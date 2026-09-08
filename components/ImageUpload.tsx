'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Star, X } from 'lucide-react'
import { uploadImage, deleteImage } from '@/lib/supabase'
import { Button } from '@/components/ui'

interface ImageUploadProps {
  orgId: string
  images: string[]
  mainImageUrl: string
  onImagesChange: (images: string[]) => void
  onMainImageChange: (url: string) => void
}

export default function ImageUpload({
  orgId,
  images,
  mainImageUrl,
  onImagesChange,
  onMainImageChange,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const url = await uploadImage(file, orgId)
        uploaded.push(url)
      }

      const updatedImages = [...images, ...uploaded]
      onImagesChange(updatedImages)

      if (!mainImageUrl && uploaded.length > 0) {
        onMainImageChange(uploaded[0])
      }
    } catch (err) {
      console.error('Erro ao enviar imagem:', err)
      alert('Não foi possível enviar uma ou mais imagens.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemove(url: string) {
    const updatedImages = images.filter((img) => img !== url)
    onImagesChange(updatedImages)

    if (mainImageUrl === url) {
      onMainImageChange(updatedImages[0] || '')
    }

    try {
      await deleteImage(url)
    } catch (err) {
      console.error('Erro ao remover imagem do storage:', err)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <ImagePlus className="h-4 w-4" />
          {uploading ? 'Enviando...' : 'Adicionar fotos'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />
        <p className="text-xs text-slate-400">Clique numa foto para definir como capa</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((url) => (
            <div
              key={url}
              className={`relative aspect-square rounded-xl overflow-hidden ring-2 cursor-pointer group ${
                url === mainImageUrl ? 'ring-indigo-600' : 'ring-transparent'
              }`}
              onClick={() => onMainImageChange(url)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              {url === mainImageUrl && (
                <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 text-[10px] font-medium bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">
                  <Star className="h-2.5 w-2.5 fill-white" />
                  Capa
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(url)
                }}
                className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
