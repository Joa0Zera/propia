import { NextResponse } from 'next/server'
import { getPropertyByIdPublic, upsertConversation } from '@/lib/supabase'
import { streamChatResponse } from '@/lib/openai'
import type { Message } from '@/lib/types'

export async function POST(req: Request) {
  const { propertyId, orgSlug, visitorSessionId, messages } = await req.json()

  if (
    !propertyId ||
    !orgSlug ||
    !visitorSessionId ||
    !Array.isArray(messages) ||
    messages.length === 0
  ) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const property = await getPropertyByIdPublic(propertyId, orgSlug)
  if (!property) {
    return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let assistantText = ''

      try {
        assistantText = await streamChatResponse(property, messages as Message[], (delta) => {
          controller.enqueue(encoder.encode(delta))
        })
      } catch (err) {
        controller.error(err)
        return
      }

      const updatedMessages: Message[] = [
        ...(messages as Message[]),
        { role: 'assistant', content: assistantText, timestamp: new Date().toISOString() },
      ]

      try {
        await upsertConversation(property.org_id, property.id, visitorSessionId, updatedMessages)
      } catch (err) {
        console.error('Falha ao salvar conversa:', err)
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
