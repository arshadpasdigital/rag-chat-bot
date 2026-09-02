import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Code2,
  Copy,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  MessageSquareText,
  MoreHorizontal,
  Paperclip,
  Plus,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
  Upload,
  UserRound,
  X,
  Zap,
} from "lucide-react"
import {
  authFieldSchemas,
  loginSchema,
  signupSchema,
} from "@/features/auth/schemas/auth-schema"
import { agentBuilderSchema } from "@/features/agents/schemas/agent-schema"
import { useAppStore } from "@/shared/store/app-store"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { Badge } from "@/components/ui/badge"
import { Button as ShadcnButton } from "@/components/ui/button"
import { Field as ShadcnField, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type Page =
  "dashboard" | "builder" | "knowledge" | "playground" | "deploy" | "auth"
const pageLabels: Record<Exclude<Page, "auth">, string> = {
  dashboard: "Overview",
  builder: "Agent builder",
  knowledge: "Knowledge base",
  playground: "Playground",
  deploy: "Deploy & SDK",
}
const navItems = [
  { id: "dashboard" as const, label: "Overview", icon: LayoutDashboard },
  { id: "builder" as const, label: "Agent builder", icon: Settings2 },
  { id: "knowledge" as const, label: "Knowledge base", icon: BookOpen },
  { id: "playground" as const, label: "Playground", icon: MessageSquareText },
  { id: "deploy" as const, label: "Deploy & SDK", icon: Code2 },
]

type AppProps = { initialPage?: Page; onNavigate?: (page: Page) => void }

export function App({ initialPage = "dashboard", onNavigate }: AppProps) {
  const [localPage, setLocalPage] = useState<Page>(initialPage)
  const page = onNavigate ? initialPage : localPage
  const navigate = (next: Page) => {
    onNavigate?.(next)
    if (!onNavigate) setLocalPage(next)
  }
  if (page === "auth")
    return (
      <AuthScreen
        onBack={() => navigate("dashboard")}
        onSuccess={() => navigate("dashboard")}
      />
    )
  return (
    <SidebarProvider
      className="app-frame"
      style={{ "--sidebar-width": "236px" } as React.CSSProperties}
    >
      <Sidebar activePage={page} onNavigate={navigate} />
      <main className="app-main">
        <Topbar page={page} onAuth={() => navigate("auth")} />
        <div className="page-scroll">
          {page === "dashboard" && <Dashboard onNavigate={navigate} />}
          {page === "builder" && <Builder onNavigate={navigate} />}
          {page === "knowledge" && <KnowledgeBase />}
          {page === "playground" && <Playground />}
          {page === "deploy" && <Deploy />}
        </div>
      </main>
    </SidebarProvider>
  )
}

function BrandMark() {
  return (
    <div className="brand-mark" aria-label="Relay home">
      <span className="brand-symbol">
        <span />
        <span />
        <span />
      </span>
      <span className="brand-name">relay</span>
    </div>
  )
}

function Sidebar({
  activePage,
  onNavigate,
}: {
  activePage: Exclude<Page, "auth">
  onNavigate: (page: Page) => void
}) {
  const workspace = useAppStore((state) => state.workspace)
  const { setOpenMobile } = useSidebar()
  const handleNavigate = (page: Page) => {
    onNavigate(page)
    setOpenMobile(false)
  }
  return (
    <ShadcnSidebar className="sidebar" collapsible="offcanvas">
      <SidebarHeader className="sidebar-top">
        <BrandMark />
      </SidebarHeader>
      <SidebarContent>
        <div className="workspace-switcher">
          <div className="workspace-avatar">{workspace.name.slice(0, 1)}</div>
          <div className="workspace-copy">
            <strong>{workspace.name}</strong>
            <span>Workspace</span>
          </div>
          <ChevronDown size={14} className="muted-icon" />
        </div>
        <SidebarGroup className="sidebar-nav-group">
          <SidebarGroupLabel className="nav-section-label">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="primary-nav">
              {navItems.map(({ id, label, icon: Icon }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    className={cn("nav-item", activePage === id && "active")}
                    isActive={activePage === id}
                    onClick={() => handleNavigate(id)}
                  >
                    <Icon size={16} strokeWidth={1.8} />
                    <span>{label}</span>
                    {id === "knowledge" && <span className="nav-count">3</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="sidebar-spacer" />
      </SidebarContent>
      <SidebarFooter className="sidebar-bottom">
        <div className="setup-card">
          <div className="setup-card-top">
            <span className="eyebrow">GETTING STARTED</span>
            <span className="setup-percent">62%</span>
          </div>
          <div className="setup-track">
            <span />
          </div>
          <p>Finish setting up your agent</p>
          <button
            onClick={() => handleNavigate("builder")}
            className="setup-link"
          >
            View checklist <ChevronRight size={13} />
          </button>
        </div>
        <button className="nav-item">
          <CircleHelp size={16} />
          <span>Help center</span>
          <ArrowUpRight size={13} className="external-icon" />
        </button>
        <button className="nav-item">
          <Settings2 size={16} />
          <span>Settings</span>
        </button>
        <Separator className="sidebar-separator" />
        <button className="profile-row" onClick={() => handleNavigate("auth")}>
          <span className="avatar avatar-small">JD</span>
          <span className="profile-copy">
            <strong>Jordan Davis</strong>
            <span>Owner</span>
          </span>
          <MoreHorizontal size={15} className="muted-icon" />
        </button>
      </SidebarFooter>
    </ShadcnSidebar>
  )
}

function Topbar({ page, onAuth }: { page: Page; onAuth: () => void }) {
  return (
    <header className="topbar">
      <div className="breadcrumb-wrap">
        <SidebarTrigger
          className="mobile-menu icon-button"
          aria-label="Open navigation"
        />
        <span className="crumb-muted">Workspace</span>
        <ChevronRight size={14} />
        <span>{pageLabels[page as Exclude<Page, "auth">]}</span>
      </div>
      <div className="topbar-actions">
        <span className="status-ping">
          <span /> All systems operational
        </span>
        <button className="topbar-icon icon-button" aria-label="Help">
          <CircleHelp size={16} />
        </button>
        <button
          className="avatar avatar-button"
          onClick={onAuth}
          aria-label="Open account"
        >
          JD
        </button>
      </div>
    </header>
  )
}
function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">{eyebrow ?? "WORKSPACE"}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  )
}
function Button({
  children,
  variant = "primary",
  onClick,
  icon,
  type = "button",
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "ghost"
  onClick?: () => void
  icon?: React.ReactNode
  type?: "button" | "submit"
}) {
  return (
    <ShadcnButton
      type={type}
      variant={variant === "primary" ? "default" : variant}
      className={cn("button", `button-${variant}`)}
      onClick={onClick}
    >
      {icon}
      {children}
    </ShadcnButton>
  )
}
function StatusBadge({
  status,
}: {
  status: "live" | "draft" | "paused" | "ready" | "indexing"
}) {
  const label =
    status === "ready"
      ? "Ready"
      : status === "indexing"
        ? "Indexing"
        : status[0].toUpperCase() + status.slice(1)
  return (
    <Badge variant="outline" className={`status-badge status-${status}`}>
      <span />
      {label}
    </Badge>
  )
}

function Dashboard({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const agents = [
    {
      name: "Northstar support",
      type: "Support agent",
      status: "live" as const,
      edited: "Today, 10:42 AM",
      tests: "128",
    },
    {
      name: "Inbound qualifier",
      type: "Lead qualification",
      status: "draft" as const,
      edited: "Yesterday",
      tests: "42",
    },
    {
      name: "Renewal concierge",
      type: "Sales agent",
      status: "paused" as const,
      edited: "Aug 28, 2026",
      tests: "19",
    },
  ]
  return (
    <div className="content-container dashboard-page">
      <PageHeader
        eyebrow="OVERVIEW"
        title="Good morning, Jordan"
        description="Build, test, and ship agents that do the work for you."
        actions={
          <Button
            onClick={() => onNavigate("builder")}
            icon={<Plus size={16} />}
          >
            New agent
          </Button>
        }
      />
      <div className="dashboard-grid">
        <section className="card hero-card">
          <div className="hero-card-main">
            <div className="hero-kicker">
              <span className="signal-dot pulse" /> YOUR AGENT IS LIVE
            </div>
            <h2>
              Northstar support
              <br />
              <em>is handling the queue.</em>
            </h2>
            <p>
              It has answered 128 conversations this week with an average
              confidence of 94%.
            </p>
            <div className="hero-actions">
              <Button
                variant="secondary"
                onClick={() => onNavigate("playground")}
              >
                Test the agent <ArrowUpRight size={15} />
              </Button>
              <span className="last-updated">Updated 6 min ago</span>
            </div>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit-ring ring-one" />
            <div className="orbit-ring ring-two" />
            <div className="orbit-center">
              <Bot size={25} />
            </div>
            <div className="orbit-node node-one" />
            <div className="orbit-node node-two" />
            <div className="orbit-node node-three" />
          </div>
        </section>
        <section className="stat-row">
          <div className="stat-card">
            <div className="stat-label">
              Conversations <span className="info-dot">i</span>
            </div>
            <div className="stat-value">189</div>
            <div className="stat-delta positive">
              ↗ 18.4% <span>vs. last week</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">
              Avg. response time <span className="info-dot">i</span>
            </div>
            <div className="stat-value">
              1.2<span className="stat-unit">s</span>
            </div>
            <div className="stat-delta positive">
              ↘ 0.3s <span>vs. last week</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">
              Knowledge sources <span className="info-dot">i</span>
            </div>
            <div className="stat-value">3</div>
            <div className="stat-delta neutral">All sources ready</div>
          </div>
        </section>
        <section className="card agents-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR WORKSPACE</span>
              <h3>Agents</h3>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("builder")}
            >
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="agent-table">
            <div className="agent-table-head">
              <span>Agent</span>
              <span>Status</span>
              <span>Last edited</span>
              <span>Tests</span>
              <span />
            </div>
            {agents.map((agent) => (
              <button
                key={agent.name}
                className="agent-row"
                onClick={() =>
                  onNavigate(agent.status === "live" ? "playground" : "builder")
                }
              >
                <div className="agent-name">
                  <span className={`agent-glyph ${agent.status}`}>
                    <Bot size={15} />
                  </span>
                  <span>
                    <strong>{agent.name}</strong>
                    <small>{agent.type}</small>
                  </span>
                </div>
                <StatusBadge status={agent.status} />
                <span className="table-muted">{agent.edited}</span>
                <span className="table-muted mono">{agent.tests}</span>
                <ChevronRight size={15} className="row-arrow" />
              </button>
            ))}
          </div>
        </section>
        <div className="bottom-grid">
          <section className="card activity-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">RECENT ACTIVITY</span>
                <h3>What’s happening</h3>
              </div>
              <button className="icon-button">
                <MoreHorizontal size={17} />
              </button>
            </div>
            <Activity
              icon={<Upload size={15} />}
              color="lime"
              text="Knowledge base indexed"
              meta="pricing-2026.pdf · 6 min ago"
            />
            <Activity
              icon={<Zap size={15} />}
              color="amber"
              text="Northstar support published"
              meta="Version 1.4 · Today, 9:58 AM"
            />
            <Activity
              icon={<MessageSquareText size={15} />}
              color="blue"
              text="New test conversation"
              meta="Inbound qualifier · Yesterday"
            />
          </section>
          <section className="card checklist-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">NEXT UP</span>
                <h3>Setup checklist</h3>
              </div>
              <span className="checklist-count">3 / 5</span>
            </div>
            <Checklist done text="Create your workspace" />
            <Checklist done text="Create your first agent" />
            <Checklist done text="Add a knowledge source" />
            <Checklist
              text="Run a test conversation"
              onClick={() => onNavigate("playground")}
            />
            <Checklist
              text="Deploy your agent"
              onClick={() => onNavigate("deploy")}
            />
          </section>
        </div>
      </div>
    </div>
  )
}
function Activity({
  icon,
  color,
  text,
  meta,
}: {
  icon: React.ReactNode
  color: string
  text: string
  meta: string
}) {
  return (
    <div className="activity-row">
      <span className={`activity-icon ${color}`}>{icon}</span>
      <span>
        <strong>{text}</strong>
        <small>{meta}</small>
      </span>
      <ChevronRight size={14} className="row-arrow" />
    </div>
  )
}
function Checklist({
  done,
  text,
  onClick,
}: {
  done?: boolean
  text: string
  onClick?: () => void
}) {
  return (
    <button className="check-row" onClick={onClick}>
      <span className={`check-box ${done ? "checked" : ""}`}>
        {done && <Check size={11} />}
      </span>
      <span className={done ? "done" : ""}>{text}</span>
      {!done && <ChevronRight size={14} className="row-arrow" />}
    </button>
  )
}

function Builder({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [saved, setSaved] = useState(true)
  const [guardrail, setGuardrail] = useState(true)
  const builderForm = useForm({
    defaultValues: {
      name: "Inbound qualifier",
      description:
        "Qualify inbound leads and route the right opportunities to our sales team.",
      prompt:
        "You are the first point of contact for Northstar Labs.\n\nYour job is to understand what a visitor needs, ask thoughtful follow-up questions, and identify whether Northstar is a good fit for their team. Be concise, warm, and honest. Never invent pricing or product capabilities.",
      temperature: 0.3,
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = agentBuilderSchema.safeParse(value)
        return result.success ? undefined : result.error.issues[0]?.message
      },
    },
    onSubmit: ({ value }) => {
      if (agentBuilderSchema.safeParse(value).success) setSaved(true)
    },
  })
  const publishAgent = () => {
    const result = agentBuilderSchema.safeParse(builderForm.state.values)
    if (result.success) onNavigate("deploy")
    else void builderForm.handleSubmit()
  }
  const [delegations, setDelegations] = useState([
    {
      name: "Billing & account questions",
      description: "Handles invoices, plan changes, and account access.",
    },
    {
      name: "Escalate to a human",
      description:
        "Routes sensitive or unresolved questions to the support team.",
    },
  ])
  return (
    <div className="content-container builder-page">
      <PageHeader
        eyebrow="AGENT BUILDER / DRAFT"
        title="Inbound qualifier"
        description="Configure how your agent thinks, speaks, and knows."
        actions={
          <>
            <span className={`save-state ${saved ? "saved" : "saving"}`}>
              <span />
              {saved ? "All changes saved" : "Saving…"}
            </span>
            <Button
              variant="secondary"
              onClick={() => void builderForm.handleSubmit()}
            >
              Save draft
            </Button>
            <Button onClick={publishAgent} icon={<Zap size={15} />}>
              Publish
            </Button>
          </>
        }
      />
      <div className="builder-layout">
        <form
          className="builder-main"
          onSubmit={(e) => {
            e.preventDefault()
            void builderForm.handleSubmit()
          }}
        >
          <BuilderSection
            number="01"
            title="Identity"
            description="Give your agent a clear job and a point of view."
          >
            <div className="form-grid">
              <builderForm.Field
                name="name"
                validators={{
                  onBlur: ({ value }) => {
                    const result =
                      agentBuilderSchema.shape.name.safeParse(value)
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message
                  },
                }}
              >
                {(field) => (
                  <Field
                    label="Agent name"
                    invalid={
                      field.state.meta.isTouched &&
                      Boolean(field.state.meta.errors[0])
                    }
                  >
                    <Input
                      value={field.state.value}
                      aria-invalid={
                        field.state.meta.isTouched &&
                        Boolean(field.state.meta.errors[0])
                      }
                      onChange={(e) => {
                        field.handleChange(e.target.value)
                        setSaved(false)
                      }}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors[0] && (
                        <span className="field-error">
                          {String(field.state.meta.errors[0])}
                        </span>
                      )}
                  </Field>
                )}
              </builderForm.Field>
              <Field label="Primary use case">
                <button type="button" className="select-field">
                  <span>Lead qualification</span>
                  <ChevronDown size={15} />
                </button>
              </Field>
            </div>
            <builderForm.Field
              name="description"
              validators={{
                onBlur: ({ value }) => {
                  const result =
                    agentBuilderSchema.shape.description.safeParse(value)
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message
                },
              }}
            >
              {(field) => (
                <Field
                  label="Short description"
                  invalid={
                    field.state.meta.isTouched &&
                    Boolean(field.state.meta.errors[0])
                  }
                >
                  <Input
                    value={field.state.value}
                    aria-invalid={
                      field.state.meta.isTouched &&
                      Boolean(field.state.meta.errors[0])
                    }
                    onChange={(e) => {
                      field.handleChange(e.target.value)
                      setSaved(false)
                    }}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.isTouched && field.state.meta.errors[0] && (
                    <span className="field-error">
                      {String(field.state.meta.errors[0])}
                    </span>
                  )}
                </Field>
              )}
            </builderForm.Field>
          </BuilderSection>
          <BuilderSection
            number="02"
            title="Instructions"
            description="The rules your agent follows in every conversation."
          >
            <builderForm.Field
              name="prompt"
              validators={{
                onBlur: ({ value }) => {
                  const result =
                    agentBuilderSchema.shape.prompt.safeParse(value)
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message
                },
              }}
            >
              {(field) => (
                <Field
                  label="System prompt"
                  hint="Keep it specific to get more consistent results."
                  invalid={
                    field.state.meta.isTouched &&
                    Boolean(field.state.meta.errors[0])
                  }
                >
                  <Textarea
                    className="prompt-input"
                    value={field.state.value}
                    aria-invalid={
                      field.state.meta.isTouched &&
                      Boolean(field.state.meta.errors[0])
                    }
                    onChange={(e) => {
                      field.handleChange(e.target.value)
                      setSaved(false)
                    }}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.isTouched && field.state.meta.errors[0] && (
                    <span className="field-error">
                      {String(field.state.meta.errors[0])}
                    </span>
                  )}
                  <div className="field-footer">
                    <span>
                      <Sparkles size={13} /> Prompt suggestions available
                    </span>
                    <button type="button" className="text-button">
                      Improve prompt <ArrowUpRight size={13} />
                    </button>
                  </div>
                </Field>
              )}
            </builderForm.Field>
          </BuilderSection>
          <BuilderSection
            number="03"
            title="Behavior"
            description="Tune how your agent responds and when it should ask for help."
          >
            <div className="model-row">
              <div className="model-select">
                <span className="model-logo">◎</span>
                <span>
                  <small>Model</small>
                  <strong>Claude 3.5 Sonnet</strong>
                </span>
                <ChevronDown size={15} />
              </div>
              <builderForm.Field
                name="temperature"
                validators={{
                  onBlur: ({ value }) => {
                    const result =
                      agentBuilderSchema.shape.temperature.safeParse(value)
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message
                  },
                }}
              >
                {(field) => (
                  <Field
                    label="Temperature"
                    invalid={
                      field.state.meta.isTouched &&
                      Boolean(field.state.meta.errors[0])
                    }
                  >
                    <div className="temperature-control">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={field.state.value}
                        onChange={(e) => {
                          field.handleChange(Number(e.target.value))
                          setSaved(false)
                        }}
                        onBlur={field.handleBlur}
                      />
                      <span className="mono">{field.state.value}</span>
                    </div>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors[0] && (
                        <span className="field-error">
                          {String(field.state.meta.errors[0])}
                        </span>
                      )}
                  </Field>
                )}
              </builderForm.Field>
            </div>
            <div className="toggle-row">
              <div>
                <strong>Stay on topic</strong>
                <small>Keep replies grounded in the knowledge base.</small>
              </div>
              <button
                type="button"
                className={`toggle ${guardrail ? "on" : ""}`}
                onClick={() => setGuardrail(!guardrail)}
                aria-label="Toggle stay on topic"
              >
                <span />
              </button>
            </div>
          </BuilderSection>
          <BuilderSection
            number="04"
            title="Delegations"
            description="Let your agent hand off specific jobs to a focused worker. No flowchart needed."
          >
            <div className="delegation-list">
              {delegations.map((item, i) => (
                <div className="delegation-row" key={item.name}>
                  <span className="delegation-handle">⠿</span>
                  <span className="delegation-number">0{i + 1}</span>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.description}</small>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() =>
                      setDelegations(
                        delegations.filter((_, index) => index !== i)
                      )
                    }
                    aria-label={`Remove ${item.name}`}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="add-delegation"
              onClick={() =>
                setDelegations([
                  ...delegations,
                  {
                    name: "New delegated task",
                    description:
                      "Describe when the agent should hand this off.",
                  },
                ])
              }
            >
              <Plus size={15} /> Add delegated task
            </button>
          </BuilderSection>
        </form>
        <aside className="builder-aside">
          <div className="preview-card card">
            <div className="preview-header">
              <span className="eyebrow">LIVE PREVIEW</span>
              <span className="live-indicator">
                <span /> Draft
              </span>
            </div>
            <div className="preview-agent">
              <span className="agent-glyph draft">
                <Bot size={17} />
              </span>
              <span>
                <strong>Inbound qualifier</strong>
                <small>Northstar Labs</small>
              </span>
            </div>
            <div className="preview-bubble agent-bubble">
              Hi there — I’m here to help you find the right fit for your team.
              What are you hoping to improve?
            </div>
            <div className="preview-bubble user-bubble">
              We’re looking for a way to qualify inbound demos.
            </div>
            <div className="preview-input">
              Send a message… <Send size={14} />
            </div>
            <button
              className="preview-link"
              onClick={() => onNavigate("playground")}
            >
              Open playground <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="tip-card">
            <span className="tip-icon">
              <Sparkles size={15} />
            </span>
            <div>
              <strong>Make it yours</strong>
              <p>
                Agents with a specific point of view feel more natural in
                conversation.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
function BuilderSection({
  number,
  title,
  description,
  children,
}: {
  number: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="builder-section">
      <div className="section-index">{number}</div>
      <div className="builder-section-content">
        <div className="builder-section-title">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {children}
      </div>
    </section>
  )
}
function Field({
  label,
  hint,
  invalid = false,
  children,
}: {
  label: string
  hint?: string
  invalid?: boolean
  children: React.ReactNode
}) {
  return (
    <ShadcnField className="field" data-invalid={invalid || undefined}>
      <FieldLabel className="field-label">
        {label}
        {hint && <small>{hint}</small>}
      </FieldLabel>
      {children}
    </ShadcnField>
  )
}

function KnowledgeBase() {
  const [files, setFiles] = useState([
    {
      name: "pricing-2026.pdf",
      type: "PDF",
      size: "2.4 MB",
      status: "ready" as const,
      updated: "6 min ago",
    },
    {
      name: "product-faq.txt",
      type: "TXT",
      size: "18 KB",
      status: "ready" as const,
      updated: "Yesterday",
    },
    {
      name: "case-studies.pdf",
      type: "PDF",
      size: "8.1 MB",
      status: "indexing" as const,
      updated: "Just now",
    },
  ])
  const [dragging, setDragging] = useState(false)
  const addFiles = (newFiles: FileList | File[]) => {
    const file = newFiles[0]
    if (file)
      setFiles([
        ...files,
        {
          name: file.name,
          type: "FILE",
          size: "New upload",
          status: "indexing",
          updated: "Just now",
        },
      ])
  }
  return (
    <div className="content-container knowledge-page">
      <PageHeader
        eyebrow="INBOUND QUALIFIER / KNOWLEDGE BASE"
        title="Make your agent useful."
        description="Give it the context it needs to answer with confidence."
        actions={
          <Button
            icon={<Upload size={15} />}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            Upload source
          </Button>
        }
      />
      <input
        id="file-input"
        type="file"
        hidden
        multiple
        onChange={(e) => e.target.files && addFiles(e.target.files)}
      />
      <div className="knowledge-grid">
        <div className="knowledge-main">
          <div
            className={`upload-zone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              addFiles(e.dataTransfer.files)
            }}
          >
            <div className="upload-icon">
              <Upload size={19} />
            </div>
            <h3>Drop files here to add knowledge</h3>
            <p>PDF, TXT, DOCX, or paste FAQs directly</p>
            <button
              className="text-button"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              Browse files <ArrowUpRight size={13} />
            </button>
          </div>
          <section className="card sources-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">SOURCES · {files.length}</span>
                <h3>Knowledge sources</h3>
              </div>
              <button className="icon-button">
                <MoreHorizontal size={17} />
              </button>
            </div>
            <div className="source-list">
              {files.map((file, i) => (
                <div className="source-row" key={`${file.name}-${i}`}>
                  <span className={`file-icon ${file.type.toLowerCase()}`}>
                    {file.type}
                  </span>
                  <div className="source-name">
                    <strong>{file.name}</strong>
                    <small>
                      {file.size} · Updated {file.updated}
                    </small>
                  </div>
                  <StatusBadge status={file.status} />
                  <button
                    className="icon-button source-more"
                    aria-label={`More options for ${file.name}`}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="knowledge-aside">
          <div className="card retrieval-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">RETRIEVAL CHECK</span>
                <h3>Ask your sources</h3>
              </div>
              <Gauge size={17} className="muted-icon" />
            </div>
            <p>
              Check what your agent will find before you start a conversation.
            </p>
            <div className="retrieval-input">
              <Input placeholder="e.g. What does the Pro plan include?" />
              <button aria-label="Search sources">
                <ArrowUpRight size={15} />
              </button>
            </div>
            <div className="retrieval-result">
              <span className="result-check">
                <Check size={12} />
              </span>
              <span>
                <strong>3 relevant chunks found</strong>
                <small>From pricing-2026.pdf · 0.91 relevance</small>
              </span>
            </div>
          </div>
          <div className="indexing-card">
            <div className="indexing-graphic">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div>
              <strong>How indexing works</strong>
              <p>
                We turn your sources into searchable context your agent can
                retrieve at the right moment.
              </p>
              <button className="text-button">
                Learn more <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Playground() {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      text: "Hi Jordan — I’m the Inbound qualifier. I can help you understand if Northstar is a good fit. What’s on your mind?",
      time: "10:47 AM",
    },
    {
      role: "user",
      text: "We need to qualify leads from our website before they reach sales.",
      time: "10:48 AM",
    },
    {
      role: "agent",
      text: "That’s exactly what I can help with. What does your current qualification process look like today?",
      time: "10:48 AM",
    },
  ])
  const [draft, setDraft] = useState("")
  const [thinking, setThinking] = useState(false)
  const sendMessage = () => {
    if (!draft.trim() || thinking) return
    const newText = draft.trim()
    setMessages([...messages, { role: "user", text: newText, time: "Now" }])
    setDraft("")
    setThinking(true)
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: "Got it. I’ll keep that context in mind as we narrow down the right next step.",
          time: "Now",
        },
      ])
      setThinking(false)
    }, 900)
  }
  return (
    <div className="content-container playground-page">
      <PageHeader
        eyebrow="INBOUND QUALIFIER / PLAYGROUND"
        title="Have a conversation."
        description="Test the draft agent with the same context your customers will see."
        actions={
          <>
            <Button
              variant="ghost"
              icon={<RotateCcw size={14} />}
              onClick={() => setMessages([])}
            >
              Reset
            </Button>
            <Button
              onClick={() => setThinking(!thinking)}
              icon={<Zap size={14} />}
            >
              {thinking ? "Agent is thinking" : "Draft mode"}
            </Button>
          </>
        }
      />
      <div className="playground-layout">
        <section className="card chat-panel">
          <div className="chat-header">
            <div className="chat-agent">
              <span className="agent-glyph draft">
                <Bot size={17} />
              </span>
              <span>
                <strong>Inbound qualifier</strong>
                <small>Draft · Claude 3.5 Sonnet</small>
              </span>
            </div>
            <span className="connection-status">
              <span /> Connected
            </span>
          </div>
          <div className="chat-body">
            {messages.length === 0 && (
              <div className="chat-empty">
                <span className="chat-empty-icon">
                  <MessageSquareText size={21} />
                </span>
                <h3>Start a test conversation</h3>
                <p>
                  Ask the agent anything. This is a safe space to try the edges.
                </p>
              </div>
            )}
            {messages.map((message, i) => (
              <div
                className={`message-row ${message.role}`}
                key={`${message.time}-${i}`}
              >
                <span className={`message-avatar ${message.role}`}>
                  {message.role === "agent" ? <Bot size={14} /> : "JD"}
                </span>
                <div className="message-stack">
                  <div className={`message-bubble ${message.role}`}>
                    {message.text}
                  </div>
                  <span className="message-time">{message.time}</span>
                </div>
              </div>
            ))}
            {thinking && (
              <div className="message-row agent">
                <span className="message-avatar agent">
                  <Bot size={14} />
                </span>
                <div className="message-stack">
                  <div className="message-bubble agent thinking-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="chat-composer">
            <button className="icon-button" aria-label="Attach file">
              <Paperclip size={17} />
            </button>
            <Input
              className="chat-input"
              value={draft}
              placeholder="Message your agent…"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage()
              }}
            />
            <button
              className="send-button"
              aria-label="Send message"
              onClick={sendMessage}
            >
              <Send size={16} />
            </button>
            <div className="composer-hint">
              <span className="mono">⌘ ↵</span> to send
            </div>
          </div>
        </section>
        <aside className="playground-aside">
          <section className="card context-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">AGENT SIGNAL</span>
                <h3>What’s in context</h3>
              </div>
              <span className="context-live">
                <span /> Live
              </span>
            </div>
            <div className="signal-item">
              <span className="signal-item-icon lime">
                <BookOpen size={14} />
              </span>
              <span>
                <strong>Knowledge retrieval</strong>
                <small>3 sources available</small>
              </span>
              <Check size={14} className="check-green" />
            </div>
            <div className="signal-item">
              <span className="signal-item-icon amber">
                <Settings2 size={14} />
              </span>
              <span>
                <strong>Delegations</strong>
                <small>2 workers configured</small>
              </span>
              <Check size={14} className="check-amber" />
            </div>
            <div className="signal-item">
              <span className="signal-item-icon blue">
                <LockKeyhole size={14} />
              </span>
              <span>
                <strong>Guardrails</strong>
                <small>On-topic mode enabled</small>
              </span>
              <Check size={14} className="check-blue" />
            </div>
          </section>
          <section className="card notes-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">TEST NOTES</span>
                <h3>Keep an eye out</h3>
              </div>
              <MoreHorizontal size={17} className="muted-icon" />
            </div>
            <p>
              Try asking about pricing, an edge case, or something outside the
              knowledge base.
            </p>
            <button className="text-button">
              View test guide <ArrowUpRight size={13} />
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Deploy() {
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const code = `import { RelayAgent } from '@relay-ai/react'\n\nexport default function Support() {\n  return (\n    <RelayAgent\n      agentId="agt_northstar_01"\n      apiKey="rly_live_••••••••"\n    />\n  )\n}`
  return (
    <div className="content-container deploy-page">
      <PageHeader
        eyebrow="INBOUND QUALIFIER / DEPLOY"
        title="Put it to work."
        description="Your agent is ready when you are. Start with a private test or ship it to your product."
        actions={
          <Button icon={<ArrowUpRight size={15} />}>Open SDK docs</Button>
        }
      />
      <div className="deploy-grid">
        <section className="card deploy-status-card">
          <div className="deploy-status-top">
            <div>
              <span className="eyebrow">PUBLISH STATUS</span>
              <h3>Inbound qualifier</h3>
            </div>
            <StatusBadge status="ready" />
          </div>
          <div className="publish-line">
            <span className="publish-dot" />
            <span />
            <span className="publish-dot" />
            <span />
            <span className="publish-dot muted" />
          </div>
          <div className="publish-labels">
            <span>Draft saved</span>
            <span>Published</span>
            <span>Production</span>
          </div>
          <div className="deploy-note">
            <span className="signal-dot" />
            <span>
              <strong>Ready to publish</strong>
              <small>
                Your agent has a knowledge base and passed its latest test.
              </small>
            </span>
            <Button onClick={() => setCopied(true)}>Publish agent</Button>
          </div>
        </section>
        <section className="card key-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">AUTHENTICATION</span>
              <h3>API key</h3>
            </div>
            <LockKeyhole size={17} className="muted-icon" />
          </div>
          <p>
            Use this key to authenticate requests from your server or embed.
          </p>
          <div className="key-field">
            <code>
              {revealed
                ? "rly_live_7c1a0b8e4f2d9a31"
                : "rly_live_••••••••••••••••"}
            </code>
            <button
              className="icon-button"
              onClick={() => setRevealed(!revealed)}
            >
              {revealed ? <UserRound size={15} /> : <LockKeyhole size={15} />}
            </button>
            <button
              className="icon-button"
              onClick={() => {
                navigator.clipboard?.writeText("rly_live_7c1a0b8e4f2d9a31")
                setCopied(true)
              }}
              aria-label="Copy API key"
            >
              <Copy size={15} />
            </button>
          </div>
          <div className="key-footer">
            <span>Created Aug 28, 2026</span>
            <button className="text-button">Rotate key</button>
          </div>
        </section>
        <section className="card code-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">REACT SDK</span>
              <h3>Embed your agent</h3>
            </div>
            <button
              className="copy-code"
              onClick={() => {
                navigator.clipboard?.writeText(code)
                setCopied(true)
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy code"}
            </button>
          </div>
          <p>Add the SDK to your app and render the agent in any React view.</p>
          <pre>
            <code>{code}</code>
          </pre>
          <div className="code-footer">
            <span>
              <span className="status-ping">
                <span /> Production ready
              </span>
            </span>
            <button className="text-button">
              Read the docs <ArrowUpRight size={13} />
            </button>
          </div>
        </section>
        <aside className="deploy-next">
          <div className="deploy-next-icon">
            <Code2 size={18} />
          </div>
          <h3>Build with Relay</h3>
          <p>
            Explore the API reference, SDK methods, and examples for a tailored
            integration.
          </p>
          <button className="text-button">
            Explore the docs <ArrowUpRight size={13} />
          </button>
        </aside>
      </div>
    </div>
  )
}

export function AuthScreen({
  onBack,
  onSuccess,
  initialMode = "signup",
}: {
  onBack: () => void
  onSuccess: () => void
  initialMode?: "login" | "signup"
}) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode)
  const setSession = useAuthStore((state) => state.setSession)
  const authForm = useForm({
    defaultValues: { email: "", name: "", password: "" },
    validators: {
      onSubmit: ({ value }) => {
        const result =
          mode === "signup"
            ? signupSchema.safeParse(value)
            : loginSchema.safeParse(value)
        return result.success ? undefined : result.error.issues[0]?.message
      },
    },
    onSubmit: ({ value }) => {
      const result =
        mode === "signup"
          ? signupSchema.safeParse(value)
          : loginSchema.safeParse(value)
      if (result.success) {
        setSession({
          id: "usr_jordan",
          name: value.name || "Jordan Davis",
          email: value.email,
        })
        onSuccess()
      }
    },
  })
  return (
    <div className="auth-screen">
      <div className="auth-visual">
        <div className="auth-visual-top">
          <BrandMark />
          <span className="eyebrow">PRIVATE BETA</span>
        </div>
        <div className="auth-statement">
          <span className="signal-dot pulse" />
          <h1>
            Good agents
            <br />
            <em>do the work.</em>
          </h1>
          <p>
            Build a sales or support agent that knows your business, sounds like
            your team, and gets better with every conversation.
          </p>
        </div>
        <div className="auth-visual-bottom">
          <span>Relay / Agent workspace</span>
          <span className="mono">01 — 05</span>
        </div>
      </div>
      <div className="auth-form-side">
        <button className="auth-back" onClick={onBack}>
          <ChevronRight size={15} className="back-arrow" /> Back to workspace
        </button>
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <span className="eyebrow">
              {mode === "signup" ? "CREATE YOUR WORKSPACE" : "WELCOME BACK"}
            </span>
            <h2>
              {mode === "signup" ? "Start building." : "Sign in to Relay."}
            </h2>
            <p>
              {mode === "signup"
                ? "Your first agent is a few thoughtful steps away."
                : "Pick up right where you left off."}
            </p>
          </div>
          <div className="auth-tabs">
            <button
              className={mode === "signup" ? "active" : ""}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Log in
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void authForm.handleSubmit()
            }}
          >
            <authForm.Field
              name="email"
              validators={{
                onBlur: ({ value }) => {
                  const result = authFieldSchemas.email.safeParse(value)
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message
                },
              }}
            >
              {(field) => (
                <Field
                  label="Work email"
                  invalid={
                    field.state.meta.isTouched &&
                    Boolean(field.state.meta.errors[0])
                  }
                >
                  <Input
                    type="email"
                    value={field.state.value}
                    aria-invalid={
                      field.state.meta.isTouched &&
                      Boolean(field.state.meta.errors[0])
                    }
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="you@company.com"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors[0] && (
                    <span className="field-error">
                      {String(field.state.meta.errors[0])}
                    </span>
                  )}
                </Field>
              )}
            </authForm.Field>
            {mode === "signup" && (
              <authForm.Field
                name="name"
                validators={{
                  onBlur: ({ value }) => {
                    const result = authFieldSchemas.name.safeParse(value)
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message
                  },
                }}
              >
                {(field) => (
                  <Field
                    label="Your name"
                    invalid={
                      field.state.meta.isTouched &&
                      Boolean(field.state.meta.errors[0])
                    }
                  >
                    <Input
                      value={field.state.value}
                      aria-invalid={
                        field.state.meta.isTouched &&
                        Boolean(field.state.meta.errors[0])
                      }
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Jordan Davis"
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors[0] && (
                        <span className="field-error">
                          {String(field.state.meta.errors[0])}
                        </span>
                      )}
                  </Field>
                )}
              </authForm.Field>
            )}
            <authForm.Field
              name="password"
              validators={{
                onBlur: ({ value }) => {
                  const result = authFieldSchemas.password.safeParse(value)
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message
                },
              }}
            >
              {(field) => (
                <Field
                  label="Password"
                  invalid={
                    field.state.meta.isTouched &&
                    Boolean(field.state.meta.errors[0])
                  }
                >
                  <Input
                    type="password"
                    value={field.state.value}
                    aria-invalid={
                      field.state.meta.isTouched &&
                      Boolean(field.state.meta.errors[0])
                    }
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="At least 8 characters"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors[0] && (
                    <span className="field-error">
                      {String(field.state.meta.errors[0])}
                    </span>
                  )}
                </Field>
              )}
            </authForm.Field>
            <Button type="submit">
              {mode === "signup" ? "Create workspace" : "Log in"}{" "}
              <ArrowUpRight size={15} />
            </Button>
          </form>
          <div className="auth-divider">
            <span>or continue with</span>
          </div>
          <Button variant="secondary" onClick={onSuccess}>
            <span className="google-mark">G</span> Continue with Google
          </Button>
          <p className="auth-legal">
            By continuing, you agree to Relay’s <button>Terms</button> and{" "}
            <button>Privacy Policy</button>.
          </p>
        </div>
        <div className="auth-form-footer">
          <span>© 2026 Relay, Inc.</span>
          <span>
            Need help? <button>Contact us</button>
          </span>
        </div>
      </div>
    </div>
  )
}

export default App
