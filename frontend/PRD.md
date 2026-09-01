# Product Requirements Document
## AI Agent Builder Platform — Frontend

| | |
|---|---|
| **Doc owner** | You |
| **Status** | Draft v1.0 |
| **Date** | September 2026 |
| **Related system** | B2B SaaS AI Agent Builder (microservices backend: API Gateway, Auth Service, Notification Service, Task Service) |

---

## 1. Overview

The backend is a microservices-based platform that lets businesses build, deploy, and manage conversational AI agents for sales, support, and lead qualification. Agents are orchestrated with LangChain/LangGraph, use PGVector for knowledge retrieval, support short-term + long-term memory, and are observable through LangSmith. An SDK lets developers embed a finished agent into their own React apps.

This PRD scopes the **frontend web application** — the dashboard businesses and developers use to configure, test, monitor, and export these agents. It does not change or duplicate the backend design; it defines what UI/UX and client-side behavior is needed to expose that backend to end users.

**Assumption:** The frontend talks to the backend exclusively through the **API Gateway** (REST/WebSocket), never directly to internal gRPC services. This assumption should be confirmed with whoever owns the Gateway contract before implementation starts.

---

## 2. Goals

- Let a non-technical business user create a working AI agent (persona, knowledge base, guardrails) without writing code.
- Let a developer test, debug, and embed that agent into their own product via the SDK.
- Surface memory, retrieval, and latency behavior transparently, so trust in the agent's answers is easy to verify.
- Keep time-to-first-working-agent low (target: under 10 minutes for a simple FAQ agent).

### Success Metrics (proposed — confirm with stakeholders)
- % of new accounts that publish at least one agent within 24 hours of signup.
- Median time from "create agent" to "first successful test conversation."
- % of agents with a knowledge base attached (proxy for adoption of core value prop).
- SDK embed completion rate (accounts that generate an embed snippet and actually use it).

---

## 3. Target Users / Personas

| Persona | Role | Primary need |
|---|---|---|
| **Founder/Ops owner** | Non-technical, sets up sales/support agent | Fast, guided agent creation; no code |
| **Developer/Integrator** | Technical, embeds agent in company product | SDK docs, API keys, embed code, debugging tools |
| **Support/Ops manager** | Maintains knowledge base, monitors quality | Easy KB upload, conversation review, escalation visibility |

---

## 4. Scope

### In scope (MVP)
- Auth (signup, login, session handling via Auth Service)
- Agent list / dashboard
- Agent builder (persona, prompt, model settings, worker-agent delegation config)
- Knowledge base upload & management (FAQ/doc upload, indexing status)
- Conversation test/playground (chat UI against a draft agent)
- Memory inspector (short-term thread view + long-term facts view)
- Observability panel (LangSmith trace links, latency, error rate)
- Notification preferences (email alerts config)
- SDK/embed page (API key + snippet generator)

### Out of scope for this PRD (flag as open questions)
- Billing/subscription UI (standard SaaS need, not mentioned in source material — confirm if required)
- Team/role-based permissions beyond a single owner
- Multi-language/localization
- White-labeling of the embedded widget

---

## 5. Information Architecture

```
/login, /signup                     — Auth
/dashboard                          — Agent list, quick stats
/agents/new                         — Agent creation wizard
/agents/:id/builder                 — Agent config (persona, prompt, workers)
/agents/:id/knowledge-base          — Upload/manage docs, indexing status
/agents/:id/playground              — Live chat test + memory inspector
/agents/:id/observability           — Traces, latency, error logs (LangSmith)
/agents/:id/deploy                  — SDK key + embed snippet
/settings/notifications             — Email/notification preferences
/settings/account                   — Profile, API keys
```

---

## 6. Feature Requirements

Each feature below includes user stories and acceptance criteria so it can be built and QA'd directly.

### 6.1 Authentication & Onboarding
**User story:** As a new user, I can sign up, log in, and land on a dashboard, so my session is secure and scoped to my org.

- Signup/login forms call the **Auth Service** via the Gateway; store session token (httpOnly cookie preferred over localStorage).
- Handle token expiry/refresh gracefully (silent refresh or forced re-login).
- First-time users see an empty-state dashboard with a "Create your first agent" CTA.

**Acceptance criteria:**
- Invalid credentials show inline error, not a generic failure.
- Authenticated routes redirect to `/login` if session is invalid/expired.

### 6.2 Dashboard
**User story:** As a user, I can see all my agents, their status, and basic health at a glance.

- List of agents: name, status (draft/live/paused), last edited, quick test-conversation count.
- Empty state + "New Agent" CTA.

### 6.3 Agent Builder
**User story:** As a business owner, I can configure an agent's persona, instructions, and behavior without writing code.

- Form/step sections for: agent name & purpose (sales/support/lead-qual), system prompt/persona, model/temperature settings, guardrails.
- **Worker agent delegation:** UI to define sub-agents or tasks the primary agent can hand off to (reflects LangGraph multi-agent design). Simple version: a list of "delegate tasks" with name + description; advanced version: a visual flow/graph editor.
- Autosave drafts; explicit "Publish" action to make an agent live.

