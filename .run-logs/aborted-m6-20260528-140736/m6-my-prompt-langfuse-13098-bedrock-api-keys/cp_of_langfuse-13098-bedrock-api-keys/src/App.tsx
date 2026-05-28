import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  Pencil,
  PlusIcon,
  Trash2,
  X,
} from "lucide-react";
import "./App.css";

type Adapter =
  | "anthropic"
  | "openai"
  | "azure"
  | "bedrock"
  | "google-vertex-ai"
  | "google-ai-studio";

type AuthMethod = "api-key" | "access-keys" | "default-credentials";

type LlmConnection = {
  id: string;
  provider: string;
  adapter: Adapter;
  baseURL?: string;
  displaySecretKey: string;
  extraHeaderKeys: string[];
  customModels: string[];
  withDefaultModels: boolean;
  authMethod?: AuthMethod;
  config?: {
    region?: string;
    location?: string;
  };
};

type DialogState =
  | { type: "create" }
  | { type: "update"; connection: LlmConnection }
  | { type: "delete"; connection: LlmConnection };

const adapters: Adapter[] = [
  "anthropic",
  "openai",
  "azure",
  "bedrock",
  "google-vertex-ai",
  "google-ai-studio",
];

const settingsPages = [
  "General",
  "API Keys",
  "LLM Connections",
  "Model Definitions",
  "Protected Prompt Labels",
  "Scores Configs",
  "Members",
  "Integrations",
  "Exports",
  "Batch Actions",
  "Audit Logs",
  "Notifications",
  "Billing",
  "Organization Settings",
];

const initialConnections: LlmConnection[] = [
  {
    id: "llm-bedrock-prod",
    provider: "bedrock-prod",
    adapter: "bedrock",
    displaySecretKey: "...1234",
    baseURL: undefined,
    customModels: ["eu.anthropic.claude-sonnet-4-6"],
    withDefaultModels: false,
    extraHeaderKeys: [],
    authMethod: "api-key",
    config: { region: "us-east-1" },
  },
];

const isLangfuseCloud = true;

