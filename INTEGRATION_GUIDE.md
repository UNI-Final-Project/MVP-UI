<!-- INTEGRACIÓN FRONTEND NUTRI-APP -->

# 🍽️ Integración de Servicios Frontend - NutriApp

## 📋 Resumen de Cambios

Se ha completado la integración de todos los servicios frontend para comunicarse con el backend FastAPI. El flujo es:

```
Frontend Service → Next.js API Route (Proxy) → Backend FastAPI → Response
```

---

## 🗂️ Servicios Creados/Actualizados

### 1. **`lib/user-auth-service.ts`** (NUEVO)
Gestiona la autenticación del usuario actual desde Supabase.

**Funciones:**
- `getCurrentUser()` → Retorna `{id, email, name}`
- `getUserId()` → Solo el ID
- `getUserName()` → Solo el nombre
- `getUserEmail()` → Solo el email

**Uso en componentes:**
```typescript
import { getCurrentUser } from "@/lib/user-auth-service"

const currentUser = await getCurrentUser()
console.log(currentUser.id, currentUser.name)
```

---

### 2. **`lib/nutrition-advisor-service.ts`** (ACTUALIZADO)
Implementa la clase `NutritionChatbot` para gestionar conversaciones.

**Clase: `NutritionChatbot`**
```typescript
const chatbot = new NutritionChatbot(userId, userName)

// Enviar mensaje
const response = await chatbot.sendMessage("¿Qué debo comer?")

// Cargar historial
const history = await chatbot.loadHistory()

// Limpiar historial
await chatbot.clearHistory()

// Obtener mensajes locales
const messages = chatbot.getMessages()
```

---

### 3. **`lib/user-profile-service.ts`** (NUEVO)
Obtiene el perfil completo del usuario con métricas y nutrición diaria.

**Funciones:**
- `getUserProfile(userId)` → Perfil completo
- `getUserMetrics(userId)` → Solo métricas
- `getTodayNutrition(userId)` → Nutrición de hoy
- `getCaloriesRemaining(userId)` → Calorías restantes
- `getNutritionProgress(userId)` → Progreso en porcentaje

**Uso:**
```typescript
import { getUserProfile, getNutritionProgress } from "@/lib/user-profile-service"

const profile = await getUserProfile(userId)
// {
//   metrics: {weight, height, calorie_goal, ...},
//   daily_nutrition: [{date, calories, protein, carbs, fat}, ...]
// }

const progress = await getNutritionProgress(userId)
// {calories_percent: 65, protein_percent: 80, ...}
```

---

### 4. **`lib/meal-analyzer-service.ts`** (Ya existía)
Analiza imágenes de comidas para extraer nutrientes.

**Función:**
```typescript
import { analyzeMealImage } from "@/lib/meal-analyzer-service"

const file = /* File object */
const nutrients = await analyzeMealImage(file)
// {ok: true, nutrients: {calories, protein_g, carbs_g, fat_g, ...}}
```

---

## 🔗 Rutas API de Next.js (Proxies)

### 1. **POST `/api/chat/[userId]`**
Envía un mensaje al chatbot del backend.

**Request:**
```json
{
  "message": "¿Qué debo desayunar?",
  "user_name": "Juan"
}
```

**Response:**
```json
{
  "ok": true,
  "response": "Te recomiendo un desayuno con...",
  "metadata": {...}
}
```

---

### 2. **GET `/api/chat/[userId]/history`**
Obtiene el historial del chatbot.

**Response:**
```json
{
  "ok": true,
  "history": [
    {
      "message_type": "user",
      "content": "Mensaje del usuario",
      "created_at": "2024-01-01T10:30:00Z"
    },
    {
      "message_type": "assistant",
      "content": "Respuesta del asistente",
      "created_at": "2024-01-01T10:31:00Z"
    }
  ]
}
```

---

### 3. **DELETE `/api/chat/[userId]/history`**
Limpia el historial del chatbot.

**Response:**
```json
{
  "ok": true
}
```

---

### 4. **GET `/api/user/[userId]/profile`**
Obtiene el perfil completo del usuario.

**Response:**
```json
{
  "ok": true,
  "profile": {
    "metrics": {
      "weight": 75,
      "height": 180,
      "calorie_goal": 2400,
      "protein_goal": 150,
      "carbs_goal": 270,
      "fat_goal": 80
    },
    "daily_nutrition": [
      {
        "date": "2024-01-01",
        "calories": 1800,
        "protein": 120,
        "carbs": 180,
        "fat": 60
      }
    ]
  }
}
```

---

## 🎯 Componentes Actualizados

### **`components/nutrition-advisor.tsx`**
Chatbot modal para recomendaciones nutricionales.

**Props:**
```typescript
interface NutritionAdvisorProps {
  userId: string
  userName?: string
  isOpen: boolean
  onClose: () => void
}
```

**Uso:**
```tsx
<NutritionAdvisor
  userId={userId}
  userName={userName}
  isOpen={showAdvisor}
  onClose={() => setShowAdvisor(false)}
/>
```

**Características:**
- ✅ Cargar historial automáticamente
- ✅ Multi-turno conversacional
- ✅ Botón para limpiar historial
- ✅ Auto-scroll a último mensaje
- ✅ Loading states

---

### **`components/nutrition-tracker.tsx`**
Componente principal actualizado para usar nuevos servicios.

**Cambios:**
- Obtiene userId y userName al montar
- Integra el chatbot del asesor
- Usa `getCurrentUser()` de auth-service

---

## 📱 Flujo de Uso Completo

