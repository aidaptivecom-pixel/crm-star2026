import { useState, useRef, useCallback } from 'react'
import { X, GripVertical, ImagePlus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface ProjectImageManagerProps {
  projectId: string
  projectSlug: string
  images: string[]
  onImagesChange: (images: string[]) => void
  readOnly?: boolean
}

export function ProjectImageManager({ projectSlug, images, onImagesChange, readOnly = false }: ProjectImageManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [previewIndex, setPreviewIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    if (!supabase) return
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (fileArray.length === 0) return

    setUploading(true)
    const newUrls: string[] = []

    for (const file of fileArray) {
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `${projectSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || supabaseAnonKey

      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/project-images/${fileName}`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': file.type,
          'x-upsert': 'true',
        },
        body: file,
      })

      if (uploadRes.ok) {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/project-images/${fileName}`
        newUrls.push(publicUrl)
      } else {
        console.error('Upload error:', await uploadRes.text())
      }
    }

    if (newUrls.length > 0) {
      const updated = [...images, ...newUrls]
      onImagesChange(updated)
    }
    setUploading(false)
  }, [images, onImagesChange, projectSlug])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }, [uploadFiles])

  const removeImage = useCallback(async (index: number) => {
    const url = images[index]
    // Try to delete from storage
    if (supabase && url.includes('project-images')) {
      const path = url.split('/project-images/')[1]
      if (path) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token || supabaseAnonKey

        await fetch(`${supabaseUrl}/storage/v1/object/project-images/${decodeURIComponent(path)}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    }
    const updated = images.filter((_, i) => i !== index)
    onImagesChange(updated)
    if (previewIndex >= updated.length) setPreviewIndex(Math.max(0, updated.length - 1))
  }, [images, onImagesChange, previewIndex])

  const moveImage = useCallback((from: number, to: number) => {
    if (to < 0 || to >= images.length) return
    const updated = [...images]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    onImagesChange(updated)
    setPreviewIndex(to)
  }, [images, onImagesChange])

  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex !== null && dragIndex !== index) {
      moveImage(dragIndex, index)
      setDragIndex(index)
    }
  }
  const handleDragEnd = () => setDragIndex(null)

  if (readOnly && images.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Preview of current/main image */}
      {images.length > 0 && (
        <div className="relative rounded-lg overflow-hidden bg-gray-100 h-48">
          <img
            src={images[previewIndex] || images[0]}
            alt={`Foto ${previewIndex + 1}`}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setPreviewIndex(i => i > 0 ? i - 1 : images.length - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewIndex(i => i < images.length - 1 ? i + 1 : 0)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPreviewIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === previewIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {previewIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {!readOnly && (
        <>
          {/* Thumbnail grid with reorder */}
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((url, index) => (
                <div
                  key={url + index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOverItem(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setPreviewIndex(index)}
                  className={`relative group rounded-lg overflow-hidden cursor-grab active:cursor-grabbing border-2 transition-colors aspect-square ${
                    index === previewIndex ? 'border-[#D4A745]' : 'border-transparent hover:border-gray-300'
                  } ${index === 0 ? 'ring-2 ring-[#D4A745]/30' : ''}`}
                >
                  <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  {index === 0 && (
                    <div className="absolute top-0.5 left-0.5 bg-[#D4A745] text-white text-[10px] px-1 rounded">
                      Principal
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <GripVertical className="w-4 h-4 text-white" />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(index) }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-[#D4A745] bg-[#D4A745]/5' : 'border-gray-300 hover:border-[#D4A745] hover:bg-gray-50'
            }`}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Subiendo...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <ImagePlus className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-500">
                  Arrastrá fotos o hacé click para subir
                </span>
                <span className="text-xs text-gray-400">JPG, PNG, WebP</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            />
          </div>
        </>
      )}
    </div>
  )
}
