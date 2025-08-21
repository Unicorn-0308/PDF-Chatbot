import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WorkflowStep {
  number: number
  title: string
  description: string
}

interface AnimatedWorkflowProps {
  steps: WorkflowStep[]
  className?: string
}

export function AnimatedWorkflow({ steps, className }: AnimatedWorkflowProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Animated flowing arrow path */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gradient for the arrow */}
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(34, 197, 94)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Animated path between cards */}
        <motion.path
          d="M 120 100 Q 280 50 440 100 T 760 100"
          stroke="url(#arrowGradient)"
          strokeWidth="3"
          fill="none"
          filter="url(#glow)"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 2, ease: "easeInOut", delay: 0.5 },
            opacity: { duration: 0.5, delay: 0.5 }
          }}
        />

        {/* Animated arrow head that travels along the path */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1,
            times: [0, 0.1, 0.9, 1]
          }}
        >
          <motion.circle
            r="8"
            fill="rgb(34, 197, 94)"
            filter="url(#glow)"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut"
            }}
            style={{
              offsetPath: "path('M 120 100 Q 280 50 440 100 T 760 100')",
            }}
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path="M 120 100 Q 280 50 440 100 T 760 100"
            >
              <mpath href="#flowPath" />
            </animateMotion>
          </motion.circle>
        </motion.g>

        {/* Energy particles */}
        {[...Array(5)].map((_, i) => (
          <motion.circle
            key={i}
            r="3"
            fill="rgb(34, 197, 94)"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.6,
              repeatDelay: 1,
            }}
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin={`${i * 0.6}s`}
              path="M 120 100 Q 280 50 440 100 T 760 100"
            />
          </motion.circle>
        ))}
      </svg>

      {/* Workflow steps */}
      <div className="grid md:grid-cols-3 gap-8 relative" style={{ zIndex: 2 }}>
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.2,
              ease: [0.21, 0.47, 0.32, 0.98]
            }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            className="relative group"
          >
            {/* Card glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.1), transparent 70%)',
                filter: 'blur(20px)'
              }}
            />

            {/* Card content */}
            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-xl h-full">
              {/* Animated number circle */}
              <motion.div
                className="relative mx-auto mb-6"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3
                  }}
                />
                <div className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto font-bold text-2xl shadow-lg">
                  {step.number}
                </div>
              </motion.div>

              {/* Text content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
              >
                <h3 className="font-semibold text-lg mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>

              {/* Connection indicator */}
              {index < steps.length - 1 && (
                <motion.div
                  className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden md:block"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 + 0.5, duration: 0.3 }}
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <motion.div
                      className="w-4 h-4 bg-primary rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Progress indicator at bottom */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20 rounded-b-2xl overflow-hidden"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: 1.5,
                  delay: index * 0.3 + 0.5,
                  ease: "easeOut"
                }}
                style={{ transformOrigin: 'left' }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-primary/50 to-primary"
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5,
                    ease: "linear"
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating particles for ambiance */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-primary/30 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 2) * 40}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}
