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
  const [files, setFiles] = useState<File[]>([])
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles)
      setFiles(fileArray)
      console.log(`📁 ${fileArray.length} archivo(s) seleccionado(s):`)
      fileArray.forEach((f) => {
        console.log(`   - ${f.name} (${(f.size / 1024).toFixed(2)}KB)`)
      })
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    if (files.length === 1) {
      // Si era el último archivo, limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
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

  if (files.length === 0) {
    setError("Por favor selecciona al menos un archivo (video, imagen o PDF).")
    return
  }

  try {
    setLoading(true)
    console.log(`🚀 Iniciando análisis de ${files.length} archivo(s)...`)
    const response = await analyzeMultimodal(files, question)
    const { answer } = formatMultimodalAnswer(response)
    setAnswer(answer)
    
    // Limpiar solo la pregunta (los archivos se mantienen para reutilizar)
    setQuestion("")
    console.log(`✅ Análisis completado`)
  } catch (err: any) {
    console.error(`❌ Error:`, err.message)
    setError(err?.message || "Error inesperado al analizar el contenido.")
  } finally {
    setLoading(false)
  }
}

const handleClearFiles = () => {
  setFiles([])
  if (fileInputRef.current) {
    fileInputRef.current.value = ""
  }
  console.log("🗑️ Archivos limpios")
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
              Archivos (video / imagen / PDF) - Puedes seleccionar múltiples
            </p>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/*,image/*,application/pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
              {files.length > 0 && (
                <Button
                  type="button"
                  onClick={handleClearFiles}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  🗑️ Limpiar
                </Button>
              )}
            </div>
            
            {/* Lista de archivos seleccionados */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {files.length} archivo(s) seleccionado(s):
                </p>
                <div className="space-y-1">
                  {files.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-muted p-2 rounded text-xs"
                    >
                      <span>
                        📄 {f.name} ({(f.size / 1024).toFixed(2)}KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-destructive hover:text-destructive/80 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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
