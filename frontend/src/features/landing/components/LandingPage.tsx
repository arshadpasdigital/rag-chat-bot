import { Link } from "@tanstack/react-router"
import {
  ArrowRight,
  ChevronRight,
  Code2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react"

function LandingBrand() {
  return (
    <Link to="/" className="landing-brand" aria-label="Relay home">
      <span className="landing-brand-symbol">
        <span />
        <span />
        <span />
      </span>
      <span>relay</span>
    </Link>
  )
}

export function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <LandingBrand />
        <nav className="landing-nav-links" aria-label="Public navigation">
          <a href="#product">Product</a>
          <a href="#how-it-works">How it works</a>
          <a href="#developers">Developers</a>
        </nav>
        <div className="landing-nav-actions">
          <Link to="/login" className="landing-login">
            Log in
          </Link>
          <Link to="/signup" className="landing-nav-cta">
            Start building <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="landing-eyebrow">
              <span className="landing-signal" /> AI agent workspace / private
              beta
            </div>
            <h1>
              Give your team an AI agent that <em>knows what to do.</em>
            </h1>
            <p className="landing-hero-description">
              Relay helps founders and ops teams build sales and support agents
              that understand your business, handle the everyday, and know when
              to ask for help.
            </p>
            <div className="landing-hero-actions">
              <Link to="/signup" className="landing-primary-cta">
                Build your first agent <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="landing-secondary-cta">
                <span className="play-mark">↗</span> See how it works
              </a>
            </div>
            <div className="landing-proof">
              <span className="proof-avatars">
                <span>JD</span>
                <span>AK</span>
                <span>SR</span>
              </span>
              <span>Built for teams who have work to get back to.</span>
            </div>
          </div>
          <div className="landing-workbench">
            <div className="workbench-top">
              <span className="eyebrow">LIVE AGENT PREVIEW</span>
              <span className="workbench-status">
                <span /> Running
              </span>
            </div>
            <div className="workbench-agent">
              <span className="workbench-agent-mark">
                <Sparkles size={17} />
              </span>
              <span>
                <strong>Northstar support</strong>
                <small>Support agent · Draft</small>
              </span>
              <span className="workbench-version">v1.4</span>
            </div>
            <div className="workbench-body">
              <div className="workbench-messages">
                <div className="workbench-message agent">
                  <span className="message-mini-mark">R</span>
                  <span>
                    I can help with that. Which part of your plan would you like
                    to change?
                  </span>
                </div>
                <div className="workbench-message user">
                  <span>We need to move two seats to our new team.</span>
                </div>
                <div className="workbench-message agent">
                  <span className="message-mini-mark">R</span>
                  <span>
                    Got it. I found the account and can walk you through the
                    next step.
                  </span>
                </div>
              </div>
              <div className="signal-trace">
                <span className="trace-label">AGENT SIGNAL</span>
                <div className="trace-step active">
                  <span className="trace-icon">
                    <MessageSquareText size={12} />
                  </span>
                  <span>
                    <strong>Understood</strong>
                    <small>Conversation intent</small>
                  </span>
                </div>
                <div className="trace-connector" />
                <div className="trace-step active">
                  <span className="trace-icon">
                    <Upload size={12} />
                  </span>
                  <span>
                    <strong>Retrieved</strong>
                    <small>3 knowledge chunks</small>
                  </span>
                </div>
                <div className="trace-connector" />
                <div className="trace-step">
                  <span className="trace-icon">
                    <ShieldCheck size={12} />
                  </span>
                  <span>
                    <strong>Ready to act</strong>
                    <small>Guardrails checked</small>
                  </span>
                </div>
              </div>
            </div>
            <div className="workbench-footer">
              <span>
                <span className="workbench-bar-fill" /> Context window 72%
              </span>
              <span className="mono">1.2s response</span>
            </div>
          </div>
        </section>

        <section className="landing-quiet-proof">
          <span className="eyebrow">THE WORK SHOULD FEEL SIMPLE</span>
          <p>
            One calm workspace for the parts that matter:{" "}
            <strong>teach it</strong> what you know, <strong>shape</strong> how
            it behaves, and <strong>see</strong> what it does before anyone else
            does.
          </p>
        </section>

        <section className="landing-process" id="how-it-works">
          <div className="landing-section-intro">
            <span className="eyebrow">FROM IDEA TO IMPACT</span>
            <h2>
              Everything your agent needs.
              <br />
              <em>Nothing it doesn’t.</em>
            </h2>
          </div>
          <div className="process-list">
            <div className="process-item">
              <span className="process-index">01</span>
              <span className="process-icon">
                <BookIcon />
              </span>
              <div>
                <h3>Teach it your business</h3>
                <p>
                  Upload a product doc, paste your FAQ, or start with the
                  questions your team answers every day.
                </p>
                <Link to="/agents/new">
                  Add your knowledge <ChevronRight size={14} />
                </Link>
              </div>
            </div>
            <div className="process-item">
              <span className="process-index">02</span>
              <span className="process-icon">
                <Sparkles size={16} />
              </span>
              <div>
                <h3>Shape how it works</h3>
                <p>
                  Set the point of view, guardrails, and simple handoffs your
                  agent should make.
                </p>
                <Link
                  to="/agents/$agentId/builder"
                  params={{ agentId: "inbound-qualifier" }}
                >
                  Open the builder <ChevronRight size={14} />
                </Link>
              </div>
            </div>
            <div className="process-item">
              <span className="process-index">03</span>
              <span className="process-icon">
                <Code2 size={16} />
              </span>
              <div>
                <h3>Test before you ship</h3>
                <p>
                  Have real conversations, inspect the context, and deploy when
                  the answers feel right.
                </p>
                <Link
                  to="/agents/$agentId/playground"
                  params={{ agentId: "inbound-qualifier" }}
                >
                  Try the playground <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-feature-band" id="product">
          <div className="feature-band-copy">
            <span className="eyebrow">MADE FOR THE WHOLE TEAM</span>
            <h2>
              Clear enough for ops.
              <br />
              <em>Powerful enough for developers.</em>
            </h2>
            <p>
              Relay keeps the work legible at every step. No prompt engineering
              degree required, and no black box between a customer question and
              your answer.
            </p>
            <Link to="/signup" className="landing-inline-link">
              Start with a blank workspace <ArrowRight size={14} />
            </Link>
          </div>
          <div className="feature-list">
            <div>
              <span className="feature-list-icon lime">
                <Zap size={15} />
              </span>
              <span>
                <strong>Quick to teach</strong>
                <small>Bring the docs you already have.</small>
              </span>
            </div>
            <div>
              <span className="feature-list-icon amber">
                <MessageSquareText size={15} />
              </span>
              <span>
                <strong>Easy to trust</strong>
                <small>See retrieval and decisions in context.</small>
              </span>
            </div>
            <div>
              <span className="feature-list-icon blue">
                <Code2 size={15} />
              </span>
              <span>
                <strong>Ready to ship</strong>
                <small>Use the SDK when your team is ready.</small>
              </span>
            </div>
          </div>
        </section>

        <section className="landing-developer-note" id="developers">
          <div>
            <span className="eyebrow">WHEN YOU’RE READY FOR MORE</span>
            <h2>
              Start with no code.
              <br />
              <em>Keep the keys.</em>
            </h2>
          </div>
          <div>
            <p>
              Build in the workspace your whole team can understand. When it’s
              time to go deeper, the same agent is ready for your React app.
            </p>
            <Link
              to="/agents/$agentId/deploy"
              params={{ agentId: "inbound-qualifier" }}
              className="landing-inline-link"
            >
              Explore the SDK <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <section className="landing-final-cta">
          <div className="final-cta-mark">
            <span />
            <span />
            <span />
          </div>
          <span className="eyebrow">YOUR NEXT SHIFT STARTS HERE</span>
          <h2>
            Give the busywork
            <br />
            <em>somewhere else to go.</em>
          </h2>
          <Link to="/signup" className="landing-primary-cta">
            Start building for free <ArrowRight size={16} />
          </Link>
          <p>No credit card. No code required.</p>
        </section>
      </main>
      <footer className="landing-footer">
        <LandingBrand />
        <span>Quiet tools for useful agents.</span>
        <span className="mono">© 2026 Relay, Inc.</span>
      </footer>
    </div>
  )
}

function BookIcon() {
  return (
    <span className="book-icon">
      <span />
      <span />
      <span />
    </span>
  )
}
