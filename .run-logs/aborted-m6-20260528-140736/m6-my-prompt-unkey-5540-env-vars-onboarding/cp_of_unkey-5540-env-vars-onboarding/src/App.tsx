import { useMemo, useState, type FormEvent } from "react";
import "./App.css";

type WizardStep =
  | "create-project"
  | "connect-github"
  | "select-repo"
  | "configure-deployment"
  | "configure-env-vars"
  | "deploying";

type Environment = {
  id: string;
  slug: string;
};

type EnvVar = {
  id: string;
  key: string;
  value: string;
  environmentId: string;
  type: "writeonly" | "recoverable";
  updatedAt: string;
  note?: string;
};

type Surface = "onboarding" | "overview";

const environments: Environment[] = [
  { id: "env-production", slug: "production" },
  { id: "env-preview", slug: "preview" },
  { id: "env-development", slug: "development" },
];

const initialEnvVars: EnvVar[] = [
  {
    id: "env-var-1",
    key: "DATABASE_URL",
    value: "postgres://deploy:secret@db.unkey.dev:5432/api",
    environmentId: "env-production",
    type: "writeonly",
    updatedAt: "2m ago",
    note: "Supabase production connection string",
  },
  {
    id: "env-var-2",
    key: "NEXT_PUBLIC_APP_URL",
    value: "https://api-starter.unkey.app",
    environmentId: "env-production",
    type: "recoverable",
    updatedAt: "8m ago",
  },
  {
    id: "env-var-3",
    key: "UNKEY_API_ID",
    value: "api_2c4q7N7rG5hfV9",
    environmentId: "env-preview",
    type: "recoverable",
    updatedAt: "18m ago",
    note: "Used by the edge middleware",
  },
];

const repos = [
  {
    id: 1,
    fullName: "acme/api-starter",
    branch: "main",
    language: "TypeScript",
    pushed: "3m ago",
    dockerfile: true,
  },
  {
    id: 2,
    fullName: "acme/customer-portal",
    branch: "main",
    language: "Go",
    pushed: "1h ago",
    dockerfile: true,
  },
  {
    id: 3,
    fullName: "acme/docs",
    branch: "main",
    language: "MDX",
    pushed: "yesterday",
    dockerfile: false,
  },
];

function App() {
  const [surface, setSurface] = useState<Surface>("onboarding");
  const [step, setStep] = useState<WizardStep>("configure-env-vars");
  const [projectName, setProjectName] = useState("API Starter");
  const [projectSlug, setProjectSlug] = useState("api-starter");
  const [selectedRepo, setSelectedRepo] = useState("acme/api-starter");
  const [envVars, setEnvVars] = useState<EnvVar[]>(initialEnvVars);
  const [showRedeployBanner, setShowRedeployBanner] = useState(false);

  const goToOnboarding = (targetStep: WizardStep) => {
    setSurface("onboarding");
    setStep(targetStep);
  };

  const saveEnvVars = (newVars: EnvVar[]) => {
    setEnvVars((current) => [...newVars, ...current]);
    setShowRedeployBanner(true);
  };

  return (
    <div className="dashboard-shell">
      <AppSidebar
        activeSurface={surface}
        projectName={projectName}
        onNewProject={() => goToOnboarding("create-project")}
        onProjectOverview={() => setSurface("overview")}
      />
      <main className="workspace-main">
        {surface === "overview" ? (
          <ProjectOverview
            projectName={projectName}
            projectSlug={projectSlug}
            envVars={envVars}
            onSaveEnvVars={saveEnvVars}
            showRedeployBanner={showRedeployBanner}
            onDismissRedeploy={() => setShowRedeployBanner(false)}
          />
        ) : (
          <Onboarding
            step={step}
            projectName={projectName}
            projectSlug={projectSlug}
            selectedRepo={selectedRepo}
            envVars={envVars}
            onSetStep={setStep}
            onSetProject={(name, slug) => {
              setProjectName(name);
              setProjectSlug(slug);
            }}
            onSetRepo={setSelectedRepo}
            onSaveEnvVars={saveEnvVars}
            onOpenOverview={() => setSurface("overview")}
          />
        )}
      </main>
    </div>
  );
}

function AppSidebar({
  activeSurface,
  projectName,
  onNewProject,
  onProjectOverview,
}: {
  activeSurface: Surface;
  projectName: string;
  onNewProject: () => void;
  onProjectOverview: () => void;
}) {
  const isResourceLevel = activeSurface === "overview";

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="product-switcher" type="button">
          <span>
            <Icon name="cloud" size={18} />
            Deploy
          </span>
          <Icon name="chevron-down" size={14} />
        </button>
        <button className="sidebar-collapse" type="button" aria-label="Collapse sidebar">
          <Icon name="chevron-left" size={18} />
        </button>
      </div>

      {isResourceLevel ? (
        <button className="resource-back" type="button" onClick={onNewProject}>
          <Icon name="chevron-left" size={12} />
          Back to All Projects
        </button>
      ) : null}

      <nav className="sidebar-nav">
        {isResourceLevel ? (
          <div className="resource-nav-group">
            <button className="nav-item is-active" type="button" onClick={onProjectOverview}>
              <Icon name="layers" />
              <span>{projectName}</span>
            </button>
            <div className="nav-submenu">
              <button className="nav-subitem" type="button">
                <Icon name="layers" />
                Deployments
              </button>
              <button className="nav-subitem" type="button">
                <Icon name="activity" />
                Logs
              </button>
              <button className="nav-subitem" type="button">
                <Icon name="nodes" />
                Requests
              </button>
              <button className="nav-subitem is-current" type="button" onClick={onProjectOverview}>
                <Icon name="filter" />
                Environment Variables
              </button>
              <button className="nav-subitem" type="button">
                <Icon name="gear" />
                Settings
              </button>
            </div>
          </div>
        ) : (
          <button className="nav-item is-active" type="button" onClick={onNewProject}>
            <Icon name="layers" />
            Projects
          </button>
        )}
      </nav>

      <div className="sidebar-section">
        <button className="nav-item" type="button">
          <Icon name="search" />
          Audit Log
        </button>
        <button className="nav-item" type="button">
          <Icon name="gear" />
          Workspace Settings
          <Icon name="chevron-right" size={12} className="nav-chevron" />
        </button>
      </div>

      <button className="usage-item" type="button">
        <span className="usage-ring" />
        Usage 0%
      </button>

      <div className="sidebar-footer">
        <button className="workspace-switcher" type="button">
          <div className="avatar">A</div>
          <span>Acme Cloud</span>
          <Icon name="chevron-down" size={14} />
        </button>
        <button className="help-button" type="button" aria-label="Help Options">
          <Icon name="info" size={18} />
        </button>
      </div>
    </aside>
  );
}