**Acceptance criteria:**
- Unsaved changes are preserved (draft state) if the user navigates away.
- Publishing is a distinct, confirmable action (not silent).

### 6.4 Knowledge Base Management
**User story:** As an ops manager, I can upload FAQs/product docs so the agent can answer accurately.

- File upload (PDF, doc, plain text, or pasted FAQ pairs).
- Indexing status per file: queued → embedding → ready → failed (reflects PGVector ingestion pipeline running async).
- Ability to delete/re-index a document.
- Search/preview: let the user query the KB directly to sanity-check retrieval before testing the full agent.

**Acceptance criteria:**
- Failed indexing shows a reason and a retry action, not a silent drop.
- Large files show upload progress.

### 6.5 Conversation Playground (Test Chat)
**User story:** As a builder, I can chat with my draft agent to test it before publishing.

- Real-time chat UI (WebSocket or SSE connection through the Gateway to the Task Service).
- Streaming responses (token-by-token) if the backend supports streaming.
- Ability to reset the conversation (clear short-term memory) mid-test.
- Inline indicator when the agent is retrieving from the knowledge base or delegating to a worker agent.

**Acceptance criteria:**
- Connection drops show a reconnect state, not a stuck spinner.
- Each test message is timestamped and viewable in a scrollback.

### 6.6 Memory Inspector
**User story:** As a builder, I can see what the agent remembers, so I can debug wrong or confusing answers.

- **Short-term:** current conversation's active context (what's in the working window).
- **Long-term:** stored user facts/preferences retrieved from the vector store, shown as a simple list (fact + source + timestamp), with the ability to manually delete an incorrect stored fact.

**Acceptance criteria:**
- Distinct visual separation between short-term (session-scoped) and long-term (persistent) memory.

### 6.7 Observability Panel
**User story:** As a developer, I can see latency, errors, and traces for agent runs so I can debug performance issues.

- Table/list of recent runs: timestamp, latency, status (success/error), token usage if available.
- Link-out (or embedded view) to the corresponding **LangSmith** trace for deep debugging.
- Basic filters: date range, status, agent version.

### 6.8 SDK / Deploy Page
**User story:** As a developer, I can grab an API key and embed snippet to drop this agent into my React app.

- Generate/rotate API key (scoped per agent).
- Copyable embed code snippet (React component usage example).
- Link to SDK docs.
- Simple environment selector if draft vs. published agents use different keys.

### 6.9 Notification Settings
**User story:** As a user, I can control what emails I get (handled by the Notification Service).

- Toggle list: e.g., "agent published," "knowledge base indexing failed," "weekly usage summary."

---

## 7. Non-Functional Requirements

- **Responsiveness:** desktop-first (this is a builder/ops tool), but must be usable on tablet widths.
- **Performance:** playground chat should feel real-time; first token latency should be visibly communicated (typing indicator) rather than left blank.
- **Accessibility:** forms and chat UI should meet WCAG 2.1 AA basics (keyboard nav, contrast, ARIA labels on dynamic chat regions).
- **Security:** no sensitive tokens in localStorage; API keys shown once or masked with a reveal action; all authenticated calls carry the session token via the Gateway.
- **Resilience:** every async operation (upload, indexing, publish, chat) needs a visible loading, success, and error state — nothing should silently do nothing.

---

## 8. Technical Notes for Implementation

- **Suggested stack:** React (matches the SDK's embed target, so builder UI and embeddable widget can share components/design tokens), TypeScript, a data-fetching layer (e.g., React Query) for the REST calls through the Gateway, WebSocket/SSE client for the playground.
- **State to manage globally:** auth/session, active agent being edited, KB indexing status (polling or push updates).
- **Real-time needs:** playground chat and KB indexing status both benefit from push updates (WebSocket) rather than polling, if the Gateway supports it; polling is an acceptable fallback for MVP.
- **Component reuse:** the chat UI built for the playground should be built as a reusable component, since it's conceptually the same UI the SDK embeds into third-party React apps.

---

## 9. Open Questions

1. Does the API Gateway expose REST, GraphQL, or both to the frontend? (affects data-fetching layer choice)
2. Is billing/subscription management in scope for MVP?
3. Is there multi-user/team access per account, or single-owner only for now?
4. How is the LangSmith trace view surfaced — deep link out, or embedded via an API?
5. What's the max file size/type support for knowledge base uploads?

---

## 10. Suggested Phasing

**Phase 1 (MVP):** Auth, Dashboard, Agent Builder (basic, no visual graph editor), Knowledge Base upload, Playground, Deploy/SDK page.
**Phase 2:** Memory Inspector, Observability panel, Notification settings.
**Phase 3:** Visual worker-agent delegation graph editor, team permissions, billing.