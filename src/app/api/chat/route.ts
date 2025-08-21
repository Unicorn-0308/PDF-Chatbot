import { NextRequest, NextResponse } from 'next/server'
import { SimpleRAGChatService } from '@/lib/rag-chat-simple'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token and verify user
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let userId = 'demo-user'
    
    // Decode token to get user ID
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      userId = decoded.email || 'demo-user'
    } catch (e) {
      // Use demo user if token decode fails
    }

    const body = await request.json()
    const { message, conversationId = generateId() } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      // Return demo response if OpenAI is not configured
      return new NextResponse(
        JSON.stringify({
          type: 'stream',
          conversationId,
          chunks: [
            { type: 'sources', sources: [
              {
                documentId: 'demo-1',
                filename: 'Technical Documentation.pdf',
                pageNumber: 12,
                content: 'This is a demo response showing how sources would appear...',
                relevanceScore: 0.95
              }
            ]},
            { type: 'token', content: 'This is a demo response. ' },
            { type: 'token', content: 'To enable real AI responses, ' },
            { type: 'token', content: 'please configure your OpenAI API key ' },
            { type: 'token', content: 'and Pinecone database in the .env.local file.' },
            { type: 'done' }
          ]
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const chatService = new SimpleRAGChatService()
          
          // Stream chat response
          for await (const chunk of chatService.streamChat(message, conversationId, userId)) {
            const data = `data: ${JSON.stringify(chunk)}\n\n`
            controller.enqueue(encoder.encode(data))
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          const errorData = `data: ${JSON.stringify({ type: 'error', content: 'An error occurred' })}\n\n`
          controller.enqueue(encoder.encode(errorData))
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
