import { useMemo, useState } from 'react';
import './App.css';

type CallbackKind =
  | 'manifest-success'
  | 'manifest-expired'
  | 'manifest-missing-code'
  | 'manifest-already-configured'
  | 'manifest-unauthenticated'
  | 'install-success'
  | 'install-verify-failed'
  | 'install-unauthenticated';

type View =
  | { screen: 'source' }
  | { screen: 'sources' }
  | { screen: 'create-source' }
  | { screen: 'github-manifest' }
  | { screen: 'github-install'; reinstall: boolean }
  | { screen: 'callback'; kind: CallbackKind; reinstall?: boolean };

type Flash = {
  kind: 'success' | 'error' | 'info';
  message: string;
};

type GithubSource = {
  uuid: string;
  id: number;
  name: string;
  organization: string;
  apiUrl: string;
  htmlUrl: string;
  customUser: string;
  customPort: number;
  appId: number | null;
  installationId: number | null;
  clientId: string;
  clientSecret: string;
  webhookSecret: string;
  privateKeyId: number | null;
  contents: string;
  metadata: string;
  pullRequests: string;
  isSystemWide: boolean;
};

type ManifestPayload = {
  name: string;
  url: string;
  hook_attributes: { url: string; active: boolean };
  redirect_url: string;
  callback_urls: string[];
  public: boolean;
  request_oauth_on_install: boolean;
  setup_url: string;
  setup_on_update: boolean;
  default_permissions: Record<string, string>;
  default_events: string[];
};

const initialSource: GithubSource = {
  uuid: 'cm9x3h7nq0001i70z3d5z9zqp',
  id: 42,
  name: 'github-app-setup-flow',
  organization: 'coollabsio',
  apiUrl: 'https://api.github.com',
  htmlUrl: 'https://github.com',
  customUser: 'git',
  customPort: 22,
  appId: null,
  installationId: null,
  clientId: '',
  clientSecret: '',
  webhookSecret: '',
  privateKeyId: null,
  contents: '',
  metadata: '',
  pullRequests: '',
  isSystemWide: false,
};

const privateKeys = [
  { id: 7, name: 'github-app-coolify-cloud' },
  { id: 11, name: 'deploy-key-production' },
];

const resources = [
  {
    project: 'Coolify Cloud',
    environment: 'production',
    name: 'api.coolify.io',
    type: 'Application',
  },
  {
    project: 'Coolify Cloud',
    environment: 'preview',
    name: 'web-preview',
    type: 'Application',
  },
];

