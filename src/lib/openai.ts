import OpenAI from 'openai'
import { OpenAIEmbeddings } from '@langchain/openai'
import { ChatOpenAI } from '@langchain/openai'

let openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (openaiClient) {
    return openaiClient
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  return openaiClient
}

export function getEmbeddingsModel() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  return new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  })
}

export function getChatModel() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  return new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.MAX_TOKENS || '2048'),
    streaming: true,
  })
}
