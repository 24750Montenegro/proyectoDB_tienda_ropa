export function Notice({ type = 'info', children }) {
  if (!children) return null
  return <div className={`notice ${type}`}>{children}</div>
}
