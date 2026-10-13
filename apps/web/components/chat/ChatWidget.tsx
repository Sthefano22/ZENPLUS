'use client'

import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useChat } from './useChat'
import { trackEvent } from '@/lib/analytics'
import {CHAT_MAX_CARACTERES, CHAT_MODO_DEMO, CHAT_NOMBRE_ASISTENTE, CHAT_SUGERENCIAS} from '@/lib/chat'
import type { ChatMensaje } from '@/types'

/* ───────────── Iconos ───────────── */

const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function IconChat({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M12 7v6M9 10h6" />
    </svg>
  )
}

function IconClose({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function IconSend({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}

function IconRefresh({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}

/* ───────────── Piezas de UI ───────────── */

function Avatar({ size = 36 }: { size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-primary font-syne text-sm font-bold text-on-primary"
      aria-hidden="true"
    >
      Z
    </span>
  )
}

function Burbuja({ mensaje, onReintentar }: { mensaje: ChatMensaje; onReintentar: () => void }) {
  const esUsuario = mensaje.rol === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${esUsuario ? 'justify-end' : 'justify-start'}`}
    >
      {!esUsuario && <Avatar size={28} />}
      <div className="flex max-w-[80%] flex-col items-start gap-1.5">
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 font-hanken text-[14px] leading-relaxed ${
            esUsuario
              ? 'rounded-br-md bg-primary text-on-primary'
              : mensaje.error
                ? 'rounded-bl-md border border-error bg-surface-mid text-error'
                : 'rounded-bl-md bg-surface-high text-on-surface'
          }`}
        >
          {mensaje.contenido}
        </div>
        {mensaje.error && (
          <button
            type="button"
            onClick={onReintentar}
            className="flex items-center gap-1.5 font-hanken text-xs text-primary transition-opacity hover:opacity-80"
          >
            <IconRefresh size={14} /> Reintentar
          </button>
        )}
      </div>
    </motion.div>
  )
}

function Escribiendo() {
  return (
    <div className="flex items-end gap-2" aria-label="El asistente está escribiendo">
      <Avatar size={28} />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-high px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-on-surface-variant"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  )
}

/* ───────────── Widget ───────────── */

export default function ChatWidget() {
  const [abierto, setAbierto] = useState(false)
  const [yaAbierto, setYaAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  const { mensajes, enviando, enviar, reintentar, reiniciar } = useChat()

  const finRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const soloSaludo = mensajes.length === 1


  useEffect(() => {
    if (abierto) finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensajes, enviando, abierto])


  useEffect(() => {
    if (!abierto) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto])


  useEffect(() => {
    if (!abierto) return
    if (!window.matchMedia('(min-width: 640px)').matches) return
    const t = setTimeout(() => inputRef.current?.focus(), 250)
    return () => clearTimeout(t)
  }, [abierto])

  function alternar() {
    setAbierto((v) => {
      const next = !v
      if (next) trackEvent('chat_opened')
      return next
    })
    setYaAbierto(true)
  }

  function ajustarAltura() {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  function enviarTexto(valor: string) {
    if (!valor.trim() || enviando) return
    enviar(valor)
    setTexto('')
    requestAnimationFrame(ajustarAltura)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    enviarTexto(texto)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      enviarTexto(texto)
    }
  }

  const puedeEnviar = texto.trim().length > 0 && !enviando

  return (
    <>
      
      <AnimatePresence>
        {abierto && (
          <motion.div
            role="dialog"
            aria-label={`Chat con ${CHAT_NOMBRE_ASISTENTE}, asistente de ZENPLUS`}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed bottom-24 left-3 right-3 z-[45] flex h-[min(600px,calc(100dvh-8rem))] flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-low shadow-2xl sm:left-auto sm:right-6 sm:w-[400px]"
          >
            
            <div className="flex items-center gap-3 border-b border-outline-variant bg-surface-mid px-4 py-3">
              <Avatar />
              <div className="min-w-0 flex-1">
                <p className="font-syne text-[15px] font-semibold leading-tight text-on-surface">
                  {CHAT_NOMBRE_ASISTENTE}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 font-hanken text-xs text-on-surface-variant">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${CHAT_MODO_DEMO ? 'bg-outline' : 'bg-green-400'}`}
                  />
                  {CHAT_MODO_DEMO ? 'Asistente virtual · Modo demo' : 'Asistente virtual'}
                </p>
              </div>
              <button
                type="button"
                onClick={reiniciar}
                aria-label="Nueva conversación"
                title="Nueva conversación"
                className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
              >
                <IconRefresh />
              </button>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar chat"
                className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
              >
                <IconClose size={18} />
              </button>
            </div>

            
            {CHAT_MODO_DEMO && (
              <p className="border-b border-outline-variant bg-surface px-4 py-2 font-hanken text-xs text-primary">
                Estamos preparando este asistente. Pronto podrás resolver tus dudas al instante.
              </p>
            )}

            
            <div
              role="log"
              aria-live="polite"
              className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4"
            >
              {mensajes.map((m) => (
                <Burbuja key={m.id} mensaje={m} onReintentar={reintentar} />
              ))}

              {soloSaludo && !enviando && (
                <div className="mt-1 flex flex-wrap gap-2 pl-9">
                  {CHAT_SUGERENCIAS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => enviarTexto(s)}
                      className="rounded-full border border-outline-variant px-3.5 py-2 text-left font-hanken text-[13px] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {enviando && <Escribiendo />}
              <div ref={finRef} />
            </div>

            
            <form onSubmit={handleSubmit} className="border-t border-outline-variant bg-surface-mid p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={texto}
                  maxLength={CHAT_MAX_CARACTERES}
                  onChange={(e) => {
                    setTexto(e.target.value)
                    ajustarAltura()
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu mensaje..."
                  aria-label="Escribe tu mensaje"
                  className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-xl border border-outline-variant bg-surface-low px-4 py-2.5 font-hanken text-[14px] text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!puedeEnviar}
                  aria-label="Enviar mensaje"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <IconSend />
                </button>
              </div>
              {!CHAT_MODO_DEMO && (
                <p className="mt-2 text-center font-hanken text-[11px] text-outline">
                  Las respuestas de la IA pueden contener errores. Confirma los datos con un asesor.
                </p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      
      <div className="group fixed bottom-5 right-5 z-[45] sm:bottom-6 sm:right-6">
        {!abierto && (
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-outline-variant bg-surface-mid px-4 py-2 font-hanken text-[13px] text-on-surface opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:block">
            ¿Necesitas ayuda? Chatea con {CHAT_NOMBRE_ASISTENTE}
          </span>
        )}

        {!yaAbierto && (
          <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-30 motion-reduce:animate-none" />
        )}

        <motion.button
          type="button"
          onClick={alternar}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label={abierto ? 'Cerrar chat' : `Abrir chat con ${CHAT_NOMBRE_ASISTENTE}`}
          aria-expanded={abierto}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-xl shadow-black/40"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={abierto ? 'cerrar' : 'abrir'}
              initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              {abierto ? <IconClose /> : <IconChat />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  )
}