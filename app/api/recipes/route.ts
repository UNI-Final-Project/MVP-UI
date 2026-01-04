export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query || !query.trim()) {
      return Response.json({ error: "Query is required" }, { status: 400 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 120000) // 10 second timeout

    const response = await fetch("https://recipes-api-541144187637.us-west4.run.app/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return Response.json({ error: `API returned status ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ error: `Failed to fetch recipes: ${errorMessage}` }, { status: 500 })
  }
}
