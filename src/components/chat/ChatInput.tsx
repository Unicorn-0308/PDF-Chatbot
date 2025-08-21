import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onToggleListening?: () => void
  isLoading?: boolean
  isListening?: boolean
  placeholder?: string
  className?: string
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onToggleListening,
  isLoading = false,
  isListening = false,
  placeholder = "Type your message here...",
  className
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className={cn('flex items-end space-x-2', className)}>
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="min-h-[60px] max-h-[200px] resize-none pr-12"
          disabled={isLoading}
        />
        {onToggleListening && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute bottom-2 right-2"
            onClick={onToggleListening}
            disabled={isLoading}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 text-red-500" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      <Button
        onClick={onSend}
        disabled={!value.trim() || isLoading}
        className="mb-[2px]"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
