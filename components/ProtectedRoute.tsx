'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient, getCurrentUser, getCurrentOrg } from '@/lib/supabase'
import { Spinner } from '@/components/ui'
import type { User, Organization } from '@/lib/types'

interface ProtectedRouteProps {
  children: (props: { user: User; org: Organization }) => React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabaseClient.auth.getSession()

      if (!session) {
        router.replace('/auth/login')
        return
      }

      const [currentUser, currentOrg] = await Promise.all([
        getCurrentUser(),
        getCurrentOrg(),
      ])

      if (!currentUser || !currentOrg) {
        router.replace('/auth/login')
        return
      }

      setUser(currentUser)
      setOrg(currentOrg)
      setLoading(false)
    }

    loadSession()

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') router.replace('/auth/login')
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  if (!user || !org) return null

  return <>{children({ user, org })}</>
}
