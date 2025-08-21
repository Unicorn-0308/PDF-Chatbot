import React from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Maximize2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PDFSourceCardProps {
  source: {
    documentId: string
    title: string
    page: number
    content: string
    relevanceScore?: number
  }
  isExpanded?: boolean
  onToggleExpand?: (documentId: string) => void
  className?: string
}

export function PDFSourceCard({
  source,
  isExpanded,
  onToggleExpand,
  className
}: PDFSourceCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        'border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors',
        className
      )}
      onClick={() => onToggleExpand?.(source.documentId)}
    >
      <div className="flex items-start space-x-2">
        <FileText className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{source.title}</p>
          <p className="text-xs text-muted-foreground">Page {source.page}</p>
          <p className="text-xs mt-1 line-clamp-2">{source.content}</p>
          {source.relevanceScore && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">Relevance:</span>
                <div className="flex-1 bg-secondary rounded-full h-2 max-w-[100px]">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.round(source.relevanceScore * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-primary font-medium">
                  {Math.round(source.relevanceScore * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
        {onToggleExpand && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(source.documentId)
            }}
            className="flex-shrink-0"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
