import React from 'react'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedFeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  delay?: number
  className?: string
  iconClassName?: string
  glowColor?: string
}

export function AnimatedFeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
  className,
  iconClassName,
  glowColor = 'rgba(34, 197, 94, 0.1)' // Default green glow
}: AnimatedFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      className={cn('relative group', className)}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`,
          filter: 'blur(20px)'
        }}
      />
      
      {/* Card content */}
      <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-xl">
        {/* Animated icon container */}
        <motion.div
          whileHover={{ 
            rotate: [0, -10, 10, -10, 0],
            transition: { duration: 0.5 }
          }}
          className="mb-6"
        >
          <div className="relative">
            {/* Icon background with pulse animation */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl"
            />
            
            {/* Icon container */}
            <div className="relative bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl p-4 w-20 h-20 mx-auto flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
              <Icon className={cn(
                'h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110',
                iconClassName
              )} />
            </div>
          </div>
        </motion.div>

        {/* Text content with stagger animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2, duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/20 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/20 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/20 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/20 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </motion.div>
  )
}
