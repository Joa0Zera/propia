import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getOrgBySlug, getActiveProperties } from '@/lib/supabase'
import { Card } from '@/components/ui'

interface GalleryPageProps {
  params: Promise<{ org_slug: string }>
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { org_slug } = await params
  const org = await getOrgBySlug(org_slug)
  if (!org) notFound()

  const properties = await getActiveProperties(org.id)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-3">
          {org.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={org.logo_url}
              alt={org.name}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
            />
          )}
          <h1 className="text-xl font-semibold text-slate-900">{org.name}</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {properties.length === 0 ? (
          <p className="text-slate-500 text-center py-20">
            Nenhum imóvel disponível no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link key={property.id} href={`/visit/${org_slug}/${property.id}`}>
                <Card className="group overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="aspect-video bg-slate-100 overflow-hidden">
                    {property.main_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={property.main_image_url}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-slate-900 truncate">{property.name}</h2>
                    {property.location && (
                      <p className="text-sm text-slate-500 truncate">{property.location}</p>
                    )}
                    <p className="mt-2 text-lg font-bold text-indigo-600">
                      {property.price
                        ? property.price.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })
                        : 'Consulte'}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
