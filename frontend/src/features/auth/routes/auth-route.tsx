import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useAuthStore } from "../store/auth-store"
import { useForm } from "@tanstack/react-form"
import {
  authFieldSchemas,
  loginSchema,
  signupSchema,
} from "../schemas/auth-schema"
import { BrandMark } from "@/components/BrandMark"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { Field } from "@/components/Field"

export function AuthRoute({ mode }: { mode: "login" | "signup" }) {
  const navigate = useNavigate()
  return (
    <AuthScreen
      initialMode={mode}
      onBack={() => void navigate({ to: "/dashboard" })}
      onSuccess={() => void navigate({ to: "/dashboard" })}
    />
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
                <Field label="Work email">
                  <input
                    type="email"
                    value={field.state.value}
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
                  <Field label="Your name">
                    <input
                      value={field.state.value}
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
                <Field label="Password">
                  <input
                    type="password"
                    value={field.state.value}
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
