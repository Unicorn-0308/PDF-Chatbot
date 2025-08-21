"use client"

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: PDFSource[]
  feedback?: 'like' | 'dislike' | null
}

export interface PDFSource {
  documentId: string
  title: string
  page: number
  content: string
  imageUrl?: string
  relevanceScore?: number
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm ThinkAI, your intelligent assistant. I can help you with questions and provide information based on the uploaded documents. How can I assist you today?",
      timestamp: new Date(),
      sources: []
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId] = useState(generateId())
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Create assistant message placeholder
    const assistantMessageId = generateId()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      sources: []
    }
    setMessages(prev => [...prev, assistantMessage])

    try {
      // Get auth token
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: content,
          conversationId
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Check if response is SSE or JSON
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('text/event-stream')) {
        // Handle SSE streaming
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          let buffer = ''
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  break
                }

                try {
                  const chunk = JSON.parse(data)
                  
                  if (chunk.type === 'token') {
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId
                        ? { ...msg, content: msg.content + chunk.content }
                        : msg
                    ))
                  } else if (chunk.type === 'sources') {
                    const formattedSources: PDFSource[] = chunk.sources.map((s: any) => ({
                      documentId: s.documentId,
                      title: s.filename,
                      page: s.pageNumber,
                      content: s.content,
                      relevanceScore: s.relevanceScore
                    }))
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId
                        ? { ...msg, sources: formattedSources }
                        : msg
                    ))
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e)
                }
              }
            }
          }
        }
      } else {
        // Handle JSON response (demo mode)
        const data = await response.json()
        
        if (data.chunks) {
          for (const chunk of data.chunks) {
            if (chunk.type === 'token') {
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + chunk.content }
                  : msg
              ))
              // Simulate streaming delay
              await new Promise(resolve => setTimeout(resolve, 50))
            } else if (chunk.type === 'sources') {
              const formattedSources: PDFSource[] = chunk.sources.map((s: any) => ({
                documentId: s.documentId,
                title: s.filename,
                page: s.pageNumber,
                content: s.content,
                relevanceScore: s.relevanceScore
              }))
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId
                  ? { ...msg, sources: formattedSources }
                  : msg
              ))
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.info('Message cancelled')
      } else {
        console.error('Chat error:', error)
        toast.error('Failed to send message')
        
        // Remove empty assistant message on error
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [conversationId, isLoading])

  const cancelMessage = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const updateFeedback = useCallback(async (messageId: string, feedback: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ))
    
    // Send feedback to backend
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]

      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messageId,
          feedback
        })
      })
    } catch (error) {
      console.error('Failed to send feedback:', error)
    }
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    cancelMessage,
    updateFeedback,
    conversationId
  }
}
