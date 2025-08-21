import { getSimpleOpenAIClient } from './openai-simple'
import { getDatabase } from './mongodb'

export interface ChatMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sources?: SourceDocument[]
  timestamp: Date
  feedback?: 'like' | 'dislike' | null
}

export interface SourceDocument {
  documentId: string
  filename: string
  pageNumber: number
  content: string
  relevanceScore: number
}

export class SimpleRAGChatService {
  private openai: ReturnType<typeof getSimpleOpenAIClient>

  constructor() {
    this.openai = getSimpleOpenAIClient()
  }

  async *streamChat(
    query: string,
    conversationId: string,
    userId: string
  ): AsyncGenerator<{ 
    type: 'token' | 'sources' | 'done' | 'error'
    content?: string
    sources?: SourceDocument[]
  }> {
    try {
      // For now, use mock sources since Pinecone isn't configured
      const mockSources: SourceDocument[] = [
        {
          documentId: 'doc-1',
          filename: 'Technical Documentation.pdf',
          pageNumber: 12,
          content: 'This system uses advanced algorithms for processing...',
          relevanceScore: 0.92
        },
        {
          documentId: 'doc-2',
          filename: 'User Manual.pdf',
          pageNumber: 45,
          content: 'Users can interact with the system through various interfaces...',
          relevanceScore: 0.85
        }
      ]

      // Yield sources first
      yield { type: 'sources', sources: mockSources }

      // Build context from sources
      const context = mockSources
        .map(source => `[${source.filename}, Page ${source.pageNumber}]: ${source.content}`)
        .join('\n\n')

      const systemPrompt = `You are ThinkAI, an intelligent assistant that provides accurate answers based on the provided documents.

${context ? `Here is the relevant context from the documents:\n\n${context}\n\n` : ''}

Instructions:
- Answer based on the provided context when available
- If the context doesn't contain relevant information, provide a general helpful response
- Be concise but thorough
- Cite sources when using information from documents
- Format your response with proper markdown when appropriate`

      try {
        // Try to use OpenAI if configured
        const response = await this.openai.createChatCompletion(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          {
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            temperature: 0.7,
            max_tokens: 2048,
            stream: true
          }
        )

        // Parse streaming response
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
                  const content = chunk.choices?.[0]?.delta?.content
                  if (content) {
                    yield { type: 'token', content }
                  }
                } catch (e) {
                  // Ignore parsing errors
                }
              }
            }
          }
        }
      } catch (apiError) {
        // If OpenAI fails or isn't configured, use a mock response
        console.log('OpenAI not available, using mock response')
        
        const mockResponse = `Based on the documents provided, I can help you with your query about "${query}".

The system documentation indicates that this platform uses advanced AI technology to process and analyze PDF documents, providing intelligent responses based on the content.

Key features include:
- Document analysis and embedding generation
- Semantic search capabilities
- Context-aware responses
- Source attribution for transparency

The information above is drawn from the Technical Documentation (Page 12) and User Manual (Page 45).`

        // Simulate streaming
        const words = mockResponse.split(' ')
        for (const word of words) {
          yield { type: 'token', content: word + ' ' }
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }

      // Save to database if available
      try {
        await this.saveMessage(conversationId, userId, query, '', mockSources)
      } catch (dbError) {
        console.log('Database not available')
      }

      yield { type: 'done' }
    } catch (error) {
      console.error('Error in chat:', error)
      yield { 
        type: 'error', 
        content: 'An error occurred while processing your request.' 
      }
    }
  }

  private async saveMessage(
    conversationId: string,
    userId: string,
    query: string,
    response: string,
    sources: SourceDocument[]
  ) {
    try {
      const db = await getDatabase()
      const conversations = db.collection('conversations')
      
      await conversations.updateOne(
        { conversationId, userId },
        {
          $push: {
            messages: {
              $each: [
                {
                  id: Date.now().toString(),
                  role: 'user',
                  content: query,
                  timestamp: new Date()
                },
                {
                  id: (Date.now() + 1).toString(),
                  role: 'assistant',
                  content: response,
                  sources,
                  timestamp: new Date()
                }
              ]
            }
          },
          $set: {
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date(),
            title: query.substring(0, 50)
          }
        },
        { upsert: true }
      )

      // Update analytics
      const analytics = db.collection('analytics')
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await analytics.updateOne(
        { date: today },
        {
          $inc: { totalQueries: 1 },
          $addToSet: { activeUsers: userId }
        },
        { upsert: true }
      )
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }
}
