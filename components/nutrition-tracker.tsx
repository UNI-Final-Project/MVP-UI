"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { analyzeMultimodal, formatMultimodalAnswer } from "@/lib/multimodal-service"
import { getUserMetrics, saveUserMetrics, calculateNutritionTargets, updateUserName, getUserName } from "@/lib/user-metrics-service"
import { getTodayNutrition, saveTodayNutrition } from "@/lib/daily-nutrition-service"
import { analyzeMealImage } from "@/lib/meal-analyzer-service"
import { getCurrentUser } from "@/lib/user-auth-service"
import MarkdownResponse from "@/components/markdown-response"
import NutritionAdvisor from "@/components/nutrition-advisor"

interface NutritionData {
  weight: number
  height: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface NutritionTrackerProps {
  showOnlyAnalyzer?: boolean
}

export default function NutritionTracker({ showOnlyAnalyzer = false }: NutritionTrackerProps) {
  const [data, setData] = useState<NutritionData>({
    weight: 75,
    height: 180,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })

  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("Usuario")
  const [editMode, setEditMode] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [savingMetrics, setSavingMetrics] = useState(false)
  const [loadingMetrics, setLoadingMetrics] = useState(true)
  const [editNutritionMode, setEditNutritionMode] = useState(false)
  const [savingNutrition, setSavingNutrition] = useState(false)
  const [showAdvisor, setShowAdvisor] = useState(false)

  // Cache timestamps para evitar llamadas frecuentes
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos en milisegundos
  const isDataStale = () => Date.now() - lastFetchTime > CACHE_DURATION

  // Targets diarios (objetivos del usuario)
  const [targets, setTargets] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
  })

  // Cargar métricas del usuario y nutrición de hoy al montar el componente
  useEffect(() => {
    const loadData = async () => {
      // Verificar si los datos aún están frescos en cache
      if (lastFetchTime > 0 && !isDataStale() && userId) {
        console.log("📦 Usando datos en cache (no necesita refetch)")
        return
      }

      setLoadingMetrics(true)
      
      // Obtener solo el ID del usuario autenticado
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUserId(currentUser.id)
      }
      
      // Cargar información personal
      const userMetrics = await getUserMetrics()
      if (userMetrics) {
        setData({
          weight: userMetrics.weight,
          height: userMetrics.height,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
        })
        setTargets({
          calories: userMetrics.calorie_goal || userMetrics.calorie_goal,
          protein: userMetrics.protein_goal || 150,
          carbs: userMetrics.carbs_goal || 250,
          fat: userMetrics.fat_goal || 70,
        })
      }

      // Obtener el nombre SOLO de user_metrics
      const nameFromDB = await getUserName()
      setUserName(nameFromDB)

      // Cargar nutrición de hoy
      const todayNutrition = await getTodayNutrition()
      if (todayNutrition) {
        setData((prev) => ({
          ...prev,
          calories: todayNutrition.calories,
          protein: todayNutrition.protein,
          carbs: todayNutrition.carbs,
          fat: todayNutrition.fat,
        }))
      }

      // Actualizar timestamp del cache
      setLastFetchTime(Date.now())
      setLoadingMetrics(false)
      console.log("✅ Datos cargados y cacheados")
    }

    loadData()
  }, [])

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const handleSaveMetrics = async () => {
    setSavingMetrics(true)
    
    // Calcular targets automáticamente basado en peso
    const calculatedTargets = calculateNutritionTargets(data.weight)
    
    const success = await saveUserMetrics({
      full_name: userName,
      weight: data.weight,
      height: data.height,
      calorie_goal: targets.calories,
      protein_goal: targets.protein,
      carbs_goal: targets.carbs,
      fat_goal: targets.fat,
    })
    
    // Guardar el nombre si cambió
    if (userName) {
      await updateUserName(userName)
    }
    
    if (success) {
      setEditMode(false)
      console.log("✅ Métricas guardadas exitosamente")
      console.log("📊 Targets calculados:", calculatedTargets)
    }
    setSavingMetrics(false)
  }

  const handleEditTodayNutrition = async () => {
    setSavingMetrics(true)
    const updated = await saveTodayNutrition({
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
    })
    if (updated) {
      setEditNutritionMode(false)
      console.log("✅ Nutrición de hoy actualizada")
    }
    setSavingMetrics(false)
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
  const [filePreviews, setFilePreviews] = useState<(string | null)[]>([])
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0)
  const [previewLoadError, setPreviewLoadError] = useState<Record<number, boolean>>({})
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles)
      // Revoke any previous previews
      setFilePreviews((prev) => {
        prev.forEach((p) => p && URL.revokeObjectURL(p))
        return []
      })
      setFiles(fileArray)
      // Crear previews para imágenes y vídeos
      const previews = fileArray.map((f) => (f.type.startsWith("image/") || f.type.startsWith("video/") ? URL.createObjectURL(f) : null))
      setFilePreviews(previews)
      setPreviewLoadError({})
      setActivePreviewIndex(0)
      console.log(`📁 ${fileArray.length} archivo(s) seleccionado(s):`)
      fileArray.forEach((f) => {
        console.log(`   - ${f.name} (${(f.size / 1024).toFixed(2)}KB)`)
      })
    }
  }

  const handleRemoveFile = (index: number) => {
    // Revoke the preview URL for this file if exists
    setFilePreviews((prev) => {
      const url = prev[index]
      if (url) URL.revokeObjectURL(url)
      const next = prev.filter((_, i) => i !== index)
      return next
    })
    setPreviewLoadError((prev) => {
      const next: Record<number, boolean> = {}
      Object.keys(prev).forEach((k) => {
        const ki = parseInt(k)
        if (ki < index) next[ki] = prev[ki]
        if (ki > index) next[ki - 1] = prev[ki]
      })
      return next
    })
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index)
      setActivePreviewIndex((cur) => {
        if (next.length === 0) return 0
        if (index < cur) return cur - 1
        if (cur >= next.length) return next.length - 1
        return cur
      })
      if (next.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return next
    })
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
  // Revoke all preview URLs
  filePreviews.forEach((p) => p && URL.revokeObjectURL(p))
  setFilePreviews([])
  setFiles([])
  setActivePreviewIndex(0)
  setPreviewLoadError({})
  if (fileInputRef.current) {
    fileInputRef.current.value = ""
  }
  console.log("🗑️ Archivos limpios")
}

  const [showNutritionForm, setShowNutritionForm] = useState(false)
  const [newNutrition, setNewNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })
  const [savingNutritionForm, setSavingNutritionForm] = useState(false)
  const mealImageInputRef = useRef<HTMLInputElement>(null)
  const [analyzingMeal, setAnalyzingMeal] = useState(false)
  const [mealImagePreview, setMealImagePreview] = useState<string | null>(null)

  const handleMealImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Generar previsualización de la imagen
    if (mealImagePreview) {
      try { URL.revokeObjectURL(mealImagePreview) } catch {}
    }
    const previewUrl = URL.createObjectURL(file)
    setMealImagePreview(previewUrl)

    console.log(`📸 Analizando comida: ${file.name}`)
    setAnalyzingMeal(true)

    const result = await analyzeMealImage(file)
    if (result && result.ok) {
      // Llenar automáticamente los campos
      setNewNutrition({
        calories: result.nutrients.calories,
        protein: Math.round(result.nutrients.protein_g),
        carbs: Math.round(result.nutrients.carbs_g),
        fat: Math.round(result.nutrients.fat_g),
      })
      console.log("✅ Campos llenados automáticamente")
    } else {
      console.error("❌ No se pudo analizar la comida")
    }

    setAnalyzingMeal(false)
  }

  // Limpiar object URLs al desmontar
  useEffect(() => {
    return () => {
      filePreviews.forEach((p) => p && URL.revokeObjectURL(p))
      if (mealImagePreview) {
        try { URL.revokeObjectURL(mealImagePreview) } catch {}
      }
    }
  }, [filePreviews, mealImagePreview])

  const handleAddNutrition = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingNutritionForm(true)

    const updated = await saveTodayNutrition({
      calories: data.calories + newNutrition.calories,
      protein: data.protein + newNutrition.protein,
      carbs: data.carbs + newNutrition.carbs,
      fat: data.fat + newNutrition.fat,
    })

    if (updated) {
      setData((prev) => ({
        ...prev,
        calories: updated.calories,
        protein: updated.protein,
        carbs: updated.carbs,
        fat: updated.fat,
      }))
      setNewNutrition({ calories: 0, protein: 0, carbs: 0, fat: 0 })
      setShowNutritionForm(false)
      console.log("✅ Nutrición registrada")
    }
    
    setSavingNutritionForm(false)
  }


  return (
    <div className="space-y-8">
      {/* Header de Bienvenida */}
      {!showOnlyAnalyzer && (
        <div className="bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/15 rounded-2xl p-4 sm:p-8 border border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-2">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-2xl sm:text-3xl font-bold bg-background border rounded px-3 py-1 w-full sm:w-auto"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        await updateUserName(userName)
                        setEditingName(false)
                      }}
                      size="sm"
                      variant="default"
                    >
                      ✓
                    </Button>
                    <Button
                      onClick={() => setEditingName(false)}
                      size="sm"
                      variant="outline"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-start sm:items-center flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent break-words">
                      ¡Hola, {userName}! 👋
                    </h1>
                    <Button
                      onClick={() => setEditingName(true)}
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                      ✏️
                    </Button>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sección de Información Personal (visible solo si no es analyzer) */}
      {!showOnlyAnalyzer && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Tu Información Personal
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAdvisor(true)}
                variant="outline"
                size="sm"
                className="bg-accent/10"
              >
                🤖 Asesor
              </Button>
              {!editMode ? (
                <Button
                  onClick={() => setEditMode(true)}
                  variant="outline"
                  size="sm"
                >
                  ✏️ Editar
                </Button>
              ) : null}
            </div>
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Nombre Completo</p>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full border rounded-md bg-background p-2 text-sm"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Peso (kg)</p>
                  <input
                    type="number"
                    step="0.1"
                    value={data.weight}
                    onChange={(e) => {
                      const newWeight = parseFloat(e.target.value) || 0
                      setData({ ...data, weight: newWeight })
                      // Actualizar targets automáticamente
                      const newTargets = calculateNutritionTargets(newWeight)
                      setTargets(newTargets)
                    }}
                    className="w-full border rounded-md bg-background p-2 text-sm"
                    placeholder="Ej: 75"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Altura (cm)</p>
                  <input
                    type="number"
                    step="0.1"
                    value={data.height}
                    onChange={(e) =>
                      setData({ ...data, height: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full border rounded-md bg-background p-2 text-sm"
                    placeholder="Ej: 180"
                  />
                </div>
              </div>

              {/* Objetivos Nutricionales */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">📊 Objetivos Diarios (calculados automáticamente)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Calorías</p>
                    <input
                      type="number"
                      value={targets.calories}
                      onChange={(e) =>
                        setTargets({
                          ...targets,
                          calories: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border rounded-md bg-background p-2 text-xs"
                      placeholder="kcal"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Proteína</p>
                    <input
                      type="number"
                      value={targets.protein}
                      onChange={(e) =>
                        setTargets({
                          ...targets,
                          protein: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border rounded-md bg-background p-2 text-xs"
                      placeholder="g"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Carbos</p>
                    <input
                      type="number"
                      value={targets.carbs}
                      onChange={(e) =>
                        setTargets({
                          ...targets,
                          carbs: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border rounded-md bg-background p-2 text-xs"
                      placeholder="g"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Grasas</p>
                    <input
                      type="number"
                      value={targets.fat}
                      onChange={(e) =>
                        setTargets({
                          ...targets,
                          fat: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border rounded-md bg-background p-2 text-xs"
                      placeholder="g"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveMetrics}
                  disabled={savingMetrics}
                  size="sm"
                >
                  {savingMetrics ? "Guardando..." : "💾 Guardar"}
                </Button>
                <Button
                  onClick={() => setEditMode(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Peso</p>
                  <p className="text-2xl font-bold text-foreground">{data.weight} kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Altura</p>
                  <p className="text-2xl font-bold text-foreground">{data.height} cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">IMC</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(data.weight / (data.height / 100) ** 2).toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Objetivos Nutricionales */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">📊 Objetivos Diarios</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs text-muted-foreground">Calorías</p>
                    <p className="text-xl font-bold text-foreground">{targets.calories}</p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs text-muted-foreground">Proteína</p>
                    <p className="text-xl font-bold text-foreground">{targets.protein}</p>
                    <p className="text-xs text-muted-foreground">g</p>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs text-muted-foreground">Carbos</p>
                    <p className="text-xl font-bold text-foreground">{targets.carbs}</p>
                    <p className="text-xs text-muted-foreground">g</p>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs text-muted-foreground">Grasas</p>
                    <p className="text-xl font-bold text-foreground">{targets.fat}</p>
                    <p className="text-xs text-muted-foreground">g</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Sección de Nutrición (visible solo si no es analyzer) */}
      {!showOnlyAnalyzer && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Today&apos;s Nutrition <span className="text-sm sm:text-base text-muted-foreground">(Inicia en 0)</span>
            </h2>
            <div className="flex gap-2 flex-shrink-0">
              {!showNutritionForm && (
                <Button
                  onClick={() => setShowNutritionForm(true)}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  <span className="hidden sm:inline">➕ Registrar Comida</span>
                  <span className="sm:hidden">➕</span>
                </Button>
              )}
              {!editNutritionMode && (
                <Button
                  onClick={() => setEditNutritionMode(true)}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  <span className="hidden sm:inline">✏️ Editar</span>
                  <span className="sm:hidden">✏️</span>
                </Button>
              )}
            </div>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {editNutritionMode ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Calorías (kcal)</p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={data.calories || ""}
                  onChange={(e) => {
                    const val = e.target.value
                    setData({
                      ...data,
                      calories: val === "" ? 0 : parseInt(val) || 0,
                    })
                  }}
                  className="w-full border rounded-md bg-background p-2 text-sm mb-3"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Proteína (g)</p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={data.protein || ""}
                  onChange={(e) => {
                    const val = e.target.value
                    setData({
                      ...data,
                      protein: val === "" ? 0 : parseInt(val) || 0,
                    })
                  }}
                  className="w-full border rounded-md bg-background p-2 text-sm mb-3"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Carbos (g)</p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={data.carbs || ""}
                  onChange={(e) => {
                    const val = e.target.value
                    setData({
                      ...data,
                      carbs: val === "" ? 0 : parseInt(val) || 0,
                    })
                  }}
                  className="w-full border rounded-md bg-background p-2 text-sm mb-3"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Grasas (g)</p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={data.fat || ""}
                  onChange={(e) => {
                    const val = e.target.value
                    setData({
                      ...data,
                      fat: val === "" ? 0 : parseInt(val) || 0,
                    })
                  }}
                  className="w-full border rounded-md bg-background p-2 text-sm mb-3"
                />
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {editNutritionMode && (
          <div className="flex gap-2 mb-6">
            <Button
              onClick={handleEditTodayNutrition}
              disabled={savingMetrics}
              size="sm"
            >
              {savingMetrics ? "Guardando..." : "💾 Guardar"}
            </Button>
            <Button
              onClick={() => setEditNutritionMode(false)}
              variant="outline"
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        )}

        {/* Formulario para agregar comida */}
        {showNutritionForm && (
          <Card className="p-4 mb-4 bg-muted">
            <form onSubmit={handleAddNutrition} className="space-y-3">
              <h4 className="text-sm font-semibold">Registrar Comida</h4>
              
              {/* Opción: Subir foto para análisis automático */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">📸 Foto de la comida (se analizará automáticamente)</p>
                <input
                  ref={mealImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleMealImageChange}
                  className="w-full border rounded-md bg-background p-2 text-xs"
                  disabled={analyzingMeal}
                />
                {mealImagePreview && (
                  <img
                    src={mealImagePreview}
                    alt="Previsualización de la comida"
                    className="mt-2 max-h-40 rounded-md object-cover border"
                  />
                )}
                {analyzingMeal && <p className="text-xs text-muted-foreground mt-1">🔄 Analizando imagen...</p>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Calorías</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newNutrition.calories || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      setNewNutrition({
                        ...newNutrition,
                        calories: val === "" ? 0 : parseInt(val) || 0,
                      })
                    }}
                    className="w-full border rounded-md bg-background p-2 text-xs"
                    placeholder="0"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Proteína (g)</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newNutrition.protein || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      setNewNutrition({
                        ...newNutrition,
                        protein: val === "" ? 0 : parseInt(val) || 0,
                      })
                    }}
                    className="w-full border rounded-md bg-background p-2 text-xs"
                    placeholder="0"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Carbos (g)</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newNutrition.carbs || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      setNewNutrition({
                        ...newNutrition,
                        carbs: val === "" ? 0 : parseInt(val) || 0,
                      })
                    }}
                    className="w-full border rounded-md bg-background p-2 text-xs"
                    placeholder="0"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Grasas (g)</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newNutrition.fat || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      setNewNutrition({
                        ...newNutrition,
                        fat: val === "" ? 0 : parseInt(val) || 0,
                      })
                    }}
                    className="w-full border rounded-md bg-background p-2 text-xs"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={savingNutritionForm}>
                  {savingNutritionForm ? "Guardando..." : "✅ Agregar"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowNutritionForm(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}
        </div>
      )}

      {/* ⬇️ Sección que usa el servicio /api/multimodal-analyzer */}
      {showOnlyAnalyzer && (
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
                  <div>
                    {/* Main viewer */}
                    <div className="mb-2">
                      {filePreviews[activePreviewIndex] ? (
                        previewLoadError[activePreviewIndex] ? (
                          <div className="w-full max-h-96 flex items-center justify-center rounded-md bg-muted p-6">
                            <div className="text-center">
                              <div className="text-3xl">📁</div>
                              <p className="text-xs text-muted-foreground mt-2">Previsualización no disponible</p>
                            </div>
                          </div>
                        ) : files[activePreviewIndex]?.type.startsWith("video/") ? (
                          <video
                            src={filePreviews[activePreviewIndex] as string}
                            controls
                            onError={() => setPreviewLoadError((p) => ({ ...p, [activePreviewIndex]: true }))}
                            className="w-full max-h-96 rounded-md bg-black"
                          />
                        ) : (
                          <img
                            src={filePreviews[activePreviewIndex] as string}
                            alt={`Previsualización ${files[activePreviewIndex]?.name}`}
                            onError={() => setPreviewLoadError((p) => ({ ...p, [activePreviewIndex]: true }))}
                            className="w-full max-h-96 object-contain rounded-md"
                          />
                        )
                      ) : (
                        <p className="text-xs text-muted-foreground">Sin previsualización disponible</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      {files.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-muted p-2 rounded text-xs"
                        >
                          <div className="flex items-center gap-3">
                            {filePreviews[idx] && !previewLoadError[idx] ? (
                              files[idx]?.type.startsWith("video/") ? (
                                <video
                                  src={filePreviews[idx] as string}
                                  className={`w-16 h-10 object-cover rounded cursor-pointer ${idx === activePreviewIndex ? 'ring-2 ring-primary' : ''}`}
                                  muted
                                  playsInline
                                  autoPlay
                                  loop
                                  onClick={() => setActivePreviewIndex(idx)}
                                  onError={() => setPreviewLoadError((p) => ({ ...p, [idx]: true }))}
                                />
                              ) : (
                                <img
                                  src={filePreviews[idx] as string}
                                  alt={`Previsualización ${f.name}`}
                                  className={`w-16 h-10 object-cover rounded cursor-pointer ${idx === activePreviewIndex ? 'ring-2 ring-primary' : ''}`}
                                  onClick={() => setActivePreviewIndex(idx)}
                                  onError={() => setPreviewLoadError((p) => ({ ...p, [idx]: true }))}
                                />
                              )
                            ) : (
                              <div className={`w-16 h-10 flex items-center justify-center rounded bg-muted text-lg ${idx === activePreviewIndex ? 'ring-2 ring-primary' : ''}`} onClick={() => setActivePreviewIndex(idx)}>
                                <span>📁</span>
                              </div>
                            )}
                            <span>
                              {f.name} ({(f.size / 1024).toFixed(2)}KB)
                            </span>
                          </div>
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
      )}

      {/* Chatbot del Asesor Nutricional */}
      {userId && (
        <NutritionAdvisor
          userId={userId}
          userName={userName}
          isOpen={showAdvisor}
          onClose={() => setShowAdvisor(false)}
        />
      )}
    </div>
  )
}
