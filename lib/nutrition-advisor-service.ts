/**
 * Servicio de Chatbot Nutricional
 * Comunica con el backend para obtener recomendaciones y mantener historial
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL || "https://658096ec9c01.ngrok-free.app"

export interface ChatMessage {
  type: "user" | "assistant"
  content: string
  timestamp: Date
  metadata?: any
}

export interface ChatResponse {
  ok: boolean
  response?: string
  metadata?: any
  error?: string
}

export interface ChatHistoryItem {
  message_type: "user" | "assistant"
  content: string
  created_at: Date
}

/**
 * Clase para gestionar el chatbot nutricional
 */
export class NutritionChatbot {
  private userId: string
  private userName: string
  messages: ChatMessage[] = []

  constructor(userId: string, userName: string = "Usuario") {
    this.userId = userId
    this.userName = userName
  }

  /**
   * Enviar un mensaje al chatbot
   */
  async sendMessage(userMessage: string): Promise<string | null> {
    try {
      console.log(`🤖 Enviando mensaje al chatbot...`)

      const response = await fetch(`/api/chat/${this.userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          user_name: this.userName,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error(`❌ Error: ${response.status}`)
        return null
      }

      const data: ChatResponse = await response.json()

      if (data.ok && data.response) {
        // Guardar en historial local
        this.messages.push({
          type: "user",
          content: userMessage,
          timestamp: new Date(),
        })

        this.messages.push({
          type: "assistant",
          content: data.response,
          timestamp: new Date(),
          metadata: data.metadata,
        })

        console.log("✅ Respuesta recibida")
        return data.response
      } else {
        console.error("❌ Respuesta inválida")
        return null
      }
    } catch (err: any) {
      console.error(`❌ Error:`, err.message)
      return null
    }
  }

  /**
   * Cargar el historial del chatbot desde el backend
   */
  async loadHistory(): Promise<ChatMessage[]> {
    try {
      console.log(`📜 Cargando historial del chatbot...`)

      const response = await fetch(`/api/chat/${this.userId}/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error(`❌ Error al cargar historial: ${response.status}`)
        return []
      }

      const data = await response.json()

      if (data.ok && Array.isArray(data.history)) {
        this.messages = data.history.map((msg: ChatHistoryItem) => ({
          type: msg.message_type,
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }))

        console.log(`✅ Historial cargado: ${this.messages.length} mensajes`)
        return this.messages
      }

      return []
    } catch (err: any) {
      console.error(`❌ Error cargando historial:`, err.message)
      return []
    }
  }

  /**
   * Limpiar el historial del chatbot
   */
  async clearHistory(): Promise<boolean> {
    try {
      console.log(`🗑️ Limpiando historial...`)

      const response = await fetch(`/api/chat/${this.userId}/history`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error(`❌ Error al limpiar historial: ${response.status}`)
        return false
      }

      const data = await response.json()

      if (data.ok) {
        this.messages = []
        console.log("✅ Historial limpiado")
        return true
      }

      return false
    } catch (err: any) {
      console.error(`❌ Error limpiando historial:`, err.message)
      return false
    }
  }

  /**
   * Obtener los mensajes locales
   */
  getMessages(): ChatMessage[] {
    return this.messages
  }

  /**
   * Limpiar los mensajes locales
   */
  clearLocalMessages(): void {
    this.messages = []
  }
}

