'use client'

import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { MessageCircleMore, Send } from 'lucide-react'
import type { Message, Property } from '@/lib/types'

interface ChatWidgetProps {
  property: Property
  orgSlug: string
  whatsappNumber: string | null
}

function getVisitorSessionId(): string {
  const key = 'propia_visitor_session_id'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = uuidv4()
    sessionStorage.setItem(key, id)
  }
  return id
}

function buildWhatsappLink(whatsappNumber: string, property: Property): string {
  const text = `Olá! Vim pelo chat do imóvel "${property.name}" e quero saber mais.`
  const digits = whatsappNumber.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

export default function ChatWidget({ property, orgSlug, whatsappNumber }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Olá! Sou o assistente virtual do imóvel "${property.name}". Posso te ajudar com informações sobre preço, condições de pagamento, localização e diferenciais. O que você gostaria de saber?`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const visitorSessionIdRef = useRef<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    visitorSessionIdRef.current = getVisitorSessionId()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    const historyForRequest = [...messages, userMessage]

    setMessages(historyForRequest)
    setInput('')
    setSending(true)

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', timestamp: new Date().toISOString() },
    ])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          orgSlug,
          visitorSessionId: visitorSessionIdRef.current,
          messages: historyForRequest,
        }),
      })

      if (!res.body) throw new Error('Sem resposta do servidor')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          updated[updated.length - 1] = { ...last, content: last.content + chunk }
          return updated
        })
      }
    } catch (err) {
      console.error('Erro no chat:', err)
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Desculpe, tive um problema para responder agora. Tente novamente.',
          timestamp: new Date().toISOString(),
        }
        return updated
      })
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-lg ring-1 ring-slate-200/70 overflow-hidden">
      <div className="px-4 py-3 bg-brand-solid-gradient text-white flex items-center gap-2">
        <MessageCircleMore className="h-5 w-5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold truncate">Fale com o assistente virtual</p>
          <p className="text-xs text-indigo-100 truncate">{property.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}
            >
              {msg.content || (sending && i === messages.length - 1 ? '...' : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {whatsappNumber && (
        <div className="px-4 pb-2">
          <a
            href={buildWhatsappLink(whatsappNumber, property)}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 ring-1 ring-inset ring-emerald-200 rounded-xl py-2 transition-colors"
          >
            Falar direto com o corretor no WhatsApp
          </a>
        </div>
      )}

      <div className="p-3 border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          placeholder="Digite sua pergunta..."
          className="flex-1 rounded-xl border-0 ring-1 ring-inset ring-slate-200 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 transition-shadow"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors flex items-center gap-1.5"
        >
          <Send className="h-4 w-4" />
          Enviar
        </button>
      </div>
    </div>
  )
}
