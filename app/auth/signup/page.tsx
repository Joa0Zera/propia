'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Sparkles, Mail } from 'lucide-react'
import { supabaseClient, ensureUserAndOrg } from '@/lib/supabase'
import { Button, Card, Input, Label } from '@/components/ui'

export default function SignupPage() {
  const [orgName, setOrgName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { org_name: orgName, full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      try {
        await ensureUserAndOrg(data.session.user.id, email, {
          org_name: orgName,
          full_name: fullName,
        })
        window.location.href = '/admin/dashboard'
        return
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao concluir cadastro')
        setLoading(false)
        return
      }
    }

    setCheckEmail(true)
    setLoading(false)
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gradient px-4">
        <Card className="max-w-sm text-center p-8">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Confirme seu e-mail</h1>
          <p className="text-sm text-slate-600">
            Enviamos um link de confirmação para <strong>{email}</strong>. Clique nele para
            ativar sua conta e acessar o painel.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gradient px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-1.5 font-bold text-xl text-slate-900 mb-8">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          Prop<span className="text-indigo-600">IA</span>
        </Link>

        <Card className="p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">Criar conta</h1>
          <p className="text-sm text-slate-500 mb-6">Cadastre sua imobiliária na PropIA</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome da imobiliária</Label>
              <Input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>

            <div>
              <Label>Seu nome</Label>
              <Input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

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

            <div>
              <Label>Confirmar senha</Label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <p className="mt-4 text-sm text-slate-500 text-center">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-indigo-600 hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
