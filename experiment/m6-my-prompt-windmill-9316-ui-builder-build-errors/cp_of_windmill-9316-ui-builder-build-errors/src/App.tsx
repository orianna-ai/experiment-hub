import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import {
  AlertTriangle,
  Bot,
  Bug,
  ChevronDown,
  Columns2,
  Database,
  EllipsisVertical,
  Eye,
  File,
  Folder,
  MousePointerSquareDashed,
  Package,
  PanelLeft,
  PanelLeftClose,
  Play,
  Plus,
  RefreshCw,
  Save,
  X
} from 'lucide-react'
import './App.css'

type IconComponent = ComponentType<{ size?: number; className?: string }>
type BuildState = 'failed' | 'ready'
type SourceTabId = 'file:src/App.tsx' | 'file:src/components/MetricCards.tsx' | 'runnable:refresh_metrics'
type TabId = SourceTabId | 'preview'

type TabItem = {
  id: TabId
  label: string
  icon: IconComponent
  closable?: boolean
  pinned?: 'right'
}

const availableSourceTabs: Record<SourceTabId, TabItem> = {
  'file:src/App.tsx': { id: 'file:src/App.tsx', label: 'App.tsx', icon: File },
  'file:src/components/MetricCards.tsx': {
    id: 'file:src/components/MetricCards.tsx',
    label: 'MetricCards.tsx',
    icon: File
  },
  'runnable:refresh_metrics': {
    id: 'runnable:refresh_metrics',
    label: 'refresh_metrics',
    icon: Play
  }
}

const previewTab: TabItem = {
  id: 'preview',
  label: 'Preview',
  icon: Eye,
  closable: false,
  pinned: 'right'
}

const buildFailure = `src/App.tsx:18:28: ERROR: Expected "}" but found ":"

  16 |   const rows = await client.query("select * from warehouse")
  17 |   return (
> 18 |     <DataTable rows={rows:} density="compact" />
     |                            ^
  19 |   )
  20 | }`

const buildFailureNote = 'The UI Builder emitted a buildError message; the next successful build clears this banner.'

const failingLogs = `[ui-builder] build started: esbuild
[ui-builder] compiling src/App.tsx
[ERROR] src/App.tsx:18:28 Expected "}" but found ":"
[ui-builder] app-preview.html left mounted
[ui-builder] buildError posted to parent window
[preview] waiting for next successful bundle`

const readyLogs = `[ui-builder] build started: esbuild
[ui-builder] compiling src/App.tsx
[ui-builder] bundle.js 142.7 kB
[preview] app-preview.html updated
[ui-builder] buildError posted with message: undefined`

