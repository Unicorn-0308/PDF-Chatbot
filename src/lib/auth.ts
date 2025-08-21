import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDatabase } from './mongodb'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

export interface User {
  _id?: string
  email: string
  password?: string
  role: 'user' | 'admin'
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function createUser(email: string, password: string, name: string, role: 'user' | 'admin' = 'user'): Promise<User | null> {
  try {
    const db = await getDatabase()
    const hashedPassword = await hashPassword(password)
    
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    if (result.acknowledged) {
      return {
        _id: result.insertedId.toString(),
        email,
        name,
        role
      }
    }
    return null
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const db = await getDatabase()
    const user = await db.collection('users').findOne({ email })
    
    if (user) {
      return {
        _id: user._id.toString(),
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
    return null
  } catch (error) {
    console.error('Error finding user:', error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    const user = await findUserByEmail(email)
    
    if (!user || !user.password) {
      return null
    }

    const isValid = await verifyPassword(password, user.password)
    
    if (!isValid) {
      return null
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user
    const token = generateToken(userWithoutPassword as User)

    return {
      user: userWithoutPassword as User,
      token
    }
  } catch (error) {
    console.error('Error authenticating user:', error)
    return null
  }
}
