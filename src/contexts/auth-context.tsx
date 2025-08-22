"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { toast } from 'sonner'

interface User {
  _id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session on mount
    checkAuth()

    // Re-check auth when window gains focus
    const handleFocus = () => {
      checkAuth()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const checkAuth = async () => {
    try {
      const token = Cookies.get('auth-token')
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          Cookies.remove('auth-token')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setIsLoading(false)
        Cookies.set('auth-token', data.token, { expires: 7 }) // 7 days
        toast.success('Login successful!')
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/chat')
        }
      } else {
        toast.error(data.error || 'Login failed')
        setUser(null)
        setIsLoading(false)
        throw new Error(data.error || 'Login failed')
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
      throw error
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Account created successfully! Please login.')
        
        // Redirect to login page after successful registration
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else {
        toast.error(data.error || 'Registration failed')
        throw new Error(data.error || 'Registration failed')
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setIsLoading(false)
    Cookies.remove('auth-token')
    router.push('/')  // Navigate to home page instead of login
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        refreshAuth: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
