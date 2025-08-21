// Simplified OpenAI client that works without the openai package
// This is a temporary solution until packages are installed

export class SimpleOpenAIClient {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || ''
  }

  async createChatCompletion(messages: any[], options: any = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: options.model || 'gpt-3.5-turbo',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2048,
        stream: options.stream || false
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    return response
  }

  async createEmbedding(text: string) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data[0].embedding
  }
}

export function getSimpleOpenAIClient() {
  return new SimpleOpenAIClient()
}
