#!/usr/bin/env node
// exp-ui — two-tab UI for visual-design experiments.
//   Overall  : per-origin overview of all finished/labeled experiments.
//   Judgement: focused workflow to label unlabeled finished experiments.

const fs = require('fs');
const path = require('path');
const http = require('http');
const net = require('net');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const UI_PORT = Number(process.env.UI_PORT || 5050);
const ORIGIN_PORT_BASE = Number(process.env.ORIGIN_PORT_BASE || 6100);

const isDir = p => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const listDirs = parent => isDir(parent)
  ? fs.readdirSync(parent).filter(n => isDir(path.join(parent, n)))
  : [];

const readPort = envPath => {
  if (!fs.existsSync(envPath)) return null;
  const m = fs.readFileSync(envPath, 'utf8').match(/^PORT=(\d+)/m);
  return m ? Number(m[1]) : null;
};
const portInUse = port => new Promise(resolve => {
  const s = net.connect({ port, host: '127.0.0.1' });
  s.once('connect', () => { s.destroy(); resolve(true); });
  s.once('error', () => resolve(false));
});
const readCost = dir => {
  const fp = path.join(dir, 'cost.json');
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return null; }
};
const readLifecycle = dir => {
  const fp = path.join(dir, 'state.json');
  if (!fs.existsSync(fp)) return 'not-started';
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')).state || 'not-started'; }
  catch { return 'not-started'; }
};
const readJudgement = dir => {
  const fp = path.join(dir, 'judgement.md');
  if (!fs.existsSync(fp)) return '';
  try { return fs.readFileSync(fp, 'utf8'); } catch { return ''; }
};

const servers = [];
function startVite(cwd, port, label) {
  console.log(`[${label}] starting vite on :${port}`);
  const p = spawn('pnpm', ['exec', 'vite', '--port', String(port), '--strictPort'], {
    cwd, stdio: ['ignore', 'pipe', 'pipe'],
  });
  p.stdout.on('data', d => process.stdout.write(`  [${label}:${port}] ${d}`));
  p.stderr.on('data', d => process.stderr.write(`  [${label}:${port}] ${d}`));
  servers.push(p);
}
async function ensureServing(cwd, port, label) {
  if (!fs.existsSync(path.join(cwd, 'package.json'))) return;
  if (await portInUse(port)) { console.log(`[${label}] :${port} already serving — reusing`); return; }
  startVite(cwd, port, label);
}

function inventory() {
  const origins = listDirs(path.join(ROOT, 'origin'));
  const originPort = Object.fromEntries(origins.map((o, i) => [o, ORIGIN_PORT_BASE + i]));
  const experiments = listDirs(path.join(ROOT, 'experiment')).map(name => {
    const dir = path.join(ROOT, 'experiment', name);
    const cp = fs.readdirSync(dir).find(n => n.startsWith('cp_of_'));
    if (!cp) return null;
    const origin = cp.replace(/^cp_of_/, '');
    const port = readPort(path.join(dir, '.env'));
    if (!port) return null;
    const lifecycle = readLifecycle(dir);
    const judgement = readJudgement(dir);
    const labeled = judgement.trim().length > 0;
    return {
      name, origin, port, lifecycle,
      state: labeled ? 'labeled' : lifecycle,
      hasJudgement: labeled,
      cost: readCost(dir),
    };
  }).filter(Boolean);
  return { origins, originPort, experiments };
}

function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60); const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}
function fmtTokens(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}
function fmtUsd(n) { return '$' + (n < 10 ? n.toFixed(2) : n.toFixed(1)); }

