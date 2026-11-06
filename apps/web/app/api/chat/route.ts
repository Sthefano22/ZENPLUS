import { NextRequest, NextResponse } from 'next/server'
import { CHAT_MAX_CARACTERES, CHAT_MAX_MENSAJES_HISTORIAL } from '@/lib/chat'
import type { ChatSolicitud } from '@/types'



const AI_CHAT_ENDPOINT = process.env.AI_CHAT_ENDPOINT
const AI_CHAT_API_KEY = process.env.AI_CHAT_API_KEY
const TIMEOUT_MS = 30_000

const RESPUESTA_DEMO =
  'Por ahora estoy en modo demo: pronto podré ayudarte a encontrar la propiedad ideal y resolver tus dudas al instante. Mientras tanto, puedes explorar el catálogo desde "Comprar" o "Alquilar", o dejar tu consulta y un asesor ZENPLUS te contactará.'

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(req: NextRequest) {
  let body: Partial<ChatSolicitud> | null = null
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 })
  }

  const { sessionId, mensajes, contexto } = body ?? {}

  if (typeof sessionId !== 'string' || !sessionId || !Array.isArray(mensajes) || mensajes.length === 0) {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 })
  }

  const historial = mensajes
    .filter(
      (m) =>
        m &&
        (m.rol === 'user' || m.rol === 'assistant') &&
        typeof m.contenido === 'string' &&
        m.contenido.trim().length > 0,
    )
    .slice(-CHAT_MAX_MENSAJES_HISTORIAL)
    .map((m) => ({ rol: m.rol, contenido: m.contenido.slice(0, CHAT_MAX_CARACTERES) }))

  if (historial.length === 0 || historial[historial.length - 1].rol !== 'user') {
    return NextResponse.json({ ok: false, error: 'Falta el mensaje del usuario.' }, { status: 400 })
  }

  /* ───── Modo demo ───── */
  if (!AI_CHAT_ENDPOINT) {
    console.log('[chat:mock]', { sessionId, ultimo: historial[historial.length - 1].contenido, contexto })
    await esperar(900) // simula que la IA "está escribiendo"
    return NextResponse.json({ ok: true, data: { reply: RESPUESTA_DEMO, demo: true } })
  }

  /* ───── Proveedor de IA real ───── */
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(AI_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(AI_CHAT_API_KEY ? { Authorization: `Bearer ${AI_CHAT_API_KEY}` } : {}),
      },
      body: JSON.stringify({ sessionId, mensajes: historial, contexto, origen: 'web' }),
      signal: controller.signal,
    })

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: 'El asistente no está disponible.' }, { status: 502 })
    }

    const data = await res.json()
    if (typeof data?.reply !== 'string' || !data.reply) {
      return NextResponse.json({ ok: false, error: 'Respuesta inválida del asistente.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true, data: { reply: data.reply } })
  } catch {
    return NextResponse.json({ ok: false, error: 'No se pudo contactar al asistente.' }, { status: 502 })
  } finally {
    clearTimeout(timeout)
  }
}
