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

    console.log(`👤 Obteniendo perfil del usuario: ${userId}`)

    const response = await fetch(`${API_BASE_URL}/user/${userId}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`❌ Error al obtener perfil: ${response.status}`)
      return Response.json(
        {
          ok: false,
          error: `Backend error: ${response.status}`,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ Perfil obtenido")

    return Response.json(data)
  } catch (error: any) {
    console.error(`❌ Error obteniendo perfil:`, error)
    return Response.json(
      {
        ok: false,
        error: error.message || "Error interno del servidor",
      },
      { status: 500 }
    )
  }
}
