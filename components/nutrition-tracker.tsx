"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { analyzeMultimodal, formatMultimodalAnswer } from "@/lib/multimodal-service"
import MarkdownResponse from "@/components/markdown-response"

interface NutritionData {
  weight: number
  height: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function NutritionTracker() {
  const [data] = useState<NutritionData>({
    weight: 75,
    height: 180,
    calories: 1850,
    protein: 120,
    carbs: 200,
    fat: 65,
  })

  // Targets diarios (ejemplo)
  const targets = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const NutritionCard = ({
    label,
    current,
    target,
    unit,
  }: {
    label: string
    current: number
    target: number
    unit: string
  }) => {
    const percentage = getProgressPercentage(current, target)
    return (
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">
            {current}
            <span className="text-lg text-muted-foreground ml-1">{unit}</span>
          </p>
        </div>
        <div className="bg-muted rounded-full h-2">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              percentage > 90 ? "bg-destructive" : "bg-accent",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Target: {target}
          {unit}
        </p>
      </Card>
    )
  }

  // ⬇️ Estado y lógica para el servicio multimodal
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [question, setQuestion] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setFile(f || null)
    if (f) {
      console.log(`📁 Archivo seleccionado: ${f.name} (${(f.size / 1024).toFixed(2)}KB)`)
    }
  }

const handleAnalyze = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setAnswer(null)

  if (!question.trim()) {
    setError("Por favor ingresa una pregunta o indicación.")
    return
  }

  if (!file) {
    setError("Por favor selecciona un archivo (video, imagen o PDF).")
    return
  }

  try {
    setLoading(true)
    console.log(`🚀 Iniciando análisis...`)
    const response = await analyzeMultimodal(file, question)
    const { answer } = formatMultimodalAnswer(response)
    setAnswer(answer)
    
    // Limpiar inputs después de éxito
    setQuestion("")
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    console.log(`✅ Análisis completado`)
  } catch (err: any) {
    console.error(`❌ Error:`, err.message)
    setError(err?.message || "Error inesperado al analizar el contenido.")
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Today&apos;s Nutrition
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <NutritionCard
            label="Calories"
            current={data.calories}
            target={targets.calories}
            unit="kcal"
          />
          <NutritionCard
            label="Protein"
            current={data.protein}
            target={targets.protein}
            unit="g"
          />
          <NutritionCard
            label="Carbs"
            current={data.carbs}
            target={targets.carbs}
            unit="g"
          />
          <NutritionCard
            label="Fat"
            current={data.fat}
            target={targets.fat}
            unit="g"
          />
        </div>

        {/* Physical Metrics */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Physical Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Weight</p>
              <p className="text-2xl font-bold text-foreground">{data.weight} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Height</p>
              <p className="text-2xl font-bold text-foreground">{data.height} cm</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">BMI</p>
              <p className="text-2xl font-bold text-foreground">
                {(data.weight / (data.height / 100) ** 2).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Calorie Goal</p>
              <p className="text-2xl font-bold text-foreground">
                {targets.calories}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ⬇️ Sección que usa el servicio /api/multimodal-analyzer */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Analizador multimodal (texto + video/imagen/PDF)
        </h3>

        <form className="space-y-4" onSubmit={handleAnalyze}>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Indicación / Pregunta
            </p>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ej: Resume el contenido..."
              className="w-full min-h-[80px] border rounded-md bg-background p-2 text-sm"
            ></textarea>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Archivo (video / imagen / PDF)
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*,application/pdf"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-xs text-muted-foreground mt-1">
                ✓ {file.name} ({(file.size / 1024).toFixed(2)}KB)
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Analizando..." : "Analizar contenido"}
          </Button>
        </form>

        {answer && (
          <div className="mt-6">
            <MarkdownResponse 
              content={answer} 
              title="Resultado del Análisis"
            />
          </div>
        )}
      </Card>
    </div>
  )
}
