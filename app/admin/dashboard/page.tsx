'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, CheckCircle2, MessageCircleMore, Star, Plus, LogOut } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { supabaseClient, getProperties, getConversations } from '@/lib/supabase'
import { Button, Card, Badge } from '@/components/ui'
import type { User, Organization, Property, Conversation } from '@/lib/types'

function DashboardContent({ user, org }: { user: User; org: Organization }) {
  const [properties, setProperties] = useState<Property[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [props, convs] = await Promise.all([
        getProperties(org.id),
        getConversations(org.id),
      ])
      setProperties(props)
      setConversations(convs)
      setLoading(false)
    }
    loadData()
  }, [org.id])

  async function handleLogout() {
    await supabaseClient.auth.signOut()
    window.location.href = '/auth/login'
  }

  const activeCount = properties.filter((p) => p.is_active).length
  const qualifiedCount = conversations.filter((c) => c.lead_qualified).length

  const stats = [
    { label: 'Imóveis', value: properties.length, icon: Building2, tone: 'text-slate-900' },
    { label: 'Ativos', value: activeCount, icon: CheckCircle2, tone: 'text-slate-900' },
    { label: 'Conversas', value: conversations.length, icon: MessageCircleMore, tone: 'text-slate-900' },
    { label: 'Leads qualificados', value: qualifiedCount, icon: Star, tone: 'text-indigo-600' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-slate-900">{org.name}</h1>
            <p className="text-sm text-slate-500">Olá, {user.full_name || user.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <stat.icon className="h-4 w-4" />
                <p className="text-sm">{stat.label}</p>
              </div>
              <p className={`text-2xl font-bold ${stat.tone}`}>{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Imóveis</h2>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/properties"
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Ver todos
            </Link>
            <Link href="/admin/properties/new">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Adicionar imóvel
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Carregando...</p>
        ) : properties.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-500 mb-3">Você ainda não cadastrou nenhum imóvel.</p>
            <Link
              href="/admin/properties/new"
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Cadastrar o primeiro imóvel
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.slice(0, 6).map((property) => (
              <Link key={property.id} href={`/admin/properties/${property.id}/edit`}>
                <Card className="p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <p className="font-medium text-slate-900 truncate">{property.name}</p>
                    <Badge tone={property.is_active ? 'green' : 'slate'}>
                      {property.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {property.price
                      ? property.price.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })
                      : 'Sem preço'}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div>
          <h2 className="font-semibold text-slate-900 mb-4">Conversas recentes</h2>
          {loading ? (
            <p className="text-sm text-slate-400">Carregando...</p>
          ) : conversations.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-500">Nenhuma conversa registrada ainda.</p>
            </Card>
          ) : (
            <Card className="divide-y divide-slate-100">
              {conversations.slice(0, 10).map((conv) => {
                const property = properties.find((p) => p.id === conv.property_id)
                return (
                  <div key={conv.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {conv.visitor_name || 'Visitante anônimo'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {property?.name || 'Imóvel removido'}
                      </p>
                    </div>
                    {conv.lead_qualified && <Badge tone="indigo">Qualificado</Badge>}
                  </div>
                )
              })}
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      {({ user, org }) => <DashboardContent user={user} org={org} />}
    </ProtectedRoute>
  )
}
