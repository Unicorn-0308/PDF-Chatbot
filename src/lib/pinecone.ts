import { Pinecone } from '@pinecone-database/pinecone'

let pineconeClient: Pinecone | null = null

export async function getPineconeClient(): Promise<Pinecone> {
  if (pineconeClient) {
    return pineconeClient
  }

  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY is not set')
  }

  pineconeClient = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  })

  return pineconeClient
}

export async function getPineconeIndex() {
  const client = await getPineconeClient()
  const indexName = process.env.PINECONE_INDEX_NAME || 'thinkai-docs'
  
  // Check if index exists, if not create it
  try {
    const indexes = await client.listIndexes()
    const indexExists = indexes.indexes?.some(index => index.name === indexName)
    
    if (!indexExists) {
      await client.createIndex({
        name: indexName,
        dimension: parseInt(process.env.EMBEDDING_DIMENSION || '1536'),
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      })
      
      // Wait for index to be ready
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  } catch (error) {
    console.log('Index might already exist or Pinecone not configured:', error)
  }

  return client.index(indexName)
}
