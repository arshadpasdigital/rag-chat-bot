export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {hint && <small>{hint}</small>}
      </span>
      {children}
    </label>
  )
}
