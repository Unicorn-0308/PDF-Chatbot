import { NextRequest, NextResponse } from 'next/server'
import { SimplePDFProcessor } from '@/lib/pdf-processor-simple'
import { getDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let isAdmin = false
    let decoded: any = null
    
    try {
      decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      isAdmin = decoded.role === 'admin'
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Check if vector DB is configured
    if (!process.env.PINECONE_API_KEY) {
      // Return demo response if Pinecone is not configured
      return NextResponse.json({
        success: true,
        document: {
          id: 'demo-' + Date.now(),
          filename: file.name,
          totalPages: 10,
          totalChunks: 25,
          uploadedAt: new Date(),
          status: 'completed',
          message: 'Demo mode - Configure Pinecone to enable real PDF processing'
        }
      })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Process PDF
    const processor = new SimplePDFProcessor()
    const processedDoc = await processor.processPDF(buffer, file.name)

    // Save document metadata to MongoDB
    try {
      const db = await getDatabase()
      await db.collection('documents').insertOne({
        ...processedDoc,
        uploadedBy: decoded.email || 'admin',
        fileSize: file.size,
      })
    } catch (dbError) {
      console.log('MongoDB not connected, document metadata not saved')
    }

    return NextResponse.json({
      success: true,
      document: processedDoc
    })
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}

// Route segment config for handling file uploads
export const runtime = 'nodejs'
export const maxDuration = 60 // Maximum allowed duration for the function
