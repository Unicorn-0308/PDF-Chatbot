import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // For demo purposes, we'll create mock users
    // In production, these would be fetched from MongoDB
    const mockUsers = [
      {
        email: 'admin@thinkai.com',
        password: 'demo123',
        role: 'admin',
        name: 'Admin User'
      },
      {
        email: 'user@thinkai.com',
        password: 'demo123',
        role: 'user',
        name: 'Demo User'
      }
    ]

    // Check if it's a demo user
    const demoUser = mockUsers.find(u => u.email === email && u.password === password)
    
    if (demoUser) {
      // Create a mock token and response for demo
      const token = Buffer.from(JSON.stringify({
        email: demoUser.email,
        role: demoUser.role,
        name: demoUser.name
      })).toString('base64')

      return NextResponse.json({
        user: {
          _id: Math.random().toString(36).substr(2, 9),
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role as 'user' | 'admin'
        },
        token
      })
    }

    // Try to authenticate with real database (when MongoDB is connected)
    try {
      const result = await authenticateUser(email, password)
      
      if (result) {
        return NextResponse.json({
          user: result.user,
          token: result.token
        })
      }
    } catch (dbError) {
      console.log('Database not connected, using demo mode')
    }

    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
