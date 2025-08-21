import React from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PDFViewerModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  content?: string
  className?: string
}

export function PDFViewerModal({
  isOpen,
  onClose,
  title = 'PDF Source Preview',
  content,
  className
}: PDFViewerModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className={cn(
            'bg-background rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">{title}</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-8 min-h-[600px] shadow-inner">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {content || 'No content available'}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
