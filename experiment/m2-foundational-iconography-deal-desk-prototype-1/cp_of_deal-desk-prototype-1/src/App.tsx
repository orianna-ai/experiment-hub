import { useState } from 'react';
import './App.css';

/* ---------- Icons (inline SVG — Tabler v3, 24×24, stroke 2) ---------- */
const Icon = ({ d, size = 16, stroke = 2 }: { d: string; size?: number; stroke?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <g dangerouslySetInnerHTML={{ __html: d }} />
  </svg>
);

const I = {
  apps: <Icon d='<path d="M4 4h6v6h-6z"/><path d="M14 4h6v6h-6z"/><path d="M4 14h6v6h-6z"/><path d="M14 14h6v6h-6z"/>' />,
  settings: <Icon d='<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>' />,
  user: <Icon d='<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>' />,
  search: <Icon d='<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/>' />,
  build: <Icon d='<path d="M7 8l-4 4l4 4"/><path d="M17 8l4 4l-4 4"/><path d="M14 4l-4 16"/>' />,
  database: <Icon d='<path d="M4 6c0 1.657 3.582 3 8 3s8 -1.343 8 -3s-3.582 -3 -8 -3s-8 1.343 -8 3"/><path d="M4 6v6c0 1.657 3.582 3 8 3s8 -1.343 8 -3v-6"/><path d="M4 12v6c0 1.657 3.582 3 8 3s8 -1.343 8 -3v-6"/>' />,
  robot: <Icon d='<path d="M6 5h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z"/><path d="M12 5v-2"/><path d="M9 12v-1"/><path d="M15 12v-1"/><path d="M10 16h4"/>' />,
  route: <Icon d='<path d="M6 19m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M18 5m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0 -7h-11a3.5 3.5 0 0 1 0 -7h8.5"/>' />,
  key: <Icon d='<path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z"/><path d="M15 9h.01"/>' />,
  lock: <Icon d='<path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"/><path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"/><path d="M8 11v-4a4 4 0 1 1 8 0v4"/>' size={14} />,
  bellOff: <Icon d='<path d="M6 8a6 6 0 0 1 9.265 -5.016"/><path d="M17.751 9.789a6.453 6.453 0 0 1 .249 1.711a8.5 8.5 0 0 0 2 5h-12.498"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/><path d="M3 3l18 18"/>' size={14} />,
  caret: <Icon d='<path d="M6 9l6 6l6 -6"/>' size={14} />,
  check: <Icon d='<path d="M5 12l5 5l10 -10"/>' size={14} />,
  shield: <Icon d='<path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/>' size={14} />,
  sparkles: <Icon d='<path d="M16 18a2 2 0 0 1 2 2"/><path d="M16 18a2 2 0 0 0 2 -2"/><path d="M20 18a2 2 0 0 1 -2 2"/><path d="M20 18a2 2 0 0 0 -2 -2"/><path d="M5 10a5 5 0 0 1 5 5"/><path d="M5 10a5 5 0 0 0 5 -5"/><path d="M15 10a5 5 0 0 1 -5 5"/><path d="M15 10a5 5 0 0 0 -5 -5"/>' size={14} />,
  warning: <Icon d='<path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.27 0z"/><path d="M12 9v4"/><path d="M12 16h.01"/>' size={14} />,
  info: <Icon d='<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 8h.01"/><path d="M11 12h1v4h1"/>' size={14} />,
  x: <Icon d='<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>' size={14} />,
  rocket: <Icon d='<path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"/><path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"/><path d="M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>' size={14} />,
};

function Tag({
  color, variant = 'solid', children,
}: { color: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'gray'; variant?: 'solid' | 'outline'; children: React.ReactNode }) {
  return <span className={`tag ${variant} ${color}`}>{children}</span>;
}

function Status({ color, children }: { color: 'green' | 'amber' | 'red' | 'blue'; children: React.ReactNode }) {
  return (
    <span className={`status ${color}`}>
      <span className="dot" />
      {children}
    </span>
  );
}

function Toggle({ on, disabled, onClick }: { on: boolean; disabled?: boolean; onClick?: () => void }) {
  return <span className={`toggle ${on ? 'on' : ''} ${disabled ? 'disabled' : ''}`} onClick={disabled ? undefined : onClick} />;
}

const SAMPLE_OPPS = [
  { name: 'Acme Corp · Platform Expansion', amount: '$420,000', stage: 'Negotiation' },
  { name: 'Globex Industries · Annual Renewal', amount: '$210,000', stage: 'Proposal' },
  { name: 'Initech · New Logo', amount: '$84,500', stage: 'Discovery' },
];

export default function App() {
  const [tab, setTab] = useState<'simulate' | 'permissions' | 'rollout' | 'diff'>('simulate');
  const [activeOpp, setActiveOpp] = useState(0);
  const [caps, setCaps] = useState({
    summarize: true,
    drafts: true,
    stage: false,
    tasks: true,
    notify: false,
  });
  const [duration, setDuration] = useState<'perm' | 'pilot'>('pilot');
  const [pilotN, setPilotN] = useState(2);
  const [pilotUnit, setPilotUnit] = useState<'days' | 'weeks'>('weeks');

  const tog = (k: string) => setCaps((c) => ({ ...c, [k]: !c[k as keyof typeof c] }));

  return (
    <div className="app">
      <aside className="app-nav">
        <div className="logo">T</div>
        <div className="nav-icon" title="Search">{I.search}</div>
        <div className="nav-icon" title="Apps">{I.apps}</div>
        <div className="nav-icon" title="Build">{I.build}</div>
        <div className="nav-icon active" title="Settings">{I.settings}</div>
      </aside>

      <aside className="settings-sidebar">
        <h4>User</h4>
        <div className="nav-item">{I.user}<span>Profile</span></div>
        <div className="nav-item">{I.settings}<span>Experience</span></div>
        <div className="nav-item">{I.key}<span>Accounts</span></div>

        <h4>Workspace</h4>
        <div className="nav-item">{I.settings}<span>General</span></div>
        <div className="nav-item">{I.user}<span>Members</span></div>
        <div className="nav-item">{I.database}<span>Data model</span></div>
        <div className="nav-item active">{I.apps}<span>Applications</span></div>
        <div className="nav-item">{I.robot}<span>AI Agents</span></div>
        <div className="nav-item">{I.shield}<span>Security</span></div>
        <div className="nav-item">{I.key}<span>Developers</span></div>
      </aside>

      <div className="app-main">
        <div className="topbar">
          <span className="crumb">Settings</span>
          <span className="sep">›</span>
          <span className="crumb">Applications</span>
          <span className="sep">›</span>
          <span className="crumb">Deal Desk</span>
          <span className="sep">›</span>
          <span className="crumb current">Review</span>
        </div>

        <div className="page-scroll">
          <div className="page">
            <div className="page-header">
              <div>
                <h1>Deal Desk</h1>
                <div className="meta">
                  <Tag color="blue" variant="solid">{I.sparkles} Proposed by Claude</Tag>
                  <span className="dot" />
                  <span>3 min ago</span>
                  <span className="dot" />
                  <span>v0.1 draft</span>
                </div>
              </div>
              <div className="actions">
                <button className="btn">Reject</button>
                <button className="btn primary" onClick={() => setTab('rollout')}>Continue to rollout</button>
              </div>
            </div>

            <div className="card">
              <div className="summary">
                <div>
                  <h2>What this app does</h2>
                  <p className="lede">
                    Adds a Deal Desk workflow to enterprise opportunities. Reps will see
                    a new panel that tracks procurement, security and legal review on
                    each deal, plus an AI summary of deal risk and a workflow that
                    routes contracts to legal automatically.
                  </p>

                  <div className="change-list">
                    <div className="change-row-wrap">
                      <div className="main">
                        <span className="icon">{I.apps}</span>
                        <span className="label">New panel on Opportunity</span>
                        <span className="detail">· Procurement, Security, Legal review</span>
                        <span className="grow" />
                        <Tag color="green">Safe</Tag>
                      </div>
                    </div>
                    <div className="change-row-wrap">
                      <div className="main">
                        <span className="icon">{I.database}</span>
                        <span className="label">3 new fields on Opportunity</span>
                        <span className="detail">· Procurement, Security Review, Legal Review</span>
                        <span className="grow" />
                        <Tag color="amber">Caution</Tag>
                      </div>
                      <div className="conflict">
                        {I.warning}
                        <span>Looks similar to existing field "Sec. Review" — review before deploying.</span>
                      </div>
                    </div>
                    <div className="change-row-wrap">
                      <div className="main">
                        <span className="icon">{I.database}</span>
                        <span className="label">New object: Mutual Action Plan</span>
                        <span className="detail">· linked to Opportunity</span>
                        <span className="grow" />
                        <Tag color="green">Safe</Tag>
                      </div>
                    </div>
                    <div className="change-row-wrap">
                      <div className="main">
                        <span className="icon">{I.robot}</span>
                        <span className="label">New AI agent</span>
                        <span className="detail">· Drafts deal-risk summaries</span>
                        <span className="grow" />
                        <Tag color="amber">Caution</Tag>
                      </div>
                    </div>
                    <div className="change-row-wrap">
                      <div className="main">
                        <span className="icon">{I.route}</span>
                        <span className="label">New workflow</span>
                        <span className="detail">· Auto-route to Legal when stage = Negotiation</span>
                        <span className="grow" />
                        <Tag color="green">Safe</Tag>
                      </div>
                    </div>
                  </div>

                  <div className="show-all">Show all (8)</div>
                </div>

                <div className="trust-stack">
                  <div className="policy-banner warn">
                    <Status color="amber"><strong>Needs admin approval</strong></Status>
                    <div className="sub">1 module crosses workspace policy. You can request approval below.</div>
                    <div className="chips">
                      <Tag color="amber" variant="outline">Agent: write access to Opportunity</Tag>
                    </div>
                  </div>

                  <div>
                    <h2 className="section-title">Affects</h2>
                    <div className="stats-row">
                      <div className="stat-tile">
                        <div className="num">2</div>
                        <div className="lbl">Record pages</div>
                      </div>
                      <div className="stat-tile">
                        <div className="num">1 + 1</div>
                        <div className="lbl">Workflow · Agent</div>
                      </div>
                      <div className="stat-tile">
                        <div className="num">28</div>
                        <div className="lbl">Reps (Enterprise AEs)</div>
                      </div>
                    </div>
                  </div>

                  <div className="disclosure">
                    <span>Agent can read 4 objects, write 2, send email: no</span>
                    {I.caret}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="tablist">
                <div className={`tab ${tab === 'simulate' ? 'active' : ''}`} onClick={() => setTab('simulate')}>
                  {I.sparkles}<span>Simulate</span>
                </div>
                <div className={`tab ${tab === 'permissions' ? 'active' : ''}`} onClick={() => setTab('permissions')}>
                  {I.shield}<span>Permissions &amp; agent</span>
                </div>
                <div className={`tab ${tab === 'rollout' ? 'active' : ''}`} onClick={() => setTab('rollout')}>
                  {I.rocket}<span>Rollout</span>
                </div>
                <div className={`tab ${tab === 'diff' ? 'active' : ''}`} onClick={() => setTab('diff')}>
                  {I.build}<span>Technical diff</span>
                </div>
              </div>

              {tab === 'simulate' && (
                <div className="simulate">
                  <div className="sim-sidebar">
                    <div className="dryrun-pill">
                      <Tag color="amber" variant="outline">
                        {I.bellOff} Dry-run preview · No data will be written
                      </Tag>
                    </div>
                    {SAMPLE_OPPS.map((o, i) => (
                      <div key={i} className={`sim-opp ${i === activeOpp ? 'active' : ''}`} onClick={() => setActiveOpp(i)}>
                        <div className="name">{o.name}</div>
                        <div className="meta"><span>{o.amount}</span><span>·</span><span>{o.stage}</span></div>
                      </div>
                    ))}
                    <div style={{ padding: 'var(--space-3)' }}>
                      <button className="btn sm" style={{ width: '100%', justifyContent: 'center' }}>Try another sample</button>
                    </div>
                  </div>

                  <div className="preview-frame">
                    <div className="preview-ribbon">
                      {I.info}
                      <span>Preview mode · Sample data · Changes are not saved</span>
                    </div>
                    <div className="preview-body">
                      <div className="record-header">
                        <div className="record-avatar">{SAMPLE_OPPS[activeOpp].name.charAt(0)}</div>
                        <div>
                          <div className="record-title">{SAMPLE_OPPS[activeOpp].name}</div>
                          <div className="record-sub">Opportunity · {SAMPLE_OPPS[activeOpp].amount} · {SAMPLE_OPPS[activeOpp].stage}</div>
                        </div>
                      </div>

                      <div className="record-tabs">
                        <span className="active">Timeline</span>
                        <span>Notes</span>
                        <span>Tasks</span>
                        <span>Emails</span>
                        <span>Files</span>
                      </div>

                      <div className="fieldset">
                        <div className="k">Stage</div><div className="v">{SAMPLE_OPPS[activeOpp].stage}</div>
                        <div className="k">Amount</div><div className="v">{SAMPLE_OPPS[activeOpp].amount}</div>
                        <div className="k">Close date</div><div className="v">Jun 30, 2026</div>
                        <div className="k">Account owner</div><div className="v">Sarah Chen</div>
                      </div>

                      <div className="panel">
                        <div className="panel-head">
                          {I.apps}
                          <span>Deal Desk</span>
                          <Tag color="purple" variant="solid">New</Tag>
                        </div>
                        <div className="panel-body">
                          <div className="review-row">
                            <div className="k">Procurement</div>
                            <div><Tag color="amber">In review</Tag></div>
                            <span className="muted small">Updated 2d ago</span>
                          </div>
                          <div className="review-row">
                            <div className="k">Security Review</div>
                            <div><Tag color="green">Approved</Tag></div>
                            <span className="muted small">Updated 5d ago</span>
                          </div>
                          <div className="review-row">
                            <div className="k">Legal Review</div>
                            <div><Tag color="gray">Not started</Tag></div>
                            <span className="muted small">—</span>
                          </div>
                          <div className="review-row">
                            <div className="k">Mutual Action Plan</div>
                            <div><span className="small">3 of 7 items complete</span></div>
                            <span className="muted small">Open plan ↗</span>
                          </div>

                          <div className="ai-summary">
                            <div className="head">{I.sparkles}<span>AI deal-risk summary</span><Tag color="purple" variant="solid">AI preview</Tag></div>
                            <p>
                              Acme's procurement team has been silent for 9 days — historically a 2.4× risk
                              signal at this stage. Legal review hasn't started despite a target close of
                              Jun 30. Recommend pinging the procurement contact and pre-routing the MSA
                              to legal this week.
                            </p>
                          </div>

                          <div style={{ marginTop: 'var(--space-3)' }}>
                            <div className="small muted" style={{ marginBottom: 4 }}>Workflow would trigger:</div>
                            <span className="side-effect-chip">{I.bellOff}<span>Would create task: Legal review for Acme</span></span>
                            <span className="side-effect-chip">{I.bellOff}<span>Would email legal@acme.com</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'permissions' && (
                <div className="permissions">
                  <div className="card">
                    <h2 className="section-title">What the AI agent can do</h2>

                    <div className="cap-row">
                      <div>
                        <div className="label">Summarize deal risk</div>
                        <div className="desc">Generate a paragraph-long risk summary on each opportunity.</div>
                      </div>
                      <div className="right"><Toggle on={caps.summarize} onClick={() => tog('summarize')} /></div>
                    </div>

                    <div className="cap-row">
                      <div>
                        <div className="label">Draft follow-up emails</div>
                        <div className="desc">Suggest email replies to deal stakeholders. Drafts only, never sent.</div>
                      </div>
                      <div className="right"><Toggle on={caps.drafts} onClick={() => tog('drafts')} /></div>
                    </div>

                    <div className="cap-row">
                      <div>
                        <div className="label">Update opportunity stage</div>
                        <div className="desc">Automatically move opportunities forward when criteria match.</div>
                      </div>
                      <div className="right">
                        <span className="lock-meta">{I.lock}<span>Blocked by workspace policy</span></span>
                        <Toggle on={false} disabled />
                      </div>
                    </div>

                    <div className="cap-row">
                      <div>
                        <div className="label">Create tasks</div>
                        <div className="desc">Create review tasks and assign them to teammates.</div>
                      </div>
                      <div className="right"><Toggle on={caps.tasks} onClick={() => tog('tasks')} /></div>
                    </div>

                    <div className="cap-row">
                      <div>
                        <div className="label">Send external notifications</div>
                        <div className="desc">Email outside contacts (procurement, legal, etc.) directly.</div>
                      </div>
                      <div className="right">
                        <Tag color="amber" variant="outline">Needs admin approval</Tag>
                        <Toggle on={caps.notify} onClick={() => tog('notify')} />
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 24 }} />

                  <div className="card">
                    <h2 className="section-title">Data scope</h2>
                    <div className="stable">
                      <div className="stable-head"><div>Object</div><div>Access</div></div>
                      <div className="stable-row"><div>Opportunity</div><div className="tags"><Tag color="green">Read</Tag><Tag color="blue">Write</Tag></div></div>
                      <div className="stable-row"><div>Mutual Action Plan</div><div className="tags"><Tag color="green">Read</Tag><Tag color="blue">Write</Tag></div></div>
                      <div className="stable-row"><div>Company</div><div className="tags"><Tag color="green">Read</Tag></div></div>
                      <div className="stable-row"><div>Contact</div><div className="tags"><Tag color="green">Read</Tag></div></div>
                      <div className="stable-row"><div>Task</div><div className="tags"><Tag color="green">Read</Tag><Tag color="blue">Write</Tag></div></div>
                      <div className="stable-row">
                        <div><strong>External access via MCP</strong></div>
                        <div className="tags">
                          <Tag color="amber">Enabled — 3 tools</Tag>
                          <a className="show-all" style={{ marginTop: 0 }}>View tools</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'rollout' && (
                <div className="rollout">
                  <div className="card">
                    <h2 className="section-title">Who gets the Deal Desk app</h2>

                    <div className="filter-row">
                      <div className="lbl">Pipeline</div>
                      <div className="chip-input">
                        <span className="chip">Enterprise sales <span className="x">{I.x}</span></span>
                        <span className="placeholder">Add pipeline…</span>
                      </div>
                    </div>
                    <div className="filter-row">
                      <div className="lbl">Team / role</div>
                      <div className="chip-input">
                        <span className="chip">Enterprise AEs <span className="x">{I.x}</span></span>
                        <span className="chip">Deal Desk team <span className="x">{I.x}</span></span>
                        <span className="placeholder">Add team or role…</span>
                      </div>
                    </div>
                    <div className="filter-row">
                      <div className="lbl">Territory</div>
                      <div className="chip-input">
                        <span className="placeholder">Any territory</span>
                      </div>
                    </div>
                    <div className="filter-row">
                      <div className="lbl">Deal size</div>
                      <div className="range-input">
                        <input defaultValue="100,000" />
                        <span className="suf">to</span>
                        <input defaultValue="" placeholder="No max" />
                        <span className="suf">USD</span>
                      </div>
                    </div>

                    <div className="filter-row">
                      <div className="lbl">Duration</div>
                      <div className="radio-group">
                        <span className={`radio ${duration === 'perm' ? 'checked' : ''}`} onClick={() => setDuration('perm')}>
                          <span className="dot" /> Permanent
                        </span>
                        <span className={`radio ${duration === 'pilot' ? 'checked' : ''}`} onClick={() => setDuration('pilot')}>
                          <span className="dot" /> Pilot for
                        </span>
                        <span className="stepper">
                          <button onClick={() => setPilotN(Math.max(1, pilotN - 1))}>−</button>
                          <input value={pilotN} onChange={(e) => setPilotN(parseInt(e.target.value || '1', 10) || 1)} />
                          <button onClick={() => setPilotN(pilotN + 1)}>+</button>
                        </span>
                        <span className="unit-pill" onClick={() => setPilotUnit(pilotUnit === 'weeks' ? 'days' : 'weeks')} style={{ cursor: 'pointer' }}>
                          {pilotUnit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="card impact-card">
                    <div className="big">28</div>
                    <div className="big-lbl">reps will see this on Monday</div>

                    <div style={{ marginTop: 16 }}>
                      <div className="row"><span className="muted small">Opportunities in scope</span><span className="v">142</span></div>
                      <div className="row"><span className="muted small">Pipelines</span><span className="v">1</span></div>
                      <div className="row"><span className="muted small">Pilot duration</span><span className="v">{duration === 'pilot' ? `${pilotN} ${pilotUnit}` : 'Permanent'}</span></div>
                    </div>

                    <div className="divider" />

                    <div className="mini-list">
                      <span>Adds 1 panel</span>
                      <span>4 fields</span>
                      <span>1 workflow</span>
                      <span>1 agent</span>
                    </div>

                    <div className="hint">
                      This is a gradual rollout. You can expand scope anytime from Settings → Apps.
                    </div>
                  </div>
                </div>
              )}

              {tab === 'diff' && (
                <div>
                  <div className="diff-section">
                    <h3>Objects</h3>
                    <div className="stable diff-table">
                      <div className="stable-row"><div>+ Added object MutualActionPlan</div><div><Tag color="green">Safe</Tag></div></div>
                    </div>
                  </div>
                  <div className="diff-section">
                    <h3>Fields</h3>
                    <div className="stable diff-table">
                      <div className="stable-row"><div>+ Added field ProcurementStatus on Opportunity</div><div><Tag color="green">Safe</Tag></div></div>
                      <div className="stable-row"><div>+ Added field SecurityReview on Opportunity</div><div><Tag color="amber">Caution</Tag></div></div>
                      <div className="stable-row"><div>+ Added field LegalReview on Opportunity</div><div><Tag color="green">Safe</Tag></div></div>
                    </div>
                  </div>
                  <div className="diff-section">
                    <h3>Workflows</h3>
                    <div className="stable diff-table">
                      <div className="stable-row"><div>+ Added workflow LegalReviewRouter (trigger: stage=Negotiation)</div><div><Tag color="green">Safe</Tag></div></div>
                    </div>
                  </div>
                  <div className="diff-section">
                    <h3>Agents</h3>
                    <div className="stable diff-table">
                      <div className="stable-row"><div>+ Added agent DealRiskSummarizer (reads: 4, writes: 2)</div><div><Tag color="amber">Caution</Tag></div></div>
                    </div>
                  </div>
                  <div className="diff-section">
                    <h3>Permissions</h3>
                    <div className="stable diff-table">
                      <div className="stable-row"><div>+ Granted write Opportunity to agent DealRiskSummarizer</div><div><Tag color="amber">Needs approval</Tag></div></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky-footer">
          <div className="left">
            <Status color="amber"><strong>Needs admin approval</strong></Status>
            <div className="sub">Agent: write access to Opportunity{caps.notify ? ' · Send external notifications' : ''}</div>
          </div>
          <div className="right">
            <button className="btn">Save draft</button>
            <button className="btn primary">{I.shield}<span>Request admin approval</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
