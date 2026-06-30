// Inline alert message with a tone variant.
export default function Alert({ tone = 'info', title, children }) {
  return (
    <div className={`alert alert-${tone}`} role="alert">
      {title && <div className="alert-title">{title}</div>}
      {children && <div className="alert-body">{children}</div>}
    </div>
  )
}
