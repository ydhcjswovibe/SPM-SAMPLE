'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Youtube, 
  Image as ImageIcon, 
  Loader2, 
  Save, 
  Trash2, 
  Upload,
  CheckCircle
} from 'lucide-react'
import type { WeeklyContent } from '@/lib/types'

interface WeekContentEditorProps {
  content: WeeklyContent | null
  weekNumber: number
  onUpdate: (updates: Partial<WeeklyContent>) => Promise<void>
}

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function WeekContentEditor({ content, weekNumber, onUpdate }: WeekContentEditorProps) {
  const [title, setTitle] = useState(content?.title || '')
  const [youtubeUrl, setYoutubeUrl] = useState(content?.youtube_url || '')
  const [description, setDescription] = useState(content?.description || '')
  const [imageUrl, setImageUrl] = useState(content?.image_url || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const youtubeId = youtubeUrl ? extractYoutubeId(youtubeUrl) : null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate({
        title: title || null,
        youtube_url: youtubeUrl || null,
        description: description || null,
        image_url: imageUrl || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.url) {
        setImageUrl(data.url)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor={`title-${weekNumber}`}>Title</Label>
        <Input
          id={`title-${weekNumber}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Enter title for Week ${weekNumber}`}
        />
      </div>

      {/* YouTube URL */}
      <div className="space-y-2">
        <Label htmlFor={`youtube-${weekNumber}`} className="flex items-center gap-2">
          <Youtube className="h-4 w-4 text-red-500" />
          YouTube Video
        </Label>
        <Input
          id={`youtube-${weekNumber}`}
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="Enter YouTube URL or video ID"
        />
        {youtubeId && (
          <Card className="overflow-hidden">
            <div className="aspect-video relative">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={`Week ${weekNumber} video`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Card>
        )}
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-blue-500" />
          Image
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {imageUrl ? (
          <Card className="overflow-hidden">
            <div className="relative aspect-video">
              <img
                src={imageUrl}
                alt={`Week ${weekNumber} image`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-3 flex items-center justify-between bg-muted/50">
              <span className="text-sm text-muted-foreground truncate flex-1">
                {imageUrl.split('/').pop()}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Replace
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload image
                </span>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor={`description-${weekNumber}`}>Description</Label>
        <Textarea
          id={`description-${weekNumber}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description or notes for this week"
          rows={4}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? 'Saved' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
