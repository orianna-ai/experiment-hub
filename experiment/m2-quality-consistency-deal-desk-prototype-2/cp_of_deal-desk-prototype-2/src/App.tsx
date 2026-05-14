import { useMemo, useState } from 'react';
import './styles.css';

/* ============================================================
 * Inline Tabler-style icons
 * ============================================================ */

type IconProps = { size?: number; color?: string; stroke?: number };

const ico = (paths: React.ReactNode) =>
  function Icon({ size = 16, color = 'currentColor', stroke = 2 }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths}
      </svg>
    );
  };

const IconChevronRight = ico(<path d="M9 6l6 6l-6 6" />);
const IconChevronDown = ico(<path d="M6 9l6 6l6 -6" />);
const IconChevronUp = ico(<path d="M6 15l6 -6l6 6" />);
const IconUsers = ico(
  <>
    <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
  </>,
);
const IconLayout = ico(
  <>
    <rect x="4" y="4" width="6" height="6" rx="1" />
    <rect x="14" y="4" width="6" height="6" rx="1" />
    <rect x="4" y="14" width="6" height="6" rx="1" />
    <rect x="14" y="14" width="6" height="6" rx="1" />
  </>,
);
const IconBolt = ico(<path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11" />);
const IconShieldCheck = ico(
  <>
    <path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.5 3.854" />
    <path d="M15 19l2 2l4 -4" />
  </>,
);
const IconCheck = ico(<path d="M5 12l5 5l10 -10" />);
const IconCheckSquare = ico(
  <>
    <path d="M9 11l3 3l8 -8" />
    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" />
  </>,
);
const IconMail = ico(
  <>
    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
    <path d="M3 7l9 6l9 -6" />
  </>,
);
const IconMessageCircle = ico(
  <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />,
);
const IconAlertCircle = ico(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </>,
);
const IconBan = ico(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M5.7 5.7l12.6 12.6" />
  </>,
);
const IconInfoCircle = ico(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8h.01" />
    <path d="M11 12h1v4h1" />
  </>,
);
const IconUserCircle = ico(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
  </>,
);
const IconColorSwatch = ico(
  <>
    <path d="M19 3h-4a2 2 0 0 0 -2 2v12a4 4 0 0 0 8 0v-12a2 2 0 0 0 -2 -2" />
    <path d="M13 7.35l-2 -2a2 2 0 0 0 -2.828 0l-2.828 2.828a2 2 0 0 0 0 2.828l9 9" />
    <path d="M7.3 13h-2.3a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h12" />
    <circle cx="17" cy="17" r=".01" />
  </>,
);
const IconAt = ico(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0v-1.5a9 9 0 1 0 -5.5 8.28" />
  </>,
);
const IconSettings = ico(
  <>
    <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);
const IconHierarchy = ico(
  <>
    <circle cx="6" cy="18" r="2" />
    <circle cx="12" cy="6" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M11.464 7.536l-4.464 8.928" />
    <path d="M12.536 7.536l4.464 8.928" />
  </>,
);
const IconCurrency = ico(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 -1.8 -1" />
    <path d="M12 6v2m0 8v2" />
  </>,
);
const IconApi = ico(
  <>
    <path d="M4 13h5" />
    <path d="M12 16v-8h3a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2h-3" />
    <path d="M20 8v8" />
    <path d="M9 16v-5.5a2.5 2.5 0 0 0 -5 0v5.5" />
  </>,
);
const IconPlug = ico(
  <>
    <path d="M9.785 6l8.215 8.215l-2.054 2.054a5.81 5.81 0 1 1 -8.215 -8.215l2.054 -2.054z" />
    <path d="M4 20l3.5 -3.5" />
    <path d="M15 4l-3.5 3.5" />
    <path d="M20 9l-3.5 3.5" />
  </>,
);
const IconSparkles = ico(
  <>
    <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z" />
  </>,
);
const IconKey = ico(
  <>
    <path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z" />
    <circle cx="15" cy="9" r="1" />
  </>,
);
const IconRocket = ico(
  <>
    <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" />
    <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" />
    <circle cx="15" cy="9" r="1" />
  </>,
);
const IconHelp = ico(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 17v.01" />
    <path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" />
  </>,
);
const IconDoor = ico(
  <>
    <path d="M13 12v.01" />
    <path d="M3 21h18" />
    <path d="M5 21v-16a2 2 0 0 1 2 -2h7.5m2.5 10.5v7.5" />
    <path d="M14 7h7m-3 -3l3 3l-3 3" />
  </>,
);
const IconChevronLeft = ico(<path d="M15 6l-6 6l6 6" />);
const IconWand = ico(
  <>
    <path d="M6 21l15 -15l-3 -3l-15 15l3 3" />
    <path d="M15 6l3 3" />
    <path d="M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
    <path d="M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
  </>,
);

/* ============================================================
 * Sidebar (Settings nav)
 * ============================================================ */

const SettingsSidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-back">
        <IconChevronLeft size={14} />
        <span>Settings</span>
      </div>

      <div className="workspace-pill">
        <div className="ws-avatar">A</div>
        <div className="ws-name">Acme Inc</div>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">User</div>
        <div className="nav-item">
          <IconUserCircle size={16} />
          Profile
        </div>
        <div className="nav-item">
          <IconColorSwatch size={16} />
          Experience
        </div>
        <div className="nav-item">
          <IconAt size={16} />
          Accounts
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">Workspace</div>
        <div className="nav-item">
          <IconSettings size={16} />
          General
        </div>
        <div className="nav-item">
          <IconHierarchy size={16} />
          Data model
        </div>
        <div className="nav-item">
          <IconUsers size={16} />
          Members
        </div>
        <div className="nav-item">
          <IconCurrency size={16} />
          Billing
        </div>
        <div className="nav-item">
          <IconApi size={16} />
          APIs &amp; Webhooks
        </div>
        <div className="nav-item active">
          <IconPlug size={16} />
          Apps
          <span className="modifier-tag">New</span>
        </div>
        <div className="nav-item">
          <IconSparkles size={16} />
          AI
          <span className="modifier-tag">New</span>
        </div>
        <div className="nav-item">
          <IconKey size={16} />
          Security
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">Other</div>
        <div className="nav-item">
          <IconRocket size={16} />
          Updates
        </div>
        <div className="nav-item">
          <IconHelp size={16} />
          Documentation
        </div>
        <div className="nav-item">
          <IconDoor size={16} />
          Logout
        </div>
      </div>
    </aside>
  );
};

