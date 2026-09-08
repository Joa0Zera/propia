import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getOrgBySlug, getPropertyByIdPublic } from '@/lib/supabase'
import ChatWidget from '@/components/ChatWidget'
import { Badge, Card } from '@/components/ui'

interface PropertyPageProps {
  params: Promise<{ org_slug: string; property_id: string }>
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { org_slug, property_id } = await params
  const org = await getOrgBySlug(org_slug)
  if (!org) notFound()

  const property = await getPropertyByIdPublic(property_id, org_slug)
  if (!property) notFound()

  const gallery = property.images?.length ? property.images : []

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            href={`/visit/${org_slug}`}
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para {org.name}
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden">
            {property.main_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={property.main_image_url}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                Sem imagem
              </div>
            )}
          </div>

          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {gallery.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`${property.name} - foto ${i + 1}`}
                  className="aspect-square object-cover rounded-xl"
                />
              ))}
            </div>
          )}

          <Card className="p-6 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{property.name}</h1>
              {property.location && (
                <p className="text-slate-500 mt-1">{property.location}</p>
              )}
            </div>

            <p className="text-3xl font-bold text-indigo-600">
              {property.price
                ? property.price.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })
                : 'Consulte'}
            </p>

            {property.description && (
              <p className="text-slate-700 whitespace-pre-wrap">{property.description}</p>
            )}

            {property.features && property.features.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Diferenciais</h3>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature, i) => (
                    <Badge key={i} tone="indigo">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(property.down_payment_options?.length || property.parcels_available?.length) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                {property.down_payment_options && property.down_payment_options.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1 text-sm">Entrada</h3>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {property.down_payment_options.map((opt, i) => (
                        <li key={i}>{opt}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {property.parcels_available && property.parcels_available.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1 text-sm">Parcelamento</h3>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {property.parcels_available.map((opt, i) => (
                        <li key={i}>{opt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {property.taxes_fees && (
              <p className="text-sm text-slate-500 pt-4 border-t border-slate-100">
                Taxas e impostos: {property.taxes_fees}
              </p>
            )}
          </Card>
        </div>

        <div className="lg:sticky lg:top-8 self-start">
          <ChatWidget
            property={property}
            orgSlug={org_slug}
            whatsappNumber={org.whatsapp_number}
          />
        </div>
      </main>
    </div>
  )
}
