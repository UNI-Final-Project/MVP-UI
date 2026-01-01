/**
 * Servicio de Perfil del Usuario
 * Obtiene métricas e información nutricional del usuario
 */

export interface UserMetrics {
  weight: number
  height: number
  calorie_goal: number
  protein_goal: number
  carbs_goal: number
  fat_goal: number
}

export interface DailyNutrition {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface UserProfile {
  metrics: UserMetrics
  daily_nutrition: DailyNutrition[]
}

export interface ProfileResponse {
  ok: boolean
  profile?: UserProfile
  error?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL || "https://658096ec9c01.ngrok-free.app"

/**
 * Obtener el perfil completo del usuario (métricas + nutrición diaria)
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log(`👤 Obteniendo perfil del usuario...`)

    const response = await fetch(`/api/user/${userId}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`❌ Error al obtener perfil: ${response.status}`)
      return null
    }

    const data: ProfileResponse = await response.json()

    if (data.ok && data.profile) {
      console.log("✅ Perfil obtenido")
      return data.profile
    } else {
      console.error("❌ Respuesta inválida del perfil")
      return null
    }
  } catch (err: any) {
    console.error(`❌ Error obteniendo perfil:`, err.message)
    return null
  }
}

/**
 * Obtener solo las métricas del usuario
 */
export async function getUserMetrics(userId: string): Promise<UserMetrics | null> {
  const profile = await getUserProfile(userId)
  return profile ? profile.metrics : null
}

/**
 * Obtener la nutrición de hoy
 */
export async function getTodayNutrition(userId: string): Promise<DailyNutrition | null> {
  const profile = await getUserProfile(userId)
  if (!profile) return null

  const today = new Date().toISOString().split("T")[0]
  return profile.daily_nutrition.find((d) => d.date === today) || null
}

/**
 * Calcular calorías restantes para hoy
 */
export async function getCaloriesRemaining(userId: string): Promise<number | null> {
  const profile = await getUserProfile(userId)
  if (!profile) return null

  const today = new Date().toISOString().split("T")[0]
  const todayNutrition = profile.daily_nutrition.find((d) => d.date === today)

  if (todayNutrition) {
    return profile.metrics.calorie_goal - todayNutrition.calories
  }

  return profile.metrics.calorie_goal
}

/**
 * Obtener progreso nutricional para hoy en formato porcentaje
 */
export async function getNutritionProgress(userId: string) {
  const profile = await getUserProfile(userId)
  if (!profile) return null

  const today = new Date().toISOString().split("T")[0]
  const todayNutrition = profile.daily_nutrition.find((d) => d.date === today)

  if (!todayNutrition) {
    return {
      calories_percent: 0,
      protein_percent: 0,
      carbs_percent: 0,
      fat_percent: 0,
    }
  }

  return {
    calories_percent: Math.round((todayNutrition.calories / profile.metrics.calorie_goal) * 100),
    protein_percent: Math.round((todayNutrition.protein / profile.metrics.protein_goal) * 100),
    carbs_percent: Math.round((todayNutrition.carbs / profile.metrics.carbs_goal) * 100),
    fat_percent: Math.round((todayNutrition.fat / profile.metrics.fat_goal) * 100),
  }
}
