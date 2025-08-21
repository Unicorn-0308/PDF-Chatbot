import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (in production, verify JWT token)
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // For demo mode, check if it's an admin token
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      if (decoded.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
    } catch (e) {
      // Not a valid token
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Try to fetch users from database
    try {
      const db = await getDatabase()
      const users = await db.collection('users')
        .find({}, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .toArray()
      
      return NextResponse.json({
        users: users.map(user => ({
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))
      })
    } catch (dbError) {
      console.log('Database not connected, returning demo users')
      
      // Return demo users for testing
      const demoUsers = [
        {
          _id: '1',
          email: 'admin@thinkai.com',
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          _id: '2',
          email: 'user@thinkai.com',
          name: 'Demo User',
          role: 'user',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02')
        },
        {
          _id: '3',
          email: 'john.doe@example.com',
          name: 'John Doe',
          role: 'user',
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03')
        },
        {
          _id: '4',
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
          role: 'user',
          createdAt: new Date('2024-01-04'),
          updatedAt: new Date('2024-01-04')
        },
        {
          _id: '5',
          email: 'bob.wilson@example.com',
          name: 'Bob Wilson',
          role: 'user',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-05')
        }
      ]
      
      return NextResponse.json({ users: demoUsers })
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
