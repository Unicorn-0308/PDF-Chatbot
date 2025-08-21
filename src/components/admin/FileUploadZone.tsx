import React, { useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadZoneProps {
  onFileSelect: (files: FileList) => void
  isUploading?: boolean
  accept?: string
  multiple?: boolean
  maxSize?: number
  className?: string
}

export function FileUploadZone({
  onFileSelect,
  isUploading = false,
  accept = '.pdf',
  multiple = true,
  maxSize = 50 * 1024 * 1024, // 50MB default
  className
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isUploading) return
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileSelect(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileSelect(files)
    }
  }

  const formatMaxSize = () => {
    const mb = maxSize / (1024 * 1024)
    return `${mb}MB`
  }

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
        isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => !isUploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      
      <div className="flex flex-col items-center space-y-2">
        {isUploading ? (
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        ) : (
          <Upload className="h-12 w-12 text-muted-foreground" />
        )}
        <p className="text-lg font-medium">
          {isUploading ? 'Uploading...' : 'Drop files here or click to upload'}
        </p>
        <p className="text-sm text-muted-foreground">
          Support for {accept} files up to {formatMaxSize()}
        </p>
      </div>
    </div>
  )
}
