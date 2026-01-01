"use client"

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NutritionChatbot } from "@/lib/nutrition-advisor-service"

interface ChatMessage {
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface NutritionAdvisorProps {
  userId: string
  userName?: string
  isOpen: boolean
  onClose: () => void
}

export default function NutritionAdvisor({ userId, userName = "Usuario", isOpen, onClose }: NutritionAdvisorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialMessageSent, setInitialMessageSent] = useState(false)
  const [chatbot, setChatbot] = useState<NutritionChatbot | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Inicializar el chatbot
  useEffect(() => {
    if (userId) {
      const newChatbot = new NutritionChatbot(userId, userName)
      setChatbot(newChatbot)
    }
  }, [userId, userName])

  // Cargar historial al abrir
  useEffect(() => {
    if (isOpen && chatbot && !initialMessageSent) {
      loadChatHistory()
      setInitialMessageSent(true)
    }
  }, [isOpen, chatbot, initialMessageSent])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatHistory = async () => {
    if (!chatbot) return

    setLoading(true)
    const history = await chatbot.loadHistory()
    setMessages(history)

    // Si no hay historial, enviar mensaje inicial
    if (history.length === 0) {
      await handleInitialMessage()
    }

    setLoading(false)
  }

  const handleInitialMessage = async () => {
    if (!chatbot) return

    setLoading(true)
    const response = await chatbot.sendMessage(
      "Basándote en mis datos y objetivos nutricionales, ¿qué alimentos y comidas me recomiendas para hoy?"
    )

    if (response) {
      setMessages(chatbot.getMessages())
    }

    setLoading(false)
  }

  const handleSendMessage = async () => {
    if (!input.trim() || loading || !chatbot) return

    const userInput = input
    setInput("")
    setLoading(true)

    // Agregar mensaje del usuario inmediatamente
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: userInput,
        timestamp: new Date(),
      },
    ])

    // Enviar al chatbot
    const response = await chatbot.sendMessage(userInput)

    // Actualizar con el historial completo
    setMessages(chatbot.getMessages())
    setLoading(false)
  }

  const handleClearHistory = async () => {
    if (!chatbot) return

    if (confirm("¿Estás seguro de que deseas borrar el historial del chat?")) {
      await chatbot.clearHistory()
      chatbot.clearLocalMessages()
      setMessages([])
      setInitialMessageSent(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">🤖 Asesor Nutricional</h3>
            <p className="text-xs text-muted-foreground">
              Recomendaciones personalizadas para tus objetivos
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            ✕
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
          {messages.length === 0 && !loading && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Cargando historial del chat...</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.type === "user"
                    ? "bg-accent text-accent-foreground"
                    : "bg-background border"
                }`}
              >
                {msg.type === "user" ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-sm font-semibold mt-1 mb-1" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        code: (props: any) => {
                          const { node, inline, children, ...rest } = props
                          return inline ? (
                            <code className="bg-muted px-1 rounded text-xs" {...rest}>{children}</code>
                          ) : (
                            <code className="block bg-muted p-2 rounded text-xs overflow-x-auto mb-2" {...rest}>{children}</code>
                          )
                        },
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-2 border-accent pl-2 italic mb-2" {...props} />
                        ),
                        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                        em: ({ node, ...props }) => <em className="italic" {...props} />,
                        hr: ({ node, ...props }) => <hr className="my-2 border-t" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
                <p className="text-xs opacity-60 mt-1">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-background border px-4 py-2 rounded-lg">
                <p className="text-sm">🤔 Procesando recomendación...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t space-y-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage()
              }}
              placeholder="Pregunta sobre comidas, alimentos..."
              disabled={loading}
              className="text-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              size="sm"
            >
              {loading ? "⏳" : "📤"}
            </Button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground flex-1">
              💡 Puedes preguntar sobre alimentos específicos, recetas, o sugerencias
            </p>
            <Button
              onClick={handleClearHistory}
              variant="ghost"
              size="sm"
              className="text-xs h-7"
            >
              🗑️ Limpiar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
