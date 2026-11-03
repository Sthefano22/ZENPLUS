'use client'

import { useCallback, useEffect, useState } from 'react'

export interface DashboardQuery<T> {
  data: T | null
  loading: boolean
  error: boolean
  retry: () => void
}

/** Carga datos de lib/api-dashboard.ts con estados loading / error y reintento (GAM4-007). */
export function useDashboardQuery<T>(fetcher: () => Promise<T>, deps: unknown[]): DashboardQuery<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let cancelado = false
    setLoading(true)
    setError(false)
    fetcher()
      .then((res) => {
        if (!cancelado) setData(res)
      })
      .catch(() => {
        if (!cancelado) setError(true)
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, intento])

  const retry = useCallback(() => setIntento((n) => n + 1), [])
  return { data, loading, error, retry }
}
