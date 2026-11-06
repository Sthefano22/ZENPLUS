'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import CountUp from '@/components/home/CountUp'
import { STATS } from '@/components/home/data'

// Franja de cristal pegada al borde inferior del hero (colores fijos: va sobre la foto)
export default function HeroStats() {
  const t = useTranslations('home')
  const th = useTranslations('hero')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.8 }}
      className="absolute inset-x-0 bottom-0 z-10 border-t border-white/15 bg-black/35 backdrop-blur-md"
    >
      <a
        href="#explorar"
        aria-label={th('descubre')}
        title={th('descubre')}
        className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-md transition-colors hover:border-[#ffe795] hover:text-[#ffe795]"
      >
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="flex"
        >
          <ChevronDown size={18} strokeWidth={2} aria-hidden="true" />
        </motion.span>
      </a>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-5 px-6 py-6 text-center lg:grid-cols-4 lg:px-10">
        {STATS.map((s) => (
          <div key={s.key} className="border-white/15 lg:border-l lg:first:border-l-0">
            <p className="font-syne text-2xl font-bold text-[#ffe795] lg:text-3xl">
              <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
            </p>
            <p className="mt-1 font-hanken text-xs text-white/75 lg:text-sm">{t(`stats.${s.key}`)}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
