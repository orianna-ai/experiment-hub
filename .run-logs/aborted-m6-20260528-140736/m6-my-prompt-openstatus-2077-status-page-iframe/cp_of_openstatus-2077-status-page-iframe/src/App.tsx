import {
  AlertCircle,
  Check,
  ChevronDown,
  Clock,
  Info,
  Menu,
  MessageCircleMore,
  Moon,
  Sun,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const ALL_SECTIONS = ["title", "banner", "components", "feed"] as const;
type Section = (typeof ALL_SECTIONS)[number];
type Variant = "success" | "degraded" | "error" | "info";
type EventType = "report" | "maintenance" | "incident";

const DEFAULT_QUERY = "?embed=&theme=light";
const BASE_DATE = new Date("2026-05-28T14:30:00-04:00");

type QueryState = {
  embed: { mode: boolean; sections: Section[] };
  theme?: "light" | "dark";
  whiteLabel: boolean;
  emptyFeed: boolean;
  controls: boolean;
};

type StatusEvent = {
  id: number;
  type: EventType;
  name: string;
  status: Variant;
  affected: string[];
  title: string;
  message: string;
  from: Date;
  to?: Date;
  updates?: {
    status: "investigating" | "identified" | "monitoring" | "resolved";
    date: Date;
    message: string;
  }[];
};

type TrackerDay = {
  day: Date;
  bar: { status: Variant | "empty"; height: number }[];
  card: { status: Variant | "empty"; value: string }[];
  events: { type: EventType; name: string; status: Variant; from: Date; to?: Date }[];
};

const PAGE = {
  slug: "acme-cloud",
  title: "Acme Cloud Status",
  description:
    "Live availability for the Acme edge, API, dashboard, and billing systems.",
  homepageUrl: "https://openstatus.dev",
  contactUrl: "https://openstatus.dev/contact",
  locales: ["en", "de"],
};

const EVENTS: StatusEvent[] = [
  {
    id: 2077,
    type: "report",
    name: "Elevated API error rates",
    title: "Elevated API error rates",
    status: "degraded",
    affected: ["API", "US East", "Webhooks"],
    message:
      "We are continuing to observe elevated error rates on a subset of API requests.",
    from: new Date("2026-05-28T12:18:00-04:00"),
    updates: [
      {
        status: "monitoring",
        date: new Date("2026-05-28T13:46:00-04:00"),
        message:
          "A mitigation is deployed and traffic is recovering. We are monitoring the remaining backlog.",
      },
      {
        status: "identified",
        date: new Date("2026-05-28T12:52:00-04:00"),
        message:
          "The issue has been isolated to a queue worker rollout affecting webhook delivery.",
      },
      {
        status: "investigating",
        date: new Date("2026-05-28T12:18:00-04:00"),
        message:
          "We are investigating increased latency and intermittent 5xx responses.",
      },
    ],
  },
  {
    id: 410,
    type: "maintenance",
    name: "Database maintenance",
    title: "Database maintenance",
    status: "info",
    affected: ["Dashboard", "Billing"],
    message:
      "A planned database maintenance window is in progress. The dashboard may briefly show stale metrics.",
    from: new Date("2026-05-28T15:00:00-04:00"),
    to: new Date("2026-05-28T16:00:00-04:00"),
  },
];

const COMPONENTS = [
  {
    id: 1,
    name: "API",
    description: "Public REST and ingest endpoints.",
    status: "degraded" as Variant,
    uptime: "99.92%",
  },
  {
    id: 2,
    name: "Dashboard",
    description: "Customer workspace and reporting UI.",
    status: "success" as Variant,
    uptime: "99.99%",
  },
  {
    id: 3,
    name: "Webhooks",
    description: "Outgoing webhook delivery.",
    status: "degraded" as Variant,
    uptime: "99.81%",
  },
];

const GROUPED_COMPONENTS = [
  {
    groupId: "edge",
    groupName: "Edge Network",
    status: "success" as Variant,
    defaultOpen: true,
    components: [
      {
        id: 4,
        name: "US East",
        description: "Virginia edge region.",
        status: "success" as Variant,
        uptime: "100%",
      },
      {
        id: 5,
        name: "EU West",
        description: "Frankfurt edge region.",
        status: "success" as Variant,
        uptime: "99.98%",
      },
    ],
  },
];

function App() {
  const { state, setEmbedMode, setSection, setTheme, setWhiteLabel, setEmptyFeed } =
    useFixtureQueryState();
  const [activeEvent, setActiveEvent] = useState(`${EVENTS[0].type}-${EVENTS[0].id}`);
  const [groupOpen, setGroupOpen] = useState<Record<string, boolean>>({
    edge: true,
  });

  const trackers = useMemo(() => {
    return Object.fromEntries(
      [...COMPONENTS, ...GROUPED_COMPONENTS.flatMap((group) => group.components)].map(
        (component, index) => [component.id, createTrackerData(index)],
      ),
    ) as Record<number, TrackerDay[]>;
  }, []);

  const isDark = state.embed.mode && state.theme === "dark";
  const sectionVisible = (section: Section) =>
    !state.embed.mode || state.embed.sections.includes(section);
  const currentEvent =
    EVENTS.find((event) => `${event.type}-${event.id}` === activeEvent) ?? EVENTS[0];

  useEffect(() => {
    const existing = document.querySelector<HTMLMetaElement>(
      'meta[name="robots"][data-embed-meta="true"]',
    );
    if (state.embed.mode) {
      const meta = existing ?? document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex,nofollow";
      meta.dataset.embedMeta = "true";
      if (!existing) document.head.appendChild(meta);
      return;
    }
    existing?.remove();
  }, [state.embed.mode]);

  return (
    <div className={`app-root ${isDark ? "dark" : ""}`}>
      {state.controls ? (
        <QueryToolbar
          state={state}
          setEmbedMode={setEmbedMode}
          setSection={setSection}
          setTheme={setTheme}
          setWhiteLabel={setWhiteLabel}
          setEmptyFeed={setEmptyFeed}
        />
      ) : null}

      <div
        className="status-shell"
        data-embed={state.embed.mode ? "true" : undefined}
        data-hide-title={sectionVisible("title") ? undefined : "true"}
        data-hide-banner={sectionVisible("banner") ? undefined : "true"}
        data-hide-components={sectionVisible("components") ? undefined : "true"}
        data-hide-feed={sectionVisible("feed") ? undefined : "true"}
      >
        <Header embedMode={state.embed.mode} />
        <main className="page-main">
          <section className="status" data-variant="degraded">
            <div className="status-header section-title">
              <div className="status-title">{PAGE.title}</div>
              <div className="status-description">{PAGE.description}</div>
            </div>

            <div className="status-content section-banner">
              <div className="banner-tabs" data-status={currentEvent.status}>
                <div className="tabs-list" role="tablist" aria-label="Open events">
                  {EVENTS.map((event, index) => {
                    const value = `${event.type}-${event.id}`;
                    return (
                      <button
                        key={value}
                        className="tab-trigger"
                        data-status={event.status}
                        data-state={activeEvent === value ? "active" : undefined}
                        type="button"
                        role="tab"
                        aria-selected={activeEvent === value}
                        onClick={() => setActiveEvent(value)}
                      >
                        {event.name}
                      </button>
                    );
                  })}
                </div>
                <EmbedAwareLink
                  embedMode={state.embed.mode}
                  href={`/events/${currentEvent.type}/${currentEvent.id}`}
                  className="banner-link"
                >
                  <StatusBanner event={currentEvent} />
                </EmbedAwareLink>
              </div>
            </div>

            <div className="status-content components-content section-components">
              {COMPONENTS.map((component) => (
                <StatusMonitor
                  key={component.id}
                  component={component}
                  data={trackers[component.id]}
                />
              ))}
              {GROUPED_COMPONENTS.map((group) => (
                <div
                  className="tracker-group"
                  data-state={groupOpen[group.groupId] ? "open" : "closed"}
                  key={group.groupId}
                >
                  <button
                    type="button"
                    className="tracker-group-trigger"
                    data-variant={group.status}
                    onClick={() =>
                      setGroupOpen((value) => ({
                        ...value,
                        [group.groupId]: !value[group.groupId],
                      }))
                    }
                  >
                    <span>{group.groupName}</span>
                    <span className="group-status">
                      <StatusMonitorStatus variant={group.status} />
                      <StatusDot variant={group.status} size="small" />
                      <ChevronDown className="chevron" aria-hidden="true" />
                    </span>
                  </button>
                  <div className="tracker-group-content">
                    {group.components.map((component) => (
                      <StatusMonitor
                        key={component.id}
                        component={component}
                        data={trackers[component.id]}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="section-separator" />

            <div className="status-content section-feed">
              <StatusFeed
                empty={state.emptyFeed}
                embedMode={state.embed.mode}
                events={EVENTS}
              />
            </div>
          </section>
        </main>
        <Footer embedMode={state.embed.mode} whiteLabel={state.whiteLabel} />
      </div>
    </div>
  );
}

function useFixtureQueryState() {
  const [search, setSearch] = useState(() =>
    window.location.search ? window.location.search : DEFAULT_QUERY,
  );

  useEffect(() => {
    if (!window.location.search) {
      window.history.replaceState(null, "", DEFAULT_QUERY);
    }
    const onPopState = () =>
      setSearch(window.location.search ? window.location.search : DEFAULT_QUERY);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const state = useMemo(() => parseQuery(search), [search]);

  const update = (mutator: (params: URLSearchParams) => void) => {
    const current = new URLSearchParams(
      (window.location.search || DEFAULT_QUERY).replace(/^\?/, ""),
    );
    mutator(current);
    const nextSearch = serializeParams(current);
    window.history.pushState(null, "", nextSearch);
    setSearch(nextSearch);
  };

  return {
    state,
    setEmbedMode(enabled: boolean) {
      update((params) => {
        if (enabled) {
          params.delete("standalone");
          params.set(
            "embed",
            state.embed.sections.length === ALL_SECTIONS.length
              ? ""
              : state.embed.sections.join(","),
          );
          if (!params.get("theme")) params.set("theme", "light");
        } else {
          params.delete("embed");
          params.set("standalone", "1");
        }
      });
    },
    setSection(section: Section, enabled: boolean) {
      update((params) => {
        const current = new Set(state.embed.sections);
        if (enabled) current.add(section);
        if (!enabled && current.size > 1) current.delete(section);
        const next = ALL_SECTIONS.filter((item) => current.has(item));
        params.delete("standalone");
        params.set("embed", next.join(","));
        if (!params.get("theme")) params.set("theme", "light");
      });
    },
    setTheme(theme: "light" | "dark") {
      update((params) => {
        params.set("theme", theme);
      });
    },
    setWhiteLabel(enabled: boolean) {
      update((params) => {
        if (enabled) params.set("whiteLabel", "1");
        else params.delete("whiteLabel");
      });
    },
    setEmptyFeed(enabled: boolean) {
      update((params) => {
        if (enabled) params.set("empty", "1");
        else params.delete("empty");
      });
    },
  };
}

function parseQuery(search: string): QueryState {
  const params = new URLSearchParams(search.replace(/^\?/, ""));
  const mode = params.has("embed");
  const raw = params.get("embed") ?? "";
  let sections: Section[] = [...ALL_SECTIONS];

  if (mode && raw.trim() !== "") {
    const parsed = Array.from(
      new Set(
        raw
          .split(",")
          .map((part) => part.trim().toLowerCase())
          .filter((part): part is Section =>
            (ALL_SECTIONS as readonly string[]).includes(part),
          ),
      ),
    );
    sections = parsed.length > 0 ? parsed : [...ALL_SECTIONS];
  }

  const theme = params.get("theme");

  return {
    embed: {
      mode,
      sections,
    },
    theme: theme === "dark" ? "dark" : theme === "light" ? "light" : undefined,
    whiteLabel: params.get("whiteLabel") === "1",
    emptyFeed: params.get("empty") === "1",
    controls: params.get("controls") === "1",
  };
}

function serializeParams(params: URLSearchParams) {
  const serialized = params.toString().replace(/%2C/g, ",");
  return serialized ? `?${serialized}` : "?standalone=1";
}

function QueryToolbar({
  state,
  setEmbedMode,
  setSection,
  setTheme,
  setWhiteLabel,
  setEmptyFeed,
}: {
  state: QueryState;
  setEmbedMode: (enabled: boolean) => void;
  setSection: (section: Section, enabled: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  setWhiteLabel: (enabled: boolean) => void;
  setEmptyFeed: (enabled: boolean) => void;
}) {
  const query = window.location.search || DEFAULT_QUERY;
  return (
    <div className="query-toolbar">
      <div className="query-address">
        <span className="query-label">Embed URL</span>
        <span className="query-value">https://status.acme.dev/{query}</span>
      </div>
      <div className="toolbar-controls" aria-label="Query state controls">
        <div className="segmented">
          <button
            type="button"
            className="segment"
            data-active={state.embed.mode ? "true" : undefined}
            onClick={() => setEmbedMode(true)}
          >
            Embed
          </button>
          <button
            type="button"
            className="segment"
            data-active={!state.embed.mode ? "true" : undefined}
            onClick={() => setEmbedMode(false)}
          >
            Standalone
          </button>
        </div>
        <div className="section-toggles" aria-label="Embed sections">
          {ALL_SECTIONS.map((section) => (
            <label className="check-toggle" key={section}>
              <input
                type="checkbox"
                checked={state.embed.sections.includes(section)}
                onChange={(event) => setSection(section, event.currentTarget.checked)}
              />
              <span>{section}</span>
            </label>
          ))}
        </div>
        <div className="icon-segmented" aria-label="Embed theme">
          <button
            type="button"
            className="icon-segment"
            data-active={state.theme !== "dark" ? "true" : undefined}
            onClick={() => setTheme("light")}
            aria-label="Light theme"
          >
            <Sun size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-segment"
            data-active={state.theme === "dark" ? "true" : undefined}
            onClick={() => setTheme("dark")}
            aria-label="Dark theme"
          >
            <Moon size={15} aria-hidden="true" />
          </button>
        </div>
        <label className="check-toggle">
          <input
            type="checkbox"
            checked={state.whiteLabel}
            onChange={(event) => setWhiteLabel(event.currentTarget.checked)}
          />
          <span>white label</span>
        </label>
        <label className="check-toggle">
          <input
            type="checkbox"
            checked={state.emptyFeed}
            onChange={(event) => setEmptyFeed(event.currentTarget.checked)}
          />
          <span>empty feed</span>
        </label>
      </div>
    </div>
  );
}

function Header({ embedMode }: { embedMode: boolean }) {
  return (
    <header className="site-header" aria-hidden={embedMode}>
      <nav className="site-nav">
        <div className="nav-left">
          <a className="brand-button" href={PAGE.homepageUrl}>
            AC
          </a>
        </div>
        <ul className="nav-tabs">
          <li>
            <a className="nav-tab active" href="/">
              Status
            </a>
          </li>
          <li>
            <a className="nav-tab" href="/events">
              Events
            </a>
          </li>
          <li>
            <a className="nav-tab" href="/monitors">
              Monitors
            </a>
          </li>
        </ul>
        <div className="nav-actions">
          <a
            className="ghost-icon"
            href={PAGE.contactUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Get in touch"
          >
            <MessageCircleMore size={17} aria-hidden="true" />
          </a>
          <button className="outline-button" type="button">
            Status updates
          </button>
          <button className="menu-button" type="button" aria-label="Menu">
            <Menu size={17} aria-hidden="true" />
          </button>
        </div>
      </nav>
    </header>
  );
}

function StatusBanner({ event }: { event: StatusEvent }) {
  return (
    <div className="status-banner" data-status={event.status}>
      <div className="banner-content">
        <StatusDot variant={event.status} />
        <div className="banner-copy">
          {event.type === "report" && event.updates?.[0] ? (
            <TimelineUpdate update={event.updates[0]} compact />
          ) : event.type === "maintenance" ? (
            <MaintenanceSummary event={event} compact />
          ) : (
            <div className="banner-message">{statusLabel(event.status)}</div>
          )}
          <div className="affected-row">
            {event.affected.map((item) => (
              <span className="badge" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusMonitor({
  component,
  data,
}: {
  component: (typeof COMPONENTS)[number] | (typeof GROUPED_COMPONENTS)[number]["components"][number];
  data: TrackerDay[];
}) {
  return (
    <div className="status-monitor" data-variant={component.status}>
      <div className="monitor-header">
        <div className="monitor-name-row">
          <div className="monitor-title">{component.name}</div>
          {component.description ? (
            <span className="info-icon" title={component.description}>
              <Info size={15} aria-hidden="true" />
            </span>
          ) : null}
        </div>
        <div className="monitor-status-row">
          <div className="uptime">{component.uptime}</div>
          <StatusDot variant={component.status} size="small" />
        </div>
      </div>
      <StatusTracker data={data} />
      <div className="monitor-footer">
        <span>{formatRelativeDay(data[0].day)}</span>
        <span>today</span>
      </div>
    </div>
  );
}

function StatusTracker({ data }: { data: TrackerDay[] }) {
  return (
    <div className="tracker" role="toolbar" aria-label="Status tracker">
      {data.map((item, index) => (
        <button
          className="tracker-bar"
          type="button"
          key={item.day.toISOString()}
          aria-label={`Day ${index + 1} status`}
        >
          {item.bar.map((segment, segmentIndex) => (
            <span
              key={`${segment.status}-${segmentIndex}`}
              style={{
                height: `${segment.height}%`,
                backgroundColor: statusColor(segment.status),
              }}
            />
          ))}
          <span className="bar-popover">
            <strong>{formatDate(item.day)}</strong>
            {item.card.map((entry, entryIndex) => (
              <span
                className="popover-row"
                key={`${item.day.toISOString()}-${entry.status}-${entryIndex}`}
              >
                <i style={{ backgroundColor: statusColor(entry.status) }} />
                <span>{statusLabel(entry.status)}</span>
                <code>{entry.value}</code>
              </span>
            ))}
            {item.events.map((event) => (
              <span className="popover-event" key={`${event.type}-${event.name}`}>
                {event.name}
              </span>
            ))}
          </span>
        </button>
      ))}
    </div>
  );
}

function StatusMonitorStatus({ variant }: { variant: Variant }) {
  return <span className={`monitor-status-text ${variant}`}>{statusLabel(variant)}</span>;
}

function StatusFeed({
  events,
  empty,
  embedMode,
}: {
  events: StatusEvent[];
  empty: boolean;
  embedMode: boolean;
}) {
  if (empty) {
    return (
      <div className="blank-container">
        <div className="blank-art">
          <BlankReport className="back" />
          <BlankReport className="middle" />
          <BlankReport />
        </div>
        <div className="blank-copy">
          <div className="blank-title">No recent notifications</div>
          <div className="blank-description">
            There have been no reports within the last 7 days.
          </div>
          <EmbedAwareLink
            embedMode={embedMode}
            href="/events"
            className="outline-button text-link-button"
          >
            View events history
          </EmbedAwareLink>
        </div>
      </div>
    );
  }

  return (
    <div className="event-group">
      {events.map((event) => (
        <article className="status-event" key={`${event.type}-${event.id}`}>
          <aside className="event-date">
            <strong>{monthDay(event.from)}</strong>
            <span>{formatRelativeDay(event.from)}</span>
          </aside>
          <EmbedAwareLink
            embedMode={embedMode}
            href={`/events/${event.type}/${event.id}`}
            className="event-link"
          >
            <div className="event-content">
              <div className="event-title">{event.title}</div>
              <div className="affected-row">
                {event.affected.map((item) => (
                  <span className="badge" key={item}>
                    {item}
                  </span>
                ))}
              </div>
              {event.type === "report" && event.updates ? (
                <div className="timeline">
                  {event.updates.map((update, index) => (
                    <TimelineUpdate
                      key={`${update.status}-${update.date.toISOString()}`}
                      update={update}
                      isLast={index === event.updates!.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <MaintenanceSummary event={event} />
              )}
            </div>
          </EmbedAwareLink>
        </article>
      ))}
      <EmbedAwareLink
        embedMode={embedMode}
        href="/events"
        className="outline-button history-button"
      >
        View events history
      </EmbedAwareLink>
    </div>
  );
}

function TimelineUpdate({
  update,
  compact = false,
  isLast = true,
}: {
  update: NonNullable<StatusEvent["updates"]>[number];
  compact?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className={`timeline-update ${compact ? "compact" : ""}`}>
      {!compact ? (
        <div className="timeline-rail">
          <span className="timeline-dot" />
          {!isLast ? <span className="timeline-line" /> : null}
        </div>
      ) : null}
      <div>
        <div className="timeline-title">
          <span>{capitalize(update.status)}</span>
          <span className="muted-dot">·</span>
          <span className="timestamp">{formatDateTime(update.date)}</span>
        </div>
        <p>{update.message || "-"}</p>
      </div>
    </div>
  );
}

function MaintenanceSummary({
  event,
  compact = false,
}: {
  event: StatusEvent;
  compact?: boolean;
}) {
  return (
    <div className={`maintenance-summary ${compact ? "compact" : ""}`}>
      {!compact ? <span className="timeline-dot info" /> : null}
      <div>
        <div className="timeline-title">
          <span>Maintenance</span>
          <span className="muted-dot">·</span>
          <span className="timestamp">
            {formatDateTime(event.from)} - {event.to ? formatTime(event.to) : "ongoing"}
          </span>
        </div>
        <p>{event.message || "-"}</p>
      </div>
    </div>
  );
}

function BlankReport({ className = "" }: { className?: string }) {
  return (
    <div className={`blank-report ${className}`}>
      <div className="blank-page-header">
        <span />
        <span />
        <span />
      </div>
      <div className="blank-line-row">
        <i />
        <div>
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="blank-overlay" />
    </div>
  );
}

function Footer({
  embedMode,
  whiteLabel,
}: {
  embedMode: boolean;
  whiteLabel: boolean;
}) {
  if (embedMode && whiteLabel) return null;

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          {!whiteLabel ? (
            <p>
              powered by{" "}
              <a
                href={`https://openstatus.dev?utm_medium=status-page&utm_source=${PAGE.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                openstatus.dev
              </a>
            </p>
          ) : null}
        </div>
        <div className="footer-controls">
          <span className="timezone">
            <Clock size={13} aria-hidden="true" />
            America/New_York
          </span>
          <button type="button" className="outline-button compact">
            EN
          </button>
          <button type="button" className="outline-button compact" aria-label="Theme">
            <Sun size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}

function EmbedAwareLink({
  embedMode,
  href,
  className,
  children,
}: {
  embedMode: boolean;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const isInternal = href.startsWith("/") || href.startsWith("#");
  const target = embedMode && isInternal && !href.startsWith("#") ? "_blank" : undefined;
  const rel = target ? "noopener noreferrer" : undefined;

  return (
    <a className={className} href={href} target={target} rel={rel}>
      {children}
    </a>
  );
}

function StatusDot({
  variant,
  size = "normal",
}: {
  variant: Variant;
  size?: "normal" | "small";
}) {
  const Icon =
    variant === "success"
      ? Check
      : variant === "degraded"
        ? TriangleAlert
        : variant === "error"
          ? AlertCircle
          : Wrench;

  return (
    <span className={`status-dot ${size}`} data-variant={variant}>
      <Icon aria-hidden="true" />
    </span>
  );
}

function createTrackerData(seed: number): TrackerDay[] {
  return Array.from({ length: 45 }, (_, index) => {
    const day = new Date(BASE_DATE);
    day.setDate(BASE_DATE.getDate() - (44 - index));
    const age = 44 - index;
    const incident = age === 0 && seed === 0;
    const degraded = age === 0 && seed === 2;
    const maintenance = age === 0 && seed === 3;
    const previousIssue = [8 + seed, 16 + seed, 27 - seed].includes(age);
    const status: Variant | "empty" = incident
      ? "degraded"
      : degraded
        ? "degraded"
        : maintenance
          ? "info"
          : previousIssue
            ? age % 2 === 0
              ? "error"
              : "degraded"
            : "success";
    const successHeight =
      status === "success" ? 100 : status === "info" ? 88 : status === "degraded" ? 82 : 72;

    return {
      day,
      bar:
        status === "success"
          ? [{ status: "success", height: 100 }]
          : [
              { status, height: 100 - successHeight },
              { status: "success", height: successHeight },
            ],
      card: [
        { status: "success", value: `${successHeight}%` },
        { status, value: status === "success" ? "0 min" : `${100 - successHeight} min` },
      ],
      events:
        age === 0 && seed === 0
          ? [
              {
                type: "report",
                name: "Elevated API error rates",
                status: "degraded",
                from: EVENTS[0].from,
              },
            ]
          : [],
    };
  });
}

function statusLabel(status: Variant | "empty") {
  return {
    success: "Operational",
    degraded: "Degraded",
    error: "Downtime",
    info: "Maintenance",
    empty: "No Data",
  }[status];
}

function statusColor(status: Variant | "empty") {
  return {
    success: "var(--success)",
    degraded: "var(--warning)",
    error: "var(--destructive)",
    info: "var(--info)",
    empty: "var(--muted)",
  }[status];
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function monthDay(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function formatRelativeDay(date: Date) {
  const diff = Math.round(
    (startOfDay(date).getTime() - startOfDay(BASE_DATE).getTime()) / 86_400_000,
  );
  if (diff === 0) return "today";
  if (diff > 0) return `in ${diff} day${diff === 1 ? "" : "s"}`;
  const days = Math.abs(diff);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default App;