function Onboarding({
  step,
  projectName,
  projectSlug,
  selectedRepo,
  envVars,
  onSetStep,
  onSetProject,
  onSetRepo,
  onSaveEnvVars,
  onOpenOverview,
}: {
  step: WizardStep;
  projectName: string;
  projectSlug: string;
  selectedRepo: string;
  envVars: EnvVar[];
  onSetStep: (step: WizardStep) => void;
  onSetProject: (name: string, slug: string) => void;
  onSetRepo: (repo: string) => void;
  onSaveEnvVars: (newVars: EnvVar[]) => void;
  onOpenOverview: () => void;
}) {
  if (step === "create-project") {
    return (
      <OnboardingStepContainer>
        <OnboardingStepHeader
          title="Deploy your first project"
          subtitle={
            <>
              Connect a GitHub repo and get a live URL in minutes.
              <br />
              Unkey handles builds, infra, scaling, and routing.
            </>
          }
          showIconRow
        />
        <CreateProjectStep
          projectName={projectName}
          projectSlug={projectSlug}
          onSubmit={(name, slug) => {
            onSetProject(name, slug);
            onSetStep("connect-github");
          }}
        />
      </OnboardingStepContainer>
    );
  }

  if (step === "connect-github") {
    return (
      <OnboardingStepContainer>
        <OnboardingStepHeader
          title="Deploy your first project"
          subtitle={
            <>
              Connect a GitHub repo and get a live URL in minutes.
              <br />
              Unkey handles builds, infra, scaling, and routing.
            </>
          }
          showIconRow
        />
        <ConnectGithubStep onConnect={() => onSetStep("select-repo")} />
      </OnboardingStepContainer>
    );
  }

  if (step === "select-repo") {
    return (
      <OnboardingStepContainer>
        <OnboardingStepHeader
          title="Select a repository"
          subtitle={
            <>
              Choose a repository and a branch containing your project.
              <br />
              We'll automatically detect Dockerfiles.
            </>
          }
        />
        <SelectRepo
          selectedRepo={selectedRepo}
          onSelect={(repo) => {
            onSetRepo(repo);
            onSetStep("configure-deployment");
          }}
        />
      </OnboardingStepContainer>
    );
  }

  if (step === "configure-deployment") {
    return (
      <OnboardingStepContainer>
        <GhostBack onClick={() => onSetStep("select-repo")} />
        <OnboardingStepHeader
          title="Configure deployment"
          subtitle="Review the defaults. Edit anything you'd like to adjust."
        />
        <ConfigureDeploymentStep selectedRepo={selectedRepo} onNext={() => onSetStep("configure-env-vars")} />
      </OnboardingStepContainer>
    );
  }

  if (step === "deploying") {
    return <DeploymentLiveStep projectSlug={projectSlug} onOpenOverview={onOpenOverview} />;
  }

  return (
    <OnboardingStepContainer>
      <GhostBack onClick={() => onSetStep("configure-deployment")} />
      <div className="onboarding-wide">
        <DeploymentEnvVars envVars={envVars} onSaveEnvVars={onSaveEnvVars} />
        <DeployAction onDeploy={() => onSetStep("deploying")} />
      </div>
    </OnboardingStepContainer>
  );
}

function OnboardingStepContainer({ children }: { children: React.ReactNode }) {
  return <div className="onboarding-step-container">{children}</div>;
}

function OnboardingStepHeader({
  title,
  subtitle,
  showIconRow,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  showIconRow?: boolean;
}) {
  return (
    <div className="onboarding-header">
      {showIconRow ? <IconRow /> : null}
      <div className="onboarding-title-stack">
        <div className="onboarding-title">{title}</div>
        {subtitle ? <div className="onboarding-subtitle">{subtitle}</div> : null}
      </div>
    </div>
  );
}

function IconRow() {
  return (
    <div className="icon-row-mask">
      <div className="icon-row">
        <IconBox muted />
        <IconBox>
          <Icon name="harddrive" size={18} />
        </IconBox>
        <IconBox>
          <Icon name="location" size={18} />
        </IconBox>
        <IconBox large>
          <Icon name="cloud" size={36} strokeWidth={1} />
        </IconBox>
        <IconBox>
          <Icon name="heart" size={18} />
        </IconBox>
        <IconBox>
          <Icon name="nodes" size={18} />
        </IconBox>
        <IconBox muted />
      </div>
    </div>
  );
}

function IconBox({
  children,
  large,
  muted,
}: {
  children?: React.ReactNode;
  large?: boolean;
  muted?: boolean;
}) {
  return <div className={`icon-box ${large ? "large" : ""} ${muted ? "muted" : ""}`}>{children}</div>;
}

function GhostBack({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="ghost-back" onClick={onClick}>
      <Icon name="chevron-left" size={12} />
      Back
    </button>
  );
}

