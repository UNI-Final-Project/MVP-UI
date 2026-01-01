export interface MealAnalysisResponse {
  ok: boolean
  nutrients: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    fiber_g?: number
    sugar_g?: number
    sodium_mg?: number
  }
  metadata?: {
    method: string
    model: string
    processing_time_ms: number
  }
}

/**
 * Analizar una imagen de comida usando el servicio de análisis
 */
export async function analyzeMealImage(file: File): Promise<MealAnalysisResponse | null> {
  try {
    console.log(`🍽️ Analizando imagen de comida: ${file.name}`)

    const formData = new FormData()
    formData.append("file", file)

    const apiBaseUrl = process.env.NEXT_PUBLIC_AI_API_URL
    if (!apiBaseUrl) {
      console.error("❌ NEXT_PUBLIC_AI_API_URL no está configurada")
      return null
    }

    const apiUrl = `${apiBaseUrl}/analyze-meal`
    
    // Usar AbortController para timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 segundos

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Error en análisis: ${response.status} ${response.statusText}`)
      console.error(`📋 Respuesta del servidor:`, errorText)
      return null
    }

    const data: MealAnalysisResponse = await response.json()
    console.log("✅ Análisis completado:", data)
    return data
  } catch (err: any) {
    console.error(`❌ Error al analizar comida:`, err.message)
    return null
  }
}
