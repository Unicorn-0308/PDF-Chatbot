import React from 'react'
import { Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-16 w-16'
}

const textSizeMap = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-5xl'
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Brain className={cn('text-primary', sizeMap[size])} />
      {showText && (
        <span className={cn('font-bold', textSizeMap[size])}>
          ThinkAI
        </span>
      )}
    </div>
  )
}