function CreateProjectStep({
  projectName,
  projectSlug,
  onSubmit,
}: {
  projectName: string;
  projectSlug: string;
  onSubmit: (name: string, slug: string) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
    );
  };

  return (
    <div className="create-project">
      <form
        className="form-card"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(name || "API Starter", slug || "api-starter");
        }}
      >
        <FormField label="Project Name" description="A descriptive name for your project." required>
          <input
            className="input"
            value={name}
            placeholder="My Awesome Project"
            onChange={(event) => handleNameChange(event.target.value)}
          />
        </FormField>
        <FormField
          label="Slug"
          description="URL-friendly identifier for your project (auto-generated from name)."
          required
        >
          <input
            className="input"
            value={slug}
            placeholder="my-awesome-project"
            onChange={(event) => setSlug(event.target.value)}
          />
        </FormField>
        <Button className="full-width" size="xlg" type="submit">
          Create Project
        </Button>
      </form>
      <OnboardingLinks />
    </div>
  );
}

function ConnectGithubStep({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="connect-step">
      <div className="connect-card">
        <div className="connect-icon">
          <Icon name="layers" size={18} />
        </div>
        <div className="connect-copy">
          <span>Import project</span>
          <span>Add a repo from your GitHub account</span>
        </div>
        <Button variant="outline" className="import-button" onClick={onConnect}>
          <Icon name="github" size={18} />
          Import from GitHub
        </Button>
      </div>
      <OnboardingLinks />
    </div>
  );
}