function App() {
  const [connections, setConnections] =
    useState<LlmConnection[]>(initialConnections);
  const [dialog, setDialog] = useState<DialogState | null>({
    type: "create",
  });

  const closeDialog = () => setDialog(null);

  const upsertConnection = (connection: LlmConnection) => {
    setConnections((current) => {
      const existingIndex = current.findIndex((item) => item.id === connection.id);
      if (existingIndex === -1) return [connection, ...current];
      return current.map((item, index) =>
        index === existingIndex ? connection : item,
      );
    });
    closeDialog();
  };

  const deleteConnection = (id: string) => {
    setConnections((current) => current.filter((item) => item.id !== id));
    closeDialog();
  };

  return (
    <div className="app-shell">
      <PageHeader />
      <main className="page-container">
        <section className="settings-layout">
          <SettingsNav />
          <div className="settings-content">
            <LlmConnectionList
              connections={connections}
              onCreate={() => setDialog({ type: "create" })}
              onUpdate={(connection) => setDialog({ type: "update", connection })}
              onDelete={(connection) => setDialog({ type: "delete", connection })}
            />
          </div>
        </section>
      </main>

      {dialog?.type === "create" && (
        <Modal title="New LLM Connection" onClose={closeDialog}>
          <ConnectionForm mode="create" onSave={upsertConnection} />
        </Modal>
      )}

      {dialog?.type === "update" && (
        <Modal title="Update LLM Connection" onClose={closeDialog}>
          <ConnectionForm
            key={dialog.connection.id}
            mode="update"
            existingConnection={dialog.connection}
            onSave={upsertConnection}
          />
        </Modal>
      )}

      {dialog?.type === "delete" && (
        <Modal title="Delete LLM Connection" onClose={closeDialog} narrow>
          <div className="delete-body">
            <p>
              Are you sure you want to delete this connection? This action cannot
              be undone.
            </p>
            <div className="dialog-footer inline-footer">
              <button
                className="button destructive"
                onClick={() => deleteConnection(dialog.connection.id)}
              >
                Permanently delete
              </button>
              <button className="button ghost" onClick={closeDialog}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PageHeader() {
  return (
    <header className="page-header">
      <div className="header-top">
        <div className="header-inner">
          <button className="icon-button sidebar-trigger" aria-label="Sidebar">
            <Menu size={16} />
          </button>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <span>Langfuse Cloud</span>
            <ChevronDown size={14} />
            <span className="slash">/</span>
            <span>Production</span>
            <ChevronDown size={14} />
          </nav>
        </div>
      </div>
      <div className="header-bottom">
        <div className="header-inner">
          <h1>Project Settings</h1>
        </div>
      </div>
    </header>
  );
}

function SettingsNav() {
  return (
    <nav className="settings-nav" aria-label="Project settings">
      {settingsPages.map((page) => (
        <button
          key={page}
          className={page === "LLM Connections" ? "active" : ""}
          type="button"
        >
          {page}
          {(page === "Billing" || page === "Organization Settings") && (
            <ArrowUpRight size={14} aria-hidden="true" />
          )}
        </button>
      ))}
    </nav>
  );
}

function LlmConnectionList({
  connections,
  onCreate,
  onUpdate,
  onDelete,
}: {
  connections: LlmConnection[];
  onCreate: () => void;
  onUpdate: (connection: LlmConnection) => void;
  onDelete: (connection: LlmConnection) => void;
}) {
  const hasExtraHeaderKeys = connections.some(
    (connection) => connection.extraHeaderKeys.length > 0,
  );

  return (
    <div id="llm-api-keys">
      <div className="section-header">
        <h2>LLM Connections</h2>
      </div>
      <p className="intro-copy">
        Connect your LLM services to enable evaluations and playground features.
        Your provider will charge based on usage.
      </p>
      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Adapter</th>
              <th>Base URL</th>
              <th>API Key</th>
              {hasExtraHeaderKeys && <th>Extra headers</th>}
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {connections.length === 0 ? (
              <tr>
                <td colSpan={hasExtraHeaderKeys ? 6 : 5} className="empty-cell">
                  None
                </td>
              </tr>
            ) : (
              connections.map((connection) => (
                <tr
                  key={connection.id}
                  className="connection-row"
                  onClick={() => onUpdate(connection)}
                >
                  <td className="mono">{connection.provider}</td>
                  <td className="mono">{connection.adapter}</td>
                  <td className="mono overflow-cell">
                    {connection.baseURL ?? "default"}
                  </td>
                  <td className="mono">{connection.displaySecretKey}</td>
                  {hasExtraHeaderKeys && (
                    <td>{connection.extraHeaderKeys.join(", ")}</td>
                  )}
                  <td>
                    <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="icon-button"
                        aria-label={`Update ${connection.provider}`}
                        onClick={() => onUpdate(connection)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Delete ${connection.provider}`}
                        onClick={() => onDelete(connection)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <button className="button secondary" onClick={onCreate}>
        <PlusIcon size={18} />
        Add LLM Connection
      </button>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  narrow = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  narrow?: boolean;
}) {
  return (
    <div className="modal-layer" role="presentation">
      <div className="modal-backdrop" />
      <section
        className={`modal-content ${narrow ? "modal-narrow" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="dialog-header">
          <h2>{title}</h2>
          <button className="close-button" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function ConnectionForm({
  mode,
  existingConnection,
  onSave,
}: {
  mode: "create" | "update";
  existingConnection?: LlmConnection;
  onSave: (connection: LlmConnection) => void;
}) {
  const [adapter, setAdapter] = useState<Adapter>(
    existingConnection?.adapter ?? "bedrock",
  );
  const [provider, setProvider] = useState(
    existingConnection?.provider ?? "bedrock-api-key",
  );
  const [baseURL, setBaseURL] = useState(existingConnection?.baseURL ?? "");
  const [awsRegion, setAwsRegion] = useState(
    existingConnection?.config?.region ?? "us-east-1",
  );
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [bedrockApiKey, setBedrockApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [withDefaultModels, setWithDefaultModels] = useState(
    existingConnection?.withDefaultModels ?? false,
  );
  const [customModels, setCustomModels] = useState<string[]>(
    existingConnection?.customModels.length
      ? existingConnection.customModels
      : [],
  );
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>(() => {
    if (mode === "update") {
      return existingConnection?.authMethod === "api-key"
        ? "api-key"
        : "access-keys";
    }
    return "access-keys";
  });
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (!provider.trim()) {
      next.provider = "Please add a provider name that identifies this connection.";
    }
    if (provider.includes(":")) {
      next.provider =
        "Provider name cannot contain colons. Use a format like 'OpenRouter_Mistral' instead.";
    }

    if (adapter === "bedrock") {
      if (!awsRegion.trim()) next.awsRegion = "AWS region is required.";

      const sameAuthMethod =
        mode === "update" &&
        ((authMethod === "api-key" && existingConnection?.authMethod === "api-key") ||
          (authMethod === "access-keys" &&
            (existingConnection?.authMethod === "access-keys" ||
              existingConnection?.authMethod === "default-credentials")));

      if (authMethod === "api-key") {
        if (!(sameAuthMethod && !bedrockApiKey.trim()) && !bedrockApiKey.trim()) {
          next.bedrockApiKey = "Bedrock API key is required.";
        }
      } else {
        const hasAnyAccessKey =
          awsAccessKeyId.trim().length > 0 || awsSecretAccessKey.trim().length > 0;
        if (!(sameAuthMethod && !hasAnyAccessKey)) {
          if (!awsAccessKeyId.trim()) {
            next.awsAccessKeyId = "AWS Access Key ID is required.";
          }
          if (!awsSecretAccessKey.trim()) {
            next.awsSecretAccessKey = "AWS Secret Access Key is required.";
          }
        }
      }

      if (customModels.every((model) => !model.trim())) {
        next.customModels =
          "At least one custom model is required for this adapter.";
      }
    } else if (adapter === "azure") {
      if (!secretKey.trim() && mode === "create") {
        next.secretKey = "Secret key is required.";
      }
      if (!baseURL.trim()) {
        next.baseURL = "API Base URL is required for Azure connections.";
      }
      if (customModels.every((model) => !model.trim())) {
        next.customModels =
          "At least one custom model is required for this adapter.";
      }
    } else if (
      !withDefaultModels &&
      customModels.every((model) => !model.trim())
    ) {
      next.withDefaultModels =
        "At least one custom model name is required when default models are disabled.";
    } else if (!secretKey.trim() && mode === "create") {
      next.secretKey = "Secret key is required.";
    }

    return next;
  }, [
    adapter,
    authMethod,
    awsAccessKeyId,
    awsRegion,
    awsSecretAccessKey,
    baseURL,
    bedrockApiKey,
    customModels,
    existingConnection?.authMethod,
    mode,
    provider,
    secretKey,
    withDefaultModels,
  ]);

  const currentAuthMatchesExisting =
    mode === "update" &&
    ((authMethod === "api-key" && existingConnection?.authMethod === "api-key") ||
      (authMethod === "access-keys" &&
        (existingConnection?.authMethod === "access-keys" ||
          existingConnection?.authMethod === "default-credentials")));
  const currentAuthUsesDefaultCredentials =
    authMethod === "access-keys" &&
    existingConnection?.authMethod === "default-credentials";

  const hasAdvancedSettings =
    adapter === "openai" ||
    adapter === "anthropic" ||
    adapter === "google-vertex-ai" ||
    adapter === "google-ai-studio";

  const setCustomModel = (index: number, value: string) => {
    setCustomModels((current) =>
      current.map((model, modelIndex) => (modelIndex === index ? value : model)),
    );
  };

  const removeCustomModel = (index: number) => {
    setCustomModels((current) =>
      current.filter((_, modelIndex) => modelIndex !== index),
    );
  };

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    const trimmedModels = customModels.map((model) => model.trim()).filter(Boolean);
    const existingDisplayKey = existingConnection?.displaySecretKey ?? "...1234";

    let displaySecretKey = existingDisplayKey;
    let nextAuthMethod: AuthMethod | undefined = existingConnection?.authMethod;
    let config = existingConnection?.config;

    if (adapter === "bedrock") {
      nextAuthMethod = authMethod;
      config = { region: awsRegion.trim() };
      if (authMethod === "api-key") {
        displaySecretKey = bedrockApiKey.trim()
          ? `...${bedrockApiKey.trim().slice(-4)}`
          : existingDisplayKey;
      } else if (awsSecretAccessKey.trim()) {
        displaySecretKey = `...${awsSecretAccessKey.trim().slice(-4)}`;
      } else {
        displaySecretKey = existingDisplayKey;
      }
    } else if (secretKey.trim()) {
      displaySecretKey = `...${secretKey.trim().slice(-4)}`;
    }

    onSave({
      id: existingConnection?.id ?? `llm-${Date.now()}`,
      provider: provider.trim(),
      adapter,
      baseURL: baseURL.trim() || undefined,
      displaySecretKey,
      customModels: trimmedModels,
      withDefaultModels: adapter === "bedrock" || adapter === "azure" ? false : withDefaultModels,
      extraHeaderKeys: existingConnection?.extraHeaderKeys ?? [],
      authMethod: adapter === "bedrock" ? nextAuthMethod : undefined,
      config,
    });
  };

  const showError = (field: string) => submitted && errors[field];

  return (
    <form className="connection-form" onSubmit={submitForm}>
      <div className="dialog-body">
        <Field
          label="LLM adapter"
          description="Schema that is accepted at that provider endpoint."
          error={showError("adapter")}
        >
          <select
            value={adapter}
            disabled={mode === "update"}
            onChange={(event) => {
              const nextAdapter = event.target.value as Adapter;
              setAdapter(nextAdapter);
            }}
          >
            {adapters.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Provider name"
          description="Key to identify the connection within Langfuse. Cannot contain colons."
          error={showError("provider")}
        >
          <input
            value={provider}
            disabled={mode === "update"}
            placeholder={`e.g. ${adapter}`}
            onChange={(event) => setProvider(event.target.value)}
          />
        </Field>

        {adapter === "bedrock" ? (
          <>
            <Field
              label="Authentication Method"
              description="Select how Langfuse should authenticate to Bedrock."
              error={showError("authMethod")}
            >
              <div className="tabs-list" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMethod === "access-keys"}
                  className={authMethod === "access-keys" ? "active" : ""}
                  onClick={() => setAuthMethod("access-keys")}
                >
                  AWS access keys
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMethod === "api-key"}
                  className={authMethod === "api-key" ? "active" : ""}
                  onClick={() => setAuthMethod("api-key")}
                >
                  API key
                </button>
              </div>
            </Field>

            <Field
              label="AWS Region"
              description={
                mode === "update" && existingConnection?.config?.region ? (
                  <span>
                    Current: <code>{existingConnection.config.region}</code>
                  </span>
                ) : undefined
              }
              error={showError("awsRegion")}
            >
              <input
                value={awsRegion}
                placeholder={
                  mode === "update" && existingConnection?.config?.region
                    ? existingConnection.config.region
                    : "e.g., us-east-1"
                }
                onChange={(event) => setAwsRegion(event.target.value)}
              />
            </Field>

            {authMethod === "api-key" && (
              <Field
                label="Bedrock API Key"
                description={
                  mode === "update" ? (
                    <span>
                      Use{" "}
                      <a href="https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html">
                        Amazon Bedrock API keys
                      </a>{" "}
                      to replace the current authentication.
                    </span>
                  ) : (
                    <span>
                      Use{" "}
                      <a href="https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html">
                        Amazon Bedrock API keys
                      </a>
                      .
                    </span>
                  )
                }
                error={showError("bedrockApiKey")}
              >
                <input
                  type="password"
                  value={bedrockApiKey}
                  placeholder={
                    mode === "update"
                      ? currentAuthMatchesExisting && existingConnection?.displaySecretKey
                        ? `${existingConnection.displaySecretKey} (preserved unless replaced)`
                        : "Enter Bedrock API key"
                      : undefined
                  }
                  autoComplete="new-password"
                  onChange={(event) => setBedrockApiKey(event.target.value)}
                />
              </Field>
            )}

            {authMethod === "access-keys" && (
              <>
                <Field
                  label={
                    <>
                      AWS Access Key ID
                      {!isLangfuseCloud && <span> (optional)</span>}
                    </>
                  }
                  description={
                    mode === "update"
                      ? currentAuthMatchesExisting
                        ? "Leave empty to keep existing credentials. To update, provide both Access Key ID and Secret Access Key."
                        : "Provide both Access Key ID and Secret Access Key."
                      : isLangfuseCloud
                        ? "These should be long-lived credentials for an AWS user with `bedrock:InvokeModel` permission."
                        : "For self-hosted deployments, AWS credentials are optional. When omitted, authentication will use the AWS SDK default credential provider chain."
                  }
                  error={showError("awsAccessKeyId")}
                >
                  <input
                    value={awsAccessKeyId}
                    placeholder={
                      mode === "update"
                        ? currentAuthUsesDefaultCredentials
                          ? "Using default AWS credentials"
                          : currentAuthMatchesExisting
                            ? "******** (existing credentials preserved if empty)"
                            : "Enter AWS access key ID"
                        : undefined
                    }
                    autoComplete="off"
                    onChange={(event) => setAwsAccessKeyId(event.target.value)}
                  />
                </Field>

                <Field
                  label={
                    <>
                      AWS Secret Access Key
                      {!isLangfuseCloud && <span> (optional)</span>}
                    </>
                  }
                  error={showError("awsSecretAccessKey")}
                >
                  <input
                    type="password"
                    value={awsSecretAccessKey}
                    placeholder={
                      mode === "update"
                        ? currentAuthUsesDefaultCredentials
                          ? "Using default AWS credentials"
                          : currentAuthMatchesExisting &&
                              existingConnection?.displaySecretKey
                            ? `${existingConnection.displaySecretKey} (preserved if empty)`
                            : "Enter AWS secret access key"
                        : undefined
                    }
                    autoComplete="new-password"
                    onChange={(event) => setAwsSecretAccessKey(event.target.value)}
                  />
                </Field>

                {!isLangfuseCloud && (
                  <div className="default-credential-note">
                    <p>
                      <strong>Default credential provider chain:</strong> When
                      AWS credentials are omitted, the system will automatically
                      check for credentials in this order:
                    </p>
                    <ul>
                      <li>
                        Environment variables (AWS_ACCESS_KEY_ID,
                        AWS_SECRET_ACCESS_KEY)
                      </li>
                      <li>AWS credentials file (~/.aws/credentials)</li>
                      <li>IAM roles for EC2 instances</li>
                      <li>IAM roles for ECS tasks</li>
                    </ul>
                    <p>
                      <a href="https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html">
                        Learn more about AWS credential providers →
                      </a>
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        ) : adapter === "azure" ? (
          <>
            <Field
              label="API Key"
              description="Your API keys are stored encrypted on our servers."
              error={showError("secretKey")}
            >
              <input
                value={secretKey}
                placeholder={
                  mode === "update" ? existingConnection?.displaySecretKey : undefined
                }
                onChange={(event) => setSecretKey(event.target.value)}
              />
            </Field>
            <Field
              label="API Base URL"
              description="Please add the base URL in the following format (or compatible API): https://{instanceName}.openai.azure.com/openai/deployments"
              error={showError("baseURL")}
            >
              <input
                value={baseURL}
                placeholder="https://your-instance.openai.azure.com/openai/deployments"
                onChange={(event) => setBaseURL(event.target.value)}
              />
            </Field>
          </>
        ) : (
          <Field
            label="API Key"
            description="Your API keys are stored encrypted on our servers."
            error={showError("secretKey")}
          >
            <input
              value={secretKey}
              placeholder={
                mode === "update" ? existingConnection?.displaySecretKey : undefined
              }
              onChange={(event) => setSecretKey(event.target.value)}
            />
          </Field>
        )}

        {(adapter === "bedrock" || adapter === "azure") && (
          <CustomModelsField
            models={customModels}
            error={showError("customModels")}
            onChange={setCustomModel}
            onAppend={() => setCustomModels((current) => [...current, ""])}
            onRemove={removeCustomModel}
            adapter={adapter}
          />
        )}

        {hasAdvancedSettings && (
          <div className="advanced-toggle-row">
            <button
              type="button"
              className="button link"
              onClick={() => setShowAdvancedSettings((value) => !value)}
            >
              <span>
                {showAdvancedSettings
                  ? "Hide advanced settings"
                  : "Show advanced settings"}
              </span>
              <ChevronDown
                size={16}
                className={showAdvancedSettings ? "rotate" : ""}
              />
            </button>
          </div>
        )}

        {hasAdvancedSettings && showAdvancedSettings && (
          <div className="advanced-panel">
            <Field
              label="API Base URL"
              description={
                adapter === "openai"
                  ? "Leave blank to use the default base URL for the given LLM adapter. OpenAI default: https://api.openai.com/v1"
                  : "Leave blank to use the default base URL for the given LLM adapter."
              }
              error={showError("baseURL")}
            >
              <input
                value={baseURL}
                placeholder="default"
                onChange={(event) => setBaseURL(event.target.value)}
              />
            </Field>
            <Field label="Enable default models" error={showError("withDefaultModels")}>
              <label className="switch-row">
                <span className="field-description">
                  Default models for the selected adapter will be available in
                  Langfuse features.
                </span>
                <input
                  type="checkbox"
                  checked={withDefaultModels}
                  onChange={(event) => setWithDefaultModels(event.target.checked)}
                />
              </label>
            </Field>
            <CustomModelsField
              models={customModels}
              error={showError("customModels")}
              onChange={setCustomModel}
              onAppend={() => setCustomModels((current) => [...current, ""])}
              onRemove={removeCustomModel}
              adapter={adapter}
            />
          </div>
        )}
      </div>

      <div className="dialog-footer">
        <div className="footer-stack">
          <button className="button primary full-width" type="submit">
            {mode === "create" ? "Create connection" : "Save changes"}
          </button>
          {submitted && Object.keys(errors).length > 0 && (
            <p className="form-message root-message">
              {Object.values(errors)[0]}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  description,
  error,
  children,
}: {
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="form-field">
      <span className="field-label">{label}</span>
      {description && <span className="field-description">{description}</span>}
      <span className="field-control">{children}</span>
      {error && <span className="form-message">{error}</span>}
    </label>
  );
}

function CustomModelsField({
  models,
  adapter,
  error,
  onChange,
  onAppend,
  onRemove,
}: {
  models: string[];
  adapter: Adapter;
  error?: React.ReactNode;
  onChange: (index: number, value: string) => void;
  onAppend: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="form-field">
      <span className="field-label">Custom models</span>
      <span className="field-description">
        Custom model names accepted by given endpoint.
      </span>
      {adapter === "azure" && (
        <span className="field-description warning">
          For Azure, the model name should be the same as the deployment name in
          Azure. For evals, choose a model with function calling capabilities.
        </span>
      )}
      {adapter === "bedrock" && (
        <span className="field-description warning">
          For Bedrock, the model name is the Bedrock Inference Profile ID, e.g.
          'eu.anthropic.claude-sonnet-4-6'
        </span>
      )}
      <div className="custom-model-stack">
        {models.map((model, index) => (
          <div className="inline-control-row" key={`${index}-${models.length}`}>
            <input
              value={model}
              placeholder={`Custom model name ${index + 1}`}
              onChange={(event) => onChange(index, event.target.value)}
            />
            <button
              className="icon-button"
              type="button"
              aria-label={`Remove custom model ${index + 1}`}
              onClick={() => onRemove(index)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button className="button ghost full-width" type="button" onClick={onAppend}>
        <PlusIcon size={18} />
        Add custom model name
      </button>
      {error && <span className="form-message">{error}</span>}
    </div>
  );
}

export default App;