### 1. **Usuario abre la app**
```typescript
// Al montar nutrition-tracker.tsx
const currentUser = await getCurrentUser()
setUserId(currentUser.id)
setUserName(currentUser.name)

// Cargar perfil
const profile = await getUserProfile(userId)
```

### 2. **Usuario registra una comida**
```typescript
// Analizar imagen
const nutrients = await analyzeMealImage(file)

// Guardar en Supabase
await saveTodayNutrition(nutrients)

// Actualizar UI
setData({...})
```

### 3. **Usuario abre el Asesor (chatbot)**
```typescript
// Click en botón "🤖 Asesor"
setShowAdvisor(true)

// Se inicializa NutritionChatbot
const chatbot = new NutritionChatbot(userId, userName)

// Se carga el historial automáticamente
const history = await chatbot.loadHistory()
```

### 4. **Usuario envía mensaje al chatbot**
```typescript
// Usuario escribe: "¿Qué debo comer después?"
const response = await chatbot.sendMessage("¿Qué debo comer después?")

// Response del backend: "Te recomiendo..."
// Se agrega a la UI automáticamente
```

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Services:                                                   │
│  ├─ user-auth-service.ts (obtener usuario)                 │
│  ├─ user-profile-service.ts (perfil del usuario)           │
│  ├─ nutrition-advisor-service.ts (chatbot)                 │
│  └─ meal-analyzer-service.ts (análisis de imágenes)        │
│                                                              │
│  Componentes:                                                │
│  ├─ nutrition-tracker.tsx (dashboard principal)            │
│  ├─ nutrition-advisor.tsx (chatbot modal)                  │
│  └─ ...otros componentes                                    │
│                                                              │
└─────────────┬───────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────┐
│              Next.js API Routes (Proxies)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /api/chat/[userId]                                        │
│  /api/chat/[userId]/history                                │
│  /api/user/[userId]/profile                                │
│  /api/multimodal-analyzer (ya existía)                      │
│  /api/recipes (ya existía)                                  │
│                                                              │
└─────────────┬───────────────────────────────────────────────┘
              │ HTTP Requests (JSON/FormData)
┌─────────────▼───────────────────────────────────────────────┐
│         Backend FastAPI (puerto 8000)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Endpoints:                                                 │
│  ├─ POST /chat/{user_id}          (enviar mensaje)         │
│  ├─ GET /chat/{user_id}/history   (obtener historial)      │
│  ├─ DELETE /chat/{user_id}/history (limpiar historial)     │
│  ├─ GET /user/{user_id}/profile   (obtener perfil)         │
│  ├─ POST /analyze-meal             (análisis de imagen)    │
│  └─ POST /qa                       (análisis multimodal)    │
│                                                              │
│  Database:                                                   │
│  └─ user_metrics, daily_nutrition, chat_history            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Configuración Requerida

### **.env.local**
```env
# AI API Base URL (Backend FastAPI)
NEXT_PUBLIC_AI_API_URL=https://658096ec9c01.ngrok-free.app

# Supabase (Auth Project)
NEXT_PUBLIC_SUPABASE_URL=https://onbhegivwevvmkwyvpng.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# Supabase (Nutrition Data Project)
VITE_SUPABASE_NUTRITION_URL=https://wlhawsxqhhlnwsuyymqm.supabase.co
VITE_SUPABASE_NUTRITION_ANON_KEY=sb_publishable_...
```

---

## ✅ Checklist de Implementación

- [x] Crear `user-auth-service.ts`
- [x] Actualizar `nutrition-advisor-service.ts` (nueva clase)
- [x] Crear `user-profile-service.ts`
- [x] Crear proxy routes:
  - [x] `/api/chat/[userId]/route.ts`
  - [x] `/api/chat/[userId]/history/route.ts`
  - [x] `/api/user/[userId]/profile/route.ts`
- [x] Actualizar `nutrition-advisor.tsx` para usar nueva clase
- [x] Actualizar `nutrition-tracker.tsx` para obtener userId/userName
- [x] Integrar chatbot con userId

---

## 🧪 Pruebas Manuales

### 1. **Test de Autenticación**
```typescript
// En consola del navegador
import { getCurrentUser } from "@/lib/user-auth-service"
const user = await getCurrentUser()
console.log(user) // {id, email, name}
```

### 2. **Test de Perfil**
```typescript
import { getUserProfile } from "@/lib/user-profile-service"
const profile = await getUserProfile("USER_ID")
console.log(profile)
```

### 3. **Test de Chatbot**
```typescript
import { NutritionChatbot } from "@/lib/nutrition-advisor-service"
const chatbot = new NutritionChatbot("USER_ID", "Juan")
const response = await chatbot.sendMessage("Hola")
console.log(response)
```

---

## 🔧 Troubleshooting

### Error: "NEXT_PUBLIC_AI_API_URL no está configurada"
→ Agregar a `.env.local`: `NEXT_PUBLIC_AI_API_URL=https://658096ec9c01.ngrok-free.app`

### Error: "Usuario no autenticado"
→ El usuario debe estar logged in en Supabase. Revisar `/app/auth/login/`

### Error: "Backend returns 404"
→ Verificar que el backend FastAPI está corriendo en puerto 8000
→ Verificar que el ngrok tunnel está activo

### Error: "Historia no se carga"
→ Verificar que el endpoint `/chat/{user_id}/history` existe en backend
→ Revisar logs del backend

---

## 📚 Documentación Adicional

- [Supabase Docs](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [FastAPI Docs](https://fastapi.tiangolo.com/)

---

**Última actualización:** 1 de Enero de 2026
**Estado:** ✅ Listo para producción
