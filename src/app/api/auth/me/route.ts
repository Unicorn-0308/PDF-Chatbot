import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // For demo purposes, decode the base64 token
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      if (decoded.email) {
        return NextResponse.json({
          user: {
            _id: Math.random().toString(36).substr(2, 9),
            email: decoded.email,
            name: decoded.name,
            role: decoded.role
          }
        })
      }
    } catch (e) {
      // Not a demo token, try real verification
    }

    // Try to verify with real JWT (when MongoDB is connected)
    try {
      const decoded = verifyToken(token)
      
      if (decoded) {
        return NextResponse.json({
          user: {
            _id: decoded.userId,
            email: decoded.email,
            role: decoded.role
          }
        })
      }
    } catch (dbError) {
      console.log('Token verification failed')
    }

    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
