import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SignupFormProps {
  onSubmit: (data: {
    name: string
    email: string
    password: string
  }) => Promise<void>
  isLoading?: boolean
  className?: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function SignupForm({
  onSubmit,
  isLoading = false,
  className
}: SignupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !agreedToTerms) {
      return
    }

    await onSubmit({
      name: formData.name,
      email: formData.email,
      password: formData.password
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as keyof FormErrors]
        return newErrors
      })
    }
  }

  const passwordStrength = {
    hasLength: formData.password.length >= 6,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={isLoading}
            className={cn('h-11 pl-10', errors.name ? 'border-red-500' : '')}
          />
        </div>
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={isLoading}
            className={cn('h-11 pl-10', errors.email ? 'border-red-500' : '')}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={isLoading}
            className={cn('h-11 pl-10 pr-10', errors.password ? 'border-red-500' : '')}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password}</p>
        )}
        
        {formData.password && (
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className={cn(
                'h-1.5 w-1.5 rounded-full',
                passwordStrength.hasLength ? 'bg-green-500' : 'bg-gray-300'
              )} />
              <span className="text-muted-foreground">At least 6 characters</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={cn(
                'h-1.5 w-1.5 rounded-full',
                passwordStrength.hasUppercase ? 'bg-green-500' : 'bg-gray-300'
              )} />
              <span className="text-muted-foreground">Contains uppercase letter</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={cn(
                'h-1.5 w-1.5 rounded-full',
                passwordStrength.hasLowercase ? 'bg-green-500' : 'bg-gray-300'
              )} />
              <span className="text-muted-foreground">Contains lowercase letter</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={cn(
                'h-1.5 w-1.5 rounded-full',
                passwordStrength.hasNumber ? 'bg-green-500' : 'bg-gray-300'
              )} />
              <span className="text-muted-foreground">Contains number</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            disabled={isLoading}
            className={cn('h-11 pl-10 pr-10', errors.confirmPassword ? 'border-red-500' : '')}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="terms"
          className="rounded border-gray-300"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          required
        />
        <Label htmlFor="terms" className="text-sm font-normal">
          I agree to the{" "}
          <Link href="#" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </Label>
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-11" 
        disabled={isLoading || !agreedToTerms}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Sign Up"
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </form>
  )
}
