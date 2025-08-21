import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document as LangchainDocument } from 'langchain/document'
import { getEmbeddingsModel } from './openai'
import { getPineconeIndex } from './pinecone'
import { v4 as uuidv4 } from 'uuid'
import pdfParse from 'pdf-parse'

export interface ProcessedDocument {
  id: string
  filename: string
  totalPages: number
  totalChunks: number
  uploadedAt: Date
  status: 'processing' | 'completed' | 'failed'
  error?: string
}

export interface DocumentChunk {
  id: string
  documentId: string
  content: string
  pageNumber: number
  chunkIndex: number
  metadata: {
    filename: string
    pageNumber: number
    totalPages: number
    chunkIndex: number
    uploadedAt: Date
  }
}

export class PDFProcessor {
  private textSplitter: RecursiveCharacterTextSplitter

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '.', '!', '?', ',', ' ', ''],
    })
  }

  async processPDF(buffer: Buffer, filename: string): Promise<ProcessedDocument> {
    const documentId = uuidv4()
    const uploadedAt = new Date()

    try {
      // Parse PDF
      const pdfData = await pdfParse(buffer)
      
      // Extract text and metadata
      const text = pdfData.text
      const totalPages = pdfData.numpages

      // Split text into chunks
      const documents = await this.createDocuments(
        text,
        documentId,
        filename,
        totalPages,
        uploadedAt
      )

      // Generate embeddings and store in Pinecone
      await this.storeInVectorDB(documents, documentId)

      // Store document metadata in MongoDB
      const processedDoc: ProcessedDocument = {
        id: documentId,
        filename,
        totalPages,
        totalChunks: documents.length,
        uploadedAt,
        status: 'completed',
      }

      return processedDoc
    } catch (error) {
      console.error('Error processing PDF:', error)
      return {
        id: documentId,
        filename,
        totalPages: 0,
        totalChunks: 0,
        uploadedAt,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async createDocuments(
    text: string,
    documentId: string,
    filename: string,
    totalPages: number,
    uploadedAt: Date
  ): Promise<LangchainDocument[]> {
    // Split text into chunks
    const chunks = await this.textSplitter.splitText(text)

    // Create documents with metadata
    return chunks.map((chunk, index) => {
      // Estimate page number based on chunk position
      const estimatedPage = Math.floor((index / chunks.length) * totalPages) + 1

      return new LangchainDocument({
        pageContent: chunk,
        metadata: {
          documentId,
          filename,
          pageNumber: estimatedPage,
          totalPages,
          chunkIndex: index,
          uploadedAt: uploadedAt.toISOString(),
        },
      })
    })
  }

  private async storeInVectorDB(documents: LangchainDocument[], documentId: string) {
    try {
      const embeddings = getEmbeddingsModel()
      const index = await getPineconeIndex()

      // Generate embeddings for all documents
      const vectors = await Promise.all(
        documents.map(async (doc, i) => {
          const embedding = await embeddings.embedQuery(doc.pageContent)
          
          return {
            id: `${documentId}-${i}`,
            values: embedding,
            metadata: {
              ...doc.metadata,
              text: doc.pageContent,
            },
          }
        })
      )

      // Batch upsert to Pinecone
      const batchSize = 100
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize)
        await index.upsert(batch)
      }

      console.log(`Stored ${vectors.length} vectors for document ${documentId}`)
    } catch (error) {
      console.error('Error storing in vector DB:', error)
      throw error
    }
  }

  async searchSimilar(query: string, topK: number = 5) {
    try {
      const embeddings = getEmbeddingsModel()
      const index = await getPineconeIndex()

      // Generate embedding for query
      const queryEmbedding = await embeddings.embedQuery(query)

      // Search in Pinecone
      const results = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      })

      return results.matches || []
    } catch (error) {
      console.error('Error searching similar documents:', error)
      return []
    }
  }
}
