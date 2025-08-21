import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  iconBgColor?: string
  className?: string
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  iconBgColor = 'bg-primary/10',
  className
}: FeatureCardProps) {
  return (
    <div className={cn('text-center p-6', className)}>
      <div className={cn(
        'rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center',
        iconBgColor
      )}>
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
