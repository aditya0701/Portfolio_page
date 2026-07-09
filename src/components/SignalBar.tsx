export function SignalBar({ className = "" }: { className?: string }) {
  return <div className={`signal-bar ${className}`} aria-hidden="true" />;
}