/* ============================================================
 * Top bar with breadcrumb
 * ============================================================ */

const TopBar = () => (
  <div className="top-bar">
    <div className="breadcrumb">
      <span className="breadcrumb-link">Settings</span>
      <span className="breadcrumb-sep">
        <IconChevronRight size={12} />
      </span>
      <span className="breadcrumb-link">Apps</span>
      <span className="breadcrumb-sep">
        <IconChevronRight size={12} />
      </span>
      <span className="breadcrumb-current">Deal Desk</span>
    </div>
  </div>
);

/* ============================================================
 * Page header
 * ============================================================ */

const PageHeader = () => (
  <div className="page-header-row">
    <div className="app-icon">
      <IconWand size={20} />
    </div>
    <div className="page-header-title-block">
      <div className="page-header-title">Deal Desk</div>
      <div className="page-header-subtitle">
        Built by Claude
        <span className="subtitle-dot"></span>
        <span className="pending-pill">
          <span className="dot"></span>
          Pending review
        </span>
      </div>
    </div>
    <button className="btn btn-ghost">Discard</button>
  </div>
);

/* ============================================================
 * Section 1 — Summary
 * ============================================================ */

type ConflictState = 'unresolved' | 'reuse' | 'new';

const Section1Summary = ({
  showTechnical,
  setShowTechnical,
  conflictResolved,
  setConflictResolved,
}: {
  showTechnical: boolean;
  setShowTechnical: (v: boolean) => void;
  conflictResolved: ConflictState;
  setConflictResolved: (v: ConflictState) => void;
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-num">1</div>
        <div className="section-title">What changes</div>
      </div>
      <div className="card">
        <div className="summary-headline">
          Adds a Deal Desk workflow to Enterprise opportunities so reps can
          track procurement, security, and legal review in one place.
        </div>
        <div className="summary-grid">
          <div className="summary-row">
            <span className="icon">
              <IconUsers size={16} />
            </span>
            <div>
              <div className="label">Affects</div>
              <div className="value">
                <span className="value-main">
                  Enterprise AEs (estimated 14 reps)
                </span>
              </div>
            </div>
          </div>
          <div className="summary-row">
            <span className="icon">
              <IconLayout size={16} />
            </span>
            <div>
              <div className="label">New surfaces</div>
              <div className="value">
                <span className="value-main">
                  Deal Desk panel on Opportunity page
                </span>
              </div>
            </div>
          </div>
          <div className="summary-row">
            <span className="icon">
              <IconBolt size={16} />
            </span>
            <div>
              <div className="label">New automations</div>
              <div className="value">
                <span className="value-main">1 workflow, 1 AI agent</span>
              </div>
            </div>
          </div>
          <div className="summary-row">
            <span className="icon">
              <IconShieldCheck size={16} />
            </span>
            <div style={{ position: 'relative' }}>
              <div className="label">Data scope</div>
              <div className="value">
                <span className="value-main">
                  Opportunities in Enterprise pipeline
                </span>
                {conflictResolved === 'unresolved' && (
                  <span
                    className="chip warning"
                    onClick={() => setPopoverOpen(!popoverOpen)}
                  >
                    <IconAlertCircle size={11} />
                    Conflict
                  </span>
                )}
                {conflictResolved !== 'unresolved' && (
                  <span className="chip success">
                    <IconCheck size={11} />
                    Resolved
                  </span>
                )}
              </div>
              {popoverOpen && conflictResolved === 'unresolved' && (
                <div
                  className="popover"
                  style={{ top: 'calc(100% + 8px)', left: 0 }}
                >
                  <div className="popover-arrow" />
                  <div className="popover-title">
                    Conflicts with: Security Review
                  </div>
                  <div className="popover-body">
                    An existing field on Opportunity already covers this.
                  </div>
                  <div className="popover-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setConflictResolved('reuse');
                        setPopoverOpen(false);
                      }}
                    >
                      Use existing field
                    </button>
                    <button
                      className="btn btn-sm"
                      onClick={() => {
                        setConflictResolved('new');
                        setPopoverOpen(false);
                      }}
                    >
                      Keep as new field
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          className="text-link"
          onClick={() => setShowTechnical(!showTechnical)}
        >
          {showTechnical ? 'Hide' : 'Show'} technical details
          {showTechnical ? (
            <IconChevronUp size={12} />
          ) : (
            <IconChevronDown size={12} />
          )}
        </button>

        {showTechnical && (
          <div className="tech-list">
            <div className="tech-group">
              <div className="tech-group-title">Objects</div>
              <div className="tech-line">
                <span className="plus">+</span> object: MutualActionPlan
              </div>
            </div>
            <div className="tech-group">
              <div className="tech-group-title">Fields</div>
              <div className="tech-line">
                <span className="plus">+</span> field:
                Opportunity.procurementStatus
              </div>
              <div className="tech-line">
                <span className="plus">+</span> field:
                Opportunity.legalReviewStatus
              </div>
              <div className="tech-line">
                <span className="equal">=</span> field:
                Opportunity.securityReview (reuses existing)
              </div>
              <div className="tech-line">
                <span className="plus">+</span> field:
                Opportunity.dealRiskSummary
              </div>
            </div>
            <div className="tech-group">
              <div className="tech-group-title">Workflows</div>
              <div className="tech-line">
                <span className="plus">+</span> workflow:
                enterpriseDealDeskKickoff
              </div>
            </div>
            <div className="tech-group">
              <div className="tech-group-title">Agents</div>
              <div className="tech-line">
                <span className="plus">+</span> agent: DealDeskAssistant
              </div>
            </div>
            <div className="tech-group">
              <div className="tech-group-title">Views</div>
              <div className="tech-line">
                <span className="tilde">~</span> view: Opportunity.recordPage
                (adds Deal Desk panel)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================
 * Section 2 — Preview
 * ============================================================ */

const Section2Preview = () => {
  const [sample, setSample] = useState('Acme Corp · $250k · Negotiation');

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-num">2</div>
        <div className="section-title">Try it on a sample deal</div>
      </div>
      <div className="card">
        <div className="preview-bar">
          <div className="preview-bar-left">
            <span className="preview-bar-label">Sample opportunity</span>
            <select
              className="select select-280"
              value={sample}
              onChange={(e) => setSample(e.target.value)}
            >
              <option>Acme Corp · $250k · Negotiation</option>
              <option>Globex · $480k · Procurement</option>
              <option>Initech · $120k · Discovery</option>
            </select>
          </div>
          <span className="badge info">
            Preview — no changes are saved
          </span>
        </div>

        <div className="preview-frame">
          <div className="preview-page">
            <div className="record-header">
              <div className="record-avatar">A</div>
              <div className="record-title-block">
                <div className="record-title">Acme Corp</div>
                <div className="record-meta">
                  <span>$250,000 ARR</span>
                  <span className="stage-pill">Negotiation</span>
                  <span>Close · Aug 30, 2026</span>
                </div>
              </div>
            </div>

            <div className="field-section-title">Opportunity</div>
            <div className="field-row">
              <div className="field-label">Owner</div>
              <div className="field-value">Maya Patel</div>
            </div>
            <div className="field-row">
              <div className="field-label">Account executive</div>
              <div className="field-value">Maya Patel</div>
            </div>
            <div className="field-row">
              <div className="field-label">Pipeline</div>
              <div className="field-value">Enterprise</div>
            </div>
            <div className="field-row">
              <div className="field-label">Source</div>
              <div className="field-value">Outbound</div>
            </div>

            <div className="field-section-title">
              Deal Desk
              <span className="chip info chip-inline-label">
                <IconSparkles size={11} />
                Added by app
              </span>
            </div>
            <div className="field-row">
              <div className="field-label">
                Procurement status
                <span className="field-required">*</span>
              </div>
              <div className="field-value">
                <span className="chip neutral">In review</span>
              </div>
            </div>
            <div className="field-row">
              <div className="field-label">
                Security review
                <span className="field-required">*</span>
              </div>
              <div className="field-value">
                <span className="chip warning">Awaiting docs</span>
              </div>
            </div>
            <div className="field-row">
              <div className="field-label">
                Legal review
                <span className="field-required">*</span>
              </div>
              <div className="field-value">
                <span className="chip neutral">Not started</span>
              </div>
            </div>

            <div className="deal-desk-panel">
              <div className="deal-desk-panel-tag">Deal Desk panel</div>
              <div className="deal-desk-title">
                <IconShieldCheck size={14} />
                Mutual action plan
              </div>
              <div className="deal-desk-checks">
                <div className="deal-desk-check">
                  <span className="dd-check-icon complete">
                    <IconCheck size={10} color="white" />
                  </span>
                  <span>NDA signed</span>
                  <span className="dd-check-status">Aug 4</span>
                </div>
                <div className="deal-desk-check">
                  <span className="dd-check-icon complete">
                    <IconCheck size={10} color="white" />
                  </span>
                  <span>Procurement intake submitted</span>
                  <span className="dd-check-status">Aug 6</span>
                </div>
                <div className="deal-desk-check">
                  <span className="dd-check-icon pending"></span>
                  <span>Security review (SOC 2 + DPA)</span>
                  <span className="dd-check-status">In review</span>
                </div>
                <div className="deal-desk-check">
                  <span className="dd-check-icon pending"></span>
                  <span>Legal redlines complete</span>
                  <span className="dd-check-status">Pending</span>
                </div>
                <div className="deal-desk-check">
                  <span className="dd-check-icon pending"></span>
                  <span>MSA signed</span>
                  <span className="dd-check-status">Pending</span>
                </div>
              </div>
            </div>

            <div className="ai-preview-wrap">
              <div className="ai-preview-tag">AI preview</div>
              <div className="ai-preview-title">Deal risk summary</div>
              <div className="ai-preview-body">
                Acme is on track for an end-of-month close, but security
                review is the critical path: the prospect has not returned a
                completed SIG-Lite questionnaire from 6 days ago. Procurement
                is moving normally. Legal redlines are unstarted; expect a
                3-5 day cycle once legal receives the MSA.
              </div>
            </div>
          </div>
        </div>

        <div className="side-effects">
          <div className="side-effects-header">
            Side effects (not run)
            <span className="se-icon">
              <IconInfoCircle size={12} />
            </span>
          </div>
          <div className="side-effects-list">
            <div className="side-effect-row">
              <span className="se-icon">
                <IconCheckSquare size={14} />
              </span>
              <span className="se-text">
                Create task: "Confirm procurement contact" assigned to AE
              </span>
              <span className="se-link">View payload</span>
            </div>
            <div className="side-effect-row">
              <span className="se-icon">
                <IconMessageCircle size={14} />
              </span>
              <span className="se-text">
                Post Slack message to #deals: "Acme Corp moved to procurement
                stage"
              </span>
              <span className="se-link">View payload</span>
            </div>
            <div className="side-effect-row">
              <span className="se-icon">
                <IconBolt size={14} />
              </span>
              <span className="se-text">
                Workflow step: notify deal-desk@acme.example when SIG-Lite
                returns
              </span>
              <span className="se-link">View payload</span>
            </div>
            <div className="side-effect-row">
              <span className="se-icon">
                <IconMail size={14} />
              </span>
              <span className="se-text">
                Draft email to Maya Patel: "Procurement intake reminder"
              </span>
              <span className="se-link">View payload</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
 * Section 3 — Permissions
 * ============================================================ */

type PermPill = {
  key: string;
  label: string;
  on: boolean;
  policy: 'ok' | 'amber' | 'red';
};

const PermPillGroup = ({
  label,
  pills,
  onToggle,
}: {
  label: string;
  pills: PermPill[];
  onToggle: (key: string) => void;
}) => (
  <div className="perm-subsection">
    <div className="perm-subsection-label">{label}</div>
    <div className="perm-pill-row">
      {pills.map((p) => (
        <div
          key={p.key}
          className={`perm-pill${!p.on ? ' off' : ''}${
            p.policy === 'red' ? ' disabled-policy' : ''
          }`}
          title={
            p.policy === 'red'
              ? 'Disallowed by workspace policy'
              : undefined
          }
        >
          <span className="perm-pill-label">{p.label}</span>
          <span
            className={`switch${p.on ? ' on' : ''}${
              p.policy === 'red' ? ' disabled' : ''
            }`}
            onClick={() => p.policy !== 'red' && onToggle(p.key)}
          />
        </div>
      ))}
    </div>
  </div>
);

const Section3Permissions = ({
  reads,
  writes,
  acts,
  toggleRead,
  toggleWrite,
  toggleAct,
  outcome,
}: {
  reads: PermPill[];
  writes: PermPill[];
  acts: PermPill[];
  toggleRead: (k: string) => void;
  toggleWrite: (k: string) => void;
  toggleAct: (k: string) => void;
  outcome: 'green' | 'amber' | 'red';
}) => {
  let outcomeChip: React.ReactNode;
  if (outcome === 'green')
    outcomeChip = (
      <span className="chip success">
        <IconCheck size={11} /> Inside policy
      </span>
    );
  else if (outcome === 'amber')
    outcomeChip = (
      <span className="chip warning">
        <IconAlertCircle size={11} /> Needs admin approval
      </span>
    );
  else
    outcomeChip = (
      <span className="chip danger">
        <IconBan size={11} /> Blocked by policy
      </span>
    );

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-num">3</div>
        <div className="section-title">What the AI agent can do</div>
      </div>
      <div className="card">
        <div className="agent-header-row">
          <div className="app-icon app-icon-xs">
            <IconSparkles size={12} />
          </div>
          <div className="agent-name">DealDeskAssistant</div>
          <div className="agent-spacer" />
          {outcomeChip}
        </div>

        <PermPillGroup label="Reads" pills={reads} onToggle={toggleRead} />
        <PermPillGroup label="Writes" pills={writes} onToggle={toggleWrite} />
        <PermPillGroup label="Acts" pills={acts} onToggle={toggleAct} />

        <div className="perm-helper">
          Workspace admins define what's allowed.{' '}
          <a>See Security &amp; Policies.</a>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
 * Section 4 — Rollout
 * ============================================================ */

const Section4Rollout = ({
  pilotOn,
  setPilotOn,
  pilotDuration,
  setPilotDuration,
  pilotUnit,
  setPilotUnit,
  showAdvanced,
  setShowAdvanced,
  endDateLabel,
}: {
  pilotOn: boolean;
  setPilotOn: (v: boolean) => void;
  pilotDuration: number;
  setPilotDuration: (n: number) => void;
  pilotUnit: 'days' | 'weeks';
  setPilotUnit: (v: 'days' | 'weeks') => void;
  showAdvanced: boolean;
  setShowAdvanced: (v: boolean) => void;
  endDateLabel: string | null;
}) => {
  return (
    <div className="section">
      <div className="section-header">
        <div className="section-num">4</div>
        <div className="section-title">Who gets it</div>
      </div>
      <div className="card">
        <div className="filter-row">
          <div className="filter-group">
            <div className="filter-label">Pipeline</div>
            <div className="select select-multi select-wide">
              <span className="chip neutral">Enterprise</span>
              <span className="select-trailing">
                <IconChevronDown size={14} />
              </span>
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-label">Team / role</div>
            <div className="select select-multi select-wide">
              <span className="chip neutral">Enterprise AE</span>
              <span className="select-trailing">
                <IconChevronDown size={14} />
              </span>
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-label">Territory</div>
            <div className="select select-multi select-wide">
              <span className="select-placeholder">All territories</span>
              <span className="select-trailing">
                <IconChevronDown size={14} />
              </span>
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-label">Deal size</div>
            <div className="deal-size-input">
              <span className="select-placeholder">≥ $</span>
              <input type="text" defaultValue="100,000" />
            </div>
          </div>
        </div>

        <div className="estimate-row">
          <IconUsers size={14} />
          Estimated reach: <strong>14 reps</strong> ·{' '}
          <strong>47 opportunities</strong>
        </div>

        <div className="pilot-row">
          <span
            className={`switch${pilotOn ? ' on' : ''}`}
            onClick={() => setPilotOn(!pilotOn)}
          />
          <span className="pilot-label">Time-box this rollout</span>
          {pilotOn && (
            <>
              <span className="text-secondary">for</span>
              <input
                className="pilot-num-input"
                type="number"
                min={1}
                value={pilotDuration}
                onChange={(e) =>
                  setPilotDuration(Math.max(1, Number(e.target.value) || 1))
                }
              />
              <select
                className="select pilot-unit-select"
                value={pilotUnit}
                onChange={(e) =>
                  setPilotUnit(e.target.value as 'days' | 'weeks')
                }
              >
                <option value="days">days</option>
                <option value="weeks">weeks</option>
              </select>
              <span className="pilot-end">{endDateLabel}</span>
            </>
          )}
        </div>

        <div className="advanced-toggle">
          <button
            className="text-link"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Advanced
            {showAdvanced ? (
              <IconChevronUp size={12} />
            ) : (
              <IconChevronDown size={12} />
            )}
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-panel">
            <div className="filter-group">
              <div className="filter-label">Specific users</div>
              <div className="select select-multi select-xwide">
                <span className="select-placeholder">Add users…</span>
                <span className="select-trailing">
                  <IconChevronDown size={14} />
                </span>
              </div>
              <div className="filter-helper">
                Use to override the filter above.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================
 * Sticky deploy bar
 * ============================================================ */

const DeployBar = ({
  outcome,
  pilotOn,
  endDate,
  conflictResolved,
}: {
  outcome: 'green' | 'amber' | 'red';
  pilotOn: boolean;
  endDate: string | null;
  conflictResolved: ConflictState;
}) => {
  const hasConflict = conflictResolved === 'unresolved';

  let chip: React.ReactNode;
  if (outcome === 'green')
    chip = (
      <span className="chip success">
        <IconCheck size={11} /> Inside policy
      </span>
    );
  else if (outcome === 'amber')
    chip = (
      <span className="chip warning">
        <IconAlertCircle size={11} /> Needs admin approval
      </span>
    );
  else
    chip = (
      <span className="chip danger">
        <IconBan size={11} /> Blocked by policy
      </span>
    );

  let summary: React.ReactNode;
  if (outcome === 'green') {
    summary = (
      <>
        Will deploy to <strong>14 reps</strong>.
        {pilotOn && endDate ? (
          <> Pilot ends {endDate.replace('Auto-revert on ', '')}.</>
        ) : null}
      </>
    );
  } else if (outcome === 'amber') {
    summary = (
      <>
        Admin approval required for <strong>2 changes</strong>.
      </>
    );
  } else {
    summary = (
      <>
        Blocked by <strong>1 workspace policy</strong>.
      </>
    );
  }

  let buttonLabel: string;
  let buttonDisabled = false;
  if (hasConflict) {
    buttonLabel = 'Resolve 1 conflict';
    buttonDisabled = true;
  } else if (outcome === 'green') {
    buttonLabel = 'Deploy app';
  } else if (outcome === 'amber') {
    buttonLabel = 'Request admin approval';
  } else {
    buttonLabel = 'Cannot deploy';
    buttonDisabled = true;
  }

  return (
    <div className="deploy-bar">
      {chip}
      <div className="deploy-bar-summary">{summary}</div>
      <button
        className={`btn btn-primary${buttonDisabled ? ' btn-disabled' : ''}`}
      >
        {buttonLabel}
      </button>
    </div>
  );
};

/* ============================================================
 * App
 * ============================================================ */

function App() {
  const [showTechnical, setShowTechnical] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pilotOn, setPilotOn] = useState(true);
  const [pilotDuration, setPilotDuration] = useState(2);
  const [pilotUnit, setPilotUnit] = useState<'days' | 'weeks'>('weeks');
  const [conflictResolved, setConflictResolved] =
    useState<ConflictState>('unresolved');

  const [reads, setReads] = useState<PermPill[]>([
    { key: 'opps', label: 'Opportunities', on: true, policy: 'ok' },
    { key: 'companies', label: 'Companies', on: true, policy: 'ok' },
    { key: 'activities', label: 'Activities', on: true, policy: 'ok' },
    { key: 'contacts', label: 'Contacts', on: true, policy: 'ok' },
  ]);
  const [writes, setWrites] = useState<PermPill[]>([
    {
      key: 'risk',
      label: 'Opportunity.dealRiskSummary',
      on: true,
      policy: 'ok',
    },
    { key: 'task', label: 'Task (create)', on: true, policy: 'ok' },
    {
      key: 'stage',
      label: 'Opportunity.stage',
      on: false,
      policy: 'amber',
    },
  ]);
  const [acts, setActs] = useState<PermPill[]>([
    {
      key: 'slack',
      label: 'Send Slack to #deals',
      on: true,
      policy: 'amber',
    },
    {
      key: 'email',
      label: 'Send external email',
      on: false,
      policy: 'red',
    },
  ]);

  const toggleRead = (k: string) =>
    setReads((rs) =>
      rs.map((p) => (p.key === k ? { ...p, on: !p.on } : p)),
    );
  const toggleWrite = (k: string) =>
    setWrites((ws) =>
      ws.map((p) => (p.key === k ? { ...p, on: !p.on } : p)),
    );
  const toggleAct = (k: string) =>
    setActs((as) => as.map((p) => (p.key === k ? { ...p, on: !p.on } : p)));

  const outcome: 'green' | 'amber' | 'red' = useMemo(() => {
    const all = [...reads, ...writes, ...acts];
    const activePills = all.filter((p) => p.on);
    if (activePills.some((p) => p.policy === 'red')) return 'red';
    if (activePills.some((p) => p.policy === 'amber')) return 'amber';
    return 'green';
  }, [reads, writes, acts]);

  const endDateLabel = useMemo(() => {
    if (!pilotOn) return null;
    const days = pilotUnit === 'days' ? pilotDuration : pilotDuration * 7;
    const end = new Date(2026, 7, 11 + days);
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `Auto-revert on ${monthNames[end.getMonth()]} ${end.getDate()}`;
  }, [pilotOn, pilotDuration, pilotUnit]);

  return (
    <div className="app-root">
      <SettingsSidebar />
      <main className="page-main">
        <TopBar />
        <div className="page-body">
          <div className="page-body-inner">
            <PageHeader />

            <Section1Summary
              showTechnical={showTechnical}
              setShowTechnical={setShowTechnical}
              conflictResolved={conflictResolved}
              setConflictResolved={setConflictResolved}
            />

            <Section2Preview />

            <Section3Permissions
              reads={reads}
              writes={writes}
              acts={acts}
              toggleRead={toggleRead}
              toggleWrite={toggleWrite}
              toggleAct={toggleAct}
              outcome={outcome}
            />

            <Section4Rollout
              pilotOn={pilotOn}
              setPilotOn={setPilotOn}
              pilotDuration={pilotDuration}
              setPilotDuration={setPilotDuration}
              pilotUnit={pilotUnit}
              setPilotUnit={setPilotUnit}
              showAdvanced={showAdvanced}
              setShowAdvanced={setShowAdvanced}
              endDateLabel={endDateLabel}
            />

            <DeployBar
              outcome={outcome}
              pilotOn={pilotOn}
              endDate={endDateLabel}
              conflictResolved={conflictResolved}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
