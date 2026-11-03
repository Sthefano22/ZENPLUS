'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'

interface CountUpProps {
  to: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
}

// Cuenta desde 0 hasta el valor real al entrar en pantalla. Sin JS o con
// "reducir movimiento" se ve directamente el valor final.
export default function CountUp({ to, decimals = 0, prefix = '', suffix = '', duration = 1.8 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const visible = useInView(ref, { once: true })
  const reducir = useReducedMotion()
  const [valor, setValor] = useState(to)

  useEffect(() => {
    if (!visible || reducir) return
    const controles = animate(0, to, { duration, ease: 'easeOut', onUpdate: (v) => setValor(v) })
    return () => controles.stop()
  }, [visible, reducir, to, duration])

  return (
    <span ref={ref}>
      {prefix}
      {valor.toFixed(decimals)}
      {suffix}
    </span>
  )
}
