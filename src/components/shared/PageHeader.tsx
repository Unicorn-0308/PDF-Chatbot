import React from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from './Logo'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title?: string
  subtitle?: string
  showLogo?: boolean
  showThemeToggle?: boolean
  onSignOut?: () => void
  className?: string
  children?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  showLogo = true,
  showThemeToggle = true,
  onSignOut,
  className,
  children
}: PageHeaderProps) {
  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut()
    } else {
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"
      window.location.href = "/login"
    }
  }

  return (
    <div className={cn('border-b', className)}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showLogo && <Logo size="md" />}
            {(title || subtitle) && (
              <div>
                {title && <h1 className="text-xl font-semibold">{title}</h1>}
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {children}
            {onSignOut !== undefined && (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            )}
            {showThemeToggle && <ThemeToggle />}
          </div>
        </div>
      </div>
    </div>
  )
}
