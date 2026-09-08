'use client'

import { useState, FormEvent } from 'react'
import ImageUpload from './ImageUpload'
import { Button, Card, Input, Label, Textarea } from '@/components/ui'
import type { Property, PropertyFormData } from '@/lib/types'

interface PropertyFormProps {
  orgId: string
  initialData?: Property
  onSubmit: (data: PropertyFormData) => Promise<void>
  submitLabel: string
}

function propertyToFormData(property?: Property): PropertyFormData {
  if (!property) {
    return {
      name: '',
      description: '',
      price: '',
      down_payment_options: [],
      parcels_available: [],
      taxes_fees: '',
      location: '',
      features: [],
      images: [],
      main_image_url: '',
      videos: [],
      ai_context: '',
      is_active: true,
    }
  }

  return {
    name: property.name,
    description: property.description || '',
    price: property.price,
    down_payment_options: property.down_payment_options || [],
    parcels_available: property.parcels_available || [],
    taxes_fees: property.taxes_fees || '',
    location: property.location || '',
    features: property.features || [],
    images: property.images || [],
    main_image_url: property.main_image_url || '',
    videos: property.videos || [],
    ai_context: property.ai_context || '',
    is_active: property.is_active,
  }
}

function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export default function PropertyForm({
  orgId,
  initialData,
  onSubmit,
  submitLabel,
}: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>(propertyToFormData(initialData))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Nome do imóvel é obrigatório')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar imóvel')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Informações básicas</h2>

        <div>
          <Label>Nome do imóvel *</Label>
          <Input
            type="text"
            required
            value={formData.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </div>

        <div>
          <Label>Descrição</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => update('description', e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Preço (R$)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                update('price', e.target.value === '' ? '' : Number(e.target.value))
              }
            />
          </div>
          <div>
            <Label>Localização</Label>
            <Input
              type="text"
              value={formData.location}
              onChange={(e) => update('location', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => update('is_active', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="is_active" className="text-sm text-slate-700">
            Imóvel ativo (visível na galeria pública)
          </label>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Fotos</h2>
        <ImageUpload
          orgId={orgId}
          images={formData.images}
          mainImageUrl={formData.main_image_url}
          onImagesChange={(images) => update('images', images)}
          onMainImageChange={(url) => update('main_image_url', url)}
        />
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Condições comerciais</h2>

        <div>
          <Label>
            Opções de entrada <span className="text-slate-400 font-normal">(uma por linha)</span>
          </Label>
          <Textarea
            value={formData.down_payment_options.join('\n')}
            onChange={(e) => update('down_payment_options', linesToArray(e.target.value))}
            rows={3}
            placeholder={'20% de entrada\nEntrada facilitada em até 12x'}
          />
        </div>

        <div>
          <Label>
            Opções de parcelamento <span className="text-slate-400 font-normal">(uma por linha)</span>
          </Label>
          <Textarea
            value={formData.parcels_available.join('\n')}
            onChange={(e) => update('parcels_available', linesToArray(e.target.value))}
            rows={3}
            placeholder={'Até 180x direto com a construtora\nFinanciamento bancário'}
          />
        </div>

        <div>
          <Label>Taxas e impostos</Label>
          <Input
            type="text"
            value={formData.taxes_fees}
            onChange={(e) => update('taxes_fees', e.target.value)}
          />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Diferenciais e mídia</h2>

        <div>
          <Label>
            Diferenciais <span className="text-slate-400 font-normal">(um por linha)</span>
          </Label>
          <Textarea
            value={formData.features.join('\n')}
            onChange={(e) => update('features', linesToArray(e.target.value))}
            rows={3}
            placeholder={'Piscina\nAcademia\nVista para o mar'}
          />
        </div>

        <div>
          <Label>
            Vídeos (links) <span className="text-slate-400 font-normal">(um por linha)</span>
          </Label>
          <Textarea
            value={formData.videos.join('\n')}
            onChange={(e) => update('videos', linesToArray(e.target.value))}
            rows={2}
          />
        </div>
      </Card>

      <Card className="p-6 space-y-2">
        <h2 className="font-semibold text-slate-900">Contexto para a IA</h2>
        <p className="text-sm text-slate-500">
          Informações extras que o assistente virtual deve saber sobre este imóvel (regras
          especiais, argumentos de venda, respostas para objeções comuns, etc). Não aparece
          na página pública.
        </p>
        <Textarea
          value={formData.ai_context}
          onChange={(e) => update('ai_context', e.target.value)}
          rows={5}
        />
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? 'Salvando...' : submitLabel}
      </Button>
    </form>
  )
}
