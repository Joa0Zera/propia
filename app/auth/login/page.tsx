'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase'
import { Button, Card, Input, Label } from '@/components/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos'
          : signInError.message
      )
      setLoading(false)
      return
    }

    window.location.href = '/admin/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gradient px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-1.5 font-bold text-xl text-slate-900 mb-8">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          Prop<span className="text-indigo-600">IA</span>
        </Link>

        <Card className="p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">Entrar</h1>
          <p className="text-sm text-slate-500 mb-6">Acesse o painel da sua imobiliária</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label>Senha</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-4 text-sm text-slate-500 text-center">
            Não tem conta?{' '}
            <Link href="/auth/signup" className="text-indigo-600 hover:underline font-medium">
              Criar conta
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
