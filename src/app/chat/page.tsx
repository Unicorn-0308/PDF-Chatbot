"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useChat } from "@/hooks/useChat"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Send, 
  Mic, 
  MicOff, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Volume2,
  Copy,
  Check,
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Brain,
  User
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { toast } from "sonner"



export default function ChatPage() {
  const { messages, isLoading, sendMessage, updateFeedback } = useChat()
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedPdf, setExpandedPdf] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)



  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    await sendMessage(input)
    setInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFeedback = (messageId: string, feedback: "like" | "dislike") => {
    updateFeedback(messageId, feedback)
    toast.success(`Feedback recorded: ${feedback === "like" ? "👍" : "👎"}`)
  }

  const handleCopy = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(messageId)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success("Copied to clipboard!")
  }

  const handleShare = (content: string) => {
    if (navigator.share) {
      navigator.share({
        title: "ThinkAI Response",
        text: content
      })
    } else {
      handleCopy(content, "share")
    }
  }

  const handleSpeak = (content: string) => {
    const utterance = new SpeechSynthesisUtterance(content)
    speechSynthesis.speak(utterance)
    toast.success("Speaking response...")
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    if (!isListening) {
      toast.info("Voice input activated")
      // Implement speech recognition here
    } else {
      toast.info("Voice input deactivated")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">ThinkAI Chat</h1>
              <p className="text-sm text-muted-foreground">Intelligent Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => {
              document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"
              window.location.href = "/login"
            }}>
              Sign Out
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex space-x-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                    <Avatar>
                      <AvatarFallback>
                        {message.role === "user" ? <User className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className={`rounded-lg p-4 ${
                        message.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}>
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            className="prose prose-sm dark:prose-invert max-w-none"
                            components={{
                              code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || "")
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, "")}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      
                      {/* Action Buttons for Assistant Messages */}
                      {message.role === "assistant" && (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFeedback(message.id, "like")}
                            className={message.feedback === "like" ? "text-green-600" : ""}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFeedback(message.id, "dislike")}
                            className={message.feedback === "dislike" ? "text-red-600" : ""}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSpeak(message.content)}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(message.content, message.id)}
                          >
                            {copiedId === message.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleShare(message.content)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* PDF Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Sources:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {message.sources.map((source, idx) => (
                              <motion.div
                                key={`${source.documentId}-${idx}`}
                                whileHover={{ scale: 1.02 }}
                                className="border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={() => setExpandedPdf(expandedPdf === source.documentId ? null : source.documentId)}
                              >
                                <div className="flex items-start space-x-2">
                                  <FileText className="h-4 w-4 text-primary mt-1" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{source.title}</p>
                                    <p className="text-xs text-muted-foreground">Page {source.page}</p>
                                    <p className="text-xs mt-1 line-clamp-2">{source.content}</p>
                                    {source.relevanceScore && (
                                      <p className="text-xs text-primary mt-1">Relevance: {Math.round(source.relevanceScore * 100)}%</p>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setExpandedPdf(source.documentId)
                                    }}
                                  >
                                    <Maximize2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 text-muted-foreground"
              >
                <Brain className="h-5 w-5 text-primary" />
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">ThinkAI is thinking...</span>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message here..."
                  className="min-h-[60px] max-h-[200px] resize-none pr-12"
                  disabled={isLoading}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute bottom-2 right-2"
                  onClick={toggleListening}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="mb-[2px]"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {expandedPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setExpandedPdf(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-background rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">PDF Source Preview</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpandedPdf(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                <div className="bg-white rounded-lg p-8 min-h-[600px] shadow-inner">
                  <p className="text-gray-800">
                    {messages.flatMap(m => m.sources || []).find(s => s.documentId === expandedPdf)?.content}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
