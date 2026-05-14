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
              <div className="title-block">
                <div className="eyebrow">
                  <Tag color="blue" variant="solid">{I.sparkles} Proposed by Claude</Tag>
                  <span className="dot" />
                  <span>3 min ago</span>
                  <span className="dot" />
                  <span>v0.1 draft</span>
                </div>
                <h1>Deal Desk</h1>
                <p className="page-sub">
                  Adds a Deal Desk workflow to enterprise opportunities. Reps see a
                  panel tracking procurement, security and legal review on each deal,
                  an AI deal-risk summary, and a workflow that auto-routes contracts
                  to legal.
                </p>
              </div>
              <div className="actions">
                <button className="btn">Reject</button>
                <button className="btn primary" onClick={() => setTab('rollout')}>Continue to rollout</button>
              </div>
            </div>

            <div className="policy-banner warn lead">
              <div className="banner-icon">{I.warning}</div>
              <div className="banner-body">
                <div className="banner-title">Needs admin approval before deploy</div>
                <div className="sub">1 module crosses workspace policy. Request approval from the action bar below.</div>
                <div className="chips">
                  <Tag color="amber" variant="outline">Agent: write access to Opportunity</Tag>
                </div>
              </div>
            </div>

            <div className="summary-grid">
              <div className="card">
                <div className="card-head">
                  <h2 className="card-title">What this app changes</h2>
                  <span className="card-meta">5 of 8 items</span>
                </div>

                <div className="change-list">
                  <div className="change-row-wrap risk-safe">
                    <div className="main">
                      <span className="icon">{I.apps}</span>
                      <div className="row-text">
                        <div className="label">New panel on Opportunity</div>
                        <div className="detail">Procurement, Security, Legal review</div>
                      </div>
                      <Tag color="green">Safe</Tag>
                    </div>
                  </div>
                  <div className="change-row-wrap risk-caution">
                    <div className="main">
                      <span className="icon">{I.database}</span>
                      <div className="row-text">
                        <div className="label">3 new fields on Opportunity</div>
                        <div className="detail">Procurement, Security Review, Legal Review</div>
                      </div>
                      <Tag color="amber">Caution</Tag>
                    </div>
                    <div className="conflict">
                      {I.warning}
                      <span>Looks similar to existing field "Sec. Review" — review before deploying.</span>
                    </div>
                  </div>
                  <div className="change-row-wrap risk-safe">
                    <div className="main">
                      <span className="icon">{I.database}</span>
                      <div className="row-text">
                        <div className="label">New object: Mutual Action Plan</div>
                        <div className="detail">Linked to Opportunity</div>
                      </div>
                      <Tag color="green">Safe</Tag>
                    </div>
                  </div>
                  <div className="change-row-wrap risk-caution">
                    <div className="main">
                      <span className="icon">{I.robot}</span>
                      <div className="row-text">
                        <div className="label">New AI agent</div>
                        <div className="detail">Drafts deal-risk summaries</div>
                      </div>
                      <Tag color="amber">Caution</Tag>
                    </div>
                  </div>
                  <div className="change-row-wrap risk-safe">
                    <div className="main">
                      <span className="icon">{I.route}</span>
                      <div className="row-text">
                        <div className="label">New workflow</div>
                        <div className="detail">Auto-route to Legal when stage = Negotiation</div>
                      </div>
                      <Tag color="green">Safe</Tag>
                    </div>
                  </div>
                </div>

                <div className="show-all">Show all 8 changes</div>
              </div>

              <div className="trust-stack">
                <div className="card impact-summary">
                  <div className="impact-hero">
                    <div className="big">28</div>
                    <div className="big-lbl">reps will see this</div>
                  </div>
                  <div className="impact-grid">
                    <div className="impact-cell">
                      <div className="num">2</div>
                      <div className="lbl">Record pages</div>
                    </div>
                    <div className="impact-cell">
                      <div className="num">1</div>
                      <div className="lbl">Workflow</div>
                    </div>
                    <div className="impact-cell">
                      <div className="num">1</div>
                      <div className="lbl">AI agent</div>
                    </div>
                  </div>
                </div>

                <div className="disclosure">
                  <span>Agent reads 4 objects · writes 2 · no email</span>
                  {I.caret}
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
            <Status color="amber">Approval required</Status>
            <span className="sub">Agent: write access to Opportunity{caps.notify ? ' · Send external notifications' : ''}</span>
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
