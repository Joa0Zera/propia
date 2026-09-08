'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import PropertyForm from '@/components/PropertyForm'
import { getPropertyById, updateProperty, deleteProperty } from '@/lib/supabase'
import { Button, Spinner } from '@/components/ui'
import type { Organization, Property, PropertyFormData } from '@/lib/types'

function EditPropertyContent({ org, propertyId }: { org: Organization; propertyId: string }) {
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const data = await getPropertyById(propertyId)
      if (!data || data.org_id !== org.id) {
        setNotFound(true)
        return
      }
      setProperty(data)
    }
    load()
  }, [propertyId, org.id])

  async function handleSubmit(data: PropertyFormData) {
    await updateProperty(propertyId, {
      name: data.name,
      description: data.description || null,
      price: data.price === '' ? 0 : data.price,
      down_payment_options: data.down_payment_options,
      parcels_available: data.parcels_available,
      taxes_fees: data.taxes_fees || null,
      location: data.location || null,
      features: data.features,
      images: data.images,
      main_image_url: data.main_image_url || null,
      videos: data.videos,
      ai_context: data.ai_context || null,
      is_active: data.is_active,
    })
    router.push('/admin/properties')
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este imóvel? Essa ação não pode ser desfeita.')) {
      return
    }
    setDeleting(true)
    try {
      await deleteProperty(propertyId)
      router.push('/admin/properties')
    } catch (err) {
      console.error('Erro ao excluir imóvel:', err)
      alert('Não foi possível excluir o imóvel.')
      setDeleting(false)
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <p className="text-slate-600 mb-3">Imóvel não encontrado.</p>
          <Link href="/admin/properties" className="text-sm text-indigo-600 hover:underline font-medium">
            Voltar para a lista de imóveis
          </Link>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200/70">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link
              href="/admin/properties"
              className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar
            </Link>
            <h1 className="text-xl font-semibold text-slate-900 mt-1">{property.name}</h1>
          </div>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Excluindo...' : 'Excluir imóvel'}
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <PropertyForm
          orgId={org.id}
          initialData={property}
          onSubmit={handleSubmit}
          submitLabel="Salvar alterações"
        />
      </main>
    </div>
  )
}

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <ProtectedRoute>
      {({ org }) => <EditPropertyContent org={org} propertyId={id} />}
    </ProtectedRoute>
  )
}
