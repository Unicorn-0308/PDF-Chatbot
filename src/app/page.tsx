"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedFeatureCard } from "@/components/shared/AnimatedFeatureCard"
import { AnimatedWorkflow } from "@/components/shared/AnimatedWorkflow"
import { Brain, MessageSquare, FileText, Users, ArrowRight, Sparkles, Shield, Zap } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 pt-20"
        >
          <div className="flex items-center justify-center mb-6">
            <Brain className="h-20 w-20 text-primary" />
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ThinkAI
          </h1>
          <p className="text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Experience the future of intelligent conversation with our advanced AI chat assistant powered by PDF document analysis
          </p>
          <Button 
            size="lg" 
            onClick={() => router.push('/login')}
            className="group"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
          <AnimatedFeatureCard
            icon={Sparkles}
            title="AI-Powered Intelligence"
            description="Leverage cutting-edge AI models including GPT-4, Claude, and more for accurate, contextual responses"
            delay={0.2}
            glowColor="rgba(34, 197, 94, 0.15)"
          />
          <AnimatedFeatureCard
            icon={FileText}
            title="PDF Document Analysis"
            description="Upload and analyze PDF documents to provide context-aware responses based on your specific content"
            delay={0.3}
            glowColor="rgba(59, 130, 246, 0.15)"
          />
          <AnimatedFeatureCard
            icon={Zap}
            title="Real-time Streaming"
            description="Get instant responses with real-time streaming, making conversations feel natural and engaging"
            delay={0.4}
            glowColor="rgba(251, 191, 36, 0.15)"
          />
        </div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <AnimatedWorkflow />
        </motion.div>

        {/* User Types Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16"
        >
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-semibold">For Users</h3>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span> Intuitive chat interface
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span> Voice input support
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span> PDF source citations
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span> Share and export responses
              </li>
            </ul>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-semibold">For Admins</h3>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span> Manage AI models
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span> Upload & organize PDFs
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span> Analytics dashboard
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span> User management
              </li>
            </ul>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center py-12"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join ThinkAI and experience the power of intelligent conversation
          </p>
          <Button 
            size="lg" 
            onClick={() => router.push('/login')}
            className="group"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}