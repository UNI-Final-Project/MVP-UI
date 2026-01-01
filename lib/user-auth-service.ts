/**
 * Servicio de Autenticación
 * Obtiene información del usuario autenticado desde Supabase
 */

import { createClient } from "@/lib/supabase/client"

export interface CurrentUser {
  id: string
  email: string | null
  name: string | null
}

/**
 * Obtener el usuario actualmente autenticado
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      console.error("❌ Error obteniendo usuario actual:", error)
      return null
    }

    const user = data.user
    return {
      id: user.id,
      email: user.email || null,
      name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message)
    return null
  }
}


