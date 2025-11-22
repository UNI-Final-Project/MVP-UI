// app/api/multimodal-analyzer/route.ts

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const question = String(formData.get("question") ?? "").trim()
    const file = formData.get("file")

    if (!question) {
      return Response.json(
        { ok: false, error: "La pregunta es obligatoria" },
        { status: 400 }
      )
    }

    if (!(file instanceof Blob)) {
      return Response.json(
        { ok: false, error: "El archivo es obligatorio" },
        { status: 400 }
      )
    }

    // Armamos el FormData para FastAPI
    const apiFormData = new FormData()
    apiFormData.append("question", question)
    apiFormData.append("use_files_api", "false")
    apiFormData.append(
      "files",
      file,
      (file as File).name ?? "upload.bin"
    )

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(
      "https://api-nutrition-759047338260.us-west4.run.app/qa",
      {
        method: "POST",
        body: apiFormData,
        signal: controller.signal,
      }
    )

    clearTimeout(timeout)

    const rawText = await response.text()
    console.log("[multimodal-analyzer] status:", response.status)
    console.log("[multimodal-analyzer] RAW RESPONSE (primeros 300 chars):")
    console.log(rawText.slice(0, 300))

    // Si FastAPI devolvió HTML o algo que no es JSON
    let parsed: any
    try {
      parsed = JSON.parse(rawText)
    } catch (e) {
      return Response.json(
        {
          ok: false,
          error: "FastAPI devolvió una respuesta no JSON",
          status: response.status,
          bodySnippet: rawText.slice(0, 500),
        },
        { status: 500 }
      )
    }

    // Si FastAPI devolvió error, lo propagamos pero igual como JSON
    if (!response.ok) {
      return Response.json(
        {
          ok: false,
          error: `FastAPI devolvió status ${response.status}`,
          detail: parsed,
        },
        { status: response.status }
      )
    }

    // Éxito: devolvemos el JSON del backend
    return Response.json(parsed, {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    })
  } catch (error) {
    console.error("[multimodal-analyzer] ERROR:", error)
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return Response.json(
      { ok: false, error: `Error procesando contenido multimodal: ${msg}` },
      { status: 500 }
    )
  }
}
