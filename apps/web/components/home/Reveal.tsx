'use client'

import { motion, useReducedMotion } from 'motion/react'

interface RevealProps {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}

// Aparece con un fade-up suave al entrar en pantalla (respeta "reducir movimiento")
export default function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  const reducir = useReducedMotion()
  if (reducir) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
