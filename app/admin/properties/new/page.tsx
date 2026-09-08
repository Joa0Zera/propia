'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import PropertyForm from '@/components/PropertyForm'
import { createProperty } from '@/lib/supabase'
import type { Organization, PropertyFormData } from '@/lib/types'

function NewPropertyContent({ org }: { org: Organization }) {
  const router = useRouter()

  async function handleSubmit(data: PropertyFormData) {
    await createProperty({
      org_id: org.id,
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200/70">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href="/admin/properties"
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Link>
          <h1 className="text-xl font-semibold text-slate-900 mt-1">Novo imóvel</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <PropertyForm orgId={org.id} onSubmit={handleSubmit} submitLabel="Criar imóvel" />
      </main>
    </div>
  )
}

export default function NewPropertyPage() {
  return <ProtectedRoute>{({ org }) => <NewPropertyContent org={org} />}</ProtectedRoute>
}