function App() {
  const builderRef = useRef<HTMLIFrameElement>(null)
  const previewRef = useRef<HTMLIFrameElement>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [splitWithPreview, setSplitWithPreview] = useState(true)
  const [openTabIds, setOpenTabIds] = useState<SourceTabId[]>(['file:src/App.tsx'])
  const [activeTabId, setActiveTabId] = useState<TabId>('file:src/App.tsx')
  const [buildState, setBuildState] = useState<BuildState>('failed')
  const [logsCollapsed, setLogsCollapsed] = useState(false)
  const [inspectorEnabled, setInspectorEnabled] = useState(false)
  const [bundler, setBundler] = useState<'esbuild' | 'rolldown'>('esbuild')

  const buildError = buildState === 'failed' ? buildFailure : undefined
  const sourceTabs = openTabIds.map((id) => availableSourceTabs[id])
  const allTabs = [...sourceTabs, previewTab]
  const singleMode = !splitWithPreview
  const showSourcePane = splitWithPreview || activeTabId !== 'preview'
  const showPreviewPane = splitWithPreview || activeTabId === 'preview'

  function postToBuilder(message: unknown) {
    builderRef.current?.contentWindow?.postMessage(message, '*')
  }

  function postToPreview(message: unknown) {
    previewRef.current?.contentWindow?.postMessage(message, '*')
  }

  function openSourceTab(id: SourceTabId) {
    setOpenTabIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
    setActiveTabId(id)
    if (id.startsWith('file:')) {
      postToBuilder({ type: 'selectFile', path: id.slice('file:'.length) })
    }
  }

  function selectTab(id: TabId) {
    if (id === 'preview') {
      if (!splitWithPreview) setActiveTabId('preview')
      return
    }
    openSourceTab(id)
  }

  function closeSourceTab(id: SourceTabId) {
    setOpenTabIds((ids) => {
      if (ids.length <= 1) return ids
      const next = ids.filter((tabId) => tabId !== id)
      if (activeTabId === id) setActiveTabId(next[Math.max(0, next.length - 1)])
      return next
    })
  }

  function toggleSplit() {
    setSplitWithPreview((split) => {
      if (split) return false
      if (activeTabId === 'preview') setActiveTabId(openTabIds[openTabIds.length - 1] ?? 'file:src/App.tsx')
      return true
    })
  }

  function pushFilesToBuilder() {
    postToBuilder({
      type: 'setFilesAndSelect',
      files: rawAppFiles,
      pathToSelect:
        activeTabId !== 'preview' && activeTabId.startsWith('file:')
          ? activeTabId.slice('file:'.length)
          : 'src/App.tsx'
    })
    postToBuilder({
      type: 'setRunnables',
      dts: rawAppRunnableDts
    })
    postToBuilder({ type: 'setFontSize', px: 12 })
    postToBuilder({ type: 'setDarkMode', dark: false })
  }

  function pushPreviewBundle(nextState: BuildState = buildState) {
    postToPreview({
      type: 'preview',
      css: previewBundleCss,
      js: previewBundleJs(nextState)
    })
  }

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== builderRef.current?.contentWindow) return
      if (event.data?.type === 'buildError') {
        setBuildState(typeof event.data.message === 'string' ? 'failed' : 'ready')
      }
      if (event.data?.type === 'preview') {
        postToPreview(event.data)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <div className="app-shell">
      <EditorHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
      />

      <div className="editor-main">
        {!sidebarCollapsed && (
          <RawAppSidebar activeTabId={activeTabId} onSelectTab={openSourceTab} />
        )}

        <main
          className={[
            'workspace',
            splitWithPreview ? 'workspace-split' : 'workspace-single',
            activeTabId === 'preview' ? 'preview-active' : 'source-active'
          ].join(' ')}
        >
          {showSourcePane && (
            <section className="pane source-pane" aria-label="UI Builder editor pane">
              <TabStrip
                tabs={singleMode ? allTabs : sourceTabs}
                activeId={activeTabId}
                buildError={buildError}
                onSelect={selectTab}
                onClose={closeSourceTab}
                trailing={
                  <button
                    className={splitWithPreview ? 'icon-btn selected' : 'icon-btn'}
                    title={splitWithPreview ? 'Move preview back into a tab' : 'Pin preview to the right'}
                    aria-label="Toggle split with preview"
                    aria-pressed={splitWithPreview}
                    onClick={toggleSplit}
                  >
                    <Columns2 size={14} />
                  </button>
                }
              />
              <iframe
                ref={builderRef}
                title="UI builder"
                src="/ui_builder/index.html"
                className="builder-frame"
                onLoad={pushFilesToBuilder}
              />
            </section>
          )}

          {splitWithPreview && <div className="splitter" aria-hidden="true" />}

          {showPreviewPane && (
            <section className="pane preview-pane" aria-label="App preview pane">
              <TabStrip
                tabs={singleMode ? allTabs : [previewTab]}
                activeId={splitWithPreview ? 'preview' : activeTabId}
                buildError={buildError}
                onSelect={selectTab}
                onClose={closeSourceTab}
                trailing={
                  <PreviewControls
                    buildState={buildState}
                    bundler={bundler}
                    inspectorEnabled={inspectorEnabled}
                    splitWithPreview={splitWithPreview}
                    onToggleBuild={() => {
                      const next = buildState === 'failed' ? 'ready' : 'failed'
                      setBuildState(next)
                      pushPreviewBundle(next)
                    }}
                    onToggleBundler={() =>
                      setBundler((value) => {
                        const next = value === 'esbuild' ? 'rolldown' : 'esbuild'
                        postToBuilder({ type: 'setBundlerType', bundlerType: next })
                        return next
                      })
                    }
                    onToggleInspector={() =>
                      setInspectorEnabled((value) => {
                        const next = !value
                        postToPreview({ type: next ? 'inspectorEnable' : 'inspectorDisable' })
                        return next
                      })
                    }
                    onToggleSplit={toggleSplit}
                  />
                }
              />
              <div className="preview-content">
                <iframe
                  ref={previewRef}
                  title="App preview"
                  src="/ui_builder/app-preview.html"
                  className="preview-frame"
                  onLoad={() => pushPreviewBundle()}
                />

                {buildError && (
                  <div className="build-alert" role="alert">
                    <div className="alert-card">
                      <div className="alert-icon">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="alert-body">
                        <div className="alert-title">Build failed with 1 error</div>
                        <pre>{buildError}</pre>
                        <div className="alert-note">{buildFailureNote}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={logsCollapsed ? 'logs-overlay collapsed' : 'logs-overlay'}>
                  <button
                    className="logs-title"
                    onClick={() => setLogsCollapsed((value) => !value)}
                    aria-expanded={!logsCollapsed}
                  >
                    Logs
                    <ChevronDown size={12} className={logsCollapsed ? 'rotated' : ''} />
                    <span>({(buildState === 'failed' ? failingLogs : readyLogs).split('\n').length})</span>
                  </button>
                  {!logsCollapsed && (
                    <div className="logs-scroll">
                      <pre>{buildState === 'failed' ? failingLogs : readyLogs}</pre>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

function EditorHeader({
  sidebarCollapsed,
  onToggleSidebar
}: {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-btn"
          title={`${sidebarCollapsed ? 'Expand' : 'Collapse'} file sidebar (Ctrl+B)`}
          aria-label="Toggle file sidebar"
          onClick={onToggleSidebar}
        >
          {sidebarCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
        </button>

        <div className="editor-title">
          <div className="breadcrumbs" aria-label="Breadcrumb">
            <button>app</button>
            <span>/</span>
            <button>f/demo</button>
            <span>/</span>
            <button>raw_apps</button>
            <span>/</span>
            <button className="current">ui_builder_build_errors</button>
          </div>
          <div className="summary">Warehouse refresh dashboard</div>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" aria-label="More actions" title="More actions">
          <EllipsisVertical size={14} />
        </button>
        <button className="btn default">
          <Bug size={14} />
          Jobs
          <span className="count">(2)</span>
        </button>
        <button className="btn default ai-btn" title="AI">
          <Bot size={14} />
          AI
        </button>
        <button className="btn default">
          <Save size={14} />
          Draft
        </button>
        <button className="btn accent">
          <Save size={14} />
          Deploy
        </button>
      </div>
    </header>
  )
}

function RawAppSidebar({
  activeTabId,
  onSelectTab
}: {
  activeTabId: string
  onSelectTab: (id: SourceTabId) => void
}) {
  return (
    <aside className="sidebar" aria-label="Raw app sidebar">
      <SidebarSection
        title="frontend"
        actions={
          <button className="mini-btn" title="Add file or folder">
            <Plus size={13} />
          </button>
        }
      >
        <div className="file-tree">
          <TreeRow icon={Folder} label="src" depth={0} active={false} />
          <TreeRow
            icon={File}
            label="App.tsx"
            depth={1}
            active={activeTabId === 'file:src/App.tsx'}
            onClick={() => onSelectTab('file:src/App.tsx')}
          />
          <TreeRow icon={Folder} label="components" depth={1} active={false} />
          <TreeRow
            icon={File}
            label="MetricCards.tsx"
            depth={2}
            active={activeTabId === 'file:src/components/MetricCards.tsx'}
            onClick={() => onSelectTab('file:src/components/MetricCards.tsx')}
          />
          <TreeRow icon={File} label="wmill.ts" depth={0} active={false} />
        </div>
      </SidebarSection>

      <SidebarSection title="packages (4)" collapsed icon={Package}>
        <div />
      </SidebarSection>

      <SidebarSection
        title="backend"
        actions={
          <button className="mini-btn" title="Create a new background runnable">
            <Plus size={13} />
          </button>
        }
      >
        <button
          className={
            activeTabId === 'runnable:refresh_metrics' ? 'runnable-row active' : 'runnable-row'
          }
          onClick={() => onSelectTab('runnable:refresh_metrics')}
        >
          <span className="badge">refresh_metrics</span>
          <span>Refresh warehouse metrics</span>
          <EllipsisVertical size={12} />
        </button>
        <button className="runnable-row">
          <span className="badge">sync_orders</span>
          <span>Sync late orders</span>
          <EllipsisVertical size={12} />
        </button>
        <div className="lint-strip">
          <AlertTriangle size={14} />
          1 error
        </div>
      </SidebarSection>

      <SidebarSection
        title="data"
        actions={
          <button className="mini-btn" title="Add data table">
            <Plus size={13} />
          </button>
        }
      >
        <button className="data-row active">
          <Database size={13} />
          analytics.public.orders
        </button>
        <button className="data-row">
          <Database size={13} />
          warehouse.public.shipments
        </button>
      </SidebarSection>

      <SidebarSection
        title="history"
        actions={
          <button className="mini-btn" title="Create a new snapshot">
            <Plus size={13} />
          </button>
        }
      >
        <div className="history-list">
          <button className="history-row active">
            <span>current</span>
            <span>now</span>
          </button>
          <button className="history-row">
            <span>build-failure-repro</span>
            <span>2m</span>
          </button>
        </div>
      </SidebarSection>
    </aside>
  )
}

function SidebarSection({
  title,
  actions,
  children,
  collapsed,
  icon: Icon
}: {
  title: string
  actions?: ReactNode
  children: ReactNode
  collapsed?: boolean
  icon?: IconComponent
}) {
  return (
    <section className={collapsed ? 'sidebar-section collapsed' : 'sidebar-section'}>
      <div className="section-title">
        <span>
          {Icon && <Icon size={12} />}
          {title}
        </span>
        <div className="section-actions">{actions}</div>
      </div>
      {!collapsed && children}
    </section>
  )
}

function TreeRow({
  icon: Icon,
  label,
  depth,
  active,
  onClick
}: {
  icon: IconComponent
  label: string
  depth: number
  active: boolean
  onClick?: () => void
}) {
  return (
    <button
      className={active ? 'tree-row active' : 'tree-row'}
      style={{ paddingLeft: 8 + depth * 14 }}
      onClick={onClick}
    >
      <Icon size={12} />
      <span>{label}</span>
    </button>
  )
}

function TabStrip({
  tabs,
  activeId,
  buildError,
  onSelect,
  onClose,
  trailing
}: {
  tabs: TabItem[]
  activeId: TabId
  buildError?: string
  onSelect: (id: TabId) => void
  onClose?: (id: SourceTabId) => void
  trailing?: ReactNode
}) {
  const pinnedRight = tabs.filter((tab) => tab.pinned === 'right')
  const middle = tabs.filter((tab) => tab.pinned !== 'right')

  return (
    <div className="tab-strip">
      <div className="tabs-root" role="tablist">
        {middle.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={activeId === tab.id}
            error={Boolean(buildError && tab.id === 'preview')}
            onSelect={onSelect}
            onClose={onClose}
          />
        ))}
        <span className="tab-sentinel" />
        {pinnedRight.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={activeId === tab.id}
            error={Boolean(buildError && tab.id === 'preview')}
            onSelect={onSelect}
            onClose={onClose}
          />
        ))}
      </div>
      {trailing && <div className="tab-trailing">{trailing}</div>}
    </div>
  )
}

function TabButton({
  tab,
  active,
  error,
  onSelect,
  onClose
}: {
  tab: TabItem
  active: boolean
  error: boolean
  onSelect: (id: TabId) => void
  onClose?: (id: SourceTabId) => void
}) {
  const Icon = tab.icon

  return (
    <button
      role="tab"
      aria-selected={active}
      className={[
        'tab-button',
        active ? 'active' : '',
        error ? 'error' : '',
        tab.closable === false ? 'not-closable' : ''
      ].join(' ')}
      onClick={() => onSelect(tab.id)}
    >
      <Icon size={12} />
      <span>{tab.label}</span>
      {tab.closable !== false && (
        <span
          className="close-tab"
          role="button"
          aria-label={`Close ${tab.label}`}
          onClick={(event) => {
            event.stopPropagation()
            onClose?.(tab.id as SourceTabId)
          }}
        >
          <X size={10} />
        </span>
      )}
    </button>
  )
}

function PreviewControls({
  buildState,
  bundler,
  inspectorEnabled,
  splitWithPreview,
  onToggleBuild,
  onToggleBundler,
  onToggleInspector,
  onToggleSplit
}: {
  buildState: BuildState
  bundler: 'esbuild' | 'rolldown'
  inspectorEnabled: boolean
  splitWithPreview: boolean
  onToggleBuild: () => void
  onToggleBundler: () => void
  onToggleInspector: () => void
  onToggleSplit: () => void
}) {
  return (
    <div className="preview-controls">
      <button className="bundler-btn" title="Switch bundler" onClick={onToggleBundler}>
        {bundler}
      </button>
      <button
        className={buildState === 'failed' ? 'build-state-btn failed' : 'build-state-btn'}
        title="Replay build state"
        aria-label="Replay build state"
        onClick={onToggleBuild}
      >
        <AlertTriangle size={13} />
        {buildState === 'failed' ? 'failed' : 'ready'}
      </button>
      <button
        className={inspectorEnabled ? 'icon-btn selected' : 'icon-btn'}
        title={inspectorEnabled ? 'Click to disable element inspector' : 'Click to enable element inspector'}
        aria-label="Toggle element inspector"
        onClick={onToggleInspector}
      >
        <MousePointerSquareDashed size={14} />
      </button>
      <button className="icon-btn" title="Replay the last build into the preview" aria-label="Rebuild">
        <RefreshCw size={14} />
      </button>
      <button
        className={splitWithPreview ? 'icon-btn selected' : 'icon-btn'}
        title={splitWithPreview ? 'Move preview back into a tab' : 'Pin preview to the right'}
        aria-label="Toggle split with preview"
        aria-pressed={splitWithPreview}
        onClick={onToggleSplit}
      >
        <Columns2 size={14} />
      </button>
    </div>
  )
}

const rawAppFiles = {
  'src/App.tsx': `import { wmill } from "./windmill.client"
import { MetricCards } from "./components/MetricCards"
import { DataTable } from "./components/DataTable"

type OrderRow = {
  customer: string
  status: "late" | "queued" | "synced"
  owner: string
  amount: number
}

export default async function Dashboard() {
  const client = await wmill.getClient()
  const rows: OrderRow[] = await client.query("select * from warehouse_orders")
  const metrics = await wmill.runScript("f/demo/refresh_metrics", { stale: true })

  return (
    <DataTable rows={rows:} density="compact" />
  )
}
`,
  'src/components/MetricCards.tsx': `export function MetricCards() {
  return <section className="grid grid-cols-3 gap-3" />
}
`,
  'src/components/DataTable.tsx': `export function DataTable() {
  return <table />
}
`,
  'package.json': `{"dependencies":{"@vitejs/plugin-react":"latest","vite":"latest","react":"latest","react-dom":"latest"}}`
}

const rawAppRunnableDts = `declare module "windmill" {
  export function refresh_metrics(args?: { stale?: boolean }): Promise<{ updatedRows: number }>
}`

const previewBundleCss = `
* { box-sizing: border-box; }
body { margin: 0; padding: 36px 32px; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #11151c; background: #ffffff; font-size: 13px; -webkit-font-smoothing: antialiased; }
.app { max-width: 960px; margin: 0 auto; }
header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
h1 { font-size: 22px; line-height: 1.2; margin: 0; font-weight: 650; letter-spacing: -0.02em; color: #11151c; }
.muted { color: #6a727e; font-size: 13px; margin-top: 4px; }
.toolbar { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
.chip { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #ebedf1; border-radius: 8px; padding: 6px 11px; background: #ffffff; color: #3b424d; font-size: 12px; font-weight: 500; }
.chip::before { content: ""; width: 6px; height: 6px; border-radius: 999px; background: #22a06b; }
.chip.stale::before { background: #d99a16; }
.cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-bottom: 24px; }
.card { border: 1px solid #ebedf1; background: #ffffff; border-radius: 12px; padding: 18px; }
.label { color: #6a727e; font-size: 12px; font-weight: 500; }
.value { font-size: 28px; font-weight: 650; letter-spacing: -0.02em; margin-top: 10px; color: #11151c; font-variant-numeric: tabular-nums; }
.delta { margin-top: 8px; font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 5px; }
.section-label { font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #9aa1ac; margin: 0 2px 10px; }
.table-wrap { border: 1px solid #ebedf1; border-radius: 12px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; background: #ffffff; }
th, td { text-align: left; padding: 13px 16px; font-variant-numeric: tabular-nums; }
tbody tr { border-top: 1px solid #f1f3f5; }
th { color: #9aa1ac; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
td { color: #3b424d; font-size: 13px; }
td:first-child { font-weight: 550; color: #11151c; }
td:last-child, th:last-child { text-align: right; font-weight: 550; color: #11151c; }
.pill { display: inline-flex; align-items: center; gap: 5px; border-radius: 999px; padding: 3px 9px 3px 8px; font-size: 11.5px; font-weight: 500; background: #f2f4f7; color: #4b515c; }
.pill::before { content: ""; width: 6px; height: 6px; border-radius: 999px; background: currentColor; opacity: 0.7; }
.pill.warn { background: #fef4f3; color: #b42318; }
.pill.ok { background: #e9f7f0; color: #1a7f52; }
`

function previewBundleJs(buildState: BuildState) {
  return `
document.getElementById('root').innerHTML = \`
  <div class="app">
    <header>
      <div>
        <h1>Warehouse refresh dashboard</h1>
        <div class="muted">Live order sync and shipment health</div>
      </div>
      <div class="toolbar">
        <span class="chip">production</span>
        <span class="chip ${buildState === 'failed' ? 'stale' : ''}">${buildState === 'failed' ? 'Stale bundle' : 'Fresh bundle'}</span>
      </div>
    </header>
    <section class="cards">
      <div class="card"><div class="label">Open orders</div><div class="value">1,248</div><div class="delta" style="color:#1a7f52">+12.8% today</div></div>
      <div class="card"><div class="label">Late shipments</div><div class="value">38</div><div class="delta" style="color:${buildState === 'failed' ? '#b42318' : '#1a7f52'}">${buildState === 'failed' ? 'Refresh blocked' : '-8 from last run'}</div></div>
      <div class="card"><div class="label">Runtime</div><div class="value">842<span style="font-size:16px;font-weight:550;color:#9aa1ac;margin-left:3px">ms</span></div><div class="delta" style="color:#6a727e">p95 background job</div></div>
    </section>
    <div class="section-label">Recent orders</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Customer</th><th>Status</th><th>Owner</th><th>Amount</th></tr></thead>
        <tbody>
          <tr><td>Northwind Import</td><td><span class="pill warn">Late</span></td><td>Ops</td><td>$4,820</td></tr>
          <tr><td>Acme Logistics</td><td><span class="pill">Queued</span></td><td>Warehouse</td><td>$2,310</td></tr>
          <tr><td>Blue River Foods</td><td><span class="pill ok">Synced</span></td><td>Sales</td><td>$7,140</td></tr>
        </tbody>
      </table>
    </div>
  </div>
\`
`
}

export default App
