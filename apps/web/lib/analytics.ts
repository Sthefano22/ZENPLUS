export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (typeof (window as any).gtag !== 'function') return
  ;(window as any).gtag('event', name, params)
}