function safeExperimentPath(name, ...rest) {
  if (!/^[a-z0-9._-]+$/i.test(name)) return null;
  return path.join(ROOT, 'experiment', name, ...rest);
}
function safeOriginPath(name, ...rest) {
  if (!/^[a-z0-9._-]+$/i.test(name)) return null;
  return path.join(ROOT, 'origin', name, ...rest);
}
function serveStatic(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderIndex() {
  const { origins, originPort, experiments } = inventory();
  const origExps = origins.map(o => ({
    origin: o,
    port: originPort[o],
    all: experiments.filter(e => e.origin === o),
    visible: (() => {
      // Sort: labeled/finished/failed first (have visual outputs), running/not-started last.
      const rank = s => s === 'labeled' ? 0 : s === 'finished' ? 1 : s === 'failed' ? 2 : s === 'running' ? 3 : 4;
      return experiments.filter(e => e.origin === o).slice().sort((a, b) => rank(a.state) - rank(b.state));
    })(),
    unlabeled: experiments.filter(e => e.origin === o && e.lifecycle === 'finished' && !e.hasJudgement),
  }));

  // pass payload to JS for the judgement tab
  const judgementPayload = experiments
    .filter(e => e.lifecycle === 'finished' && !e.hasJudgement)
    .map(e => ({ name: e.name, origin: e.origin, port: e.port, originPort: originPort[e.origin], cost: e.cost }));
  // payload for the overall-tab side-panel: every experiment
  const allExpsPayload = experiments.map(e => ({
    name: e.name, origin: e.origin, port: e.port, originPort: originPort[e.origin],
    state: e.state, lifecycle: e.lifecycle, cost: e.cost,
  }));

  return `<!doctype html><html><head>
<meta charset="utf-8"><title>experiment hub</title>
<script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
<style>
  *,*::before,*::after{box-sizing:border-box}
  :root{--bg:#0b0b0e;--panel:#101015;--border:#1f1f26;--border-soft:#16161c;--ink:#ececef;--ink-2:#a5a5ad;--ink-3:#6f6f78;--accent:#7ee2a8;--violet:#a78bfa}
  html,body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.55 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  header.top{padding:14px 22px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background:#0d0d11;position:sticky;top:0;z-index:5}
  header.top h1{margin:0;font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2)}
  header.top .meta{font-size:11px;color:var(--ink-3);font-variant-numeric:tabular-nums}
  nav.tabs{display:flex;gap:4px}
  nav.tabs a{font:inherit;font-size:12px;color:var(--ink-3);text-decoration:none;padding:6px 14px;border-radius:8px;border:1px solid transparent}
  nav.tabs a:hover{color:var(--ink-2)}
  nav.tabs a.active{color:var(--ink);background:#15151c;border-color:var(--border)}

  .panel{display:none}
  .panel.active{display:block}

  /* --- OVERALL TAB --- */
  .origin-block{padding:22px 26px;border-bottom:1px solid var(--border)}
  .origin-block h2{margin:0 0 6px;font-size:16px;font-weight:600;color:var(--ink)}
  .origin-block .origin-meta{font-size:11px;color:var(--ink-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px}
  .origin-row{display:grid;grid-template-columns:340px 1fr;gap:24px;align-items:start}
  .origin-thumb{background:#101015;border:1px solid var(--border);border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color .12s,transform .12s}
  .origin-thumb:hover{border-color:#2c2c34}
  .origin-thumb:active{transform:translateY(1px)}
  .origin-thumb .head{padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-3);background:#13131a;border-bottom:1px solid var(--border)}
  .origin-thumb img{display:block;width:100%;height:auto;background:#fff}
  .exp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
  .exp-card{background:#101015;border:1px solid var(--border);border-radius:10px;overflow:hidden;display:flex;flex-direction:column}
  .exp-card .head{padding:8px 12px;display:flex;justify-content:space-between;gap:8px;align-items:center;background:#13131a;border-bottom:1px solid var(--border)}
  .exp-card .head .name{font-size:12px;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .exp-card img{display:block;width:100%;background:#fff;aspect-ratio:1440/900;object-fit:cover;object-position:top}
  .exp-card .feedback{padding:10px 12px;font-size:12px;color:var(--ink);background:#15101a;border-top:1px solid #2a2238;white-space:pre-wrap;line-height:1.5}
  .exp-card .cost{padding:8px 12px;border-top:1px solid var(--border);font-size:11px;color:var(--ink-3);display:flex;gap:8px;flex-wrap:wrap;font-variant-numeric:tabular-nums}
  .exp-card .cost b{color:var(--ink-2);font-weight:500}
  .empty-block{padding:20px;color:var(--ink-3);font-style:italic;font-size:13px}

  .state-badge{display:inline-flex;gap:6px;align-items:center;font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;padding:3px 8px;border-radius:999px;border:1px solid var(--border)}
  .state-badge .dot{width:6px;height:6px;border-radius:50%}
  .state-badge[data-state="not-started"]{color:#9b9ba2}
  .state-badge[data-state="not-started"] .dot{background:#5a5a64}
  .state-badge[data-state="running"]{color:#e0b53c;border-color:#3a3324;background:#1a1610}
  .state-badge[data-state="running"] .dot{background:#e0b53c;animation:pulse 1.4s ease-in-out infinite}
  .state-badge[data-state="failed"]{color:#e26a6a;border-color:#3a2424;background:#1a1010}
  .state-badge[data-state="failed"] .dot{background:#e26a6a}
  .state-badge[data-state="finished"]{color:var(--accent);border-color:#234c39;background:#0f1a14}
  .state-badge[data-state="finished"] .dot{background:var(--accent)}
  .state-badge[data-state="labeled"]{color:var(--violet);border-color:#352a55;background:#15101a}
  .state-badge[data-state="labeled"] .dot{background:var(--violet)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
  .exp-card .ss-placeholder{aspect-ratio:1440/900;background:#08080b;display:flex;align-items:center;justify-content:center;color:var(--ink-3);font-size:11px;text-transform:uppercase;letter-spacing:.08em;border-top:1px solid var(--border-soft)}
  .exp-card.compact{align-self:start}
  .exp-card.compact .head{border-bottom:0}
  .exp-card{cursor:pointer;transition:border-color .12s,transform .12s}
  .exp-card:hover{border-color:#2c2c34}
  .exp-card:active{transform:translateY(1px)}

  /* --- detail panel --- */
  .panel-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:opacity .15s;z-index:80}
  .panel-backdrop.open{opacity:1;pointer-events:auto}
  .side-panel{position:fixed;top:0;right:0;height:100vh;width:min(820px,90vw);background:#0c0c10;border-left:1px solid var(--border);transform:translateX(100%);transition:transform .18s ease-out;z-index:90;display:flex;flex-direction:column}
  .side-panel.open{transform:translateX(0)}
  .side-panel .sp-head{padding:14px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:14px;background:#0d0d11}
  .side-panel .sp-head .title{font-size:14px;font-weight:600}
  .side-panel .sp-head .meta{font-size:11px;color:var(--ink-3);display:flex;gap:6px;flex-wrap:wrap;font-variant-numeric:tabular-nums}
  .side-panel .sp-head .chip{padding:2px 8px;border-radius:6px;border:1px solid var(--border);background:#13131a;color:var(--ink-2)}
  .side-panel .sp-head .chip.usd{color:var(--accent);border-color:#234c39;background:#0f1a14}
  .side-panel .sp-head .close{background:transparent;border:1px solid var(--border);color:var(--ink-2);width:30px;height:30px;border-radius:6px;cursor:pointer;font-size:16px;line-height:1}
  .side-panel .sp-head .close:hover{color:var(--ink);background:#16161e}
  .side-panel .sp-body{flex:1;overflow-y:auto;padding:18px 20px;display:flex;flex-direction:column;gap:14px}
  .sp-section-label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-3);font-weight:600}
  .sp-iframe-wrap{background:var(--panel);border:1px solid var(--border);border-radius:10px;overflow:hidden;height:540px;resize:vertical;min-height:300px;display:flex;flex-direction:column}
  .sp-iframe-wrap .label{padding:6px 12px;font-size:11px;color:var(--ink-2);background:#13131a;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:10px}
  .sp-iframe-wrap .label a{color:var(--ink-3);text-decoration:none}
  .sp-iframe-wrap iframe{flex:1;border:0;background:#fff;width:100%}
  .sp-toggle{display:inline-flex;border:1px solid var(--border);border-radius:6px;overflow:hidden;background:#0d0d11}
  .sp-toggle button{font:inherit;font-size:11px;color:var(--ink-3);background:transparent;border:0;padding:3px 10px;cursor:pointer;text-transform:uppercase;letter-spacing:.04em}
  .sp-toggle button.active{color:var(--ink);background:#1a1a22}
  .sp-toggle button.active[data-which="original"]{color:#9aa0a6}
  .sp-toggle button.active[data-which="finalized"]{color:var(--accent)}

  /* --- JUDGEMENT TAB --- */
  .j-layout{display:flex;min-height:calc(100vh - 50px)}
  .j-rail{flex:0 0 280px}
  .j-rail{border-right:1px solid var(--border);background:#0c0c10;padding:18px 16px;overflow-y:auto}
  .j-rail h3{margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-3);font-weight:600}
  .j-rail .origin-list{display:flex;flex-direction:column;gap:4px;margin-bottom:22px}
  .origin-pick{font:inherit;font-size:12px;color:var(--ink-2);background:transparent;border:1px solid var(--border);padding:6px 10px;border-radius:6px;cursor:pointer;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:8px}
  .origin-pick:hover{color:var(--ink)}
  .origin-pick.active{color:var(--ink);background:#16161e;border-color:#2c2c34}
  .origin-pick .num{font-size:10px;color:var(--ink-3);font-variant-numeric:tabular-nums}
  .exp-list{display:flex;flex-direction:column;gap:2px}
  .exp-pick{font:inherit;font-size:12px;color:var(--ink-2);background:transparent;border:1px solid transparent;border-left:2px solid transparent;padding:6px 10px;border-radius:0 6px 6px 0;cursor:pointer;text-align:left;display:flex;justify-content:space-between;gap:6px;align-items:center}
  .exp-pick:hover{color:var(--ink);background:#13131a}
  .exp-pick.active{color:var(--ink);background:#15151c;border-left-color:var(--accent)}
  .exp-pick .cost{font-size:10px;color:var(--ink-3);font-variant-numeric:tabular-nums}
  .exp-list .empty{font-size:11px;color:var(--ink-3);font-style:italic;padding:6px 10px}

  .j-main{padding:22px 28px;flex:1;min-width:0}
  .j-main .placeholder{color:var(--ink-3);padding:60px 20px;text-align:center;font-style:italic}
  .j-main h2{margin:0 0 4px;font-size:18px;font-weight:600}
  .j-main .sub{font-size:11px;color:var(--ink-3);margin-bottom:16px;display:flex;gap:10px;flex-wrap:wrap;font-variant-numeric:tabular-nums}
  .j-main .sub .chip{padding:2px 8px;border-radius:6px;border:1px solid var(--border);background:#13131a;color:var(--ink-2)}
  .j-main .sub .chip.usd{color:var(--accent);border-color:#234c39;background:#0f1a14}

  .j-row{display:flex;gap:0;margin-bottom:18px;resize:vertical;overflow:hidden;min-height:520px;height:720px;border:1px solid var(--border);border-radius:10px}
  .j-pane{background:var(--panel);overflow:hidden;display:flex;flex-direction:column;flex:1 1 50%;min-width:120px}
  .j-pane.original{border-right:1px solid var(--border)}
  .j-split{flex:0 0 8px;background:transparent;cursor:col-resize;position:relative;z-index:2}
  .j-split:hover,.j-split.dragging{background:#2c2c34}
  .j-row.dragging iframe{pointer-events:none}
  .j-flicker{background:var(--panel);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:18px}
  .j-flicker .head{display:flex;justify-content:space-between;align-items:center;padding:8px 14px;background:#13131a;border-bottom:1px solid var(--border)}
  .j-flicker .head .label{font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;color:var(--ink-2)}
  .j-flicker .head .which{font-size:11px;color:var(--ink-3);font-variant-numeric:tabular-nums;text-transform:uppercase;letter-spacing:.04em}
  .j-flicker .head .which.before{color:#9aa0a6}
  .j-flicker .head .which.after{color:var(--accent)}
  .j-flicker .head button{font:inherit;font-size:11px;color:var(--ink-2);background:transparent;border:1px solid var(--border);padding:3px 10px;border-radius:6px;cursor:pointer}
  .j-flicker .head button:hover{color:var(--ink);border-color:#2c2c34}
  .j-flicker .head button.paused{color:#e0b53c;border-color:#3a3324}
  .j-flicker .frames{position:relative;width:100%;aspect-ratio:1440/900;background:#fff}
  .j-flicker .frames img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;opacity:0;transition:opacity 60ms linear}
  .j-flicker .frames img.show{opacity:1}
  .j-split::before{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:2px;height:30px;background:var(--ink-3);border-radius:1px}
  .j-pane .label{padding:8px 12px;font-size:11px;color:var(--ink-2);background:#13131a;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:.05em;font-weight:600;display:flex;justify-content:space-between}
  .j-pane .label.original{color:#9aa0a6}
  .j-pane .label.finalized{color:var(--accent)}
  .j-pane .label a{color:var(--ink-3);text-decoration:none;text-transform:none;letter-spacing:0;font-weight:400}
  .j-pane img{display:block;width:100%;background:#fff}
  .j-pane iframe{display:block;width:100%;flex:1;border:0;background:#fff}

  .j-findings{background:#0e0e13;border:1px solid var(--border);border-radius:10px;margin-bottom:18px;overflow:hidden}
  .j-findings summary{list-style:none;cursor:pointer;padding:10px 18px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2);user-select:none;display:flex;align-items:center;gap:8px}
  .j-findings summary::-webkit-details-marker{display:none}
  .j-findings summary::before{content:"▸";font-size:10px;color:var(--ink-3);transition:transform .15s;display:inline-block}
  .j-findings[open] summary::before{transform:rotate(90deg)}
  .j-findings[open] summary{border-bottom:1px solid var(--border)}
  .j-findings .body{padding:14px 22px 18px;color:var(--ink-2)}
  .j-findings h1,.j-findings h2,.j-findings h3{color:var(--ink);margin:1.2em 0 .4em;font-weight:600}
  .j-findings h1{font-size:16px;border-bottom:1px solid var(--border);padding-bottom:6px}
  .j-findings h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-2)}
  .j-findings h3{font-size:12px}
  .j-findings ul,.j-findings ol{margin:.4em 0 .8em;padding-left:1.2em}
  .j-findings li{margin:.15em 0}
  .j-findings code{background:#1a1a22;color:#cccccf;padding:1px 5px;border-radius:4px;font-family:ui-monospace,Menlo,monospace;font-size:12px}
  .j-findings pre{background:#0a0a0e;border:1px solid var(--border);border-radius:8px;padding:12px;overflow:auto;font-size:12px}
  .j-findings pre code{background:transparent;padding:0;color:#d4d4d6}
  .j-findings strong{color:var(--ink)}

  .j-editor{background:#0e0e13;border:1px solid var(--border);border-radius:10px;padding:14px 18px}
  .j-editor .head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
  .j-editor .head .label{font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;color:var(--ink-2)}
  .j-editor .status{font-size:11px;color:var(--ink-3);font-variant-numeric:tabular-nums}
  .j-editor .status.saving{color:#e0b53c}
  .j-editor .status.saved{color:var(--accent)}
  .j-editor .status.error{color:#e26a6a}
  .j-editor textarea{width:100%;min-height:140px;background:#08080b;color:var(--ink);border:1px solid var(--border);border-radius:8px;padding:12px;font:13px/1.55 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;resize:vertical;outline:none}
  .j-editor textarea:focus{border-color:#2c2c34}
  .j-editor textarea::placeholder{color:var(--ink-3)}
  .j-editor .actions{display:flex;justify-content:space-between;gap:8px;margin-top:10px}
  .j-editor button{font:inherit;font-size:12px;padding:6px 14px;border-radius:6px;cursor:pointer;border:1px solid var(--border);background:#16161e;color:var(--ink-2)}
  .j-editor button:hover{color:var(--ink)}
  .j-editor button.primary{background:var(--accent);color:#0b0b0e;border-color:var(--accent);font-weight:600}
  .j-editor button.primary:hover{background:#9eebbc}
</style></head>
<body>
<header class="top">
  <h1>experiment hub</h1>
  <nav class="tabs">
    <a href="#overall" class="tab" data-tab="overall">Overall</a>
    <a href="#judgement" class="tab" data-tab="judgement">Judgement</a>
  </nav>
  <div class="meta">${experiments.length} experiment(s) · ${origins.length} origin(s)</div>
</header>

<section class="panel" id="panel-overall">
${origExps.length === 0 ? `<div class="empty-block">no origins yet.</div>` : origExps.map(b => `
  <div class="origin-block">
    <h2>${b.origin}</h2>
    <div class="origin-meta">${b.all.length} experiment(s) · ${b.all.filter(e => e.state === 'finished').length} finished · ${b.all.filter(e => e.state === 'labeled').length} labeled · ${b.all.filter(e => e.state === 'running').length} running · ${b.all.filter(e => e.state === 'not-started').length} pending · ${b.all.filter(e => e.state === 'failed').length} failed</div>
    <div class="origin-row">
      <div class="origin-thumb" data-origin="${b.origin}" data-origin-port="${b.port}" title="open original">
        <div class="head">original<span style="float:right;color:var(--ink-3)">click to open ↗</span></div>
        <img src="/origin/${b.origin}/screenshot.png" alt="${b.origin}" loading="lazy">
      </div>
      <div>
        ${b.visible.length === 0 ? `<div class="empty-block">no finished experiments yet.</div>` : `<div class="exp-grid">
          ${b.visible.map(e => {
            const pending = e.state === 'running' || e.state === 'not-started';
            const hasAfter = fs.existsSync(path.join(ROOT, 'experiment', e.name, 'screenshots', 'after.png'));
            const placeholder = e.state === 'failed' ? 'failed — no output' : 'no screenshot';
            return `
          <div class="exp-card${pending ? ' compact' : ''}" data-name="${e.name}">
            <div class="head">
              <span class="name" title="${escapeHtml(e.name)}">${escapeHtml(e.name)}</span>
              <span class="state-badge" data-state="${e.state}"><span class="dot"></span>${e.state}</span>
            </div>
            ${pending ? '' : (hasAfter ? `<img src="/screenshot/${e.name}/after.png" loading="lazy">` : `<div class="ss-placeholder">${placeholder}</div>`)}
            ${e.hasJudgement ? `<div class="feedback">${escapeHtml(readJudgement(path.join(ROOT,'experiment',e.name)).trim())}</div>` : ''}
            ${e.cost ? `<div class="cost"><span><b>${fmtDuration(e.cost.wall_ms)}</b></span><span><b>${e.cost.turns}t</b></span><span><b>${fmtTokens(e.cost.tokens.total)}</b></span><span><b>${fmtUsd(e.cost.cost_usd)}</b></span></div>` : ''}
          </div>`;
          }).join('')}
        </div>`}
      </div>
    </div>
  </div>`).join('')}
</section>

<div class="panel-backdrop" id="sp-backdrop"></div>
<aside class="side-panel" id="sp" aria-hidden="true">
  <div class="sp-head">
    <div>
      <div class="title" id="sp-title">—</div>
      <div class="meta" id="sp-meta"></div>
    </div>
    <button class="close" id="sp-close" aria-label="close">×</button>
  </div>
  <div class="sp-body" id="sp-body"></div>
</aside>

<section class="panel" id="panel-judgement">
  <div class="j-layout">
    <aside class="j-rail">
      <h3>prototype</h3>
      <div class="origin-list">
        ${origins.map(o => {
          const n = judgementPayload.filter(p => p.origin === o).length;
          return `<button class="origin-pick" data-origin="${o}">${o} <span class="num">${n}</span></button>`;
        }).join('')}
      </div>
      <h3>unlabeled finished</h3>
      <div class="exp-list" id="j-exp-list"><div class="empty">pick a prototype.</div></div>
    </aside>
    <main class="j-main" id="j-main">
      <div class="placeholder">Choose a prototype on the left, then pick an unlabeled finished experiment.</div>
    </main>
  </div>
</section>

<script>
  marked.use({ gfm: true, breaks: false });
  const JUDGEMENT = ${JSON.stringify(judgementPayload)};
  const ALL_EXPS = ${JSON.stringify(allExpsPayload)};

  /* --- tab routing --- */
  const tabs = document.querySelectorAll('nav.tabs a');
  function setTab(name) {
    if (!['overall','judgement'].includes(name)) name = 'overall';
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
  }
  window.addEventListener('hashchange', () => setTab(location.hash.replace('#','')));
  setTab(location.hash.replace('#','') || 'overall');

  /* --- side panel for overall tab --- */
  const sp = document.getElementById('sp');
  const spBackdrop = document.getElementById('sp-backdrop');
  const spTitle = document.getElementById('sp-title');
  const spMeta = document.getElementById('sp-meta');
  const spBody = document.getElementById('sp-body');
  let spFlickerInterval = null;
  const closeSP = () => {
    if (spFlickerInterval) { clearInterval(spFlickerInterval); spFlickerInterval = null; }
    sp.classList.remove('open'); spBackdrop.classList.remove('open');
    sp.setAttribute('aria-hidden', 'true'); spBody.innerHTML = '';
  };
  document.getElementById('sp-close').addEventListener('click', closeSP);
  spBackdrop.addEventListener('click', closeSP);
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeSP(); });

  function openExp(name) {
    const e = ALL_EXPS.find(x => x.name === name);
    if (!e) return;
    spTitle.textContent = e.name;
    const c = e.cost;
    spMeta.innerHTML =
      \`<span class="chip state-badge" data-state="\${e.state}"><span class="dot"></span>\${e.state}</span>
       <span class="chip">origin: \${e.origin}</span>
       <span class="chip">port: \${e.port}</span>\` +
      (c ? \`<span class="chip">\${fmtDur(c.wall_ms)}</span><span class="chip">\${c.turns} turns</span><span class="chip">\${fmtTk(c.tokens.total)} tok</span><span class="chip usd">\${(c.cost_usd<10?'$'+c.cost_usd.toFixed(2):'$'+c.cost_usd.toFixed(1))}</span>\` : '');

    spBody.innerHTML = \`
      <div>
        <div class="sp-section-label" style="margin-bottom:6px">judgement</div>
        <div class="j-editor">
          <div class="head"><span class="label">edit</span><span class="status" id="sp-status">loading…</span></div>
          <textarea id="sp-textarea" placeholder="How much did it achieve its goal? What was missed? Why was it missed?"></textarea>
        </div>
      </div>
      <details class="j-findings" open>
        <summary>findings.md</summary>
        <div class="body" id="sp-findings">loading…</div>
      </details>
      <div>
        <div class="sp-section-label" style="margin-bottom:6px">prototype</div>
        <div class="sp-iframe-wrap" id="sp-iframe-wrap">
          <div class="label">
            <span class="sp-toggle">
              <button data-which="original">Original</button>
              <button data-which="finalized" class="active">Finalized</button>
            </span>
            <a id="sp-iframe-link" href="http://localhost:\${e.port}/" target="_blank">:\${e.port} ↗</a>
          </div>
          <iframe id="sp-iframe" src="http://localhost:\${e.port}/" loading="lazy"></iframe>
        </div>
      </div>
      <div>
        <div class="sp-section-label" style="margin-bottom:6px">flicker compare</div>
        <div class="j-flicker">
          <div class="head">
            <span class="label">before ↔ after</span>
            <span class="which before" id="sp-flicker-which">before</span>
            <button id="sp-flicker-toggle">pause</button>
          </div>
          <div class="frames" id="sp-flicker-frames">
            <img class="frame-before show" src="/screenshot/\${name}/before.png">
            <img class="frame-after" src="/screenshot/\${name}/after.png">
          </div>
        </div>
      </div>
    \`;

    // Findings
    fetch('/findings/' + encodeURIComponent(name)).then(r => r.ok ? r.text() : '').then(t => {
      const out = []; let skip = false;
      for (const line of (t || '').split('\\n')) {
        if (/^## Screenshots\\b/.test(line)) { skip = true; continue; }
        if (skip && /^## /.test(line)) skip = false;
        if (!skip) out.push(line);
      }
      document.getElementById('sp-findings').innerHTML = marked.parse(out.join('\\n').trim() || '_no findings yet_');
    });

    // Judgement editor (autosave)
    const ta = document.getElementById('sp-textarea');
    const status = document.getElementById('sp-status');
    const setStatus = (cls, text) => { status.className = 'status ' + cls; status.textContent = text; };
    let lastSaved = null; let timer = null;
    fetch('/judgement/' + encodeURIComponent(name)).then(r => r.ok ? r.text() : '').then(t => {
      ta.value = t;
      setStatus(t ? 'saved' : '', t ? 'loaded' : 'empty');
    });
    const save = async () => {
      try {
        setStatus('saving', 'saving…');
        const r = await fetch('/judgement/' + encodeURIComponent(name), {
          method:'PUT', headers:{'Content-Type':'text/plain'}, body: ta.value,
        });
        if (!r.ok) throw new Error('http ' + r.status);
        lastSaved = Date.now();
        setStatus('saved', 'saved ' + fmtAgo(lastSaved));
        // Live-update the card in the overall grid: badge + feedback text + state
        const card = document.querySelector('.exp-card[data-name="' + name + '"]');
        if (card) {
          const labeled = ta.value.trim().length > 0;
          const newState = labeled ? 'labeled' : e.lifecycle;
          card.querySelector('.state-badge').dataset.state = newState;
          card.querySelector('.state-badge').lastChild.textContent = newState;
          let fb = card.querySelector('.feedback');
          if (labeled) {
            if (!fb) {
              fb = document.createElement('div');
              fb.className = 'feedback';
              const cost = card.querySelector('.cost');
              cost ? card.insertBefore(fb, cost) : card.appendChild(fb);
            }
            fb.textContent = ta.value.trim();
          } else if (fb) {
            fb.remove();
          }
        }
        e.state = ta.value.trim().length > 0 ? 'labeled' : e.lifecycle;
      } catch { setStatus('error', 'save failed'); }
    };
    ta.addEventListener('input', () => { clearTimeout(timer); setStatus('saving','editing…'); timer = setTimeout(save, 800); });
    ta.addEventListener('blur', () => { clearTimeout(timer); save(); });

    // Original/Finalized iframe toggle.
    const iframe = document.getElementById('sp-iframe');
    const linkEl = document.getElementById('sp-iframe-link');
    document.querySelectorAll('#sp-iframe-wrap .sp-toggle button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#sp-iframe-wrap .sp-toggle button').forEach(b => b.classList.toggle('active', b === btn));
        const port = btn.dataset.which === 'original' ? e.originPort : e.port;
        const url = 'http://localhost:' + port + '/';
        iframe.src = url; linkEl.href = url; linkEl.textContent = ':' + port + ' ↗';
      });
    });

    // Flicker compare (before <-> after)
    if (spFlickerInterval) { clearInterval(spFlickerInterval); spFlickerInterval = null; }
    const spBefore = document.querySelector('#sp-flicker-frames .frame-before');
    const spAfter = document.querySelector('#sp-flicker-frames .frame-after');
    const spWhich = document.getElementById('sp-flicker-which');
    const spFlickToggle = document.getElementById('sp-flicker-toggle');
    const spTick = () => {
      const nextIsAfter = spBefore.classList.contains('show');
      spBefore.classList.toggle('show', !nextIsAfter);
      spAfter.classList.toggle('show', nextIsAfter);
      spWhich.textContent = nextIsAfter ? 'after' : 'before';
      spWhich.className = 'which ' + (nextIsAfter ? 'after' : 'before');
    };
    spFlickerInterval = setInterval(spTick, 1000);
    spFlickToggle.addEventListener('click', () => {
      if (spFlickerInterval) {
        clearInterval(spFlickerInterval); spFlickerInterval = null;
        spFlickToggle.textContent = 'play'; spFlickToggle.classList.add('paused');
      } else {
        spFlickerInterval = setInterval(spTick, 1000);
        spFlickToggle.textContent = 'pause'; spFlickToggle.classList.remove('paused');
      }
    });

    sp.classList.add('open'); spBackdrop.classList.add('open'); sp.setAttribute('aria-hidden','false');
  }

  document.querySelectorAll('.exp-card[data-name]').forEach(card => {
    card.addEventListener('click', () => openExp(card.dataset.name));
  });

  function openOrigin(name, port) {
    spTitle.textContent = name;
    spMeta.innerHTML =
      \`<span class="chip" style="color:#9aa0a6">original</span>
       <span class="chip">origin: \${name}</span>
       <span class="chip">port: \${port}</span>\`;
    spBody.innerHTML = \`
      <div>
        <div class="sp-section-label" style="margin-bottom:6px">prototype</div>
        <div class="sp-iframe-wrap">
          <div class="label">
            <span style="color:#9aa0a6;text-transform:uppercase;letter-spacing:.04em;font-weight:600;font-size:11px">Original</span>
            <a href="http://localhost:\${port}/" target="_blank">:\${port} ↗</a>
          </div>
          <iframe src="http://localhost:\${port}/" loading="lazy"></iframe>
        </div>
      </div>
    \`;
    sp.classList.add('open'); spBackdrop.classList.add('open'); sp.setAttribute('aria-hidden','false');
  }

  document.querySelectorAll('.origin-thumb[data-origin]').forEach(el => {
    el.addEventListener('click', () => openOrigin(el.dataset.origin, el.dataset.originPort));
  });

  /* --- judgement workflow --- */
  const fmtAgo = ts => { const s=Math.round((Date.now()-ts)/1000); return s<60?s+'s ago':Math.round(s/60)+'m ago'; };
  const fmtDur = ms => { const s=Math.round(ms/1000); const m=Math.floor(s/60); return m>0?m+'m '+(s%60)+'s':s+'s'; };
  const fmtTk = n => n>=1e6?(n/1e6).toFixed(1).replace(/\\.0$/,'')+'M':n>=1e3?(n/1e3).toFixed(1).replace(/\\.0$/,'')+'k':String(n);

  let selectedOrigin = null;
  let selectedExp = null;
  let queue = [];
  let flickerInterval = null;

  function renderExpList() {
    const list = document.getElementById('j-exp-list');
    if (!selectedOrigin) { list.innerHTML = '<div class="empty">pick a prototype.</div>'; return; }
    queue = JUDGEMENT.filter(e => e.origin === selectedOrigin);
    if (queue.length === 0) { list.innerHTML = '<div class="empty">no unlabeled finished experiments. nice.</div>'; return; }
    list.innerHTML = queue.map(e => {
      const costBit = e.cost ? '<span class="cost">' + fmtDur(e.cost.wall_ms) + ' · ' + (e.cost.cost_usd < 10 ? '$' + e.cost.cost_usd.toFixed(2) : '$' + e.cost.cost_usd.toFixed(1)) + '</span>' : '';
      return '<button class="exp-pick" data-name="' + e.name + '"><span>' + e.name.replace(e.origin, '…') + '</span>' + costBit + '</button>';
    }).join('');
    list.querySelectorAll('.exp-pick').forEach(btn => {
      btn.addEventListener('click', () => loadExp(btn.dataset.name));
    });
  }

  document.querySelectorAll('.origin-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.origin-pick').forEach(b => b.classList.toggle('active', b === btn));
      selectedOrigin = btn.dataset.origin;
      selectedExp = null;
      renderExpList();
      document.getElementById('j-main').innerHTML = '<div class="placeholder">Pick an experiment on the left.</div>';
    });
  });

  async function loadExp(name) {
    selectedExp = queue.find(e => e.name === name);
    if (!selectedExp) return;
    if (flickerInterval) { clearInterval(flickerInterval); flickerInterval = null; }
    document.querySelectorAll('.exp-pick').forEach(b => b.classList.toggle('active', b.dataset.name === name));
    const main = document.getElementById('j-main');
    const c = selectedExp.cost;
    const subChips = c
      ? '<span class="chip">' + fmtDur(c.wall_ms) + '</span><span class="chip">' + c.turns + ' turns</span><span class="chip">' + fmtTk(c.tokens.total) + ' tok</span><span class="chip usd">' + (c.cost_usd < 10 ? '$' + c.cost_usd.toFixed(2) : '$' + c.cost_usd.toFixed(1)) + '</span>'
      : '';
    main.innerHTML = \`
      <h2>\${name}</h2>
      <div class="sub">
        <span class="chip">origin: \${selectedExp.origin}</span>
        <span class="chip">port: \${selectedExp.port}</span>
        \${subChips}
      </div>
      <div class="j-editor">
        <div class="head"><span class="label">judgement</span><span class="status" id="j-status">empty</span></div>
        <textarea id="j-textarea" placeholder="How much did it achieve its goal? What was missed? Why was it missed?"></textarea>
        <div class="actions">
          <button id="j-save">save</button>
          <button id="j-save-next" class="primary">save & next →</button>
        </div>
      </div>
      <div class="j-row" id="j-row">
        <div class="j-pane original">
          <div class="label original">original<a href="http://localhost:\${selectedExp.originPort}/" target="_blank">open :\${selectedExp.originPort} ↗</a></div>
          <iframe src="http://localhost:\${selectedExp.originPort}/" loading="lazy"></iframe>
        </div>
        <div class="j-split" id="j-split" title="drag to resize"></div>
        <div class="j-pane finalized">
          <div class="label finalized">finalized<a href="http://localhost:\${selectedExp.port}/" target="_blank">open :\${selectedExp.port} ↗</a></div>
          <iframe src="http://localhost:\${selectedExp.port}/" loading="lazy"></iframe>
        </div>
      </div>
      <div class="j-flicker">
        <div class="head">
          <span class="label">flicker compare</span>
          <span class="which before" id="j-flicker-which">before</span>
          <button id="j-flicker-toggle">pause</button>
        </div>
        <div class="frames" id="j-flicker-frames">
          <img class="frame-before show" src="/screenshot/\${name}/before.png">
          <img class="frame-after" src="/screenshot/\${name}/after.png">
        </div>
      </div>
      <details class="j-findings"><summary>findings.md</summary><div class="body" id="j-findings-body">loading…</div></details>
    \`;

    // Flicker compare (before <-> after every 1s)
    const before = document.querySelector('#j-flicker-frames .frame-before');
    const after = document.querySelector('#j-flicker-frames .frame-after');
    const which = document.getElementById('j-flicker-which');
    const flickToggle = document.getElementById('j-flicker-toggle');
    const tick = () => {
      // Next state = whichever isn't currently showing.
      const nextIsAfter = before.classList.contains('show');
      before.classList.toggle('show', !nextIsAfter);
      after.classList.toggle('show', nextIsAfter);
      which.textContent = nextIsAfter ? 'after' : 'before';
      which.className = 'which ' + (nextIsAfter ? 'after' : 'before');
    };
    const start = () => { if (!flickerInterval) flickerInterval = setInterval(tick, 1000); };
    const stop = () => { if (flickerInterval) { clearInterval(flickerInterval); flickerInterval = null; } };
    flickToggle.addEventListener('click', () => {
      if (flickerInterval) { stop(); flickToggle.textContent = 'play'; flickToggle.classList.add('paused'); }
      else { start(); flickToggle.textContent = 'pause'; flickToggle.classList.remove('paused'); }
    });
    start();

    // Splitter drag (col resize between original/finalized iframes)
    const row = document.getElementById('j-row');
    const split = document.getElementById('j-split');
    const left = row.querySelector('.j-pane.original');
    const right = row.querySelector('.j-pane.finalized');
    let dragging = false;
    split.addEventListener('mousedown', () => {
      dragging = true; split.classList.add('dragging'); row.classList.add('dragging');
      document.body.style.userSelect = 'none';
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const rect = row.getBoundingClientRect();
      const x = Math.max(120, Math.min(rect.width - 120, e.clientX - rect.left));
      left.style.flex = '0 0 ' + x + 'px';
      right.style.flex = '1 1 0';
    });
    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false; split.classList.remove('dragging'); row.classList.remove('dragging');
      document.body.style.userSelect = '';
    });

    // Load findings
    fetch('/findings/' + encodeURIComponent(name)).then(r => r.ok ? r.text() : '').then(t => {
      let body = t;
      const out = [];
      let skip = false;
      for (const line of body.split('\\n')) {
        if (/^## Screenshots\\b/.test(line)) { skip = true; continue; }
        if (skip && /^## /.test(line)) skip = false;
        if (!skip) out.push(line);
      }
      document.getElementById('j-findings-body').innerHTML = marked.parse(out.join('\\n').trim() || '_no findings yet_');
    });

    // Load current judgement
    const ta = document.getElementById('j-textarea');
    const status = document.getElementById('j-status');
    let lastSaved = null;
    let timer = null;
    const setStatus = (cls, text) => { status.className = 'status ' + cls; status.textContent = text; };
    const r = await fetch('/judgement/' + encodeURIComponent(name));
    ta.value = r.ok ? await r.text() : '';
    setStatus(ta.value ? 'saved' : '', ta.value ? 'loaded' : 'empty');

    const save = async () => {
      try {
        setStatus('saving', 'saving…');
        const r = await fetch('/judgement/' + encodeURIComponent(name), {
          method: 'PUT', headers: {'Content-Type':'text/plain'}, body: ta.value,
        });
        if (!r.ok) throw new Error('http ' + r.status);
        lastSaved = Date.now();
        setStatus('saved', 'saved ' + fmtAgo(lastSaved));
        // If non-empty, this experiment is now labeled → remove from queue
        if (ta.value.trim().length > 0) {
          queue = queue.filter(e => e.name !== name);
          // Update master JUDGEMENT array so subsequent rerenders are correct
          const idx = JUDGEMENT.findIndex(e => e.name === name);
          if (idx >= 0) JUDGEMENT.splice(idx, 1);
        }
      } catch { setStatus('error', 'save failed'); }
    };
    ta.addEventListener('input', () => { clearTimeout(timer); setStatus('saving','editing…'); timer = setTimeout(save, 800); });
    ta.addEventListener('blur', () => { clearTimeout(timer); save(); });

    document.getElementById('j-save').addEventListener('click', save);
    document.getElementById('j-save-next').addEventListener('click', async () => {
      await save();
      // Re-render list (this experiment now removed) and jump to next
      renderExpList();
      const next = queue[0];
      if (next) loadExp(next.name);
      else document.getElementById('j-main').innerHTML = '<div class="placeholder">All done for ' + selectedOrigin + '. 🎯</div>';
    });
  }
</script>
</body></html>`;
}

async function main() {
  const { origins, originPort, experiments } = inventory();
  for (const o of origins) await ensureServing(path.join(ROOT, 'origin', o), originPort[o], `origin/${o}`);
  for (const e of experiments) {
    await ensureServing(path.join(ROOT, 'experiment', e.name, `cp_of_${e.origin}`), e.port, `exp/${e.name}`);
  }

  const ui = http.createServer((req, res) => {
    const url = req.url || '/';
    if (url === '/' || url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderIndex());
    }
    let m;
    if ((m = url.match(/^\/screenshot\/([^\/]+)\/(before|after)\.png$/))) {
      const fp = safeExperimentPath(m[1], 'screenshots', `${m[2]}.png`);
      if (!fp) { res.writeHead(400); return res.end('bad name'); }
      return serveStatic(res, fp, 'image/png');
    }
    if ((m = url.match(/^\/origin\/([^\/]+)\/screenshot\.png$/))) {
      const fp = safeOriginPath(m[1], '.cached-before.png');
      if (!fp) { res.writeHead(400); return res.end('bad name'); }
      return serveStatic(res, fp, 'image/png');
    }
    if ((m = url.match(/^\/findings\/([^\/]+)$/))) {
      const fp = safeExperimentPath(decodeURIComponent(m[1]), 'findings.md');
      if (!fp) { res.writeHead(400); return res.end('bad name'); }
      return serveStatic(res, fp, 'text/markdown; charset=utf-8');
    }
    if ((m = url.match(/^\/judgement\/([^\/]+)$/))) {
      const fp = safeExperimentPath(decodeURIComponent(m[1]), 'judgement.md');
      if (!fp) { res.writeHead(400); return res.end('bad name'); }
      if (req.method === 'GET') {
        return fs.readFile(fp, 'utf8', (err, data) => {
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' });
          res.end(err ? '' : data);
        });
      }
      if (req.method === 'PUT' || req.method === 'POST') {
        let body = '';
        req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
        req.on('end', () => {
          fs.writeFile(fp, body, err => {
            if (err) { res.writeHead(500); return res.end(String(err)); }
            res.writeHead(204); res.end();
          });
        });
        return;
      }
      res.writeHead(405); return res.end('method not allowed');
    }
    res.writeHead(404); res.end('not found');
  });
  ui.listen(UI_PORT, () => {
    console.log(`\n  → http://localhost:${UI_PORT}  (Ctrl-C to stop everything)\n`);
  });

  const shutdown = () => {
    console.log('\nstopping servers…');
    for (const p of servers) { try { p.kill(); } catch {} }
    ui.close();
    setTimeout(() => process.exit(0), 200);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => { console.error(err); process.exit(1); });
