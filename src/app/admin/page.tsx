"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Brain,
  Upload,
  FileText,
  Users,
  MessageSquare,
  TrendingUp,
  Settings,
  Database,
  Activity,
  Download,
  Trash2,
  Eye,
  ChevronDown,
  Check,
  X,
  Loader2,
  BarChart3,
  Clock,
  Server,
  UserCheck,
  Shield as ShieldIcon,
  Calendar,
  Mail as MailIcon
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

interface PDFFile {
  id: string
  name: string
  size: string
  uploadDate: Date
  pages: number
  status: "processing" | "ready" | "error"
}

interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  isActive: boolean
}

interface User {
  _id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "models" | "documents" | "users" | "settings">("dashboard")
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const [uploadedFiles, setUploadedFiles] = useState<PDFFile[]>([
    {
      id: "1",
      name: "Technical Documentation.pdf",
      size: "2.4 MB",
      uploadDate: new Date(),
      pages: 156,
      status: "ready"
    },
    {
      id: "2",
      name: "User Manual.pdf",
      size: "1.8 MB",
      uploadDate: new Date(),
      pages: 89,
      status: "ready"
    }
  ])
  const [isUploading, setIsUploading] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)



  const aiModels: AIModel[] = [
    {
      id: "gpt-4",
      name: "GPT-4",
      provider: "OpenAI",
      description: "Most capable model, best for complex tasks",
      isActive: true
    },
    {
      id: "gpt-3.5",
      name: "GPT-3.5 Turbo",
      provider: "OpenAI",
      description: "Fast and efficient for most tasks",
      isActive: true
    },
    {
      id: "claude-3",
      name: "Claude 3 Opus",
      provider: "Anthropic",
      description: "Advanced reasoning and analysis",
      isActive: false
    },
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      provider: "Google",
      description: "Multimodal capabilities",
      isActive: false
    }
  ]

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/admin/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          const newFile: PDFFile = {
            id: data.document.id,
            name: data.document.filename,
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            uploadDate: new Date(data.document.uploadedAt),
            pages: data.document.totalPages,
            status: data.document.status as 'processing' | 'ready' | 'error'
          }
          setUploadedFiles(prev => [...prev, newFile])
        } else {
          toast.error(`Failed to upload ${file.name}`)
        }
      }
      
      toast.success(`Successfully uploaded ${files.length} file(s)`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload files')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
    toast.success("File deleted successfully")
  }

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId)
    setShowModelDropdown(false)
    toast.success(`Switched to ${aiModels.find(m => m.id === modelId)?.name}`)
  }

  // Fetch data when tabs are active
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'dashboard') {
      fetchAnalytics()
    }
  }, [activeTab])

  const fetchUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        })))
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error loading users')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true)
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]

      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        toast.error('Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Error loading analytics')
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    setUpdatingUserId(userId)
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]

      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ))
        toast.success(`User role updated to ${newRole}`)
      } else {
        toast.error('Failed to update user role')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Error updating user role')
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">ThinkAI Admin</h1>
                <p className="text-sm text-muted-foreground">System Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => {
                document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"
                window.location.href = "/login"
              }}>
                Sign Out
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "models", label: "AI Models", icon: Brain },
              { id: "documents", label: "Documents", icon: FileText },
              { id: "users", label: "Users", icon: Users },
              { id: "settings", label: "Settings", icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.stats?.totalUsers || '2,543'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{analyticsData?.stats?.monthlyGrowth?.users || '+12%'}</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.stats?.totalQueries || '45,231'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{analyticsData?.stats?.monthlyGrowth?.queries || '+23%'}</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.stats?.activeSessions || '89'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98.5%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">Operational</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Query Volume</CardTitle>
                  <CardDescription>Daily queries over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData?.queryData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="queries"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Model Usage Distribution</CardTitle>
                  <CardDescription>Breakdown by AI model</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.modelUsageData || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(analyticsData?.modelUsageData || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Active users throughout the day</CardDescription>
              </CardHeader>
                              <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData?.userActivityData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "models" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>AI Model Configuration</CardTitle>
                <CardDescription>Select and configure the AI model for chat responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Active Model</Label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setShowModelDropdown(!showModelDropdown)}
                    >
                      <span className="flex items-center space-x-2">
                        <Brain className="h-4 w-4" />
                        <span>{aiModels.find(m => m.id === selectedModel)?.name}</span>
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    
                    {showModelDropdown && (
                      <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-10">
                        {aiModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => handleModelSelect(model.id)}
                            className="w-full text-left px-4 py-3 hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{model.name}</p>
                                <p className="text-sm text-muted-foreground">{model.provider}</p>
                                <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                              </div>
                              {selectedModel === model.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiModels.map((model) => (
                    <Card key={model.id} className={model.id === selectedModel ? "border-primary" : ""}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{model.name}</CardTitle>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            model.isActive ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}>
                            {model.isActive ? "Active" : "Inactive"}
                          </div>
                        </div>
                        <CardDescription>{model.provider}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{model.description}</p>
                        <div className="mt-4 flex space-x-2">
                          <Button
                            size="sm"
                            variant={model.id === selectedModel ? "default" : "outline"}
                            onClick={() => handleModelSelect(model.id)}
                          >
                            {model.id === selectedModel ? "Selected" : "Select"}
                          </Button>
                          <Button size="sm" variant="ghost">
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "documents" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Document Management</CardTitle>
                <CardDescription>Upload and manage PDF documents for AI training</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      {isUploading ? (
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      ) : (
                        <Upload className="h-12 w-12 text-muted-foreground" />
                      )}
                      <p className="text-lg font-medium">
                        {isUploading ? "Uploading..." : "Drop PDFs here or click to upload"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Support for PDF files up to 50MB
                      </p>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Uploaded Documents ({uploadedFiles.length})</h3>
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {file.size} • {file.pages} pages • Uploaded {file.uploadDate.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded-full text-xs ${
                              file.status === "ready" 
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : file.status === "processing"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}>
                              {file.status === "processing" && (
                                <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                              )}
                              {file.status}
                            </div>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteFile(file.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* User Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Users</p>
                              <p className="text-2xl font-bold">{users.length}</p>
                            </div>
                            <Users className="h-8 w-8 text-primary opacity-50" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Admins</p>
                              <p className="text-2xl font-bold">
                                {users.filter(u => u.role === 'admin').length}
                              </p>
                            </div>
                            <ShieldIcon className="h-8 w-8 text-primary opacity-50" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Regular Users</p>
                              <p className="text-2xl font-bold">
                                {users.filter(u => u.role === 'user').length}
                              </p>
                            </div>
                            <UserCheck className="h-8 w-8 text-primary opacity-50" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* User List */}
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-medium">User</th>
                            <th className="text-left p-4 font-medium">Email</th>
                            <th className="text-left p-4 font-medium">Role</th>
                            <th className="text-left p-4 font-medium">Joined</th>
                            <th className="text-left p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user, index) => (
                            <tr 
                              key={user._id} 
                              className={`border-t hover:bg-muted/30 transition-colors ${
                                index % 2 === 0 ? '' : 'bg-muted/10'
                              }`}
                            >
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                      {user.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      ID: {user._id}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <MailIcon className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{user.email}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === 'admin' 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'bg-secondary text-secondary-foreground'
                                }`}>
                                  {user.role === 'admin' ? (
                                    <>
                                      <ShieldIcon className="h-3 w-3 mr-1" />
                                      Admin
                                    </>
                                  ) : (
                                    <>
                                      <User className="h-3 w-3 mr-1" />
                                      User
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>{user.createdAt.toLocaleDateString()}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  {user.role === 'user' ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateUserRole(user._id, 'admin')}
                                      disabled={updatingUserId === user._id}
                                      className="flex items-center space-x-1"
                                    >
                                      {updatingUserId === user._id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <>
                                          <ShieldIcon className="h-3 w-3" />
                                          <span>Make Admin</span>
                                        </>
                                      )}
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateUserRole(user._id, 'user')}
                                      disabled={updatingUserId === user._id || users.filter(u => u.role === 'admin').length <= 1}
                                      className="flex items-center space-x-1"
                                    >
                                      {updatingUserId === user._id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <>
                                          <UserCheck className="h-3 w-3" />
                                          <span>Make User</span>
                                        </>
                                      )}
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-muted-foreground"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Info Note */}
                    <div className="bg-muted/50 rounded-lg p-4 mt-4">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> New users are automatically registered with "User" role. 
                        Admins can promote users to "Admin" role from this panel. At least one admin must remain in the system.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system parameters and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="sk-..."
                      defaultValue="sk-.............................."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-tokens">Max Tokens per Response</Label>
                    <Input
                      id="max-tokens"
                      type="number"
                      placeholder="2048"
                      defaultValue="2048"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      placeholder="0.7"
                      defaultValue="0.7"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate-limit">Rate Limit (requests/minute)</Label>
                    <Input
                      id="rate-limit"
                      type="number"
                      placeholder="60"
                      defaultValue="60"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button>Save Settings</Button>
                  <Button variant="outline">Reset to Defaults</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Configuration</CardTitle>
                <CardDescription>Manage database connections and storage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Vector Database</p>
                      <p className="text-sm text-muted-foreground">Pinecone • 2.3M vectors stored</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Server className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Application Database</p>
                      <p className="text-sm text-muted-foreground">PostgreSQL • 15.2 GB used</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
