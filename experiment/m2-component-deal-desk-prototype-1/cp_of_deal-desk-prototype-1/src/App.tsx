import { useState } from 'react';
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
  sortUpDown: <Icon d='<polyline points="8 5 5 2 2 5"/><polyline points="16 19 19 22 22 19"/><line x1="5" y1="2" x2="5" y2="22"/><line x1="19" y1="2" x2="19" y2="22"/>' size={12} stroke={1.5} />,
  sortAsc: <Icon d='<polyline points="6 9 12 3 18 9"/><line x1="12" y1="3" x2="12" y2="21"/>' size={12} />,
  sortDesc: <Icon d='<polyline points="6 15 12 21 18 15"/><line x1="12" y1="3" x2="12" y2="21"/>' size={12} />,
  inbox: <Icon d='<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>' size={28} stroke={1.5} />,
  alert: <Icon d='<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' size={14} />,
  refresh: <Icon d='<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>' size={12} />,
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

type SortKey = 'object' | 'access' | null;
type SortDir = 'asc' | 'desc';

function SortHeader({
  label, sortKey, currentKey, dir, onSort, align = 'left',
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const active = sortKey === currentKey;
  return (
    <button
      type="button"
      className={`sort-th ${active ? 'active' : ''} ${align}`}
      onClick={() => onSort(sortKey)}
    >
      <span>{label}</span>
      <span className="sort-icon" aria-hidden>
        {!active ? I.sortUpDown : dir === 'asc' ? I.sortAsc : I.sortDesc}
      </span>
    </button>
  );
}

function EmptyState({
  icon, title, body, action,
}: { icon: React.ReactNode; title: string; body: string; action?: { label: string; onClick?: () => void } }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-body">{body}</div>
      {action && <button className="btn sm" onClick={action.onClick}>{action.label}</button>}
    </div>
  );
}

function SkeletonRow({ cols = 2 }: { cols?: number }) {
  return (
    <div className="skeleton-row" aria-hidden>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="skeleton-cell"><span className="skeleton-bar" style={{ width: `${40 + ((i * 17) % 50)}%` }} /></div>
      ))}
    </div>
  );
}

function InlineError({ children }: { children: React.ReactNode }) {
  return <div className="inline-error">{I.alert}<span>{children}</span></div>;
}

function FieldHelp({ children }: { children: React.ReactNode }) {
  return <div className="field-help">{children}</div>;
}

function DiffSection({
  title, count, children,
}: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="diff-section">
      <div className="diff-section-head">
        <h3>{title}</h3>
        <span className="count-badge">{count}</span>
      </div>
      <div className="stable diff-table">{children}</div>
    </div>
  );
}

function DiffHead() {
  return (
    <div className="stable-head diff-head">
      <div>Change</div>
      <div className="right">Impact</div>
    </div>
  );
}