function SelectRepo({
  selectedRepo,
  onSelect,
}: {
  selectedRepo: string;
  onSelect: (repo: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [bannerVisible, setBannerVisible] = useState(true);

  const filtered = repos.filter((repo) => repo.fullName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="select-repo">
      {bannerVisible ? (
        <div className="github-banner">
          <Icon name="check" size={12} />
          <span className="banner-strong">GitHub connected successfully.</span>
          <span>You can now select a repository to deploy</span>
          <button type="button" onClick={() => setBannerVisible(false)} aria-label="Dismiss">
            <Icon name="x" size={12} />
          </button>
        </div>
      ) : null}

      <div className="repo-toolbar">
        <button className="select-trigger" type="button">
          <Icon name="github" size={14} />
          acme
          <Icon name="chevron-down" size={12} />
        </button>
        <div className="search-wrap">
          <Icon name="search" size={12} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search repositories..."
          />
        </div>
      </div>

      <div className="repo-list">
        {filtered.map((repo) => (
          <div className="repo-row" key={repo.id}>
            <div className="language-dot">{repo.language.slice(0, 2)}</div>
            <div className="repo-name-block">
              <span>{repo.fullName.split("/")[1]}</span>
              <span>{repo.pushed}</span>
            </div>
            <div className="docker-status">
              {repo.dockerfile ? (
                <>
                  <Icon name="check" size={12} />
                  <span>Dockerfile detected</span>
                </>
              ) : (
                <span>No Dockerfile</span>
              )}
            </div>
            <button className="branch-select" type="button">
              <Icon name="branch" size={12} />
              {repo.branch}
              <Icon name="chevron-down" size={12} />
            </button>
            <Button variant={selectedRepo === repo.fullName ? "primary" : "outline"} onClick={() => onSelect(repo.fullName)}>
              Select
            </Button>
          </div>
        ))}
      </div>

      <button className="hint-link group" type="button">
        <span>
          Can't find your repo? Add more from <span>GitHub</span>.
        </span>
      </button>
      <OnboardingLinks />
    </div>
  );
}

function ConfigureDeploymentStep({
  selectedRepo,
  onNext,
}: {
  selectedRepo: string;
  onNext: () => void;
}) {
  return (
    <div className="onboarding-wide">
      <DeploymentSettings selectedRepo={selectedRepo} />
      <div className="next-action">
        <Button size="xlg" className="rounded-lg" onClick={onNext}>
          Next
        </Button>
        <span>Start configuring your environment variables</span>
      </div>
    </div>
  );
}

function DeploymentSettings({ selectedRepo }: { selectedRepo: string }) {
  return (
    <div className="deployment-settings">
      <div className="setting-card-group">
        <SettingCard
          icon="github"
          title="Repository"
          description="Source repository for this deployment"
          value={<RepoNameLabel fullName={selectedRepo} />}
          chevronState="disabled"
        />
        <SettingCard
          icon="folder"
          title="Root directory"
          description="Build context directory. All COPY/ADD commands are relative to this path. (e.g., services/api)"
          value="."
        />
        <SettingCard
          icon="file"
          title="Dockerfile"
          description="Dockerfile location used for docker build. (e.g., services/api/Dockerfile)"
          value="Dockerfile"
        />
        <SettingCard
          icon="eye"
          title="Watch paths"
          description="Only trigger deployments when files matching these glob patterns change. Leave empty to deploy on all changes."
          value="All files (no filter)"
        />
      </div>

      <SettingsGroup icon="clock" title="Runtime settings" />
      <SettingsGroup icon="gear" title="Advanced configurations" />
      <SettingsGroup icon="stack" title="Sentinel configurations" />
    </div>
  );
}

function SettingCard({
  icon,
  title,
  description,
  value,
  expanded,
  chevronState = "interactive",
  children,
}: {
  icon: IconName;
  title: string;
  description: string;
  value: React.ReactNode;
  expanded?: boolean;
  chevronState?: "interactive" | "disabled" | "hidden";
  children?: React.ReactNode;
}) {
  return (
    <div className="setting-card">
      <div className="setting-card-row">
        <div className="setting-icon">
          <Icon name={icon} size={18} />
        </div>
        <div className="setting-copy">
          <div className="setting-title">{title}</div>
          <div className="setting-desc">{description}</div>
        </div>
        <div className="selected-config">
          <span className="selected-config-pill">{value}</span>
        </div>
        {chevronState !== "hidden" ? (
          <Icon
            name="chevron-right"
            size={12}
            className={`${expanded ? "rotated" : ""} ${chevronState === "disabled" ? "disabled-chevron" : ""}`}
          />
        ) : null}
      </div>
      {expanded && children ? <div className="setting-expanded">{children}</div> : null}
    </div>
  );
}

function RepoNameLabel({ fullName }: { fullName: string }) {
  const [handle, repoName] = fullName.split("/");
  return (
    <span className="repo-name-label">
      <span>{handle}</span>
      <span>/{repoName}</span>
    </span>
  );
}

function SettingsGroup({ icon, title }: { icon: IconName; title: string }) {
  return (
    <div className="settings-group">
      <button type="button" className="settings-group-button">
        <Icon name={icon} size={14} />
        <span>{title}</span>
      </button>
      <button type="button" className="settings-show">
        Show
        <Icon name="chevron-right" size={12} />
      </button>
    </div>
  );
}

function DeploymentEnvVars({
  envVars,
  onSaveEnvVars,
}: {
  envVars: EnvVar[];
  onSaveEnvVars: (newVars: EnvVar[]) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("last-updated");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const environmentName = (environmentId: string) =>
    environments.find((environment) => environment.id === environmentId)?.slug ?? "Unknown";

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered = envVars.filter((envVar) => {
      if (query && !envVar.key.toLowerCase().includes(query)) {
        return false;
      }
      if (environmentFilter !== "all" && envVar.environmentId !== environmentFilter) {
        return false;
      }
      return true;
    });

    if (sortBy === "name-asc") {
      return [...filtered].sort((a, b) => a.key.localeCompare(b.key));
    }
    return filtered;
  }, [envVars, environmentFilter, searchQuery, sortBy]);

  return (
    <>
      <section className="env-vars-stack">
        <div className="env-vars-header">
          <div>
            <h1>Environment Variables</h1>
            <p>Store API keys, tokens, and config securely. Changes apply on next deploy.</p>
          </div>
          <Button variant={isAddOpen ? "outline" : "primary"} onClick={() => setIsAddOpen(true)}>
            <Icon name="plus" size={12} />
            Add Environment Variable
          </Button>
        </div>

        <EnvVarsToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          environmentFilter={environmentFilter}
          onEnvironmentFilterChange={setEnvironmentFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {filteredData.length === 0 ? (
          <EnvVarsEmpty searchQuery={searchQuery} />
        ) : (
          <div className="env-vars-list">
            {filteredData.map((envVar) => (
              <div key={envVar.id}>
                <div className="env-var-row">
                  <div className="env-name-cell">
                    <div>
                      <button className="env-key" type="button">
                        {highlightMatch(envVar.key, searchQuery)}
                      </button>
                      {envVar.type === "writeonly" ? <Badge variant="warning">Sensitive</Badge> : null}
                      {envVar.note ? (
                        <span className="note-icon" title={envVar.note}>
                          <Icon name="note" size={14} />
                        </span>
                      ) : null}
                    </div>
                    <span>{environmentName(envVar.environmentId)}</span>
                  </div>
                  <EnvVarValueCell envVar={envVar} />
                  <div className="updated-cell">
                    <Badge>
                      <Icon name="activity" size={12} />
                      {envVar.updatedAt}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    className="row-menu"
                    onClick={() => setEditingId(editingId === envVar.id ? null : envVar.id)}
                    aria-label={`Edit ${envVar.key}`}
                  >
                    <Icon name="dots" size={16} />
                  </button>
                </div>
                {editingId === envVar.id ? (
                  <EnvVarEditRow envVar={envVar} environmentName={environmentName(envVar.environmentId)} onClose={() => setEditingId(null)} />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <AddEnvVarPanel
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={(newVars) => {
          onSaveEnvVars(newVars);
          setIsAddOpen(false);
        }}
      />
    </>
  );
}

function EnvVarsToolbar({
  searchQuery,
  onSearchChange,
  environmentFilter,
  onEnvironmentFilterChange,
  sortBy,
  onSortChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  environmentFilter: string;
  onEnvironmentFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}) {
  return (
    <div className="env-toolbar">
      <div className="form-input with-icon search-large">
        <Icon name="search" size={16} />
        <input
          placeholder="Search..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <label className="select-shell">
        <Icon name="layers" size={14} />
        <select value={environmentFilter} onChange={(event) => onEnvironmentFilterChange(event.target.value)}>
          <option value="all">All Environments</option>
          {environments.map((environment) => (
            <option key={environment.id} value={environment.id}>
              {environment.slug}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={14} />
      </label>
      <label className="select-shell">
        <Icon name="filter" size={14} />
        <select value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
          <option value="last-updated">Last Updated</option>
          <option value="name-asc">Name A-Z</option>
        </select>
        <Icon name="chevron-down" size={14} />
      </label>
    </div>
  );
}

function EnvVarValueCell({ envVar }: { envVar: EnvVar }) {
  const [visible, setVisible] = useState(false);
  if (envVar.type === "writeonly") {
    return <div className="env-value-cell" />;
  }
  return (
    <div className="env-value-cell">
      <button
        className="reveal-button"
        type="button"
        aria-label={visible ? "Click to hide" : "Click to reveal"}
        onClick={() => setVisible((current) => !current)}
      >
        <Icon name={visible ? "eye-off" : "eye"} size={12} />
      </button>
      {visible ? <button className="value-pill" type="button">{envVar.value}</button> : <span className="masked-value">••••••••••••</span>}
    </div>
  );
}

function EnvVarEditRow({
  envVar,
  environmentName,
  onClose,
}: {
  envVar: EnvVar;
  environmentName: string;
  onClose: () => void;
}) {
  return (
    <div className="env-edit-row">
      <FormField label="Key">
        <input className="input mono" value={envVar.key} readOnly={envVar.type === "writeonly"} />
      </FormField>
      <FormField label={envVar.type === "writeonly" ? "New Value" : "Value"}>
        <textarea className="textarea mono" defaultValue={envVar.type === "writeonly" ? "" : envVar.value} placeholder={envVar.type === "writeonly" ? "Enter new value to replace" : "value"} />
      </FormField>
      <FormField label="Note">
        <input className="input" defaultValue={envVar.note ?? ""} placeholder="Optional description for this variable..." />
      </FormField>
      <FormField label="Environment">
        <input className="input capitalize" value={environmentName} readOnly />
      </FormField>
      <div className="edit-actions">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Save</Button>
      </div>
    </div>
  );
}

function EnvVarsEmpty({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="env-empty">
      <div className="empty-icon">
        <Icon name="ufo" size={30} />
      </div>
      <h2>{searchQuery ? "No Matching Variables" : "No Environment Variables"}</h2>
      <p>
        {searchQuery
          ? `No variables matching "${searchQuery}". Try a different search term.`
          : "Environment variables will appear here once you add them. Store API keys, tokens, and config securely."}
      </p>
    </div>
  );
}

function AddEnvVarPanel({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (envVars: EnvVar[]) => void;
}) {
  const [rows, setRows] = useState([{ key: "", value: "", description: "" }]);
  const [environmentId, setEnvironmentId] = useState("__all__");
  const [sensitive, setSensitive] = useState(true);

  if (!isOpen) {
    return null;
  }

  const updateRow = (index: number, key: string, value: string) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const targetEnvironmentIds =
      environmentId === "__all__" ? environments.map((environment) => environment.id) : [environmentId];
    const nonEmptyRows = rows.filter((row) => row.key.trim() && row.value.trim());
    const newVars = nonEmptyRows.flatMap((row) =>
      targetEnvironmentIds.map((targetEnvironmentId, index) => ({
        id: `env-var-${Date.now()}-${targetEnvironmentId}-${index}`,
        key: row.key.trim(),
        value: row.value.trim(),
        environmentId: targetEnvironmentId,
        type: sensitive ? ("writeonly" as const) : ("recoverable" as const),
        updatedAt: "just now",
        note: row.description.trim() || undefined,
      })),
    );
    if (newVars.length > 0) {
      onSave(newVars);
    }
  };

  return (
    <>
      <button className="panel-backdrop" type="button" onClick={onClose} aria-label="Close panel" />
      <aside className="slide-panel">
        <div className="slide-panel-header">
          <div>
            <span>Add Environment Variable</span>
            <p>Set a key-value pair for your project.</p>
          </div>
          <button type="button" className="panel-close" onClick={onClose} aria-label="Close panel">
            <Icon name="double-chevron-right" size={18} />
          </button>
        </div>

        <form className="slide-form" onSubmit={handleSubmit}>
          <div className="slide-scroll">
            <div className="env-row-fields">
              {rows.map((row, index) => (
                <div className="add-row" key={`${index}-${row.key}`}>
                  <div className="row-inputs">
                    <FormField label="Key">
                      <input
                        className="input mono"
                        placeholder="CLIENT_KEY..."
                        value={row.key}
                        onChange={(event) => updateRow(index, "key", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Value">
                      <input
                        className="input mono"
                        placeholder="value"
                        value={row.value}
                        onChange={(event) => updateRow(index, "value", event.target.value)}
                      />
                    </FormField>
                    {rows.length > 1 ? (
                      <button
                        className="trash-button"
                        type="button"
                        onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}
                      >
                        <Icon name="trash" size={12} />
                      </button>
                    ) : null}
                  </div>
                  <details>
                    <summary>
                      <Icon name="plus" size={12} />
                      Add Note
                    </summary>
                    <input
                      className="input"
                      placeholder="Optional description for this variable..."
                      value={row.description}
                      onChange={(event) => updateRow(index, "description", event.target.value)}
                    />
                  </details>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="add-another"
              type="button"
              onClick={() => setRows((current) => [...current, { key: "", value: "", description: "" }])}
            >
              <Icon name="plus" size={12} />
              Add Another
            </Button>
          </div>

          <div className="slide-options">
            <FormField label="Environment">
              <select className="input capitalize" value={environmentId} onChange={(event) => setEnvironmentId(event.target.value)}>
                <option value="__all__">All Environments</option>
                {environments.map((environment) => (
                  <option key={environment.id} value={environment.id}>
                    {environment.slug}
                  </option>
                ))}
              </select>
            </FormField>
            <label className="switch-line">
              <button
                className={sensitive ? "switch checked" : "switch"}
                type="button"
                aria-pressed={sensitive}
                onClick={() => setSensitive((current) => !current)}
              >
                <span />
              </button>
              <span>Sensitive</span>
              <Icon name="info" size={14} />
            </label>
          </div>

          <div className="slide-footer">
            <Button variant="outline" type="button">
              <Icon name="cloud" size={12} />
              Import <span className="medium">.env</span>
            </Button>
              <span>or drag & drop / paste (⌘V) your .env</span>
            <Button className="save-button" type="submit">
              Save
            </Button>
          </div>
        </form>
      </aside>
    </>
  );
}

function DeployAction({ onDeploy }: { onDeploy: () => void }) {
  return (
    <div className="deploy-action">
      <Button size="xlg" className="rounded-lg" onClick={onDeploy}>
        Deploy
      </Button>
      <span>We'll build your image, provision infrastructure, and more.</span>
    </div>
  );
}

function DeploymentLiveStep({
  projectSlug,
  onOpenOverview,
}: {
  projectSlug: string;
  onOpenOverview: () => void;
}) {
  return (
    <OnboardingStepContainer>
      <OnboardingStepHeader
        title={
          <span className="deployment-complete-title">
            Deployment complete!
            <Icon name="check" size={14} />
          </span>
        }
        subtitle={
          <>
            Redirecting to project overview in <span className="countdown">15</span> seconds ...{" "}
            <button className="go-now" type="button" onClick={onOpenOverview}>
              Go now
            </button>
          </>
        }
      />
      <div className="deployment-live">
        <div className="deployment-info">
          <div className="deployment-status-icon">
            <Icon name="check" size={16} />
          </div>
          <div>
            <span className="deployment-info-title">Production deployment is ready</span>
            <span className="deployment-info-url">https://{projectSlug}.unkey.app</span>
          </div>
          <Badge variant="success">ready</Badge>
        </div>
        <div className="progress-card">
          {["Queued deployment", "Built Docker image", "Provisioned infrastructure", "Assigned domain"].map((label) => (
            <div className="progress-row" key={label}>
              <Icon name="check" size={12} />
              <span>{label}</span>
              <span>completed</span>
            </div>
          ))}
        </div>
      </div>
    </OnboardingStepContainer>
  );
}

function ProjectOverview({
  projectName,
  projectSlug,
  envVars,
  onSaveEnvVars,
  showRedeployBanner,
  onDismissRedeploy,
}: {
  projectName: string;
  projectSlug: string;
  envVars: EnvVar[];
  onSaveEnvVars: (newVars: EnvVar[]) => void;
  showRedeployBanner: boolean;
  onDismissRedeploy: () => void;
}) {
  return (
    <div className="project-page">
      <header className="project-header">
        <div>
          <div className="project-kicker">Projects / {projectSlug}</div>
          <h1>{projectName}</h1>
        </div>
        <Button variant="outline">
          <Icon name="external" size={12} />
          Visit
        </Button>
      </header>
      <nav className="project-tabs">
        <button type="button">Overview</button>
        <button type="button">Deployments</button>
        <button type="button">Logs</button>
        <button type="button" className="active">
          Environment Variables
        </button>
        <button type="button">Settings</button>
      </nav>
      <div className="project-content">
        <DeploymentEnvVars envVars={envVars} onSaveEnvVars={onSaveEnvVars} />
      </div>
      {showRedeployBanner ? <PendingRedeployBanner onDismiss={onDismissRedeploy} /> : null}
    </div>
  );
}

function PendingRedeployBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="redeploy-banner">
      <button type="button" className="redeploy-dismiss" onClick={onDismiss} aria-label="Dismiss">
        <Icon name="x" size={14} />
      </button>
      <div className="redeploy-glow">
        <Icon name="hammer" size={18} />
      </div>
      <div className="redeploy-copy">
        <span>Changes detected</span>
        <span>Redeploy to apply your latest changes to production.</span>
        <Button>Redeploy</Button>
      </div>
    </div>
  );
}

function OnboardingLinks() {
  return (
    <div className="onboarding-links">
      <Button variant="outline" className="pill">
        <Icon name="book" size={18} />
        View documentation
      </Button>
      <Button variant="outline" className="pill">
        <Icon name="discord" size={18} />
        Join community
      </Button>
    </div>
  );
}

function FormField({
  label,
  description,
  required,
  children,
}: {
  label: string;
  description?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="form-field">
      <span>
        {label}
        {required ? <em>*</em> : null}
      </span>
      {children}
      {description ? (
        <output>
          <Icon name="info" size={14} />
          <span>{description}</span>
        </output>
      ) : null}
    </label>
  );
}

function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "xlg";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button type={type} className={`button ${variant} ${size} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "warning" | "success";
}) {
  return <span className={`badge ${variant}`}>{children}</span>;
}

function highlightMatch(text: string, query: string) {
  if (!query) {
    return text;
  }
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) {
    return text;
  }
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

type IconName =
  | "activity"
  | "book"
  | "branch"
  | "check"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "cloud"
  | "discord"
  | "dots"
  | "double-chevron-right"
  | "external"
  | "eye"
  | "eye-off"
  | "file"
  | "filter"
  | "folder"
  | "gear"
  | "github"
  | "grid"
  | "hammer"
  | "harddrive"
  | "heart"
  | "info"
  | "key"
  | "layers"
  | "location"
  | "nodes"
  | "note"
  | "plus"
  | "search"
  | "stack"
  | "trash"
  | "ufo"
  | "x"
  | "clock";

function Icon({
  name,
  size = 16,
  strokeWidth = 1.7,
  className = "",
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: `icon ${className}`,
    "aria-hidden": true,
  };

  switch (name) {
    case "activity":
      return (
        <svg {...common}>
          <path d="M16.25 8.75h-2.3c-.42 0-.8.27-.94.66l-1.65 4.58c-.12.33-.59.33-.7-.01L7.34 4.02c-.11-.34-.59-.34-.71-.01L4.99 8.59c-.14.4-.52.66-.94.66H1.75" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 3.25h7.5A2.5 2.5 0 0 1 14 5.75v9H5.25A2.25 2.25 0 0 1 3 12.5V4.25c0-.55.45-1 1-1Z" />
          <path d="M5.25 14.75A2.25 2.25 0 0 1 3 12.5c0-1.24 1.01-2.25 2.25-2.25H14" />
        </svg>
      );
    case "branch":
      return (
        <svg {...common}>
          <line x1="4.75" y1="5.75" x2="4.75" y2="12.25" />
          <path d="M13.25 5.75v1c0 1.1-.9 2-2 2h-4.5c-1.1 0-2 .9-2 2" />
          <circle cx="4.75" cy="3.75" r="2" />
          <circle cx="13.25" cy="3.75" r="2" />
          <circle cx="4.75" cy="14.25" r="2" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m3.5 9.25 3.25 3.25 7.75-7.75" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <path d="m4.75 6.75 4.25 4.25 4.25-4.25" />
        </svg>
      );
    case "chevron-left":
      return (
        <svg {...common}>
          <path d="M11.5 15.25 5.25 9l6.25-6.25" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...common}>
          <path d="m6.75 3.5 5.5 5.5-5.5 5.5" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path d="M6.75 10.5 9 8.25l2.25 2.25" />
          <path d="M9 8.25v6" />
          <path d="M12 14.25h.5a3.75 3.75 0 0 0 .96-7.36A4.5 4.5 0 0 0 4.5 7.25c0 .35.05.69.13 1.01A3 3 0 0 0 4.75 14.25H6" />
        </svg>
      );
    case "discord":
      return (
        <svg {...common} viewBox="0 0 32 32" fill="currentColor" stroke="none">
          <path d="M26.4 6.5a24 24 0 0 0-6.2-1.9c-.3.5-.6 1.1-.8 1.6a23 23 0 0 0-6.9 0c-.2-.5-.5-1.1-.8-1.6a24.4 24.4 0 0 0-6.2 1.9C1.7 12.3.6 18 1.1 23.6a24.6 24.6 0 0 0 7.6 3.8c.6-.8 1.2-1.7 1.6-2.6-.9-.3-1.7-.7-2.6-1.2l.6-.5c4.8 2.3 10.4 2.3 15.2 0l.6.5c-.8.5-1.7.9-2.6 1.2.5.9 1 1.8 1.6 2.6a24.8 24.8 0 0 0 7.6-3.8c.7-6.5-1-12.1-4.3-17.1ZM11 20.1c-1.5 0-2.7-1.3-2.7-3s1.2-3 2.7-3 2.7 1.4 2.7 3-1.2 3-2.7 3Zm10 0c-1.5 0-2.7-1.3-2.7-3s1.2-3 2.7-3 2.7 1.4 2.7 3-1.2 3-2.7 3Z" />
        </svg>
      );
    case "dots":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <circle cx="4.5" cy="9" r="1.1" />
          <circle cx="9" cy="9" r="1.1" />
          <circle cx="13.5" cy="9" r="1.1" />
        </svg>
      );
    case "double-chevron-right":
      return (
        <svg {...common}>
          <path d="m9.75 4.75 4.25 4.25-4.25 4.25" />
          <path d="m5 4.75 4.25 4.25L5 13.25" />
        </svg>
      );
    case "external":
      return (
        <svg {...common}>
          <path d="M7.25 4.25H4.5a2 2 0 0 0-2 2v7.25a2 2 0 0 0 2 2h7.25a2 2 0 0 0 2-2v-2.75" />
          <path d="M10 2.5h5.5V8" />
          <path d="M15.5 2.5 8.75 9.25" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2.1 10.1a2 2 0 0 1 0-2.2C3.1 6.3 5.4 3.75 9 3.75s5.9 2.55 6.9 4.15a2 2 0 0 1 0 2.2c-1 1.6-3.3 4.15-6.9 4.15s-5.9-2.55-6.9-4.15Z" />
          <circle cx="9" cy="9" r="2.25" fill="currentColor" stroke="none" />
        </svg>
      );
    case "eye-off":
      return (
        <svg {...common}>
          <path d="M2.75 2.75 15.25 15.25" />
          <path d="M6.85 4.2A7.1 7.1 0 0 1 9 3.75c3.6 0 5.9 2.55 6.9 4.15.45.68.45 1.57 0 2.25-.3.45-.72.98-1.27 1.5" />
          <path d="M11.25 13.9A7.9 7.9 0 0 1 9 14.25c-3.6 0-5.9-2.55-6.9-4.15a2 2 0 0 1 0-2.2c.38-.58.95-1.3 1.71-1.96" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M15.25 7v7.25a2 2 0 0 1-2 2h-8.5a2 2 0 0 1-2-2V3.75a2 2 0 0 1 2-2h5.6L15.25 7Z" />
          <path d="M10.75 1.75v4a1 1 0 0 0 1 1h3.5" />
          <path d="M5.75 9.75h6.5" />
          <path d="M5.75 12.25h4" />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <path d="M2.75 4.25h12.5" />
          <path d="M5.25 9h7.5" />
          <path d="M8 13.75h2" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M2.25 8.75v-4a2 2 0 0 1 2-2h1.95c.61 0 1.18.27 1.56.75l.6.75h5.39a2 2 0 0 1 2 2v2.85" />
          <path d="M15.75 9.25v4a2 2 0 0 1-2 2h-9.5a2 2 0 0 1-2-2v-4.5a2 2 0 0 1 2-2h9.5a2 2 0 0 1 2 2v.5Z" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="2.4" />
          <path d="M9 1.75v1.7M9 14.55v1.7M15.25 9h-1.7M4.45 9h-1.7M13.42 4.58l-1.2 1.2M5.78 12.22l-1.2 1.2M13.42 13.42l-1.2-1.2M5.78 5.78l-1.2-1.2" />
        </svg>
      );
    case "github":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M12 2.25a9.75 9.75 0 0 0-3.08 19c.49.09.67-.21.67-.47v-1.66c-2.72.59-3.3-1.17-3.3-1.17-.45-1.12-1.09-1.42-1.09-1.42-.89-.61.07-.6.07-.6.98.07 1.5 1.01 1.5 1.01.87 1.49 2.28 1.06 2.84.81.09-.63.34-1.06.62-1.3-2.17-.25-4.45-1.09-4.45-4.83 0-1.07.38-1.94 1-2.62-.1-.25-.44-1.25.1-2.59 0 0 .82-.26 2.68 1a9.2 9.2 0 0 1 4.88 0c1.86-1.26 2.67-1 2.67-1 .54 1.34.2 2.34.1 2.59.63.68 1 1.55 1 2.62 0 3.75-2.28 4.58-4.46 4.82.35.31.66.9.66 1.83v2.7c0 .26.18.57.68.47A9.75 9.75 0 0 0 12 2.25Z" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="2.75" y="2.75" width="5" height="5" rx="1" />
          <rect x="10.25" y="2.75" width="5" height="5" rx="1" />
          <rect x="2.75" y="10.25" width="5" height="5" rx="1" />
          <rect x="10.25" y="10.25" width="5" height="5" rx="1" />
        </svg>
      );
    case "hammer":
      return (
        <svg {...common}>
          <path d="m11.53 8.72-6.56 6.56a1.6 1.6 0 0 1-2.25-2.25l6.56-6.56" />
          <path d="m16.2 8.94-1.52 1.52a1 1 0 0 1-1.41 0L5.74 2.93 6.68 2l4.19.49c.22.03.43.13.59.29l4.74 4.75a1 1 0 0 1 0 1.41Z" />
        </svg>
      );
    case "harddrive":
      return (
        <svg {...common}>
          <rect x="1.75" y="8.75" width="14.5" height="6" rx="2" />
          <path d="m1.84 10.15 2.18-6.08A2 2 0 0 1 5.91 2.75h6.18a2 2 0 0 1 1.89 1.32l2.18 6.08" />
          <path d="M4.75 11.75H7.5" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M15.66 8.75c.21-.67.34-1.38.34-2.14.01-2.12-1.7-3.85-3.83-3.86A3.8 3.8 0 0 0 9 4.47a3.8 3.8 0 0 0-3.17-1.72C3.7 2.76 1.99 4.49 2 6.61c0 .95.2 1.83.52 2.64" />
          <path d="M4.51 12.25c1.48 1.54 3.2 2.55 4.02 2.97.3.16.64.16.94 0 .9-.47 2.91-1.64 4.47-3.47" />
          <path d="M17.25 8.75H12l-1.5 3-3.25-5.5-1.5 3H.75" />
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="7.25" />
          <path d="M9 8.25v4.57" />
          <circle cx="9" cy="5.75" r=".75" fill="currentColor" stroke="none" />
        </svg>
      );
    case "key":
      return (
        <svg {...common}>
          <circle cx="6.5" cy="9" r="3.25" />
          <path d="M9.75 9h6" />
          <path d="M13.25 9v2.25" />
          <path d="M15.75 9v1.5" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="m2.67 5.09 5.86-3.1a1 1 0 0 1 .94 0l5.86 3.1a.75.75 0 0 1 0 1.32l-5.86 3.1a1 1 0 0 1-.94 0l-5.86-3.1a.75.75 0 0 1 0-1.32Z" />
          <path d="M15.74 9c0 .26-.14.52-.4.66l-5.87 3.1a1 1 0 0 1-.94 0l-5.87-3.1A.75.75 0 0 1 2.26 9" />
          <path d="M15.74 12.25c0 .26-.14.52-.4.66l-5.87 3.1a1 1 0 0 1-.94 0l-5.87-3.1a.75.75 0 0 1-.4-.66" />
        </svg>
      );
    case "location":
      return (
        <svg {...common}>
          <circle cx="9" cy="5" r="3.25" />
          <path d="M9 8.25v5" />
          <path d="M12 12.43c2.51.31 4.25 1.01 4.25 1.82 0 1.1-3.25 2-7.25 2s-7.25-.9-7.25-2c0-.81 1.74-1.51 4.25-1.82" />
        </svg>
      );
    case "nodes":
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="1.75" />
          <circle cx="3.5" cy="5.75" r="1.75" />
          <circle cx="14.5" cy="5.75" r="1.75" />
          <circle cx="3.5" cy="12.25" r="1.75" />
          <circle cx="14.5" cy="12.25" r="1.75" />
          <path d="M5 6.4 7.5 7.9M13 6.4l-2.5 1.5M5 11.6l2.5-1.5M13 11.6l-2.5-1.5" />
        </svg>
      );
    case "note":
      return (
        <svg {...common}>
          <path d="M4 2.75h10v12.5H4z" />
          <path d="M6.25 6h5.5M6.25 9h5.5M6.25 12h3.5" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M9 3.25v11.5" />
          <path d="M3.25 9h11.5" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <path d="m15.25 15.25-3.97-3.97" />
          <circle cx="7.75" cy="7.75" r="5" />
        </svg>
      );
    case "stack":
      return (
        <svg {...common}>
          <path d="m13.75 13.38.69.14a1.5 1.5 0 0 0 1.81-1.47V4.62c0-.71-.5-1.32-1.19-1.47l-6.5-1.37a1.5 1.5 0 0 0-1.67.85" />
          <path d="m3.56 4.48 6.5 1.37c.69.15 1.19.76 1.19 1.47v7.43a1.5 1.5 0 0 1-1.81 1.47l-6.5-1.37a1.5 1.5 0 0 1-1.19-1.47V5.95c0-.95.88-1.66 1.81-1.47Z" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="m13.47 7.25-.37 7.1a2 2 0 0 1-2 1.9H6.9a2 2 0 0 1-2-1.9l-.37-7.1" />
          <path d="M6.75 4.75v-2c0-.55.45-1 1-1h2.5c.55 0 1 .45 1 1v2" />
          <path d="M2.75 4.75h12.5" />
        </svg>
      );
    case "ufo":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <ellipse cx="12" cy="11" rx="7.5" ry="3.75" />
          <path d="M6.5 10.5c.7-3 2.55-4.75 5.5-4.75s4.8 1.75 5.5 4.75" />
          <path d="M5 14.25c2.2 1.5 11.8 1.5 14 0" />
          <circle cx="9" cy="11" r=".6" fill="currentColor" stroke="none" />
          <circle cx="12" cy="11.35" r=".6" fill="currentColor" stroke="none" />
          <circle cx="15" cy="11" r=".6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M4.25 4.25 13.75 13.75" />
          <path d="M13.75 4.25 4.25 13.75" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <path d="M9 4.75V9l3.25 2.25" />
          <path d="M9 1.75a7.25 7.25 0 1 1 0 14.5 7.25 7.25 0 0 1 0-14.5Z" />
        </svg>
      );
  }
}

export default App;
