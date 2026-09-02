import { Link, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useAuthStore } from "../store/auth-store"
import { useForm } from "@tanstack/react-form"
import {
  authFieldSchemas,
  loginSchema,
  signupSchema,
} from "../schemas/auth-schema"
import { BrandMark } from "@/components/BrandMark"
import { Button } from "@/components/ui/button"
import {
  Field as ShadcnField,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { ArrowUpRight, ChevronRight, MailCheck } from "lucide-react"
import { Field } from "@/components/Field"

type AuthMode = "login" | "signup"
type AuthStep = "credentials" | "verify"

const OTP_LENGTH = 6
const OTP_RESEND_DELAY_SECONDS = 60

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
}

export function AuthRoute({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate()
  return (
    <AuthScreen
      mode={mode}
      onBack={() => void navigate({ to: "/dashboard" })}
      onSuccess={() => void navigate({ to: "/dashboard" })}
    />
  )
}

export function AuthScreen({
  mode,
  onBack,
  onSuccess,
}: {
  mode: AuthMode
  onBack: () => void
  onSuccess: () => void
}) {
  const setSession = useAuthStore((state) => state.setSession)
  const [step, setStep] = useState<AuthStep>("credentials")
  const [verificationEmail, setVerificationEmail] = useState("")
  const [verificationName, setVerificationName] = useState("")
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [countdown, setCountdown] = useState(OTP_RESEND_DELAY_SECONDS)
  const [resendTick, setResendTick] = useState(0)
  const [codeMessage, setCodeMessage] = useState(
    "We sent a 6-digit code to your email."
  )

  useEffect(() => {
    if (step !== "verify") return

    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendTick, step])

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

      if (!result.success) return

      setVerificationEmail(value.email)
      setVerificationName(value.name || "Jordan Davis")
      setOtp("")
      setOtpError("")
      setCountdown(OTP_RESEND_DELAY_SECONDS)
      setCodeMessage("We sent a 6-digit code to your email.")
      setStep("verify")
    },
  })

  const handleResend = () => {
    if (countdown > 0) return
    setOtp("")
    setOtpError("")
    setCountdown(OTP_RESEND_DELAY_SECONDS)
    setCodeMessage("A new verification code was sent to your email.")
    setResendTick((current) => current + 1)
  }

  const handleVerificationSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Enter the 6-digit code sent to your email.")
      return
    }

    // Replace this client-side check with the Auth Service verification call.
    setSession({
      id: "usr_jordan",
      name: verificationName,
      email: verificationEmail,
    })
    onSuccess()
  }

  const isSignup = mode === "signup"

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
        <button className="auth-back" onClick={onBack} type="button">
          <ChevronRight size={15} className="back-arrow" /> Back to workspace
        </button>
        <div className="auth-form-wrap">
          {step === "credentials" ? (
            <>
              <div className="auth-form-header">
                <span className="eyebrow">
                  {isSignup ? "CREATE YOUR WORKSPACE" : "WELCOME BACK"}
                </span>
                <h2>{isSignup ? "Start building." : "Sign in to Relay."}</h2>
                <p>
                  {isSignup
                    ? "Your first agent is a few thoughtful steps away."
                    : "Pick up right where you left off."}
                </p>
              </div>
              <nav className="auth-tabs" aria-label="Account access">
                <Link className={isSignup ? "active" : ""} to="/signup">
                  Sign up
                </Link>
                <Link className={!isSignup ? "active" : ""} to="/login">
                  Log in
                </Link>
              </nav>
              <form
                onSubmit={(event) => {
                  event.preventDefault()
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
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        placeholder="you@company.com"
                        autoComplete="email"
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
                {isSignup && (
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
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          onBlur={field.handleBlur}
                          placeholder="Jordan Davis"
                          autoComplete="name"
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
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        placeholder="At least 8 characters"
                        autoComplete={
                          isSignup ? "new-password" : "current-password"
                        }
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
                <Button type="submit" className="auth-submit">
                  {isSignup ? "Create workspace" : "Log in"}
                  <ArrowUpRight data-icon="inline-end" />
                </Button>
              </form>
              <div className="auth-divider">
                <span>or continue with</span>
              </div>
              <Button
                variant="secondary"
                onClick={onSuccess}
                className="auth-google"
              >
                <span className="google-mark">G</span> Continue with Google
              </Button>
              <p className="auth-legal">
                By continuing, you agree to Relay’s <button>Terms</button> and{" "}
                <button>Privacy Policy</button>.
              </p>
            </>
          ) : (
            <>
              <div className="auth-form-header auth-verify-header">
                <span className="auth-verify-icon" aria-hidden="true">
                  <MailCheck />
                </span>
                <span className="eyebrow">CHECK YOUR INBOX</span>
                <h2>Verify your email.</h2>
                <p>
                  Enter the code we sent to <strong>{verificationEmail}</strong>
                  .
                </p>
              </div>
              <form
                onSubmit={handleVerificationSubmit}
                className="auth-verify-form"
              >
                <FieldGroup className="auth-verify-fields">
                  <ShadcnField data-invalid={Boolean(otpError)}>
                    <FieldLabel htmlFor="verification-code">
                      Verification code
                    </FieldLabel>
                    <InputOTP
                      id="verification-code"
                      maxLength={OTP_LENGTH}
                      value={otp}
                      onChange={(value) => {
                        setOtp(value.replace(/\D/g, "").slice(0, OTP_LENGTH))
                        if (otpError) setOtpError("")
                      }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      aria-label="6-digit verification code"
                      aria-invalid={Boolean(otpError)}
                      autoFocus
                    >
                      <InputOTPGroup className="auth-otp-group">
                        {Array.from({ length: OTP_LENGTH }, (_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className="auth-otp-slot"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                    <FieldDescription>{codeMessage}</FieldDescription>
                    <FieldError>{otpError}</FieldError>
                  </ShadcnField>
                </FieldGroup>
                <Button
                  type="submit"
                  className="auth-submit"
                  disabled={otp.length !== OTP_LENGTH}
                >
                  Verify and continue
                  <ArrowUpRight data-icon="inline-end" />
                </Button>
              </form>
              <div className="auth-resend-row" aria-live="polite">
                <span>
                  {countdown > 0
                    ? `Resend code in ${formatCountdown(countdown)}`
                    : "Didn’t receive the code?"}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0}
                >
                  Resend code
                </button>
              </div>
              <button
                type="button"
                className="auth-change-email"
                onClick={() => setStep("credentials")}
              >
                Use a different email
              </button>
            </>
          )}
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
