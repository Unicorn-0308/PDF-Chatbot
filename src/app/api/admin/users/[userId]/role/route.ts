import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check if user is admin
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // For demo mode, check if it's an admin token
    let isAdmin = false
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      isAdmin = decoded.role === 'admin'
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { role } = body

    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const { userId } = params

    // Try to update user in database
    try {
      const db = await getDatabase()
      
      const result = await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            role,
            updatedAt: new Date()
          } 
        }
      )

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        message: 'User role updated successfully',
        userId,
        role
      })
    } catch (dbError) {
      console.log('Database not connected, simulating update')
      
      // In demo mode, simulate successful update
      return NextResponse.json({
        message: 'User role updated successfully (demo mode)',
        userId,
        role
      })
    }
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
