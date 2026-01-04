/**
 * Ruta: POST /api/chat/[userId]
 * Proxea los mensajes del chatbot al backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL || "https://658096ec9c01.ngrok-free.app"

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await Promise.resolve(params)
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/chat/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return Response.json(
        {
          ok: false,
          error: `Backend error: ${response.status}`,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error: any) {
    return Response.json(
      {
        ok: false,
        error: error.message || "Error interno del servidor",
      },
      { status: 500 }
    )
  }
}
