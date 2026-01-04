/**
 * Ruta: GET /api/user/[userId]/profile
 * Proxea la solicitud de perfil al backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL || "https://658096ec9c01.ngrok-free.app"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await Promise.resolve(params)

    const response = await fetch(`${API_BASE_URL}/user/${userId}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
