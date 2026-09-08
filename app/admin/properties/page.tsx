'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getProperties } from '@/lib/supabase'
import { Button, Card, Badge } from '@/components/ui'
import type { Organization, Property } from '@/lib/types'

function PropertiesContent({ org }: { org: Organization }) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getProperties(org.id)
      setProperties(data)
      setLoading(false)
    }
    load()
  }, [org.id])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Painel
            </Link>
            <h1 className="text-xl font-semibold text-slate-900 mt-1">Imóveis</h1>
          </div>
          <Link href="/admin/properties/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Adicionar imóvel
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
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
          <Card className="divide-y divide-slate-100">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/admin/properties/${property.id}/edit`}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                <div className="h-14 w-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {property.main_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={property.main_image_url}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Sem foto
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{property.name}</p>
                  <p className="text-sm text-slate-500 truncate">
                    {property.location || 'Sem localização'}
                  </p>
                </div>

                <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                  {property.price
                    ? property.price.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })
                    : 'Sem preço'}
                </p>

                <Badge tone={property.is_active ? 'green' : 'slate'} className="whitespace-nowrap">
                  {property.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </Link>
            ))}
          </Card>
        )}
      </main>
    </div>
  )
}

export default function PropertiesPage() {
  return <ProtectedRoute>{({ org }) => <PropertiesContent org={org} />}</ProtectedRoute>
}
