import { getOpenAIClient } from './openai'
import { PDFProcessor } from './pdf-processor'
import { getDatabase } from './mongodb'
import { v4 as uuidv4 } from 'uuid'

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

export interface Conversation {
  id: string
  userId: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export class RAGChatService {
  private pdfProcessor: PDFProcessor
  private openai: ReturnType<typeof getOpenAIClient>

  constructor() {
    this.pdfProcessor = new PDFProcessor()
    this.openai = getOpenAIClient()
  }

  async *streamChat(
    query: string,
    conversationId: string,
    userId: string
  ): AsyncGenerator<{ 
    type: 'token' | 'sources' | 'done'
    content?: string
    sources?: SourceDocument[]
  }> {
    try {
      // 1. Search for relevant documents
      const relevantDocs = await this.pdfProcessor.searchSimilar(query, 5)
      
      // 2. Format sources
      const sources: SourceDocument[] = relevantDocs
        .filter(doc => doc.score && doc.score > 0.7) // Only include highly relevant docs
        .map(doc => ({
          documentId: doc.metadata?.documentId as string || '',
          filename: doc.metadata?.filename as string || 'Unknown',
          pageNumber: doc.metadata?.pageNumber as number || 1,
          content: doc.metadata?.text as string || '',
          relevanceScore: doc.score || 0,
        }))

      // 3. Build context from relevant documents
      const context = sources
        .map(source => `[${source.filename}, Page ${source.pageNumber}]: ${source.content}`)
        .join('\n\n')

      // 4. Create system prompt with context
      const systemPrompt = `You are ThinkAI, an intelligent assistant that provides accurate answers based on the provided documents.

${context ? `Here is the relevant context from the documents:\n\n${context}\n\n` : ''}

Instructions:
- Answer based on the provided context when available
- If the context doesn't contain relevant information, provide a general helpful response
- Be concise but thorough
- Cite sources when using information from documents
- Format your response with proper markdown when appropriate`

      // 5. Stream response from OpenAI
      const stream = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
      })

      // 6. Yield sources first
      if (sources.length > 0) {
        yield { type: 'sources', sources }
      }

      // 7. Stream tokens
      let fullResponse = ''
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullResponse += content
          yield { type: 'token', content }
        }
      }

      // 8. Save to database
      await this.saveMessage(conversationId, userId, query, fullResponse, sources)

      // 9. Signal completion
      yield { type: 'done' }
    } catch (error) {
      console.error('Error in RAG chat:', error)
      throw error
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
      const conversationsCollection = db.collection('conversations')

      // Check if conversation exists
      const existingConversation = await conversationsCollection.findOne({
        id: conversationId,
        userId
      })

      const userMessage: ChatMessage = {
        id: uuidv4(),
        conversationId,
        role: 'user',
        content: query,
        timestamp: new Date(),
        feedback: null,
      }

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        conversationId,
        role: 'assistant',
        content: response,
        sources,
        timestamp: new Date(),
        feedback: null,
      }

      if (existingConversation) {
        // Update existing conversation
        await conversationsCollection.updateOne(
          { id: conversationId },
          {
            $push: {
              messages: { $each: [userMessage, assistantMessage] }
            },
            $set: {
              updatedAt: new Date()
            }
          }
        )
      } else {
        // Create new conversation
        const newConversation: Conversation = {
          id: conversationId,
          userId,
          title: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
          messages: [userMessage, assistantMessage],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await conversationsCollection.insertOne(newConversation)
      }

      // Update analytics
      await this.updateAnalytics(userId)
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  private async updateAnalytics(userId: string) {
    try {
      const db = await getDatabase()
      const analyticsCollection = db.collection('analytics')

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await analyticsCollection.updateOne(
        { date: today },
        {
          $inc: {
            totalQueries: 1,
            [`userQueries.${userId}`]: 1,
          },
          $addToSet: {
            activeUsers: userId,
          }
        },
        { upsert: true }
      )
    } catch (error) {
      console.error('Error updating analytics:', error)
    }
  }

  async updateFeedback(messageId: string, feedback: 'like' | 'dislike') {
    try {
      const db = await getDatabase()
      await db.collection('conversations').updateOne(
        { 'messages.id': messageId },
        { $set: { 'messages.$.feedback': feedback } }
      )
    } catch (error) {
      console.error('Error updating feedback:', error)
    }
  }

  async getConversationHistory(conversationId: string, userId: string) {
    try {
      const db = await getDatabase()
      const conversation = await db.collection('conversations').findOne({
        id: conversationId,
        userId
      })
      return conversation
    } catch (error) {
      console.error('Error getting conversation history:', error)
      return null
    }
  }
}
