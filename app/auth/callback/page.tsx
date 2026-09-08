'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient, ensureUserAndOrg } from '@/lib/supabase'
import { Spinner } from '@/components/ui'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)
      const errorDescription = params.get('error_description')

      if (errorDescription) {
        setError(errorDescription)
        return
      }

      const code = params.get('code')
      if (code) {
        const { error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setError(exchangeError.message)
          return
        }
      }

      const {
        data: { session },
      } = await supabaseClient.auth.getSession()

      if (!session) {
        router.replace('/auth/login')
        return
      }

      try {
        await ensureUserAndOrg(session.user.id, session.user.email!, {
          org_name: session.user.user_metadata?.org_name,
          full_name: session.user.user_metadata?.full_name,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao concluir cadastro')
        return
      }

      router.replace('/admin/dashboard')
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gradient px-4">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Não foi possível confirmar seu acesso</p>
          <p className="text-sm text-slate-500">{error}</p>
          <a
            href="/auth/login"
            className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
          >
            Voltar para o login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gradient">
      <Spinner className="h-10 w-10" />
    </div>
  )
}