function DiffRow({ change, tag }: { change: string; tag: React.ReactNode }) {
  const op = change.trim().startsWith('+') ? 'add' : change.trim().startsWith('-') ? 'remove' : 'mod';
  return (
    <div className={`stable-row diff-row ${op}`}>
      <div className="change-text"><span className="op">{op === 'add' ? '+' : op === 'remove' ? '−' : '~'}</span><span>{change.replace(/^[+\-~]\s*/, '')}</span></div>
      <div className="right">{tag}</div>
    </div>
  );
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
  const [dealMin, setDealMin] = useState('100,000');
  const [dealMax, setDealMax] = useState('');
  const [dataSortKey, setDataSortKey] = useState<SortKey>('object');
  const [dataSortDir, setDataSortDir] = useState<SortDir>('asc');
  const [mcpError, setMcpError] = useState(true);

  const minNum = parseInt(dealMin.replace(/,/g, ''), 10) || 0;
  const maxNum = dealMax ? (parseInt(dealMax.replace(/,/g, ''), 10) || 0) : Infinity;
  const dealSizeError = dealMax && maxNum <= minNum ? 'Max must be greater than min.' : null;

  const dataScope: { object: string; access: ('read' | 'write')[] }[] = [
    { object: 'Opportunity', access: ['read', 'write'] },
    { object: 'Mutual Action Plan', access: ['read', 'write'] },
    { object: 'Company', access: ['read'] },
    { object: 'Contact', access: ['read'] },
    { object: 'Task', access: ['read', 'write'] },
  ];
  const sortedDataScope = [...dataScope].sort((a, b) => {
    const dirMul = dataSortDir === 'asc' ? 1 : -1;
    if (dataSortKey === 'object') return a.object.localeCompare(b.object) * dirMul;
    if (dataSortKey === 'access') return (a.access.length - b.access.length) * dirMul;
    return 0;
  });
  const handleSort = (k: SortKey) => {
    if (k === dataSortKey) setDataSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setDataSortKey(k); setDataSortDir('asc'); }
  };

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

                    {mcpError && (
                      <div className="error-banner" role="alert">
                        <span className="icon">{I.alert}</span>
                        <div className="msg">
                          <strong>Couldn't load MCP tool inventory</strong>
                          <span>The MCP server didn't respond within 5s. Showing cached tool list.</span>
                        </div>
                        <button className="btn sm" onClick={() => setMcpError(false)}>{I.refresh}<span>Retry</span></button>
                        <button className="icon-btn" aria-label="Dismiss" onClick={() => setMcpError(false)}>{I.x}</button>
                      </div>
                    )}

                    <div className="stable sticky scrollable">
                      <div className="stable-head">
                        <SortHeader label="Object" sortKey="object" currentKey={dataSortKey} dir={dataSortDir} onSort={handleSort} />
                        <SortHeader label="Access" sortKey="access" currentKey={dataSortKey} dir={dataSortDir} onSort={handleSort} />
                      </div>
                      {sortedDataScope.map((r) => (
                        <div className="stable-row" key={r.object}>
                          <div>{r.object}</div>
                          <div className="tags">
                            {r.access.includes('read') && <Tag color="green">Read</Tag>}
                            {r.access.includes('write') && <Tag color="blue">Write</Tag>}
                          </div>
                        </div>
                      ))}
                      <div className="stable-row mcp-row">
                        <div><strong>External access via MCP</strong></div>
                        <div className="tags">
                          {mcpError ? (
                            <span className="skeleton-bar inline" style={{ width: 140 }} />
                          ) : (
                            <>
                              <Tag color="amber">Enabled — 3 tools</Tag>
                              <a className="show-all" style={{ marginTop: 0 }}>View tools</a>
                            </>
                          )}
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

                    <div className="form-field">
                      <label className="form-label" htmlFor="f-pipeline">
                        Pipeline <span className="required" aria-hidden>*</span>
                      </label>
                      <div className="chip-input" id="f-pipeline" tabIndex={0}>
                        <span className="chip">Enterprise sales <button className="x" aria-label="Remove">{I.x}</button></span>
                        <input className="chip-input-field" placeholder="Add pipeline…" />
                      </div>
                      <FieldHelp>Reps in this pipeline will see the new panel.</FieldHelp>
                    </div>

                    <div className="form-field">
                      <label className="form-label" htmlFor="f-team">
                        Team or role <span className="required" aria-hidden>*</span>
                      </label>
                      <div className="chip-input" id="f-team" tabIndex={0}>
                        <span className="chip">Enterprise AEs <button className="x" aria-label="Remove">{I.x}</button></span>
                        <span className="chip">Deal Desk team <button className="x" aria-label="Remove">{I.x}</button></span>
                        <input className="chip-input-field" placeholder="Add team or role…" />
                      </div>
                    </div>

                    <div className="form-field">
                      <label className="form-label" htmlFor="f-territory">Territory</label>
                      <div className="chip-input empty" id="f-territory" tabIndex={0}>
                        <input className="chip-input-field" placeholder="Any territory" />
                      </div>
                      <FieldHelp>Leave empty to apply across all territories.</FieldHelp>
                    </div>

                    <div className="form-field">
                      <label className="form-label">Deal size <span className="optional">(USD)</span></label>
                      <div className={`range-input ${dealSizeError ? 'error' : ''}`}>
                        <input
                          aria-label="Minimum deal size"
                          value={dealMin}
                          onChange={(e) => setDealMin(e.target.value)}
                          placeholder="No min"
                        />
                        <span className="suf">to</span>
                        <input
                          aria-label="Maximum deal size"
                          value={dealMax}
                          onChange={(e) => setDealMax(e.target.value)}
                          placeholder="No max"
                        />
                      </div>
                      {dealSizeError ? <InlineError>{dealSizeError}</InlineError> : <FieldHelp>Only opportunities in this range will be in scope.</FieldHelp>}
                    </div>

                    <div className="form-field">
                      <span className="form-label">Duration</span>
                      <div className="radio-group">
                        <label className={`radio ${duration === 'perm' ? 'checked' : ''}`}>
                          <input type="radio" name="duration" checked={duration === 'perm'} onChange={() => setDuration('perm')} />
                          <span className="dot" />
                          <span>Permanent</span>
                        </label>
                        <label className={`radio ${duration === 'pilot' ? 'checked' : ''}`}>
                          <input type="radio" name="duration" checked={duration === 'pilot'} onChange={() => setDuration('pilot')} />
                          <span className="dot" />
                          <span>Pilot for</span>
                        </label>
                        <span className={`stepper ${duration !== 'pilot' ? 'muted' : ''}`}>
                          <button type="button" aria-label="Decrease" onClick={() => setPilotN(Math.max(1, pilotN - 1))}>−</button>
                          <input aria-label="Pilot length" value={pilotN} onChange={(e) => setPilotN(parseInt(e.target.value || '1', 10) || 1)} />
                          <button type="button" aria-label="Increase" onClick={() => setPilotN(pilotN + 1)}>+</button>
                        </span>
                        <button
                          type="button"
                          className="unit-pill"
                          onClick={() => setPilotUnit(pilotUnit === 'weeks' ? 'days' : 'weeks')}
                          aria-label="Toggle pilot unit"
                        >
                          {pilotUnit}
                        </button>
                      </div>
                      {duration === 'pilot' && (
                        <FieldHelp>Access will automatically revert after {pilotN} {pilotUnit}.</FieldHelp>
                      )}
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
                <div className="diff">
                  <DiffSection title="Objects" count={1}>
                    <DiffHead />
                    <DiffRow change="+ Added object MutualActionPlan" tag={<Tag color="green">Safe</Tag>} />
                  </DiffSection>

                  <DiffSection title="Fields" count={3}>
                    <DiffHead />
                    <DiffRow change="+ Added field ProcurementStatus on Opportunity" tag={<Tag color="green">Safe</Tag>} />
                    <DiffRow change="+ Added field SecurityReview on Opportunity" tag={<Tag color="amber">Caution</Tag>} />
                    <DiffRow change="+ Added field LegalReview on Opportunity" tag={<Tag color="green">Safe</Tag>} />
                  </DiffSection>

                  <DiffSection title="Workflows" count={1}>
                    <DiffHead />
                    <DiffRow change="+ Added workflow LegalReviewRouter (trigger: stage=Negotiation)" tag={<Tag color="green">Safe</Tag>} />
                  </DiffSection>

                  <DiffSection title="Agents" count={1}>
                    <DiffHead />
                    <DiffRow change="+ Added agent DealRiskSummarizer (reads: 4, writes: 2)" tag={<Tag color="amber">Caution</Tag>} />
                  </DiffSection>

                  <DiffSection title="Permissions" count={1}>
                    <DiffHead />
                    <DiffRow change="+ Granted write Opportunity to agent DealRiskSummarizer" tag={<Tag color="amber">Needs approval</Tag>} />
                  </DiffSection>

                  <DiffSection title="Removed items" count={0}>
                    <EmptyState
                      icon={I.inbox}
                      title="No removals"
                      body="This proposal only adds new objects, fields, and workflows. Nothing is removed."
                    />
                  </DiffSection>
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
