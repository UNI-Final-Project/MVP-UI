import { createNutritionClient } from "@/lib/supabase/nutrition-client"

export interface UserMetrics {
  id?: string
  user_id: string
  full_name?: string // Nombre completo del usuario
  weight: number // kg
  height: number // cm
  calorie_goal: number
  protein_goal?: number
  carbs_goal?: number
  fat_goal?: number
  created_at?: string
  updated_at?: string
}

/**
 * Calcular targets nutricionales basados en peso
 * Fórmulas:
 * - Calorías: peso × 32 kcal
 * - Proteína: peso × 1.6 g
 * - Carbos: (calorías × 45%) / 4
 * - Grasas: (calorías × 30%) / 9
 */
export function calculateNutritionTargets(weight: number) {
  const calories = Math.round(weight * 32)
  const protein = Math.round(weight * 1.6)
  const carbs = Math.round((calories * 0.45) / 4)
  const fat = Math.round((calories * 0.3) / 9)
  
  return { calories, protein, carbs, fat }
}

/**
 * Obtener métricas del usuario actual
 */
export async function getUserMetrics(): Promise<UserMetrics | null> {
  try {
    const supabase = createNutritionClient()

    // Obtener usuario actual del proyecto de autenticación original
    const authClient = await import("@/lib/supabase/client").then((m) =>
      m.createClient()
    )
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      console.error("❌ No hay usuario autenticado")
      return null
    }

    // Obtener métricas del usuario
    const { data, error } = await supabase
      .from("user_metrics")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No existe registro, retornar null
        console.log("ℹ️ No hay métricas guardadas para este usuario")
        return null
      }
      console.error("❌ Error al obtener métricas:", error.message)
      return null
    }

    console.log("✅ Métricas obtenidas:", data)
    return data
  } catch (err: any) {
    console.error("❌ Error inesperado:", err.message)
    return null
  }
}

/**
 * Guardar o actualizar métricas del usuario
 */
export async function saveUserMetrics(metrics: Omit<UserMetrics, "id" | "user_id" | "created_at" | "updated_at">): Promise<UserMetrics | null> {
  try {
    const supabase = createNutritionClient()

    // Obtener usuario actual del proyecto de autenticación original
    const authClient = await import("@/lib/supabase/client").then((m) =>
      m.createClient()
    )
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      console.error("❌ No hay usuario autenticado")
      return null
    }

    // Intentar actualizar primero
    const { data: existingData } = await supabase
      .from("user_metrics")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    let result
    if (existingData) {
      // Actualizar
      const { data, error } = await supabase
        .from("user_metrics")
        .update({
          ...metrics,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("❌ Error al actualizar métricas:", error.message)
        return null
      }
      result = data
      console.log("✅ Métricas actualizadas:", result)
    } else {
      // Crear nuevo registro
      const { data, error } = await supabase
        .from("user_metrics")
        .insert({
          user_id: user.id,
          ...metrics,
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Error al guardar métricas:", error.message)
        return null
      }
      result = data
      console.log("✅ Métricas guardadas:", result)
    }

    return result
  } catch (err: any) {
    console.error("❌ Error inesperado:", err.message)
    return null
  }
}

/**
 * Obtener el nombre completo del usuario (solo de la BD)
 */
export async function getUserName(): Promise<string> {
  try {
    const metrics = await getUserMetrics()
    
    // Si existe full_name en la BD, usarlo
    if (metrics?.full_name) {
      return metrics.full_name
    }

    // Si no existe, retornar "Usuario" (NO obtener del auth)
    return "Usuario"
  } catch (err: any) {
    console.error("❌ Error obteniendo nombre:", err.message)
    return "Usuario"
  }
}

/**
 * Actualizar el nombre completo del usuario
 */
export async function updateUserName(fullName: string): Promise<boolean> {
  try {
    const supabase = createNutritionClient()

    // Obtener usuario actual
    const authClient = await import("@/lib/supabase/client").then((m) =>
      m.createClient()
    )
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      console.error("❌ No hay usuario autenticado")
      return false
    }

    // Actualizar el nombre en user_metrics
    const { error } = await supabase
      .from("user_metrics")
      .update({ full_name: fullName })
      .eq("user_id", user.id)

    if (error) {
      console.error("❌ Error al actualizar nombre:", error.message)
      return false
    }

    console.log("✅ Nombre actualizado:", fullName)
    return true
  } catch (err: any) {
    console.error("❌ Error inesperado:", err.message)
    return false
  }
}
