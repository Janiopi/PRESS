# 🤖 Guía de Integración: Google Gemini AI

## ✅ Pasos Completados

1. ✅ SDK de Gemini instalado
2. ✅ Servicio de IA creado (`src/services/geminiService.ts`)
3. ✅ Modal actualizado con botón de IA
4. ✅ Variable de entorno configurada

---

## 🔑 Paso Final: Configurar tu API Key

### 1. Obtener API Key de Google AI

1. Ve a **[Google AI Studio](https://makersuite.google.com/app/apikey)**
2. Inicia sesión con tu cuenta de Google
3. Click en **"Get API Key"** o **"Create API Key"**
4. Selecciona un proyecto existente o crea uno nuevo
5. **Copia la API key** que se genera (empieza con `AIza...`)

### 2. Configurar en tu proyecto

Edita el archivo `frontend/.env` y reemplaza:

```env
VITE_GEMINI_API_KEY=tu_api_key_de_gemini_aqui
```

Por:

```env
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Reiniciar el servidor

```bash
# Detener el servidor (Ctrl+C)
# Volver a ejecutar:
npm run dev
```

---

## 🎯 Funcionalidades Implementadas

### 1. **Explicación Inteligente de Candidatos**

En el modal de cada candidato verás un botón **"Generar Explicación"** que:

- ✅ Analiza toda la información del candidato
- ✅ Resume su perfil profesional
- ✅ Destaca propuestas clave
- ✅ Menciona denuncias de forma objetiva
- ✅ Genera explicación en 3-4 párrafos

**Uso:**
```typescript
// Automático al hacer clic en el botón
generateCandidateExplanation(candidate, proposals, judicialCases, partyName)
```

### 2. **Explicación para Jóvenes** (Opcional)

Lenguaje casual y directo para votantes jóvenes:

```typescript
generateYouthExplanation(candidate, partyName)
```

### 3. **Comparar Candidatos** (Opcional - Por implementar)

Compara dos candidatos objetivamente:

```typescript
compareCandidates(candidate1, candidate2, proposals1, proposals2)
```

### 4. **Chat Inteligente** (Opcional - Por implementar)

Responde preguntas específicas sobre candidatos:

```typescript
askAboutCandidate(question, candidate, proposals, judicialCases)
```

---

## 💰 Costos de Gemini API

### Modelo: Gemini Pro (Gratis)

- **Gratis hasta 60 requests por minuto**
- **Texto**: 15 requests/min gratis
- **Límite**: 1,500 requests/día
- **Ideal para**: Desarrollo y aplicaciones pequeñas

### Si necesitas más:

- **Gemini Pro**: $0.00025 / 1K caracteres (input)
- **Gemini Pro**: $0.0005 / 1K caracteres (output)

**Ejemplo de costo:**
- 100 candidatos × 1 explicación = ~100 requests
- Promedio: 500 caracteres de input + 1000 de output
- **Costo total**: ~$0.05 USD (5 centavos)

---

## 🔒 Seguridad de API Key

### ⚠️ IMPORTANTE:

1. **NO subir `.env` a GitHub** (ya está en `.gitignore`)
2. **NO compartir tu API key públicamente**
3. **Para producción**: Usar variables de entorno del servidor

### Configuración para producción (Vercel/Netlify):

```bash
# En el dashboard del hosting, agregar:
VITE_GEMINI_API_KEY=tu_key_real
```

---

## 🎨 Personalizar Prompts

Los prompts están en `src/services/geminiService.ts`. Puedes editarlos para:

- Cambiar el tono (más formal, más casual)
- Ajustar la longitud de las respuestas
- Agregar más énfasis en ciertos aspectos
- Incluir más contexto

### Ejemplo de personalización:

```typescript
const prompt = `
Eres un analista político peruano especializado en elecciones 2026.

IMPORTANTE:
- Enfócate en propuestas concretas
- Menciona denuncias solo si están confirmadas
- Usa datos verificables
- Tono: Profesional pero accesible
...
`;
```

---

## 🧪 Probar la Integración

### Test 1: Verificar API Key

```javascript
// En la consola del navegador:
console.log(import.meta.env.VITE_GEMINI_API_KEY);
// Debe mostrar tu API key (no "undefined")
```

### Test 2: Generar Explicación

1. Abre la app
2. Ve a "Voto Informado 2026"
3. Click en cualquier candidato
4. Click en **"Generar Explicación"**
5. Espera 2-5 segundos
6. Debe aparecer un texto generado por IA

### Test 3: Verificar en consola

Si hay errores, abre la consola del navegador (F12) y revisa:
- ❌ "API key no configurada" → Falta agregar la key en `.env`
- ❌ "API_KEY_INVALID" → La key es incorrecta
- ❌ "QUOTA_EXCEEDED" → Superaste el límite gratuito

---

## 🚀 Siguientes Mejoras Opcionales

### 1. Auto-generar al abrir modal

```typescript
useEffect(() => {
  if (party && proposals.length > 0) {
    generateAIExplanation();
  }
}, [party, proposals]);
```

### 2. Caché de explicaciones

Guardar explicaciones en localStorage para no regenerar:

```typescript
const cacheKey = `ai-${candidate.id}`;
const cached = localStorage.getItem(cacheKey);
if (cached) {
  setAiExplanation(cached);
} else {
  // Generar y guardar
}
```

### 3. Modo "Explicación Rápida"

Botón adicional para explicación ultra-corta (50 palabras):

```typescript
const quickPrompt = `Resume en 2 oraciones quién es ${candidate.full_name}`;
```

### 4. Comparador de Candidatos

Nueva sección que permite seleccionar 2 candidatos y compararlos lado a lado con IA.

---

## 📊 Monitoreo de Uso

Google AI Studio te permite ver:
- Requests por día
- Tokens consumidos
- Errores

Dashboard: [https://makersuite.google.com/app/prompts](https://makersuite.google.com/app/prompts)

---

## ❓ Troubleshooting

### Problema: "API key no configurada"

**Solución:**
1. Verifica que el archivo `.env` existe en `frontend/`
2. Verifica que la variable empieza con `VITE_`
3. Reinicia el servidor de desarrollo

### Problema: "Failed to fetch"

**Solución:**
1. Verifica tu conexión a internet
2. Revisa que la API key sea válida
3. Verifica que no has excedido el límite gratuito

### Problema: Respuestas lentas

**Solución:**
1. Normal: Gemini toma 2-5 segundos en responder
2. Si toma >10 segundos, puede ser problema de red
3. Considera agregar timeout en el servicio

---

## 🎓 Recursos Adicionales

- [Documentación de Gemini AI](https://ai.google.dev/docs)
- [Guía de Prompts](https://ai.google.dev/docs/prompt_best_practices)
- [API Reference](https://ai.google.dev/api/rest/v1/models)
- [Ejemplos de código](https://github.com/google/generative-ai-js)

---

## ✨ Resultado Final

Después de configurar tu API key, tendrás:

✅ Explicaciones inteligentes de candidatos con un click
✅ Análisis objetivo generado por IA
✅ Resúmenes de propuestas y denuncias
✅ Interfaz moderna con loading states
✅ Totalmente integrado con tu app

**¡Listo para usar en producción! 🚀**
