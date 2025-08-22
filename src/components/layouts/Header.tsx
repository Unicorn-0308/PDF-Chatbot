"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { 
  Menu, 
  User, 
  LogOut, 
  Settings, 
  Shield, 
  MessageSquare,
  Home,
  ChevronDown,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Remove Home from navigation - logo already links to home
  const navigation = [
    { name: 'Chat', href: '/chat', icon: MessageSquare, public: false },
    { name: 'Admin', href: '/admin', icon: Shield, public: false, adminOnly: true },
  ]

  const filteredNavigation = navigation.filter(item => {
    if (!item.public && !isAuthenticated) return false
    if (item.adminOnly && user?.role !== 'admin') return false
    return true
  })

  const handleNavigation = (href: string) => {
    router.push(href)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Logo size="md" showText={true} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side - User menu and Theme toggle */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {!isLoading && isAuthenticated ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user?.name}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            Role: {user?.role}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 pb-4 border-b">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {user?.role}
                            </p>
                          </div>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="space-y-2">
                          {filteredNavigation.map((item) => (
                            <Button
                              key={item.name}
                              variant={pathname === item.href ? "secondary" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => handleNavigation(item.href)}
                            >
                              <item.icon className="mr-2 h-4 w-4" />
                              {item.name}
                            </Button>
                          ))}
                        </nav>

                        <div className="pt-4 border-t space-y-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleNavigation('/settings')}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600"
                            onClick={logout}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : !isLoading ? (
              <>
                {/* Desktop Login/Signup */}
                <div className="hidden md:flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => router.push('/signup')}
                  >
                    Sign Up
                  </Button>
                </div>
                
                {/* Mobile Menu Button for non-authenticated users */}
                <div className="md:hidden">
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              router.push('/login')
                              setMobileMenuOpen(false)
                            }}
                          >
                            Login
                          </Button>
                          <Button
                            className="w-full justify-start"
                            onClick={() => {
                              router.push('/signup')
                              setMobileMenuOpen(false)
                            }}
                          >
                            Sign Up
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              // Loading state
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
