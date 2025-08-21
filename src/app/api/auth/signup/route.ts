import { NextRequest, NextResponse } from 'next/server'
import { createUser, findUserByEmail } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters', field: 'name' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', field: 'email' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters', field: 'password' },
        { status: 400 }
      )
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain uppercase, lowercase, and number', field: 'password' },
        { status: 400 }
      )
    }

    // For demo mode, check if email already exists in mock users
    const mockUsers = [
      'admin@thinkai.com',
      'user@thinkai.com'
    ]

    if (mockUsers.includes(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Email already registered', field: 'email' },
        { status: 409 }
      )
    }

    // Try to create user in database (when MongoDB is connected)
    try {
      // Check if user already exists
      const existingUser = await findUserByEmail(email)
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already registered', field: 'email' },
          { status: 409 }
        )
      }

      // Create new user (default role is 'user')
      const newUser = await createUser(email, password, name, 'user')
      
      if (newUser) {
        return NextResponse.json({
          message: 'User created successfully',
          user: {
            _id: newUser._id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          }
        })
      }
    } catch (dbError) {
      console.log('Database not connected, using demo mode')
      
      // In demo mode, simulate successful registration
      return NextResponse.json({
        message: 'User created successfully (demo mode)',
        user: {
          _id: Math.random().toString(36).substr(2, 9),
          email: email,
          name: name,
          role: 'user'
        }
      })
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
