// app/api/multimodal-analyzer/route.ts
// API para análisis multimodal (imágenes, videos, PDFs) con respuestas nutricionales

interface MultimodalMetadata {
  question?: string
  media_count?: number
  analysis_types?: string[]
  validation_passed?: boolean
  answer_length?: number
  execution_logs?: number
  processing_time_ms: number
}

interface MultimodalResponse {
  ok: boolean
  answer?: string
  metadata?: MultimodalMetadata
  error?: string
  detail?: any
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

export const runtime = "nodejs"

/**
 * POST endpoint para procesar contenido multimodal
 * Acepta: pregunta + archivo (imagen, video, PDF)
 * Devuelve: respuesta del API de IA + metadata
 */
export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    // Extraer datos del formulario
    const formData = await request.formData()
    const question = String(formData.get("question") ?? "").trim()
    
    // Soportar ambas formas de enviar archivos: "file" o "files"
    let files: File[] = []
    
    // Intentar obtener como "files" (múltiple)
    const filesArray = formData.getAll("files")
    if (filesArray && filesArray.length > 0) {
      files = filesArray.filter((f) => f instanceof File) as File[]
    }
    
    // Si no hay "files", intentar obtener como "file" (singular)
    if (files.length === 0) {
      const singleFile = formData.get("file")
      if (singleFile instanceof File) {
        files = [singleFile]
      }
    }

    // Validaciones
    if (!question) {
      return Response.json(
        { ok: false, error: "La pregunta es obligatoria" },
        { status: 400 }
      )
    }

    if (files.length === 0) {
      return Response.json(
        { ok: false, error: "El archivo es obligatorio" },
        { status: 400 }
      )
    }

    // Construir FormData para FastAPI
    const apiFormData = new FormData()
    apiFormData.append("question", question)
    apiFormData.append("use_files_api", "false")
    
    // Agregar todos los archivos como "files"
    for (const file of files) {
      apiFormData.append("files", file, file.name)
    }

    // Setup para timeout (120 segundos para archivos grandes)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000)

    let response: Response
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_AI_API_URL
      
      if (!apiBaseUrl) {
        return Response.json(
          {
            ok: false,
            error: "NEXT_PUBLIC_AI_API_URL no está configurada",
            hint: "Configura la variable de entorno NEXT_PUBLIC_AI_API_URL en .env.local",
            example: "NEXT_PUBLIC_AI_API_URL=https://f421eb1aa022.ngrok-free.app",
          },
          { status: 500 }
        )
      }

      const apiUrl = `${apiBaseUrl}/qa`
      response = await fetch(apiUrl, {
        method: "POST",
        body: apiFormData,
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeoutId)
    }

    // Intentar parsear como JSON
    const rawText = await response.text()
    let apiResponse: MultimodalResponse

    try {
      apiResponse = JSON.parse(rawText)
    } catch (parseError) {
      return Response.json(
        {
          ok: false,
          error: "El API devolvió una respuesta no JSON",
          status: response.status,
          contentType: response.headers.get("content-type"),
          bodySnippet: rawText.slice(0, 1000),
          hint: "Verifica que el servidor FastAPI esté activo en la URL correcta",
        },
        { status: 502 }
      )
    }

    // Si el código HTTP es error
    if (!response.ok) {
      return Response.json(
        {
          ok: false,
          error: `El API devolvió status ${response.status}`,
          detail: apiResponse,
        },
        { status: response.status }
      )
    }

    // Si el API devolvió ok=false pero HTTP 200
    if (apiResponse.ok === false) {
      return Response.json(apiResponse, { status: 400 })
    }

    // Éxito: enriquecer respuesta con metadata interna
    const processingTime = Date.now() - startTime
    const enrichedResponse: MultimodalResponse = {
      ok: true,
      answer: apiResponse.answer,
      metadata: {
        ...(apiResponse.metadata || {}),
        processing_time_ms: (apiResponse.metadata?.processing_time_ms ?? 0) + processingTime,
      } as MultimodalMetadata,
    }

    return Response.json(enrichedResponse, {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    })
  } catch (error) {
    const processingTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"

    // Detectar timeout
    if (errorMessage.includes("abort") || errorMessage.includes("timeout")) {
      return Response.json(
        {
          ok: false,
          error: "El procesamiento tardó demasiado (timeout de 120s). Intenta con un archivo más pequeño.",
          detail: errorMessage,
        },
        { status: 408 }
      )
    }

    return Response.json(
      {
        ok: false,
        error: `Error procesando contenido: ${errorMessage}`,
        processingTime,
      },
      { status: 500 }
    )
  }
}
