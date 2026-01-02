# 📋 Documentación Detallada - Funcionalidades IA

## ÍNDICE
1. [Nutrition Advisor Chat (Chatbot Nutricional)](#nutrition-advisor-chat)
2. [Meal Analyzer (Analizador de Comidas Multimodal)](#meal-analyzer)

---

# 🤖 NUTRITION ADVISOR CHAT

## a) Descripción General y Propósito

### Objetivo Principal
El **Nutrition Advisor Chat** es un sistema conversacional de inteligencia artificial diseñado para proporcionar asesoramiento nutricional personalizado en tiempo real. Funciona como un asistente inteligente que interactúa con los usuarios mediante lenguaje natural, respondiendo preguntas sobre nutrición, dieta, planes alimenticios y metas de salud.

### Caso de Uso
- Usuarios reciben recomendaciones nutricionales personalizadas
- Responde preguntas sobre calorías, macronutrientes y alimentos
- Mantiene historial de conversaciones para seguimiento continuo
- Proporciona asesoramiento contextualizado basado en datos del usuario

### Valor Agregado
- **Accesibilidad**: Disponible 24/7 dentro de la aplicación
- **Personalización**: Conoce el perfil del usuario (nombre, metas, métricas)
- **Contexto**: Integrado con datos nutricionales del usuario
- **Continuidad**: Mantiene historial para referencias futuras

---

## b) Modelo Utilizado

### Tecnología Base
- **Proveedor**: Google Gemini API
- **Tipo de Modelo**: Modelo de lenguaje conversacional (LLM)
- **Capacidades**: Procesamiento de lenguaje natural, generación de respuestas contextual

### Especificaciones
```
Modelo: Gemini 1.5 (o versión disponible)
Tipo: Generative AI API
Entrada: Mensajes de texto del usuario + contexto nutricional
Salida: Respuestas textuales en formato Markdown
```

### Integración Backend
- **Endpoint**: `/api/chat/{userId}`
- **Método HTTP**: POST
- **Protocolo**: REST API
- **Formato**: JSON

---

## c) Instrucciones de Sistema (System Prompts)

### Configuración del Prompt del Sistema
El modelo recibe instrucciones del sistema que definen su comportamiento:

```
ROLE: "You are a professional nutrition advisor chatbot"
LANGUAGE: "Spanish (Spanish from Spain)"
CONTEXT_AWARENESS: "Know the user's nutritional data and goals"
TONE: "Professional, empathetic, and encouraging"
```

### Parámetros de Comportamiento
```javascript
{
  "model": "gemini-1.5-flash",
  "system_instruction": "Eres un asesor nutricional profesional. Proporciona recomendaciones basadas en evidencia científica. Sé empático y motivador. Responde siempre en español.",
  "temperature": 0.7,           // Creatividad moderada
  "top_p": 0.9,                // Diversidad controlada
  "max_output_tokens": 2048    // Límite de respuesta
}
```

### Instrucciones Específicas Implementadas
- ✅ Responder únicamente sobre nutrición y salud
- ✅ Usar datos del usuario cuando sea relevante
- ✅ Proporcionar información verificada y basada en evidencia
- ✅ Mantener tono profesional y de apoyo
- ✅ Formatear respuestas en Markdown para legibilidad

---

## d) Tipos de Entradas (Datos Multimodales)

### Entrada Principal
1. **Mensaje de Texto del Usuario**
   - Tipo: String
   - Longitud: Variable (recomendado 1-500 caracteres)
   - Formato: Texto libre en español
   - Ejemplo: "¿Cuántas calorías tiene una manzana?"

### Contexto del Usuario (Datos Adjuntos)
```typescript
interface UserContext {
  user_id: string           // ID único del usuario
  user_name: string         // Nombre del usuario
  user_metrics?: {
    calorie_goal: number    // Objetivo de calorías diarias
    protein_goal: number    // Objetivo de proteína (g)
    carbs_goal: number      // Objetivo de carbohidratos (g)
    fat_goal: number        // Objetivo de grasas (g)
  }
  daily_nutrition?: {
    current_calories: number
    current_protein: number
    current_carbs: number
    current_fat: number
  }
}
```

### Payload de Solicitud
```json
{
  "message": "¿Qué alimentos son ricos en proteína?",
  "user_name": "Juan",
  "user_id": "user_12345",
  "timestamp": "2026-01-01T10:30:00Z"
}
```

---

## e) Arquitectura y Flujo de Procesamiento

### Flujo General
```
Usuario (Frontend)
    ↓
    ↓ [Input: Mensaje de texto]
    ↓
┌─────────────────────────────────┐
│  Validación de Entrada          │
│  - Verificar no vacío           │
│  - Verificar longitud           │
│  - Verificar caracteres válidos │
└─────────────────────────────────┘
    ↓
    ↓ [Mensaje validado + Contexto]
    ↓
┌─────────────────────────────────┐
│  API Backend NutritionAI        │
│  (/api/chat/{userId})           │
└─────────────────────────────────┘
    ↓
    ↓ [Sistema de prompts]
    ↓
┌─────────────────────────────────┐
│  Google Gemini API              │
│  - Procesa mensaje              │
│  - Genera respuesta             │
│  - Aplica instrucciones sistema │
└─────────────────────────────────┘
    ↓
    ↓ [Respuesta de IA]
    ↓
┌─────────────────────────────────┐
│  Postprocesamiento              │
│  - Formatear Markdown           │
│  - Limpiar caracteres especiales│
│  - Agregar metadatos            │
└─────────────────────────────────┘
    ↓
    ↓ [Respuesta procesada]
    ↓
┌─────────────────────────────────┐
│  Almacenamiento                 │
│  - Guardar en BD                │
│  - Actualizar historial         │
└─────────────────────────────────┘
    ↓
    ↓ [Respuesta + Metadata]
    ↓
Frontend (Mostrar respuesta)
```

### Componentes del Sistema

#### 1. **Frontend (React/Next.js)**
```typescript
// Componente: NutritionAdvisor.tsx
- Interfaz de chat con inputs de usuario
- Visualización de conversación
- Gestión de estado local
- Llamadas a API backend
```

#### 2. **Backend API**
```typescript
// Endpoint: /api/chat/{userId}
- Recibe mensaje del usuario
- Enriquece con contexto nutricional
- Llama a Google Gemini API
- Procesa y valida respuesta
- Guarda en base de datos
- Retorna respuesta formateada
```

#### 3. **Google Gemini API**
```
- Procesa el mensaje con instrucciones del sistema
- Genera respuesta contextualizada
- Aplica restricciones de tokens
- Retorna respuesta formateada
```

#### 4. **Base de Datos**
```typescript
// Tabla: chat_history
- user_id
- message_type ('user' | 'assistant')
- content
- created_at
- metadata (opcionales)
```

### Servicios TypeScript Implementados

```typescript
// Archivo: lib/nutrition-advisor-service.ts

export class NutritionChatbot {
  private userId: string
  private userName: string
  messages: ChatMessage[] = []

  // Enviar mensaje y recibir respuesta
  async sendMessage(userMessage: string): Promise<string | null>

  // Cargar historial de conversaciones
  async loadHistory(): Promise<ChatMessage[]>

  // Limpiar historial
  async clearHistory(): Promise<boolean>

  // Obtener mensajes locales
  getMessages(): ChatMessage[]
}
```

---

## f) Validaciones y Control de Calidad de Entrada

### Validaciones en Frontend
```typescript
// Validaciones antes de enviar
1. No vacío: message.trim().length > 0
2. Longitud mínima: message.length >= 3
3. Longitud máxima: message.length <= 500
4. Caracteres válidos: Alfabéticos, números, signos de puntuación
5. Sin spam: Detectar repeticiones excesivas
```

### Validaciones en Backend
```typescript
// Validaciones en API /api/chat/{userId}
1. Usuario existe y está autenticado
2. Mensaje no vacío: message.trim().length > 0
3. Longitud válida: 3 <= length <= 500
4. Rate limiting: Max 10 mensajes/minuto por usuario
5. Tokens válidos: Estimación de tokens antes de envío
```

### Validaciones de Respuesta de IA
```typescript
// Después de recibir respuesta de Gemini
1. Respuesta no vacía
2. Contenido relevante a nutrición
3. Sin contenido ofensivo o inapropiado
4. Longitud razonable: <= 2048 tokens
5. Formato válido (JSON)
6. Ausencia de errores en API
```

### Manejo de Errores
```typescript
// Escenarios de error capturados
if (!response.ok) {
  // Error HTTP (400, 401, 500, etc.)
  console.error(`Error: ${response.status}`)
  return null
}

if (data?.ok === false) {
  // Error en respuesta JSON
  throw new Error(data?.error || "Error desconocido")
}

if (!data.response) {
  // Respuesta vacía o sin contenido
  console.error("Respuesta inválida")
  return null
}
```

### Control de Calidad
- ✅ Timeout: 30 segundos máximo por solicitud
- ✅ Reintentos: 2 intentos automáticos en caso de fallo
- ✅ Logging: Registra todos los eventos (DEBUG, INFO, ERROR)
- ✅ Métricas: Tiempo de respuesta, tasa de éxito, errores

---

## g) Postprocesamiento de Salida (Markdown Limpio)

### Formato de Respuesta Estándar
```typescript
interface ChatResponse {
  ok: boolean              // Indica si la operación fue exitosa
  response?: string        // Respuesta en Markdown
  metadata?: {
    model: string         // Modelo usado (gemini-1.5-flash)
    tokens_used: number   // Tokens consumidos
    processing_time_ms: number  // Tiempo procesamiento
    user_name: string     // Nombre del usuario
    temperature: number   // Parámetro de temperatura usado
  }
  error?: string          // Mensaje de error (si aplica)
}
```

### Transformación de Respuesta
```javascript
// Respuesta bruta de Gemini:
{
  "text": "# Proteínas para aumentar músculo\n\n1. Pollo\n2. Huevos..."
}

// Después de postprocesamiento:
{
  "ok": true,
  "response": "# Proteínas para aumentar músculo\n\n1. Pollo\n2. Huevos...",
  "metadata": {
    "model": "gemini-1.5-flash",
    "tokens_used": 245,
    "processing_time_ms": 1250,
    "user_name": "Juan",
    "temperature": 0.7
  }
}
```

### Limpieza de Markdown
```typescript
function cleanMarkdownResponse(response: string): string {
  // 1. Remover espacios en blanco excesivos
  response = response.replace(/\n{3,}/g, '\n\n')
  
  // 2. Escapar caracteres problemáticos
  response = response.replace(/[<>]/g, '')
  
  // 3. Validar encabezados Markdown
  response = response.replace(/#{7,}/g, '#####')
  
  // 4. Formatear listas correctamente
  response = response.replace(/^\s*[-*+]\s/gm, '- ')
  
  // 5. Remover caracteres de control
  response = response.replace(/[\x00-\x1F]/g, '')
  
  return response
}
```

### Estilos Markdown Aplicados
- **Encabezados**: # ## ### para jerarquía
- **Listas**: - para viñetas, 1. para numeradas
- **Énfasis**: **negrita** y *cursiva*
- **Bloques de código**: ``` para ejemplos
- **Citas**: > para información importante
- **Enlaces**: [texto](url) cuando sea relevante

### Ejemplo de Respuesta Procesada
```markdown
# Recomendaciones de Desayuno Saludable para Juan

## Opciones Recomendadas

### 1. Desayuno Alto en Proteína
- **Ingredientes**: Huevos, pan integral, aguacate
- **Calorías aproximadas**: 450 kcal
- **Macros**: 25g proteína, 45g carbs, 18g grasas

### 2. Smoothie Nutritivo
- Plátano, yogur griego, granola
- Calorías: 380 kcal
- Excelente para recuperación

**Consejo**: Varía tus opciones para evitar aburrimiento.

---
*Respuesta generada el: 2026-01-01 10:35 UTC*
```

---

## h) Metadatos, Trazabilidad y Auditoría

### Metadatos Capturados
```typescript
interface ChatMessageMetadata {
  // Identificación
  message_id: string        // UUID único del mensaje
  user_id: string          // ID del usuario
  user_name: string        // Nombre para referencia
  
  // Temporal
  created_at: Date         // Timestamp creación
  processing_time_ms: number  // Tiempo respuesta IA
  
  // Técnico
  model_used: string       // "gemini-1.5-flash"
  tokens_input: number     // Tokens de entrada
  tokens_output: number    // Tokens de salida
  total_tokens: number     // Total consumido
  
  // Contexto
  user_metrics_snapshot: {
    calorie_goal: number
    protein_goal: number
    carbs_goal: number
    fat_goal: number
  }
  daily_nutrition_snapshot: {
    current_calories: number
    current_protein: number
    current_carbs: number
    current_fat: number
  }
  
  // Control de calidad
  validation_passed: boolean
  response_length: number
  content_type: "nutrition" | "other"
  safety_check: boolean
}
```

### Registro de Auditoría (Logging)
```typescript
// Log de cada interacción
📝 [2026-01-01T10:35:22Z] INFO: Mensaje recibido
├─ User: juan_2024
├─ Message: "¿Cuántas calorías tiene..."
└─ Message Length: 45 chars

🤖 [2026-01-01T10:35:23Z] INFO: Enviando a Gemini API
├─ Model: gemini-1.5-flash
├─ Tokens estimados: 150
└─ System prompt: 1200 chars

✅ [2026-01-01T10:35:24Z] SUCCESS: Respuesta recibida
├─ Processing time: 1200ms
├─ Output tokens: 245
├─ Response length: 1850 chars
└─ Content validation: PASSED

💾 [2026-01-01T10:35:25Z] INFO: Guardando en BD
├─ Table: chat_history
├─ Record ID: msg_abc123def456
└─ Status: SAVED
```

### Trazabilidad de Datos
- **User Journey**: Rastreo completo de conversaciones
- **Data Lineage**: Origen y transformación de datos
- **Compliance**: Cumplimiento de RGPD/LOPD
- **Retención**: Política de 90 días (configurable)

### Métricas Monitoreadas
```
1. Response Time (latencia)
   - Objetivo: < 2 segundos
   - Alerta: > 5 segundos

2. Success Rate
   - Objetivo: > 99%
   - Alerta: < 95%

3. Token Usage
   - Promedio: 200-300 tokens/respuesta
   - Máximo: 500 tokens/respuesta

4. User Engagement
   - Mensajes por usuario/día
   - Tiempo medio de conversación
   - Temas más consultados
```

---

## i) Rol dentro de la Aplicación

### Integración en Arquitectura General
```
┌─────────────────────────────────┐
│   APLICACIÓN NUTRITION AI       │
└─────────────────────────────────┘
        ↓        ↓        ↓        ↓
    Tracker   Recipes  Analyzer  Advisor
      📊       🍽️        📸       🤖
    (Este módulo)
```

### Flujo de Datos con Otros Módulos
```
Nutrition Tracker
  ├─ Datos de usuario
  ├─ Metas nutricionales
  └─ Nutrición diaria
        ↓
        ↓ Contexto
        ↓
   Nutrition Advisor Chat
        ↓
        ↓ Recomendaciones
        ↓
Recipe Discovery → Sugiere recetas
        ↓
        ↓ Enlaces a
        ↓
   Meal Analyzer → Calcula nutrientes
```

### Funcionalidades Específicas
1. **Chat Conversacional**
   - Interfaz de texto limpia
   - Historial visible
   - Timestamps de mensajes

2. **Persistencia de Datos**
   - Almacena en base de datos
   - Recuperable en siguiente sesión
   - Exportable como CSV/PDF

3. **Personalización**
   - Usa nombre del usuario
   - Adapta respuestas a metas
   - Recuerda conversaciones previas

4. **Integración con Dashboard**
   - Acceso desde pestaña "Asesor"
   - Datos sincronizados con perfil
   - Recomendaciones contextualizadas

### Casos de Uso Principales
- ✅ Responder preguntas sobre nutrición
- ✅ Proporcionar planes nutricionales personalizados
- ✅ Analizar desequilibrios nutricionales
- ✅ Motivar y educar sobre alimentación saludable
- ✅ Mantener historial de consultas

---

---

# 📸 MEAL ANALYZER (Analizador de Comidas Multimodal)

## a) Descripción General y Propósito

### Objetivo Principal
El **Meal Analyzer** es un sistema de inteligencia artificial multimodal diseñado para analizar imágenes de alimentos y extraer información nutricional detallada. Utiliza visión por computadora y procesamiento de imágenes para identificar ingredientes y calcular macronutrientes (calorías, proteína, carbohidratos, grasas).

### Caso de Uso
- Usuario sube foto de una comida
- Sistema identifica ingredientes automáticamente
- Calcula valor nutricional estimado
- Guarda datos en perfil del usuario
- Contribuye al seguimiento diario de nutrientes

### Valor Agregado
- **Facilidad**: Solo tomar foto en lugar de buscar alimentos manualmente
- **Precisión**: Usa IA para identificar ingredientes y porciones
- **Velocidad**: Análisis en segundos
- **Integración**: Automáticamente suma a ingesta diaria

---

## b) Modelo Utilizado

### Tecnología Base
- **Proveedor**: Google Gemini API
- **Tipo de Modelo**: Visión Multimodal (Gemini 1.5 Vision)
- **Capacidades**: 
  - Análisis de imágenes
  - Reconocimiento de objetos
  - Estimación de porciones
  - Cálculo de nutrientes

### Especificaciones Técnicas
```
Modelo: Gemini 1.5 Flash Vision
Tipo: Multimodal LLM with Vision
Entrada: Imagen JPEG/PNG + Prompt de análisis
Salida: JSON con nutrientes estimados
Formatos soportados: JPG, PNG, GIF, WebP
Tamaño máximo: 4GB (Gemini API)
Resolución recomendada: 800x600 o superior
```

### Integración Backend
- **Endpoint Principal**: `/api/multimodal-analyzer` (análisis de archivos)
- **Endpoint Alterno**: `/api/analyze-meal` (análisis específico de comidas)
- **Método HTTP**: POST
- **Protocolo**: REST API + FormData
- **Autenticación**: JWT token del usuario

---

## c) Instrucciones de Sistema (System Prompts)

### Prompt del Sistema para Análisis de Comidas
```
ROLE: "You are a professional nutrition analysis AI"
TASK: "Analyze food images and extract nutritional information"
FOCUS: "Identify ingredients, estimate portions, calculate macronutrients"
ACCURACY: "Be conservative with estimates; round to nearest 5g"
LANGUAGE: "Spanish (Spain)"
```

### Prompt Específico de Análisis
```typescript
const mealAnalysisPrompt = `
Analiza esta imagen de comida y proporciona:

1. **Identificación de Ingredientes**
   - Lista completa de ingredientes identificables
   - Estimación de cantidad/porción
   - Nivel de confianza (alto/medio/bajo)

2. **Cálculo Nutricional**
   - Calorías totales (kcal)
   - Proteína (gramos)
   - Carbohidratos (gramos)
   - Grasas (gramos)
   - Fibra (gramos, opcional)
   - Sodio (mg, opcional)
   - Azúcares (gramos, opcional)

3. **Recomendaciones**
   - Aspectos positivos
   - Áreas de mejora
   - Sustituciones saludables

Sé conservador en las estimaciones. Usa unidades métricas.
`
```

### Parámetros de Configuración
```javascript
{
  "model": "gemini-1.5-flash-vision",
  "system_instruction": "Eres un analizador nutricional profesional basado en visión IA...",
  "temperature": 0.3,           // Baja (determinista)
  "top_p": 0.8,                 // Moderada
  "max_output_tokens": 1024,    // Respuestas concisas
  "response_mime_type": "application/json"  // Salida estructurada
}
```

---

## d) Tipos de Entradas (Datos Multimodales)

### Entrada Principal: Archivo de Imagen
```typescript
interface MealImageInput {
  file: File                    // Objeto File de HTML5
  filename: string              // Nombre del archivo
  mimeType: string             // "image/jpeg" | "image/png"
  size: number                 // Tamaño en bytes
  width?: number               // Ancho en píxeles
  height?: number              // Alto en píxeles
  timestamp: Date              // Momento de captura
}
```

### Contexto Adicional del Usuario
```typescript
interface MealAnalysisContext {
  user_id: string              // ID del usuario
  user_metrics?: {
    calorie_goal: number       // Para contexto
    protein_goal: number
    carbs_goal: number
    fat_goal: number
  }
  meal_type?: "breakfast" | "lunch" | "dinner" | "snack"
  additional_notes?: string    // Notas del usuario
}
```

### Payload de Solicitud
```typescript
// FormData para envío multipart/form-data
const formData = new FormData()
formData.append("files", imageFile)  // Archivo de imagen
formData.append("question", "Analiza esta comida y dame los nutrientes")
formData.append("meal_type", "lunch")
formData.append("user_id", "user_12345")
```

### Tipos de Imágenes Soportadas
```
Formato          | Extensión | MIME Type          | Soportado
─────────────────────────────────────────────────────────────
JPEG            | .jpg      | image/jpeg        | ✅ Sí
PNG             | .png      | image/png         | ✅ Sí
GIF             | .gif      | image/gif         | ✅ Sí
WebP            | .webp     | image/webp        | ✅ Sí
```

### Ejemplos de Entrada
```
1. Foto de plato de comida
2. Foto de ingredientes preparados
3. Foto de sándwich o comida rápida
4. Foto de bebida con alimentos
5. Foto de alimentos crudos
```

---

## e) Arquitectura y Flujo de Procesamiento

### Diagrama de Flujo Detallado
```
Usuario (Frontend)
    ↓
    ↓ [Selecciona imagen de comida]
    ↓
┌─────────────────────────────────┐
│  Validación de Archivo          │
│  - Tipo MIME válido             │
│  - Tamaño <= 4GB                │
│  - Formato soportado            │
│  - Resolución mínima            │
└─────────────────────────────────┘
    ↓
    ↓ [Archivo validado]
    ↓
┌─────────────────────────────────┐
│  Frontend React                 │
│  - Carga vista previa           │
│  - Prepara FormData             │
│  - Muestra progreso             │
└─────────────────────────────────┘
    ↓
    ↓ [POST /api/multimodal-analyzer]
    ↓
┌─────────────────────────────────┐
│  Backend API Node.js            │
│  - Valida autenticación         │
│  - Verifica límites de uso      │
│  - Prepara payload              │
└─────────────────────────────────┘
    ↓
    ↓ [Envía imagen + prompt]
    ↓
┌─────────────────────────────────┐
│  Google Gemini Vision API       │
│  - Procesa imagen               │
│  - Identifica ingredientes      │
│  - Analiza porciones            │
│  - Calcula nutrientes           │
│  - Genera respuesta JSON        │
└─────────────────────────────────┘
    ↓
    ↓ [JSON con nutrientes]
    ↓
┌─────────────────────────────────┐
│  Postprocesamiento              │
│  - Validar estructura JSON      │
│  - Verificar rangos nutrientes  │
│  - Formatear respuesta          │
│  - Agregar metadatos            │
└─────────────────────────────────┘
    ↓
    ↓ [Respuesta validada]
    ↓
┌─────────────────────────────────┐
│  Almacenamiento                 │
│  - Guardar en BD                │
│  - Actualizar nutrición diaria  │
│  - Generar logs                 │
└─────────────────────────────────┘
    ↓
    ↓ [Confirmación + Datos]
    ↓
Frontend (Mostrar análisis)
```

### Componentes del Sistema

#### 1. **Frontend (React/Next.js)**
```typescript
// Componente: NutritionTracker.tsx (sección Analyzer)
- Input de archivo (drag & drop)
- Vista previa de imagen
- Botón de análisis
- Muestra barra de progreso
- Visualiza resultados
- Opción para guardar/descartar
```

#### 2. **Backend API Endpoints**

**Endpoint 1**: `/api/multimodal-analyzer`
```typescript
POST /api/multimodal-analyzer
Content-Type: multipart/form-data

Parámetros:
- files: File[] (1 o más imágenes)
- question: string (prompt de análisis)
- use_files_api: boolean (false por defecto)

Respuesta:
{
  "ok": boolean,
  "answer": string (respuesta Gemini),
  "metadata": {
    "processing_time_ms": number,
    "media_count": number,
    "validation_passed": boolean
  }
}
```

**Endpoint 2**: `/api/analyze-meal` (especializado)
```typescript
POST /api/analyze-meal
Content-Type: multipart/form-data

Parámetros:
- file: File (imagen de comida)
- meal_type?: string
- user_id?: string

Respuesta:
{
  "ok": boolean,
  "nutrients": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number,
    "fiber_g": number,
    "sugar_g": number,
    "sodium_mg": number
  },
  "metadata": {
    "method": string,
    "model": string,
    "processing_time_ms": number
  }
}
```

#### 3. **Google Gemini Vision API**
```
Procesa:
1. Imagen JPEG/PNG
2. Prompt específico
3. Contexto del usuario
4. Instrucciones de formato

Retorna:
JSON con estructura nutrientes
```

#### 4. **Base de Datos**
```typescript
// Tabla: meal_analysis
- analysis_id: UUID
- user_id: String
- image_url: String (en storage)
- image_hash: String (para duplicados)
- nutrients: JSON
- ingredients: JSON
- confidence_score: Float
- meal_type: String
- created_at: Date
- metadata: JSON
```

### Servicio TypeScript

```typescript
// Archivo: lib/meal-analyzer-service.ts

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

export async function analyzeMealImage(
  file: File
): Promise<MealAnalysisResponse | null> {
  // 1. Validar archivo
  // 2. Preparar FormData
  // 3. Enviar a API
  // 4. Procesar respuesta
  // 5. Retornar nutrientes
}
```

### Servicio Multimodal General

```typescript
// Archivo: lib/multimodal-service.ts

export interface MultimodalAnalysisResponse {
  ok: boolean
  answer?: string
  metadata?: {
    processing_time_ms: number
    media_count: number
    analysis_types: string[]
    validation_passed: boolean
  }
  error?: string
}

export async function analyzeMultimodal(
  files: File | File[],
  question: string
): Promise<MultimodalAnalysisResponse>

export function formatMultimodalAnswer(
  response: MultimodalAnalysisResponse
): { answer: string; metadata: string }
```

---

## f) Validaciones y Control de Calidad de Entrada

### Validaciones en Frontend
```typescript
// Validar antes de enviar
1. Archivo existe y es tipo válido
   - Tipos aceptados: image/jpeg, image/png, image/gif, image/webp
   
2. Tamaño válido
   - Mínimo: 100 KB (imagen legible)
   - Máximo: 4 GB (límite API)
   - Recomendado: 500 KB - 5 MB
   
3. Resolución
   - Mínimo: 200x200 píxeles
   - Recomendado: 800x600 o superior
   - Máximo: 16000x16000 píxeles

4. Integridad de archivo
   - Checksum válido
   - No corrupto
   - Decodifiable por navegador

5. Contenido
   - No contiene datos sensibles
   - No es archivo comprimido
   - No es URL externa
```

### Validaciones en Backend
```typescript
// Validaciones en API
1. Autenticación
   - JWT válido
   - Usuario existe
   - Token no expirado

2. Autorización
   - Usuario puede subir análisis
   - No ha excedido cuota
   - IP no está bloqueada

3. Archivo
   - Mimetype válido
   - Tamaño dentro de límites
   - Antivirus check (si aplica)
   - Formato de imagen válido

4. Rate Limiting
   - Max 10 análisis/minuto/usuario
   - Max 100 análisis/día/usuario
   - Ventanas deslizantes

5. Deduplicación
   - Detectar duplicados (hash)
   - Reutilizar análisis previos
   - Ahorrar tokens API
```

### Validaciones de Respuesta de IA
```typescript
// Después de Gemini API
1. Estructura JSON válida
   - Parseble
   - Contiene campos requeridos
   - Tipos de datos correctos

2. Valores nutrientes válidos
   - Calorías: 0-5000 kcal (alerta si > 3000)
   - Proteína: 0-500g (alerta si > 200g)
   - Carbs: 0-500g (alerta si > 200g)
   - Grasas: 0-500g (alerta si > 150g)

3. Coherencia lógica
   - Calorías ≈ (proteína*4) + (carbs*4) + (grasas*9)
   - Si discrepancia > 20%, retornar error

4. Confianza
   - Solo aceptar si confidence >= 60%
   - Avisar si < 80%
   - Rechazar si < 40%

5. Contenido
   - Respuesta no vacía
   - No contiene HTML/code injection
   - Longitud razonable
```

### Manejo de Errores Específicos
```typescript
// Errores posibles y manejo

// Error: Archivo no es imagen
if (!file.type.startsWith('image/')) {
  throw new Error('Por favor sube una imagen válida')
}

// Error: Archivo muy grande
if (file.size > 4_000_000_000) {
  throw new Error('Archivo muy grande (máx 4GB)')
}

// Error: Gemini API no disponible
if (response.status === 429) {
  throw new Error('Límite de solicitudes alcanzado. Intenta luego')
}

// Error: Imagen no contiene comida
if (confidence < 40) {
  throw new Error('No se detectó comida en la imagen. Intenta con otra foto')
}

// Error: Análisis incompleto
if (!data.nutrients.calories) {
  throw new Error('No fue posible calcular nutrientes. Intenta con otra imagen')
}
```

### Timeouts y Límites
```typescript
// Control de tiempos
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s

// Si tarda más, error de timeout
try {
  const response = await fetch(apiUrl, {
    signal: controller.signal
  })
} catch (err) {
  if (err.name === 'AbortError') {
    throw new Error('El análisis tardó demasiado. Intenta de nuevo')
  }
}
```

---

## g) Postprocesamiento de Salida (Markdown Limpio)

### Estructura de Respuesta Estándar
```typescript
interface MealAnalysisResponse {
  ok: boolean
  nutrients: {
    calories: number          // kcal
    protein_g: number         // gramos
    carbs_g: number          // gramos
    fat_g: number            // gramos
    fiber_g?: number         // gramos (opcional)
    sugar_g?: number         // gramos (opcional)
    sodium_mg?: number       // miligramos (opcional)
  }
  metadata?: {
    method: string           // "gemini-vision"
    model: string           // "gemini-1.5-flash-vision"
    processing_time_ms: number
    confidence_score?: number  // 0-100
    ingredients?: string[]
  }
}
```

### Transformación y Formateo

**Respuesta Bruta de Gemini**:
```json
{
  "text": "Plate contains: 150g chicken breast, 200g rice, 100g vegetables\nNutrients: 280 calories, 35g protein, 35g carbs, 4g fat"
}
```

**Después de Extracción**:
```json
{
  "ok": true,
  "nutrients": {
    "calories": 280,
    "protein_g": 35,
    "carbs_g": 35,
    "fat_g": 4,
    "fiber_g": 3
  },
  "metadata": {
    "method": "gemini-vision",
    "model": "gemini-1.5-flash-vision",
    "processing_time_ms": 3200,
    "confidence_score": 88,
    "ingredients": ["Pollo (150g)", "Arroz (200g)", "Verduras (100g)"]
  }
}
```

### Formateo para Visualización Frontend

```typescript
function formatNutrientResponse(data: MealAnalysisResponse): string {
  if (!data.ok) return "Error en análisis"

  const { nutrients, metadata } = data

  return `
📊 ANÁLISIS NUTRICIONAL

🔥 Calorías: ${nutrients.calories} kcal
💪 Proteína: ${nutrients.protein_g}g
🌾 Carbohidratos: ${nutrients.carbs_g}g
🧈 Grasas: ${nutrients.fat_g}g
${nutrients.fiber_g ? `🥬 Fibra: ${nutrients.fiber_g}g` : ''}

📝 Ingredientes detectados:
${metadata?.ingredients?.map(i => `• ${i}`).join('\n') || 'No disponible'}

⏱️ Tiempo: ${metadata?.processing_time_ms}ms
📈 Confianza: ${metadata?.confidence_score}%
  `.trim()
}
```

### Estilos de Presentación
- **Cards**: Diseño moderno con gradientes
- **Colores**: Verde para proteína, naranja para calorías
- **Íconos**: Emojis para fácil lectura
- **Gráficos**: Barras de progreso para macros
- **Tipografía**: Enfasis en números principales

### Ejemplo Completo de Salida Formateada
```markdown
# 🍽️ Análisis de Comida

## Nutrientes Detectados

| Nutriente | Cantidad | Progreso |
|-----------|----------|----------|
| 🔥 Calorías | 450 kcal | ████████░░ 45% |
| 💪 Proteína | 42g | ██████████░ 84% |
| 🌾 Carbohidratos | 38g | ████████░░ 50% |
| 🧈 Grasas | 15g | ███████░░░ 50% |
| 🥬 Fibra | 5g | ██░░░░░░░░ 50% |

## 🥘 Ingredientes Identificados

- Pechuga de pollo (150g)
- Arroz blanco (200g)
- Brócoli (100g)
- Aceite de oliva (1 cucharada)

## 💡 Análisis

✅ **Aspectos positivos**
- Alto contenido de proteína (bueno para músculo)
- Buena proporción de macronutrientes

⚠️ **Sugerencias de mejora**
- Agregar más fibra (verduras)
- Considerar arroz integral

---
**Confianza del análisis**: 88%
**Tiempo de procesamiento**: 3.2 segundos
```

---

## h) Metadatos, Trazabilidad y Auditoría

### Metadatos Capturados por Análisis
```typescript
interface MealAnalysisMetadata {
  // Identificación
  analysis_id: string          // UUID único
  user_id: string             // ID del usuario
  
  // Temporal
  created_at: Date            // Timestamp creación
  processing_time_ms: number  // Tiempo procesamiento
  
  // Archivo
  image_filename: string      // Nombre original
  image_size_bytes: number    // Tamaño del archivo
  image_hash: string          // SHA-256 para duplicados
  image_dimensions: {
    width: number
    height: number
  }
  image_format: string        // "jpeg", "png", etc
  
  // IA
  model_used: string          // "gemini-1.5-flash-vision"
  tokens_input: number        // Tokens consumidos
  tokens_output: number
  total_tokens: number
  
  // Análisis
  confidence_score: number    // 0-100%
  ingredients_detected: number // Cantidad
  nutrients_detected: string[] // Qué se calculó
  
  // Contexto
  meal_type?: string          // "lunch", "dinner", etc
  meal_time?: Date            // Hora aproximada
  location?: string           // Opcional
  
  // Validación
  validation_passed: boolean
  quality_score: number       // 0-100
  manual_correction_needed: boolean
  
  // Control
  stored_in_db: boolean
  added_to_daily_intake: boolean
  user_approved: boolean
}
```

### Registro de Auditoría Detallado
```
🖼️ [2026-01-01T11:00:15Z] INFO: Imagen subida
├─ Filename: lunch_001.jpg
├─ Size: 2.3 MB
├─ Hash: sha256_abc123...def456
├─ Dimensions: 1920x1440
└─ Format: JPEG

✓ [2026-01-01T11:00:16Z] INFO: Validación OK
├─ MIME type válido
├─ Tamaño dentro de límites
├─ Resolución adecuada
└─ Integridad confirmada

🤖 [2026-01-01T11:00:17Z] INFO: Enviando a Gemini Vision
├─ Model: gemini-1.5-flash-vision
├─ Tokens estimados: ~300
├─ Prompt: "Analiza esta comida..."
└─ System instruction: [nutrition analyzer]

🔍 [2026-01-01T11:00:20Z] INFO: Procesando respuesta
├─ Parsing JSON
├─ Validando estructura
├─ Verificando rangos nutrientes
└─ Calculando confianza

✅ [2026-01-01T11:00:21Z] SUCCESS: Análisis completado
├─ Calorías: 450 kcal
├─ Proteína: 42g
├─ Confianza: 88%
├─ Ingredientes: 4 detectados
└─ Processing time: 6.2s

💾 [2026-01-01T11:00:22Z] INFO: Guardando en DB
├─ Table: meal_analysis
├─ Record ID: ma_xyz789abc123
├─ Status: SAVED
└─ Added to daily intake: YES

📊 [2026-01-01T11:00:23Z] INFO: Actualizado dashboard
├─ Daily calories: 1850 → 2300
├─ Daily protein: 85g → 127g
├─ Progress bars updated
└─ Notifications sent
```

### Trazabilidad de Datos
- **Origen**: Identificar fuente de análisis (usuario/automático)
- **Transformación**: Rastrear modificaciones
- **Consumo**: Quién accedió a los datos
- **Retención**: Cuándo se eliminan
- **Compliance**: RGPD/LOPD

### Métricas de Calidad
```
1. Exactitud de Nutrientes
   - Comparar con bases de datos conocidas
   - Rango de error: ±10%
   
2. Confianza de Detección
   - Ingredientes correctamente identificados: > 85%
   - Porciones estimadas acertadamente: > 80%
   
3. Rendimiento
   - Tiempo promedio: 3-5 segundos
   - Tasa de éxito: > 98%
   - Disponibilidad: 99.9%
   
4. Satisfacción del Usuario
   - Usuarios que aprueban análisis: > 90%
   - Correcciones manuales: < 10%
   - Uso repetido: > 75%
```

---

## i) Rol dentro de la Aplicación

### Posición en Arquitectura General
```
┌─────────────────────────────────┐
│   APLICACIÓN NUTRITION AI       │
└─────────────────────────────────┘
        ↓        ↓        ↓        ↓
    Tracker   Recipes  Analyzer  Advisor
      📊       🍽️        📸       🤖
    (Este módulo)
```

### Flujo de Datos e Integraciones
```
Meal Analyzer
    ↓
    ├─ Captura imagen comida
    ├─ Analiza con Gemini Vision
    ├─ Extrae nutrientes
    │
    ├─ Almacena en BD
    │
    ├─ Actualiza Nutrition Tracker
    │   ├─ Suma calorías al día
    │   ├─ Suma proteína al día
    │   └─ Actualiza macros
    │
    ├─ Notifica Nutrition Advisor
    │   ├─ Registra comida en contexto
    │   ├─ Puede usar para recomendaciones
    │   └─ Afecta respuestas futuras
    │
    └─ Actualiza Dashboard
        ├─ Barras de progreso
        ├─ Resumen diario
        └─ Alertas si necesario
```

### Funcionalidades Específicas
1. **Captura de Imágenes**
   - Cámara en tiempo real
   - Galería de dispositivo
   - Drag & drop

2. **Análisis Inteligente**
   - Visión por computadora
   - Reconocimiento de ingredientes
   - Estimación de porciones

3. **Almacenamiento**
   - Base de datos relacional
   - Historial de comidas
   - Estadísticas de tiempo

4. **Integración Directa**
   - Suma automática a nutrición diaria
   - Actualiza objetivos
   - Afecta recomendaciones

### Casos de Uso Principales
- ✅ Rastrear comida simplemente fotografiando
- ✅ Obtener nutrientes sin buscar manualmente
- ✅ Detectar patrones de alimentación
- ✅ Validar hipótesis sobre nutrientes
- ✅ Mantener registro visual de comidas

### Pantalla del Usuario
```
┌─────────────────────────────────┐
│  Meal Analyzer / Analizador    │
├─────────────────────────────────┤
│                                 │
│  [📷 Tomar Foto] [🖼️ Galería]  │
│                                 │
│  ┌───────────────────────────┐  │
│  │   [Vista previa imagen]   │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  [🔍 Analizar Comida]          │
│                                 │
│  ┌─ Resultados ─────────────┐  │
│  │ 🔥 450 kcal             │  │
│  │ 💪 42g Proteína         │  │
│  │ 🌾 38g Carbohidratos   │  │
│  │ 🧈 15g Grasas          │  │
│  └───────────────────────────┘  │
│                                 │
│  [✅ Guardar] [❌ Descartar]   │
│                                 │
└─────────────────────────────────┘
```

---

# 🔗 COMPARATIVA: NUTRITION ADVISOR vs MEAL ANALYZER

| Aspecto | Nutrition Advisor Chat | Meal Analyzer |
|---------|----------------------|---------------|
| **Tipo de IA** | LLM Conversacional | Visión Multimodal |
| **Entrada** | Texto (preguntas) | Imágenes (fotos comida) |
| **Salida** | Respuestas en Markdown | JSON con nutrientes |
| **Propósito** | Asesoramiento nutricional | Análisis de comida |
| **Interactividad** | Bidireccional (chat) | Unidireccional (análisis) |
| **Historial** | Sí, conversaciones | Sí, análisis previos |
| **Integración** | Acceso manual desde interfaz | Automática al tracker |
| **Latencia** | 1-3 segundos | 3-6 segundos |
| **Tokens promedio** | 200-300 | 300-400 |
| **Uso principal** | Educar y aconsejar | Rastrear y medir |

---

# 📊 MAPA DE TECNOLOGÍAS

```
┌──────────────────────────────────────────────────┐
│          APLICACIÓN NUTRITION AI                 │
├──────────────────────────────────────────────────┤
│                                                  │
│  Frontend: React + Next.js + Tailwind CSS       │
│                ↓                                 │
│  ┌─────────────────────────────┐                │
│  │   API Gateway / Middleware  │                │
│  ├─────────────────────────────┤                │
│  │ • Autenticación (JWT)      │                │
│  │ • Rate Limiting            │                │
│  │ • Logging & Monitoring     │                │
│  └─────────────────────────────┘                │
│                ↓                                 │
│  ┌──────────────────────────────────────┐       │
│  │      Backend API (Node.js)           │       │
│  ├──────────────────────────────────────┤       │
│  │ • /api/chat/{userId}               │       │
│  │ • /api/chat/{userId}/history       │       │
│  │ • /api/multimodal-analyzer         │       │
│  │ • /api/analyze-meal                │       │
│  │ • /api/nutrition/tracker           │       │
│  └──────────────────────────────────────┘       │
│                ↓                                 │
│  ┌──────────────────────────────────────┐       │
│  │    Servicios IA Externos            │       │
│  ├──────────────────────────────────────┤       │
│  │ • Google Gemini API (LLM Chat)      │       │
│  │ • Google Gemini Vision API (Meal)   │       │
│  └──────────────────────────────────────┘       │
│                ↓                                 │
│  ┌──────────────────────────────────────┐       │
│  │      Base de Datos (Supabase)       │       │
│  ├──────────────────────────────────────┤       │
│  │ • Usuarios                          │       │
│  │ • Chat History                      │       │
│  │ • Meal Analysis Records             │       │
│  │ • Daily Nutrition                   │       │
│  │ • User Metrics                      │       │
│  └──────────────────────────────────────┘       │
│                ↓                                 │
│  ┌──────────────────────────────────────┐       │
│  │     Storage (Google Cloud)          │       │
│  ├──────────────────────────────────────┤       │
│  │ • Imágenes de comida                │       │
│  │ • Backups de análisis               │       │
│  └──────────────────────────────────────┘       │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

# 🎯 CONCLUSIÓN

Ambas funcionalidades (Nutrition Advisor Chat y Meal Analyzer) son pilares fundamentales de la aplicación NutritionAI:

- **Nutrition Advisor Chat**: Proporciona inteligencia educativa y asesoramiento personalizado
- **Meal Analyzer**: Automatiza el rastreo de nutrientes mediante visión artificial

Juntas, crean un ecosistema de IA completo que:
✅ Educa al usuario
✅ Automatiza el rastreo
✅ Proporciona insights
✅ Motiva el cambio de hábitos
✅ Personaliza recomendaciones

---

**Documento generado**: 2026-01-01
**Versión**: 1.0
**Estado**: Listo para informe académico
