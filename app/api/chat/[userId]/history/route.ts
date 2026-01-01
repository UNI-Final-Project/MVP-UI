/**
 * Ruta: GET /api/chat/[userId]/history
 * Ruta: DELETE /api/chat/[userId]/history
 * Proxea historial del chatbot al backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL || "https://658096ec9c01.ngrok-free.app"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await Promise.resolve(params)

    console.log(`📜 Obteniendo historial del chatbot para usuario: ${userId}`)

    const response = await fetch(`${API_BASE_URL}/chat/${userId}/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`❌ Error al obtener historial: ${response.status}`)
      return Response.json(
        {
          ok: false,
          error: `Backend error: ${response.status}`,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ Historial obtenido")

    return Response.json(data)
  } catch (error: any) {
    console.error(`❌ Error obteniendo historial:`, error)
    return Response.json(
      {
        ok: false,
        error: error.message || "Error interno del servidor",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await Promise.resolve(params)

    console.log(`🗑️ Limpiando historial del chatbot para usuario: ${userId}`)

    const response = await fetch(`${API_BASE_URL}/chat/${userId}/history`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`❌ Error al limpiar historial: ${response.status}`)
      return Response.json(
        {
          ok: false,
          error: `Backend error: ${response.status}`,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ Historial limpiado")

    return Response.json(data)
  } catch (error: any) {
    console.error(`❌ Error limpiando historial:`, error)
    return Response.json(
      {
        ok: false,
        error: error.message || "Error interno del servidor",
      },
      { status: 500 }
    )
  }
}
