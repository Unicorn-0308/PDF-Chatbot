import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WorkflowStep {
  number: number
  title: string
  description: string
}

interface AnimatedWorkflowProps {
  steps?: WorkflowStep[]
  className?: string
}

const defaultSteps: WorkflowStep[] = [
  {
    number: 1,
    title: 'Upload Documents',
    description: 'Admins upload PDF documents to build the knowledge base'
  },
  {
    number: 2,
    title: 'Ask Questions',
    description: 'Users interact with the AI through a natural chat interface'
  },
  {
    number: 3,
    title: 'Get Smart Answers',
    description: 'Receive accurate responses with source citations from PDFs'
  }
]

export function AnimatedWorkflow({ 
  steps = defaultSteps,
  className 
}: AnimatedWorkflowProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Animated connecting line for desktop */}
      <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 overflow-hidden">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-primary/20 via-primary to-primary/20 origin-left"
        />
      </div>

      {/* Workflow steps */}
      <div className="grid md:grid-cols-3 gap-8 relative">
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
            className="text-center relative"
          >
            {/* Animated step number */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.2 + 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              className="relative inline-block mb-4"
            >
              {/* Pulsing ring effect */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  delay: index * 0.3,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute inset-0 bg-primary rounded-full"
              />
              
              {/* Step number container */}
              <motion.div
                whileHover={{ 
                  scale: 1.1,
                  rotate: 360,
                  transition: { duration: 0.3 }
                }}
                className="relative bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto font-bold text-xl shadow-lg cursor-pointer"
              >
                {step.number}
              </motion.div>

              {/* Connecting dots for mobile */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.2 + 0.5 }}
                  className="md:hidden absolute top-full left-1/2 transform -translate-x-1/2 mt-2"
                >
                  <div className="flex flex-col gap-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.1,
                          repeat: Infinity,
                        }}
                        className="w-1 h-1 bg-primary/50 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Step content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.2 + 0.4 
              }}
            >
              <motion.h3 
                className="font-semibold mb-2 text-foreground"
                whileHover={{ 
                  color: 'hsl(var(--primary))',
                  transition: { duration: 0.2 }
                }}
              >
                {step.title}
              </motion.h3>
              <motion.p 
                className="text-sm text-muted-foreground leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.2 + 0.5 
                }}
              >
                {step.description}
              </motion.p>
            </motion.div>

            {/* Arrow indicator for desktop - positioned on the connecting line */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.2 + 0.6 
                }}
                className="hidden md:block absolute top-6 -right-4 transform -translate-y-1/2 text-primary/50 z-10"
              >
                <motion.svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  animate={{
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </motion.div>
            )}

            {/* Decorative elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ delay: index * 0.2 + 0.8 }}
              className="absolute inset-0 -z-10"
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary rounded-full blur-3xl" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 flex justify-center gap-2"
      >
        {steps.map((_, index) => (
          <motion.div
            key={index}
            initial={{ width: 8 }}
            animate={{ width: index === 1 ? 24 : 8 }}
            transition={{ 
              duration: 0.3,
              delay: 1.5 + index * 0.1
            }}
            className="h-2 bg-primary/30 rounded-full"
          />
        ))}
      </motion.div>
    </div>
  )
}