function App() {
  const [view, setView] = useState<View>(() => viewFromLocation());
  const [source, setSource] = useState<GithubSource>(initialSource);
  const [webhookEndpoint, setWebhookEndpoint] = useState('https://coolify.example.com');
  const [previewDeployments, setPreviewDeployments] = useState(true);
  const [administration, setAdministration] = useState(false);
  const [manifestState, setManifestState] = useState(
    'st_live_h3dUeyZz9hUMq87rK6VMQJjW5mLxYw4BgCtgQ59b4qCqB1mTm2'
  );
  const [manualOpen, setManualOpen] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [lastCallback, setLastCallback] = useState('No setup callback has been processed.');

  const manifestPayload = useMemo(
    () => buildManifestPayload(source, webhookEndpoint, previewDeployments, administration),
    [source, webhookEndpoint, previewDeployments, administration]
  );

  function routeTo(next: View) {
    setView(next);
    window.history.pushState(null, '', pathForView(next, source, manifestState));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function resetForNewAttempt() {
    setManifestState('st_live_v2_' + Math.random().toString(36).slice(2, 18).padEnd(16, 'x'));
    setFlash({ kind: 'info', message: 'A new GitHub App setup state was generated for this source.' });
  }

  function completeManifest() {
    setSource((current) => ({
      ...current,
      name: 'coolify-cloud',
      appId: 987654,
      clientId: 'Iv23li3D8r9kq7m2aC',
      clientSecret: 'ghs_***************',
      webhookSecret: 'whsec_**************',
      privateKeyId: 7,
      contents: 'read',
      metadata: 'read',
      pullRequests: previewDeployments ? 'write' : '',
    }));
    setLastCallback('Manifest callback accepted. One-time state consumed and GitHub App credentials saved.');
    setFlash({ kind: 'success', message: 'Github App updated. Continue by installing repositories on GitHub.' });
    routeTo({ screen: 'source' });
  }

  function completeInstall(reinstall = false) {
    setSource((current) => ({
      ...current,
      installationId: reinstall ? 222222 : 123456,
      contents: 'read',
      metadata: 'read',
      pullRequests: 'write',
    }));
    setLastCallback(
      reinstall
        ? 'Installation callback verified against GitHub. Existing installation id was replaced with 222222.'
        : 'Installation callback verified against GitHub. Installation id 123456 was stored.'
    );
    setFlash({
      kind: 'success',
      message: reinstall
        ? 'Github App repositories updated.'
        : 'Github App installation verified and saved.',
    });
    routeTo({ screen: 'source' });
  }

  function createManualApp() {
    setSource((current) => ({
      ...current,
      appId: 1234567890,
      installationId: 1234567890,
      clientId: 'manual-client-id',
      clientSecret: 'manual-secret',
      webhookSecret: 'manual-webhook-secret',
      privateKeyId: 11,
      contents: 'read',
      metadata: 'read',
      pullRequests: 'write',
    }));
    setManualOpen(false);
    setLastCallback('Manual installation was used. Callback verification was not part of this path.');
    setFlash({ kind: 'success', message: 'Github App updated. You can now configure the details.' });
  }

  function saveSource() {
    setFlash({ kind: 'success', message: 'Github App updated.' });
  }

  return (
    <div className="app-shell">
      <Sidebar onNavigate={routeTo} active={view.screen === 'sources' ? 'sources' : 'source'} />
      <main className="main-content">
        {flash ? <FlashBanner flash={flash} onDismiss={() => setFlash(null)} /> : null}
        {view.screen === 'sources' ? (
          <SourcesPage source={source} onAdd={() => routeTo({ screen: 'create-source' })} onOpen={() => routeTo({ screen: 'source' })} />
        ) : null}
        {view.screen === 'create-source' ? (
          <CreateSourceModal
            source={source}
            onClose={() => routeTo({ screen: 'sources' })}
            onCreate={(next) => {
              setSource(next);
              setFlash({ kind: 'success', message: 'GitHub App source created. Continue with automated installation.' });
              routeTo({ screen: 'source' });
            }}
          />
        ) : null}
        {view.screen === 'source' ? (
          <SourcePage
            source={source}
            webhookEndpoint={webhookEndpoint}
            setWebhookEndpoint={setWebhookEndpoint}
            previewDeployments={previewDeployments}
            setPreviewDeployments={setPreviewDeployments}
            administration={administration}
            setAdministration={setAdministration}
            manualOpen={manualOpen}
            setManualOpen={setManualOpen}
            onRegister={() => routeTo({ screen: 'github-manifest' })}
            onManual={createManualApp}
            onInstall={(reinstall) => routeTo({ screen: 'github-install', reinstall })}
            onSave={saveSource}
          />
        ) : null}
        {view.screen === 'github-manifest' ? (
          <GithubManifestPage
            source={source}
            manifestState={manifestState}
            payload={manifestPayload}
            onBack={() => routeTo({ screen: 'source' })}
            onSubmit={() => routeTo({ screen: 'callback', kind: 'manifest-success' })}
            onExpired={() => routeTo({ screen: 'callback', kind: 'manifest-expired' })}
            onMissingCode={() => routeTo({ screen: 'callback', kind: 'manifest-missing-code' })}
            onUnauthenticated={() => routeTo({ screen: 'callback', kind: 'manifest-unauthenticated' })}
          />
        ) : null}
        {view.screen === 'github-install' ? (
          <GithubInstallPage
            source={source}
            reinstall={view.reinstall}
            onBack={() => routeTo({ screen: 'source' })}
            onInstall={() => routeTo({ screen: 'callback', kind: 'install-success', reinstall: view.reinstall })}
            onVerifyFailed={() => routeTo({ screen: 'callback', kind: 'install-verify-failed', reinstall: view.reinstall })}
            onUnauthenticated={() => routeTo({ screen: 'callback', kind: 'install-unauthenticated', reinstall: view.reinstall })}
          />
        ) : null}
        {view.screen === 'callback' ? (
          <CallbackPage
            kind={view.kind}
            source={source}
            manifestState={manifestState}
            reinstall={view.reinstall ?? false}
            onManifestSuccess={completeManifest}
            onInstallSuccess={() => completeInstall(view.reinstall)}
            onRetry={() => {
              resetForNewAttempt();
              routeTo({ screen: 'source' });
            }}
            onReturn={() => routeTo({ screen: 'source' })}
          />
        ) : null}
      </main>
    </div>
  );
}

function viewFromLocation(): View {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  if (path.includes('/webhooks/source/github/redirect')) {
    if (params.get('signed_out') === '1') return { screen: 'callback', kind: 'manifest-unauthenticated' };
    if (params.get('state') === 'expired-state') return { screen: 'callback', kind: 'manifest-expired' };
    if (!params.get('code')) return { screen: 'callback', kind: 'manifest-missing-code' };
    if (params.get('code') === 'replayed-code') return { screen: 'callback', kind: 'manifest-already-configured' };
    return { screen: 'callback', kind: 'manifest-success' };
  }
  if (path.includes('/webhooks/source/github/install')) {
    if (params.get('signed_out') === '1') return { screen: 'callback', kind: 'install-unauthenticated' };
    if (params.get('installation_id') === '999999') return { screen: 'callback', kind: 'install-verify-failed', reinstall: true };
    return { screen: 'callback', kind: 'install-success' };
  }
  if (path.includes('/sources')) return { screen: 'sources' };
  if (path.includes('/github/settings/apps/new') || path.includes('/settings/apps/new')) return { screen: 'github-manifest' };
  if (path.includes('/github/apps/')) return { screen: 'github-install', reinstall: path.includes('select_target') };
  return { screen: 'source' };
}

function pathForView(view: View, source: GithubSource, manifestState: string) {
  if (view.screen === 'sources') return '/sources';
  if (view.screen === 'create-source') return '/sources?modal=new-github-app';
  if (view.screen === 'source') return `/source/github/${source.uuid}`;
  if (view.screen === 'github-manifest') {
    return `/github/organizations/${source.organization}/settings/apps/new?state=${manifestState}`;
  }
  if (view.screen === 'github-install') {
    const name = source.name || 'github-app-setup-flow';
    return `/github/apps/${name}/installations/${view.reinstall ? 'select_target' : 'new'}`;
  }
  if (view.screen === 'callback') {
    if (view.kind.startsWith('manifest')) {
      if (view.kind === 'manifest-missing-code') {
        return `/webhooks/source/github/redirect?state=${manifestState}`;
      }
      if (view.kind === 'manifest-expired') {
        return '/webhooks/source/github/redirect?state=expired-state&code=gh_manifest_code_8172';
      }
      if (view.kind === 'manifest-already-configured') {
        return `/webhooks/source/github/redirect?state=${manifestState}&code=replayed-code`;
      }
      if (view.kind === 'manifest-unauthenticated') {
        return `/webhooks/source/github/redirect?state=${manifestState}&code=gh_manifest_code_8172&signed_out=1`;
      }
      return `/webhooks/source/github/redirect?state=${manifestState}&code=gh_manifest_code_8172`;
    }
    if (view.kind === 'install-unauthenticated') {
      return `/webhooks/source/github/install?source=${source.uuid}&setup_action=install&installation_id=123456&signed_out=1`;
    }
    const installationId = view.kind === 'install-verify-failed' ? '999999' : view.reinstall ? '222222' : '123456';
    return `/webhooks/source/github/install?source=${source.uuid}&setup_action=install&installation_id=${installationId}`;
  }
  return '/source/github/' + source.uuid;
}

function buildManifestPayload(
  source: GithubSource,
  endpoint: string,
  previewDeployments: boolean,
  administration: boolean
): ManifestPayload {
  const default_permissions: Record<string, string> = {
    contents: 'read',
    metadata: 'read',
    emails: 'read',
    administration: administration ? 'write' : 'read',
  };
  const default_events = ['push'];
  if (previewDeployments) {
    default_permissions.pull_requests = 'write';
    default_events.push('pull_request');
  }

  return {
    name: source.name,
    url: endpoint,
    hook_attributes: {
      url: `${endpoint}/webhooks/source/github/events`,
      active: true,
    },
    redirect_url: `${endpoint}/webhooks/source/github/redirect`,
    callback_urls: [`${endpoint}/login/github/app`],
    public: false,
    request_oauth_on_install: false,
    setup_url: `${endpoint}/webhooks/source/github/install?source=${source.uuid}`,
    setup_on_update: true,
    default_permissions,
    default_events,
  };
}

function Sidebar({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: (view: View) => void;
}) {
  const items = [
    ['Dashboard', 'home'],
    ['Projects', 'layers'],
    ['Servers', 'server'],
    ['Sources', 'source'],
    ['Destinations', 'map'],
    ['S3 Storages', 'database'],
    ['Keys & Tokens', 'key'],
    ['Profile', 'profile'],
  ];

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <button className="brand" onClick={() => onNavigate({ screen: 'source' })}>
          <span>Coolify</span>
        </button>
        <span className="version">v4.0.0-beta.420</span>
      </div>
      <button className="search-button">
        <Icon name="search" />
        <kbd>/</kbd>
      </button>
      <div className="team-switcher">
        <span className="team-dot" />
        <span>Root Team</span>
      </div>
      <nav className="nav-list">
        {items.map(([label, icon]) => (
          <button
            key={label}
            className={`menu-item ${(active === 'sources' || active === 'source') && label === 'Sources' ? 'menu-item-active' : ''}`}
            onClick={() => (label === 'Sources' ? onNavigate({ screen: 'sources' }) : undefined)}
          >
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function SourcesPage({
  source,
  onAdd,
  onOpen,
}: {
  source: GithubSource;
  onAdd: () => void;
  onOpen: () => void;
}) {
  return (
    <section>
      <div className="page-title-row">
        <h1>Sources</h1>
        <Button onClick={onAdd}>+ Add</Button>
      </div>
      <div className="subtitle">Git sources for your applications.</div>
      <div className="sources-grid">
        <button className="coolbox source-card" onClick={onOpen}>
          <div className="source-icon">
            <Icon name="source" />
          </div>
          <div className="source-card-body">
            <div className="box-title">{source.name}</div>
            {source.appId ? (
              <span className="box-description">Organization: {source.organization || 'personal user'}</span>
            ) : (
              <span className="box-description text-error">Configuration is not finished.</span>
            )}
          </div>
        </button>
      </div>
    </section>
  );
}

function CreateSourceModal({
  source,
  onClose,
  onCreate,
}: {
  source: GithubSource;
  onClose: () => void;
  onCreate: (source: GithubSource) => void;
}) {
  const [draft, setDraft] = useState(source);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);

  return (
    <div className="modal-screen">
      <div className="modal-card">
        <div className="modal-head">
          <h3>New GitHub App</h3>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            onCreate(draft);
          }}
        >
          <p className="form-copy">
            This is required, if you would like to get full integration (commit / pull request deployments, etc) with GitHub.
          </p>
          <div className="form-row two">
            <TextInput label="Name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} required />
            <TextInput
              label="Organization (on GitHub)"
              value={draft.organization}
              placeholder="If empty, your GitHub user will be used."
              onChange={(organization) => setDraft({ ...draft, organization })}
            />
          </div>
          <Checkbox
            label="System Wide"
            helper="If checked, this GitHub App will be available for everyone in this Coolify instance."
            checked={draft.isSystemWide}
            onChange={(isSystemWide) => setDraft({ ...draft, isSystemWide })}
          />
          {draft.isSystemWide ? (
            <Callout type="warning" title="Not Recommended">
              System-wide GitHub Apps are shared across all teams on this Coolify instance. This means any team can use this
              GitHub App to deploy applications from your repositories. For better security and isolation, it is recommended
              to create team-specific GitHub Apps instead.
            </Callout>
          ) : null}
          <button className="accordion-button" type="button" onClick={() => setEnterpriseOpen(!enterpriseOpen)}>
            <h4>Self-hosted / Enterprise GitHub</h4>
            <Icon name={enterpriseOpen ? 'chevron-up' : 'chevron-down'} />
          </button>
          {enterpriseOpen ? (
            <div className="enterprise-panel">
              <div className="form-row two">
                <TextInput label="HTML Url" value={draft.htmlUrl} onChange={(htmlUrl) => setDraft({ ...draft, htmlUrl })} required />
                <TextInput label="API Url" value={draft.apiUrl} onChange={(apiUrl) => setDraft({ ...draft, apiUrl })} required />
              </div>
              <div className="form-row two">
                <TextInput label="Custom Git User" value={draft.customUser} onChange={(customUser) => setDraft({ ...draft, customUser })} required />
                <TextInput
                  label="Custom Git Port"
                  type="number"
                  value={String(draft.customPort)}
                  onChange={(customPort) => setDraft({ ...draft, customPort: Number(customPort) || 22 })}
                  required
                />
              </div>
            </div>
          ) : null}
          <Button type="submit" className="mt-4">
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}

function SourcePage({
  source,
  webhookEndpoint,
  setWebhookEndpoint,
  previewDeployments,
  setPreviewDeployments,
  administration,
  setAdministration,
  manualOpen,
  setManualOpen,
  onRegister,
  onManual,
  onInstall,
  onSave,
}: {
  source: GithubSource;
  webhookEndpoint: string;
  setWebhookEndpoint: (value: string) => void;
  previewDeployments: boolean;
  setPreviewDeployments: (value: boolean) => void;
  administration: boolean;
  setAdministration: (value: boolean) => void;
  manualOpen: boolean;
  setManualOpen: (value: boolean) => void;
  onRegister: () => void;
  onManual: () => void;
  onInstall: (reinstall: boolean) => void;
  onSave: () => void;
}) {
  const configured = Boolean(source.appId);
  const installed = Boolean(source.installationId);

  if (!configured) {
    return (
      <section>
        <div className="page-title-row pb-4">
          <h1>GitHub App</h1>
          <Button tone="danger">Delete</Button>
        </div>
        <div className="source-setup">
          <h3>Manual Installation</h3>
          <div className="manual-row">
            <span>If you want to fill the form manually, you can continue below. Only for advanced users.</span>
            <Button onClick={() => setManualOpen(true)}>Continue</Button>
          </div>
          {manualOpen ? (
            <div className="inline-editor">
              <div className="form-row two">
                <TextInput label="App Id" value="1234567890" onChange={() => undefined} />
                <TextInput label="Installation Id" value="1234567890" onChange={() => undefined} />
              </div>
              <Button onClick={onManual}>Save manual values</Button>
            </div>
          ) : null}

          <h3>Automated Installation</h3>
          <Alert className="alert-setup">You must complete this step before you can use this source!</Alert>
          <div className="register-row">
            <SelectField
              label="Webhook Endpoint"
              helper="All Git webhooks will be sent to this endpoint."
              value={webhookEndpoint}
              onChange={setWebhookEndpoint}
              options={[
                ['https://coolify.example.com', 'Use https://coolify.example.com'],
                ['http://203.0.113.10:8000', 'Use http://203.0.113.10:8000'],
                ['https://staging.coolify.example.com', 'Use https://staging.coolify.example.com'],
              ]}
            />
            <Button highlighted onClick={onRegister}>
              Register Now
            </Button>
          </div>
          <div className="checkbox-list">
            <Checkbox
              label="Mandatory"
              helper="Contents: read; Metadata: read; Email: read"
              checked
              disabled
              onChange={() => undefined}
            />
            <Checkbox
              label="Preview Deployments "
              helper="Necessary for updating pull requests with useful comments (deployment status, links, etc.). Pull Request: read and write"
              checked={previewDeployments}
              onChange={setPreviewDeployments}
            />
          </div>
        </div>
      </section>
    );
  }

  if (!installed) {
    return (
      <section>
        <div className="page-title-row">
          <h1>GitHub App</h1>
          <Button tone="danger">Delete</Button>
        </div>
        <div className="subtitle">Your Private GitHub App for private repositories.</div>
        <Alert className="alert-install">You must complete this step before you can use this source!</Alert>
        <button className="coolbox install-box" onClick={() => onInstall(false)}>
          <Icon name="github" />
          <span>Install Repositories on GitHub</span>
        </button>
      </section>
    );
  }

  return (
    <section>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <div className="page-title-row">
          <h1>GitHub App</h1>
          <div className="button-row">
            <Button type="submit">Save</Button>
            <Button tone="danger">Delete</Button>
          </div>
        </div>
        <div className="subtitle">Your Private GitHub App for private repositories.</div>
        <div className="form-stack">
          <div className="app-name-row">
            <div className="grow-row">
              <TextInput label="App Name" value={source.name} onChange={() => undefined} />
              <Button>Sync Name</Button>
              <Button ghost>
                Rename
                <Icon name="external" />
              </Button>
              <Button ghost onClick={() => onInstall(true)}>
                Update Repositories
                <Icon name="external" />
              </Button>
            </div>
          </div>
          <TextInput label="Organization" value={source.organization} placeholder="If empty, personal user will be used" onChange={() => undefined} />
          <div className="wide-check">
            <Checkbox
              label="System Wide?"
              helper="If checked, this GitHub App will be available for everyone in this Coolify instance."
              checked={source.isSystemWide}
              onChange={() => undefined}
            />
          </div>
          <div className="form-row two">
            <TextInput label="HTML Url" value={source.htmlUrl} onChange={() => undefined} />
            <TextInput label="API Url" value={source.apiUrl} onChange={() => undefined} />
          </div>
          <div className="form-row two">
            <TextInput label="User" value={source.customUser} onChange={() => undefined} required />
            <TextInput label="Port" value={String(source.customPort)} type="number" onChange={() => undefined} required />
          </div>
          <div className="form-row two">
            <TextInput label="App Id" value={String(source.appId)} type="number" onChange={() => undefined} required />
            <TextInput label="Installation Id" value={String(source.installationId)} type="number" onChange={() => undefined} required />
          </div>
          <div className="form-row three">
            <TextInput label="Client Id" type="password" value={source.clientId} onChange={() => undefined} required />
            <TextInput label="Client Secret" type="password" value={source.clientSecret} onChange={() => undefined} required />
            <TextInput label="Webhook Secret" type="password" value={source.webhookSecret} onChange={() => undefined} required />
          </div>
          <SelectField
            label="Private Key"
            value={String(source.privateKeyId)}
            onChange={() => undefined}
            options={privateKeys.map((key) => [String(key.id), key.name])}
          />
          <div className="permissions-head">
            <h2>Permissions</h2>
            <Button>Refetch</Button>
            <Button>
              Update
              <Icon name="external" />
            </Button>
          </div>
          <div className="form-row three">
            <TextInput label="Content" helper="read - mandatory." value={source.contents || 'N/A'} readonly onChange={() => undefined} />
            <TextInput label="Metadata" helper="read - mandatory." value={source.metadata || 'N/A'} readonly onChange={() => undefined} />
            <TextInput
              label="Pull Request"
              helper="write access needed to use deployment status update in previews."
              value={source.pullRequests || 'N/A'}
              readonly
              onChange={() => undefined}
            />
          </div>
        </div>
      </form>

      <div className="resources-section">
        <div>
          <h2>Resources</h2>
          <div className="title">Here you can find all resources that are using this source.</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Environment</th>
                <th>Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.name}>
                  <td>{resource.project}</td>
                  <td>{resource.environment}</td>
                  <td>
                    <a>{resource.name} <Icon name="internal" /></a>
                  </td>
                  <td>{resource.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function GithubManifestPage({
  source,
  manifestState,
  payload,
  onBack,
  onSubmit,
  onExpired,
  onMissingCode,
  onUnauthenticated,
}: {
  source: GithubSource;
  manifestState: string;
  payload: ManifestPayload;
  onBack: () => void;
  onSubmit: () => void;
  onExpired: () => void;
  onMissingCode: () => void;
  onUnauthenticated: () => void;
}) {
  const actionPath = `${source.htmlUrl}/organizations/${source.organization}/settings/apps/new?state=${manifestState}`;
  return (
    <div className="github-page">
      <div className="github-top">
        <Icon name="github" />
        <span>GitHub</span>
        <span className="github-path">{actionPath}</span>
      </div>
      <div className="github-card">
        <div className="github-head">
          <div>
            <h1>Register new GitHub App</h1>
            <p>{source.organization ? `${source.organization} settings` : 'Personal settings'} / Developer settings / GitHub Apps</p>
          </div>
          <Button onClick={onBack}>Cancel</Button>
        </div>
        <div className="github-form-grid">
          <TextInput label="GitHub App name" value={payload.name} onChange={() => undefined} />
          <TextInput label="Homepage URL" value={payload.url} onChange={() => undefined} />
          <TextInput label="Webhook URL" value={payload.hook_attributes.url} onChange={() => undefined} />
          <TextInput label="Redirect URL" value={payload.redirect_url} onChange={() => undefined} />
          <TextInput label="Setup URL" value={payload.setup_url} onChange={() => undefined} />
        </div>
        <div className="manifest-box">
          <div className="manifest-row">
            <span>Hidden manifest input</span>
            <code>state={manifestState}</code>
          </div>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </div>
        <div className="github-actions">
          <Button highlighted onClick={onSubmit}>
            Create GitHub App
          </Button>
          <Button onClick={onExpired}>Open expired setup link</Button>
          <Button onClick={onMissingCode}>Return without manifest code</Button>
          <Button onClick={onUnauthenticated}>Return after session expires</Button>
        </div>
      </div>
    </div>
  );
}

function GithubInstallPage({
  source,
  reinstall,
  onBack,
  onInstall,
  onVerifyFailed,
  onUnauthenticated,
}: {
  source: GithubSource;
  reinstall: boolean;
  onBack: () => void;
  onInstall: () => void;
  onVerifyFailed: () => void;
  onUnauthenticated: () => void;
}) {
  return (
    <div className="github-page">
      <div className="github-top">
        <Icon name="github" />
        <span>GitHub</span>
        <span className="github-path">
          {source.htmlUrl}/apps/{source.name}/installations/{reinstall ? 'select_target' : 'new'}
        </span>
      </div>
      <div className="github-card install-card">
        <div className="github-head">
          <div>
            <h1>{reinstall ? 'Update repository access' : 'Install Coolify App'}</h1>
            <p>Choose repositories that Coolify can access for deployments and preview environments.</p>
          </div>
          <Button onClick={onBack}>Cancel</Button>
        </div>
        <div className="repo-options">
          <label className="repo-option selected">
            <input type="radio" checked readOnly />
            <span>Only select repositories</span>
          </label>
          <label className="repo-option">
            <input type="checkbox" checked readOnly />
            <span>coollabsio/coolify</span>
          </label>
          <label className="repo-option">
            <input type="checkbox" checked readOnly />
            <span>coollabsio/coolify-cloud</span>
          </label>
        </div>
        <div className="permission-summary">
          <h3>Repository permissions</h3>
          <div>Contents: Read-only</div>
          <div>Metadata: Read-only</div>
          <div>Pull requests: Read and write</div>
          <div>Setup URL: /webhooks/source/github/install?source={source.uuid}</div>
        </div>
        <div className="github-actions">
          <Button highlighted onClick={onInstall}>
            {reinstall ? 'Update access' : 'Install'}
          </Button>
          <Button onClick={onVerifyFailed}>Return with mismatched installation</Button>
          <Button onClick={onUnauthenticated}>Return after sign out</Button>
        </div>
      </div>
    </div>
  );
}

function CallbackPage({
  kind,
  source,
  manifestState,
  reinstall,
  onManifestSuccess,
  onInstallSuccess,
  onRetry,
  onReturn,
}: {
  kind: CallbackKind;
  source: GithubSource;
  manifestState: string;
  reinstall: boolean;
  onManifestSuccess: () => void;
  onInstallSuccess: () => void;
  onRetry: () => void;
  onReturn: () => void;
}) {
  const manifest = kind.startsWith('manifest');
  const success = kind === 'manifest-success' || kind === 'install-success';
  const details = callbackDetails(kind, source, manifestState, reinstall);

  return (
    <section className="callback-page">
      <div className="page-title-row">
        <h1>{manifest ? 'GitHub App setup callback' : 'GitHub App install callback'}</h1>
        <Button onClick={onReturn}>Back to Source</Button>
      </div>
      <div className="subtitle mono">{details.route}</div>
      <Callout type={success ? 'success' : details.type} title={details.title}>
        {details.message}
      </Callout>
      <div className="callback-timeline">
        {details.steps.map((step) => (
          <div className={`timeline-row ${step.state}`} key={step.label}>
            <span className="timeline-dot" />
            <div>
              <strong>{step.label}</strong>
              <p>{step.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="callback-footer">
        {kind === 'manifest-success' ? (
          <Button highlighted onClick={onManifestSuccess}>
            Continue to GitHub App
          </Button>
        ) : null}
        {kind === 'install-success' ? (
          <Button highlighted onClick={onInstallSuccess}>
            Continue to GitHub App
          </Button>
        ) : null}
        {!success ? <Button onClick={onRetry}>Try setup again</Button> : null}
      </div>
    </section>
  );
}

function callbackDetails(kind: CallbackKind, source: GithubSource, manifestState: string, reinstall: boolean) {
  const baseSteps = [
    { label: 'Web middleware', text: 'Request is handled inside the authenticated web session.', state: 'done' },
    { label: 'Throttle', text: 'Callback route is rate limited to 30 requests per minute.', state: 'done' },
  ];

  if (kind === 'manifest-success') {
    return {
      type: 'success' as const,
      title: 'GitHub App manifest converted',
      message: 'The one-time setup state matched the current team and was consumed before credentials were stored.',
      route: `/webhooks/source/github/redirect?state=${manifestState}&code=gh_manifest_code_8172`,
      steps: [
        ...baseSteps,
        { label: 'Setup state', text: 'Cache payload action=manifest, team_id=Root Team, source_id=42.', state: 'done' },
        { label: 'Manifest conversion', text: 'GitHub returned app id, slug, client secret, webhook secret, and private key.', state: 'done' },
      ],
    };
  }
  if (kind === 'manifest-expired') {
    return {
      type: 'danger' as const,
      title: 'Setup state was not found',
      message: 'The callback was rejected before GitHub was called because the setup state was missing or already used.',
      route: '/webhooks/source/github/redirect?state=expired-state&code=gh_manifest_code_8172',
      steps: [
        ...baseSteps,
        { label: 'Setup state', text: 'Cache::pull returned empty. The route responds with 404.', state: 'failed' },
        { label: 'GitHub API', text: 'No manifest conversion request was sent.', state: 'muted' },
      ],
    };
  }
  if (kind === 'manifest-missing-code') {
    return {
      type: 'danger' as const,
      title: 'Missing GitHub App manifest code',
      message: 'The callback URL did not include the manifest code, so Coolify stops with a 422 response.',
      route: `/webhooks/source/github/redirect?state=${manifestState}`,
      steps: [
        ...baseSteps,
        { label: 'Manifest code', text: 'The code query parameter is blank.', state: 'failed' },
        { label: 'Setup state', text: 'The state is not consumed because the request is incomplete.', state: 'muted' },
      ],
    };
  }
  if (kind === 'manifest-already-configured') {
    return {
      type: 'danger' as const,
      title: 'GitHub App credentials are already configured',
      message: 'A replayed manifest callback cannot rebind an existing GitHub App source.',
      route: `/webhooks/source/github/redirect?state=${manifestState}&code=replayed-code`,
      steps: [
        ...baseSteps,
        { label: 'Setup state', text: 'The old setup state points to this source, but credentials already exist.', state: 'done' },
        { label: 'Credential guard', text: 'The route responds with 403 before storing new secrets.', state: 'failed' },
      ],
    };
  }
  if (kind === 'manifest-unauthenticated') {
    return {
      type: 'warning' as const,
      title: 'Sign in required',
      message: 'Manifest setup callbacks require an authenticated Coolify session before processing state or calling GitHub.',
      route: `/webhooks/source/github/redirect?state=${manifestState}&code=gh_manifest_code_8172`,
      steps: [
        { label: 'Web middleware', text: 'The auth middleware redirects to sign in.', state: 'failed' },
        { label: 'GitHub API', text: 'No manifest conversion request was sent.', state: 'muted' },
      ],
    };
  }
  if (kind === 'install-success') {
    const installationId = reinstall ? 222222 : 123456;
    return {
      type: 'success' as const,
      title: reinstall ? 'Repository access updated' : 'GitHub App installation verified',
      message: reinstall
        ? 'Re-installing an already configured GitHub App is allowed after GitHub confirms the installation belongs to the app.'
        : 'The installation id was verified against GitHub before it was stored on the source.',
      route: `/webhooks/source/github/install?source=${source.uuid}&setup_action=install&installation_id=${installationId}`,
      steps: [
        ...baseSteps,
        { label: 'Source lookup', text: 'The source UUID resolves inside the current team.', state: 'done' },
        { label: 'GitHub verification', text: `GET /app/installations/${installationId} returned app_id=${source.appId ?? 987654}.`, state: 'done' },
        { label: 'Persist installation', text: `installation_id=${installationId} is saved.`, state: 'done' },
      ],
    };
  }
  if (kind === 'install-unauthenticated') {
    return {
      type: 'warning' as const,
      title: 'Sign in required',
      message: 'Installation callbacks are handled inside the authenticated web session.',
      route: `/webhooks/source/github/install?source=${source.uuid}&setup_action=install&installation_id=123456`,
      steps: [
        { label: 'Web middleware', text: 'The auth middleware redirects to sign in.', state: 'failed' },
        { label: 'GitHub verification', text: 'No installation lookup was sent.', state: 'muted' },
      ],
    };
  }
  return {
    type: 'danger' as const,
    title: 'GitHub App installation could not be verified',
    message: 'The installation id was rejected because GitHub did not confirm it belongs to this App.',
    route: `/webhooks/source/github/install?source=${source.uuid}&setup_action=install&installation_id=999999`,
    steps: [
      ...baseSteps,
      { label: 'Source lookup', text: 'The source UUID resolves inside the current team.', state: 'done' },
      { label: 'GitHub verification', text: 'GET /app/installations/999999 returned 404 or a different app_id.', state: 'failed' },
      { label: 'Persist installation', text: 'The existing installation id is left unchanged.', state: 'muted' },
    ],
  };
}

function FlashBanner({ flash, onDismiss }: { flash: Flash; onDismiss: () => void }) {
  return (
    <div className={`flash flash-${flash.kind}`}>
      <span>{flash.message}</span>
      <button className="icon-button" onClick={onDismiss} aria-label="Dismiss">
        <Icon name="close" />
      </button>
    </div>
  );
}

function Button({
  children,
  onClick,
  type = 'button',
  tone,
  highlighted,
  ghost,
  disabled,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  tone?: 'danger';
  highlighted?: boolean;
  ghost?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${tone === 'danger' ? 'btn-danger' : ''} ${highlighted ? 'btn-highlighted' : ''} ${
        ghost ? 'btn-ghost' : ''
      } ${className}`}
    >
      {children}
    </button>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = 'text',
  helper,
  placeholder,
  required,
  readonly,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  helper?: string;
  placeholder?: string;
  required?: boolean;
  readonly?: boolean;
}) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {required ? <b>*</b> : null}
        {helper ? <em title={helper}>?</em> : null}
      </span>
      <input
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        required={required}
        readOnly={readonly}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
  helper?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {helper ? <em title={helper}>?</em> : null}
      </span>
      <select className="input select" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, labelText]) => (
          <option value={optionValue} key={optionValue}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
  helper,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  helper?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`check-row ${disabled ? 'disabled' : ''}`}>
      <span>
        {label}
        {helper ? <em title={helper}>?</em> : null}
      </span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function Alert({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`alert-error ${className}`}>
      <Icon name="warning" />
      <span>{children}</span>
    </div>
  );
}

function Callout({
  type,
  title,
  children,
}: {
  type: 'warning' | 'danger' | 'success';
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`callout callout-${type}`}>
      <Icon name={type === 'success' ? 'check' : 'warning'} />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (name) {
    case 'home':
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <path d="M3 12l9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case 'layers':
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <path d="M12 4l8 4-8 4-8-4 8-4z" />
          <path d="M4 12l8 4 8-4" />
          <path d="M4 16l8 4 8-4" />
        </svg>
      );
    case 'server':
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <rect x="3" y="4" width="18" height="7" rx="2" />
          <rect x="3" y="13" width="18" height="7" rx="2" />
          <path d="M7 8h.01M7 17h.01" />
        </svg>
      );
    case 'source':
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <path d="M7 4l-5 5 5 5" />
          <path d="M17 4l5 5-5 5" />
          <path d="M14 3l-4 18" />
        </svg>
      );
    case 'map':
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" />
          <path d="M9 3v15M15 6v15" />
        </svg>
      );
    case 'database':
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <ellipse cx="12" cy="6" rx="8" ry="3" />
          <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
          <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
        </svg>
      );
    case 'key':
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <circle cx="7" cy="15" r="4" />
          <path d="M10 12l9-9 2 2-2 2 2 2-2 2-2-2-5 5" />
        </svg>
      );
    case 'profile':
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case 'search':
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      );
    case 'github':
      return (
        <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.17-1.1-1.48-1.1-1.48-.91-.62.07-.61.07-.61 1 .07 1.53 1.04 1.53 1.04.89 1.52 2.34 1.08 2.91.82.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.5 9.5 0 0 1 12 6.99c.85 0 1.7.11 2.5.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <path d="M10.3 4.3L2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      );
    case 'check':
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12l2.5 2.5L16 9" />
        </svg>
      );
    case 'external':
      return (
        <svg className="inline-icon" viewBox="0 0 24 24" {...common}>
          <path d="M14 4h6v6" />
          <path d="M10 14L20 4" />
          <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
        </svg>
      );
    case 'internal':
      return (
        <svg className="inline-icon" viewBox="0 0 24 24" {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case 'close':
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case 'chevron-up':
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <path d="M6 15l6-6 6 6" />
        </svg>
      );
    default:
      return (
        <svg className="icon" viewBox="0 0 24 24" {...common}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
  }
}

export default App;
