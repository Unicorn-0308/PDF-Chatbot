import React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Brain, User, ThumbsUp, ThumbsDown, Volume2, Copy, Share2, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    feedback?: 'like' | 'dislike' | null
  }
  onFeedback?: (messageId: string, feedback: 'like' | 'dislike') => void
  onCopy?: (content: string, messageId: string) => void
  onShare?: (content: string) => void
  onSpeak?: (content: string) => void
  copiedId?: string | null
  className?: string
}

export function ChatMessage({
  message,
  onFeedback,
  onCopy,
  onShare,
  onSpeak,
  copiedId,
  className
}: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      <div className={cn(
        'flex space-x-3 max-w-[80%]',
        isUser ? 'flex-row-reverse space-x-reverse' : ''
      )}>
        <Avatar>
          <AvatarFallback>
            {isUser ? <User className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <div className={cn(
            'rounded-lg p-4',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}>
            {!isUser ? (
              <ReactMarkdown
                className="prose prose-sm dark:prose-invert max-w-none"
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "")
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
          
          {/* Action Buttons for Assistant Messages */}
          {!isUser && (
            <div className="flex items-center space-x-2">
              {onFeedback && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onFeedback(message.id, "like")}
                    className={message.feedback === "like" ? "text-green-600" : ""}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onFeedback(message.id, "dislike")}
                    className={message.feedback === "dislike" ? "text-red-600" : ""}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </>
              )}
              {onSpeak && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSpeak(message.content)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
              {onCopy && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopy(message.content, message.id)}
                >
                  {copiedId === message.id ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
              {onShare && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onShare(message.content)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
