import { useMemo, useState } from 'react';
import './App.css';

/* ---------- Icons (inline SVG) ---------- */
const Icon = ({ d, size = 16, stroke = 1.75 }: { d: string; size?: number; stroke?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <g dangerouslySetInnerHTML={{ __html: d }} />
  </svg>
);

const I = {
  apps: <Icon d='<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>' />,
  settings: <Icon d='<circle cx="12" cy="12" r="3"/>' />,
  user: <Icon d='<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' />,
  search: <Icon d='<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>' />,
  build: <Icon d='<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' />,
  database: <Icon d='<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>' />,
  robot: <Icon d='<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>' />,
  route: <Icon d='<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>' />,
  key: <Icon d='<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/>' />,
  lock: <Icon d='<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' size={12} />,
  bellOff: <Icon d='<path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><line x1="1" y1="1" x2="23" y2="23"/>' size={12} />,
  caret: <Icon d='<polyline points="6 9 12 15 18 9"/>' size={14} />,
  check: <Icon d='<polyline points="20 6 9 17 4 12"/>' size={14} />,
  shield: <Icon d='<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' size={14} />,
  sparkles: <Icon d='<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>' size={12} />,
  warning: <Icon d='<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' size={14} />,
  info: <Icon d='<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>' size={14} />,
  x: <Icon d='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} />,
  rocket: <Icon d='<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>' size={14} />,
  sort: <Icon d='<path d="M6 4v14"/><path d="m2 8 4-4 4 4"/>' size={12} stroke={2} />,
  plus: <Icon d='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} stroke={2.5} />,
  file: <Icon d='<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' />,
};

type SortDir = 'asc' | 'desc';

function SortHeader<K extends string>({
  label, sortKey, currentKey, currentDir, onSort,
}: { label: string; sortKey: K; currentKey: K | null; currentDir: SortDir; onSort: (k: K) => void }) {
  const isActive = currentKey === sortKey;
  return (
    <button
      type="button"
      className={`th sortable ${isActive ? `sorted ${currentDir}` : ''}`}
      onClick={() => onSort(sortKey)}
      aria-sort={isActive ? (currentDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span>{label}</span>
      <span className="sort-icon">{I.sort}</span>
    </button>
  );
}

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

type ScopeKey = 'object' | 'access' | 'records' | 'last';
type DiffKey = 'name' | 'kind' | 'risk';

const ACCESS_RANK: Record<string, number> = { Read: 1, Write: 2 };

const SCOPE_ROWS = [
  { object: 'Opportunity', access: ['Read', 'Write'], records: 142, last: '2m ago', lastTs: 2 },
  { object: 'Mutual Action Plan', access: ['Read', 'Write'], records: 38, last: '12m ago', lastTs: 12 },
  { object: 'Company', access: ['Read'], records: 412, last: '3h ago', lastTs: 180 },
  { object: 'Contact', access: ['Read'], records: 1184, last: '1d ago', lastTs: 1440 },
  { object: 'Task', access: ['Read', 'Write'], records: 87, last: '5m ago', lastTs: 5 },
  { object: 'Pipeline', access: ['Read'], records: 4, last: '7d ago', lastTs: 10080 },
  { object: 'Note', access: ['Read'], records: 219, last: '2d ago', lastTs: 2880 },
  { object: 'Activity', access: ['Read'], records: 902, last: '4h ago', lastTs: 240 },
];

const DIFF_ROWS: Array<{ name: string; kind: 'Object' | 'Field' | 'Workflow' | 'Agent' | 'Permission'; risk: 'Safe' | 'Caution' | 'Needs approval' }> = [
  { name: '+ MutualActionPlan', kind: 'Object', risk: 'Safe' },
  { name: '+ Opportunity.ProcurementStatus', kind: 'Field', risk: 'Safe' },
  { name: '+ Opportunity.SecurityReview', kind: 'Field', risk: 'Caution' },
  { name: '+ Opportunity.LegalReview', kind: 'Field', risk: 'Safe' },
  { name: '+ LegalReviewRouter (stage=Negotiation)', kind: 'Workflow', risk: 'Safe' },
  { name: '+ DealRiskSummarizer (r:4 w:2)', kind: 'Agent', risk: 'Caution' },
  { name: '+ write Opportunity → DealRiskSummarizer', kind: 'Permission', risk: 'Needs approval' },
];

const RISK_RANK: Record<string, number> = { Safe: 1, Caution: 2, 'Needs approval': 3 };
const KIND_RANK: Record<string, number> = { Object: 1, Field: 2, Workflow: 3, Agent: 4, Permission: 5 };

function applySort<T>(rows: T[], key: keyof T | null, dir: SortDir, getVal: (r: T, k: keyof T) => string | number) {
  if (!key) return rows;
  const sorted = [...rows].sort((a, b) => {
    const va = getVal(a, key);
    const vb = getVal(b, key);
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
}

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

  const [scopeSort, setScopeSort] = useState<{ key: ScopeKey | null; dir: SortDir }>({ key: 'object', dir: 'asc' });
  const [diffSort, setDiffSort] = useState<{ key: DiffKey | null; dir: SortDir }>({ key: 'kind', dir: 'asc' });

  const toggleScopeSort = (k: ScopeKey) =>
    setScopeSort((s) => ({ key: k, dir: s.key === k && s.dir === 'asc' ? 'desc' : 'asc' }));
  const toggleDiffSort = (k: DiffKey) =>
    setDiffSort((s) => ({ key: k, dir: s.key === k && s.dir === 'asc' ? 'desc' : 'asc' }));

  const sortedScope = useMemo(
    () => applySort(SCOPE_ROWS, scopeSort.key, scopeSort.dir, (r, k) => {
      if (k === 'access') return r.access.map((a) => ACCESS_RANK[a] ?? 0).reduce((s, n) => s + n, 0);
      if (k === 'records') return r.records;
      if (k === 'last') return r.lastTs;
      return String(r[k] ?? '').toLowerCase();
    }),
    [scopeSort],
  );

  const sortedDiff = useMemo(
    () => applySort(DIFF_ROWS, diffSort.key, diffSort.dir, (r, k) => {
      if (k === 'risk') return RISK_RANK[r.risk];
      if (k === 'kind') return KIND_RANK[r.kind];
      return r.name.toLowerCase();
    }),
    [diffSort],
  );

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
                    <div className="stable cols-4 scrollable">
                      <div className="stable-head">
                        <SortHeader<ScopeKey> label="Object" sortKey="object" currentKey={scopeSort.key} currentDir={scopeSort.dir} onSort={toggleScopeSort} />
                        <SortHeader<ScopeKey> label="Access" sortKey="access" currentKey={scopeSort.key} currentDir={scopeSort.dir} onSort={toggleScopeSort} />
                        <SortHeader<ScopeKey> label="Records" sortKey="records" currentKey={scopeSort.key} currentDir={scopeSort.dir} onSort={toggleScopeSort} />
                        <SortHeader<ScopeKey> label="Last used" sortKey="last" currentKey={scopeSort.key} currentDir={scopeSort.dir} onSort={toggleScopeSort} />
                      </div>
                      {sortedScope.map((r) => (
                        <div className="stable-row" key={r.object}>
                          <div className="obj-cell"><span className="icon">{I.database}</span>{r.object}</div>
                          <div className="tags">
                            {r.access.includes('Read') && <Tag color="green">Read</Tag>}
                            {r.access.includes('Write') && <Tag color="blue">Write</Tag>}
                          </div>
                          <div className="cell-num">{r.records.toLocaleString()}</div>
                          <div className="cell-muted">{r.last}</div>
                        </div>
                      ))}
                      <div className="stable-row">
                        <div className="obj-cell"><span className="icon">{I.route}</span><strong>External access via MCP</strong></div>
                        <div className="tags"><Tag color="amber">3 tools</Tag></div>
                        <div className="cell-num">—</div>
                        <div className="cell-muted"><a className="show-all" style={{ marginTop: 0 }}>View tools</a></div>
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
                    <h3>All changes ({DIFF_ROWS.length})</h3>
                    <div className="stable diff-table">
                      <div className="stable-head">
                        <SortHeader<DiffKey> label="Type" sortKey="kind" currentKey={diffSort.key} currentDir={diffSort.dir} onSort={toggleDiffSort} />
                        <SortHeader<DiffKey> label="Change" sortKey="name" currentKey={diffSort.key} currentDir={diffSort.dir} onSort={toggleDiffSort} />
                        <SortHeader<DiffKey> label="Risk" sortKey="risk" currentKey={diffSort.key} currentDir={diffSort.dir} onSort={toggleDiffSort} />
                      </div>
                      {sortedDiff.map((r, i) => (
                        <div className="stable-row" key={i}>
                          <div className="change-type add">{r.kind}</div>
                          <div>{r.name}</div>
                          <div>
                            <Tag color={r.risk === 'Safe' ? 'green' : r.risk === 'Caution' ? 'amber' : 'red'}>{r.risk}</Tag>
                          </div>
                        </div>
                      ))}
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
