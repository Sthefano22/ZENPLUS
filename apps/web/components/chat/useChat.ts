'use client'

import { useCallback, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { sendChatMessage } from '@/lib/api'
import { CHAT_MAX_CARACTERES, CHAT_SALUDO, CHAT_SALUDO_ID, crearId } from '@/lib/chat'
import type { ChatMensaje } from '@/types'

function crearSaludo(): ChatMensaje {
  return { id: CHAT_SALUDO_ID, rol: 'assistant', contenido: CHAT_SALUDO, creadoEn: Date.now() }
}


export function useChat() {
  const pathname = usePathname()
  const [mensajes, setMensajes] = useState<ChatMensaje[]>(() => [crearSaludo()])
  const [enviando, setEnviando] = useState(false)

  const sessionIdRef = useRef('')
  const enviandoRef = useRef(false)
  const mensajesRef = useRef<ChatMensaje[]>(mensajes)

  const actualizar = useCallback((lista: ChatMensaje[]) => {
    mensajesRef.current = lista
    setMensajes(lista)
  }, [])

  const enviar = useCallback(
    async (texto: string) => {
      const contenido = texto.trim().slice(0, CHAT_MAX_CARACTERES)
      if (!contenido || enviandoRef.current) return

      if (!sessionIdRef.current) sessionIdRef.current = crearId()
      const sessionId = sessionIdRef.current

      const usuario: ChatMensaje = { id: crearId(), rol: 'user', contenido, creadoEn: Date.now() }
      const conversacion = [...mensajesRef.current.filter((m) => !m.error), usuario]
      actualizar(conversacion)

      enviandoRef.current = true
      setEnviando(true)

      const res = await sendChatMessage({
        sessionId,

        mensajes: conversacion
          .filter((m) => m.id !== CHAT_SALUDO_ID)
          .map(({ rol, contenido }) => ({ rol, contenido })),
        contexto: { pathname: pathname ?? undefined },
      })


      if (sessionIdRef.current !== sessionId) return

      const respuesta: ChatMensaje =
        res.ok && res.data
          ? { id: crearId(), rol: 'assistant', contenido: res.data.reply, creadoEn: Date.now() }
          : {
              id: crearId(),
              rol: 'assistant',
              contenido: res.error ?? 'No pude responder en este momento.',
              creadoEn: Date.now(),
              error: true,
            }

      actualizar([...mensajesRef.current, respuesta])
      enviandoRef.current = false
      setEnviando(false)
    },
    [actualizar, pathname],
  )

  const reintentar = useCallback(() => {
    const lista = mensajesRef.current.filter((m) => !m.error)
    const ultimo = lista[lista.length - 1]
    if (!ultimo || ultimo.rol !== 'user') return
    actualizar(lista.slice(0, -1))
    enviar(ultimo.contenido)
  }, [actualizar, enviar])

  const reiniciar = useCallback(() => {
    sessionIdRef.current = ''
    enviandoRef.current = false
    setEnviando(false)
    actualizar([crearSaludo()])
  }, [actualizar])

  return { mensajes, enviando, enviar, reintentar, reiniciar }
}