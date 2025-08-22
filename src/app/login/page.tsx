"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Brain, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      await login(email, password)
      // The login function in useAuth handles the redirect and success message
    } catch (error) {
      console.error("Login error:", error)
      // Error toast is already shown by the login function in useAuth
    } finally {
      setIsLoading(false)
    }
  }

  // For demo purposes - remove in production
  const handleDemoLogin = (role: "user" | "admin") => {
    setEmail(role === "admin" ? "admin@thinkai.com" : "user@thinkai.com")
    setPassword("demo123")
    toast.info(`Demo credentials filled for ${role}`)
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4 py-8">

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 rounded-full p-3">
                <Brain className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access ThinkAI
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    href="#" 
                    className="text-sm text-primary hover:underline"
                    onClick={(e) => {
                      e.preventDefault()
                      toast.info("Password reset functionality coming soon")
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-11 pr-10"
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
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Demo Login Buttons - Remove in production */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin("user")}
                disabled={isLoading}
                className="h-11"
              >
                Demo User
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin("admin")}
                disabled={isLoading}
                className="h-11"
              >
                Demo Admin
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
            <div>
              Don't have an account?{" "}
              <Link 
                href="/signup" 
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
            <div className="text-xs">
              By continuing, you agree to our{" "}
              <Link href="#" className="underline">Terms of Service</Link> and{" "}
              <Link href="#" className="underline">Privacy Policy</Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
