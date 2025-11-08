# 📋 Guía de Integración: MongoDB → Supabase

## 🎯 Situación Actual

**MOCK DATA ACTIVO** ✅  
La aplicación está funcionando con datos simulados ubicados en `src/data/mockNews.ts`

## 📦 Lo que recibirás del Web Scraping

Tu compañero te entregará una **Base de Datos MongoDB** con la siguiente estructura:

```javascript
{
  fecha: Date,           // Fecha de publicación
  titulo: String,        // Título de la noticia
  diario: String,        // Nombre del diario (fuente)
  url: String,          // URL de la noticia original
  noticia: String,      // Contenido completo de la noticia
  imagen: String        // URL de la imagen
}
```

## 🔄 Proceso de Integración (Paso a Paso)

### **PASO 1: Recibir y validar los datos**

1. **Exportar datos de MongoDB a JSON**
   ```bash
   mongoexport --db=press_db --collection=noticias --out=noticias.json
   ```

2. **Validar que tenga el formato correcto**
   - Verificar que todos los campos existen
   - Revisar que las URLs sean válidas
   - Confirmar que las fechas estén en formato correcto

---

### **PASO 2: Procesar y enriquecer los datos**

Los datos crudos necesitan ser procesados para agregar:

#### 2.1 **Resumen** (si no está incluido)
- Opción 1: Generarlo con IA (OpenAI, Claude, etc.)
- Opción 2: Extraer los primeros 2-3 párrafos

#### 2.2 **Explicaciones con IA** ⚠️ CRÍTICO
Necesitas generar dos versiones:

**a) Explicación para Jóvenes** (`youth_explanation`)
```
Prompt sugerido:
"Explica esta noticia política en lenguaje simple y directo, 
como si le hablaras a un joven de 18-25 años. Usa ejemplos 
cotidianos y evita tecnicismos. Máximo 100 palabras."
```

**b) Explicación para Expertos** (`expert_explanation`)
```
Prompt sugerido:
"Analiza esta noticia política con profundidad, incluyendo 
contexto político, implicaciones legales y económicas. Usa 
terminología técnica apropiada. Máximo 150 palabras."
```

#### 2.3 **Tags** (categorización)
Agregar etiquetas relevantes:
```javascript
// Ejemplos de tags
['economía', 'salud', 'educación', 'corrupción', 'elecciones-2026', 
 'congreso', 'reforma', 'debate-presidencial', 'inversión-pública']
```

#### 2.4 **Rating de Confiabilidad** ⭐
Asignar un rating de 1-5 estrellas según el diario:

```javascript
const diaryRatings = {
  'El Comercio': 5,
  'La República': 4,
  'RPP Noticias': 5,
  'Gestión': 4,
  'Andina': 4,
  // Agregar más según tu análisis
};
```

---

### **PASO 3: Transformar el formato**

Convertir de MongoDB a formato Supabase:

```javascript
// Formato MongoDB (entrada)
{
  fecha: "2025-11-07",
  titulo: "Congreso aprueba reforma electoral",
  diario: "El Comercio",
  url: "https://...",
  noticia: "El contenido completo...",
  imagen: "https://..."
}

// Formato Supabase (salida)
{
  id: uuid(),  // Generar UUID
  title: "Congreso aprueba reforma electoral",
  summary: "Resumen generado...",
  source_name: "El Comercio",
  source_url: "https://...",
  reliability_rating: 5,
  published_date: "2025-11-07",
  youth_explanation: "Explicación simple...",
  expert_explanation: "Análisis profundo...",
  tags: ["reforma-electoral", "congreso", "elecciones-2026"],
  image_url: "https://...",
  created_at: "2025-11-07T10:30:00"
}
```

---

### **PASO 4: Script de Transformación**

Crea un script Node.js para procesar los datos:

```javascript
// scripts/transform-news.js
const fs = require('fs');

// 1. Leer el JSON de MongoDB
const mongoData = JSON.parse(fs.readFileSync('noticias.json', 'utf8'));

// 2. Transformar cada noticia
const transformedData = mongoData.map(noticia => ({
  id: generateUUID(),
  title: noticia.titulo,
  summary: generateSummary(noticia.noticia), // Implementar función
  source_name: noticia.diario,
  source_url: noticia.url,
  reliability_rating: getDiaryRating(noticia.diario),
  published_date: noticia.fecha,
  youth_explanation: '', // Generar con IA
  expert_explanation: '', // Generar con IA
  tags: extractTags(noticia.titulo, noticia.noticia),
  image_url: noticia.imagen,
  created_at: new Date().toISOString()
}));

// 3. Guardar resultado
fs.writeFileSync('noticias-transformed.json', 
  JSON.stringify(transformedData, null, 2));
```

---

### **PASO 5: Migrar a Supabase**

#### Opción A: Importación Manual (Pequeño volumen)
1. Ir a Supabase Dashboard
2. Table Editor → `news_articles`
3. Import data → Seleccionar JSON
4. Mapear campos
5. Importar

#### Opción B: Script Automatizado (Recomendado)
```javascript
// scripts/upload-to-supabase.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // ⚠️ Usar service key, no anon key
);

async function uploadNews() {
  const news = JSON.parse(fs.readFileSync('noticias-transformed.json'));
  
  // Subir en lotes de 100
  for (let i = 0; i < news.length; i += 100) {
    const batch = news.slice(i, i + 100);
    const { error } = await supabase
      .from('news_articles')
      .insert(batch);
    
    if (error) {
      console.error(`Error en lote ${i}:`, error);
    } else {
      console.log(`✅ Subidos ${batch.length} registros`);
    }
  }
}

uploadNews();
```

---

### **PASO 6: Activar datos reales en la app**

Una vez que los datos estén en Supabase:

1. **Actualizar `.env`** con credenciales reales
   ```env
   VITE_SUPABASE_URL=tu_url_real
   VITE_SUPABASE_ANON_KEY=tu_key_real
   ```

2. **Editar `src/lib/supabase.ts`**
   ```typescript
   // Descomentar la validación
   if (!supabaseUrl || !supabaseAnonKey) {
     throw new Error('Missing Supabase environment variables');
   }
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

3. **Editar `src/components/NoticiasExplicadas.tsx`**
   ```typescript
   // Comentar el import de mockNews
   // import { mockNews } from '../data/mockNews';
   
   // Descomentar la query a Supabase
   const { data } = await supabase
     .from('news_articles')
     .select('*')
     .order('published_date', { ascending: false });
   
   if (data) {
     setNews(data);
   }
   ```

---

## 🤖 Recomendación: Usar IA para procesar

### Opción 1: OpenAI API
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateExplanations(noticia) {
  // Para jóvenes
  const youthResponse = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "Eres un explicador de noticias políticas para jóvenes."
    }, {
      role: "user",
      content: `Explica en lenguaje simple: ${noticia.titulo}\n\n${noticia.noticia}`
    }]
  });

  // Para expertos
  const expertResponse = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "Eres un analista político experto."
    }, {
      role: "user",
      content: `Analiza profundamente: ${noticia.titulo}\n\n${noticia.noticia}`
    }]
  });

  return {
    youth: youthResponse.choices[0].message.content,
    expert: expertResponse.choices[0].message.content
  };
}
```

### Opción 2: Claude API (Anthropic)
```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function generateExplanations(noticia) {
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Genera dos explicaciones de esta noticia:
      1. Para jóvenes (simple, 100 palabras)
      2. Para expertos (técnico, 150 palabras)
      
      Noticia: ${noticia.titulo}
      ${noticia.noticia}`
    }]
  });

  return message.content;
}
```

---

## ⚠️ Puntos Críticos

### 1. **Job Diario** (Actualización automática)
Tu compañero mencionó ejecutar un job diario. Necesitarás:

- **Opción A**: Cron job en servidor que ejecute el scraping y suba a BD
- **Opción B**: Supabase Edge Functions con triggers programados
- **Opción C**: GitHub Actions que ejecute el script diariamente

### 2. **Costos de IA**
Procesar explicaciones con IA tiene costo:
- OpenAI GPT-4: ~$0.03 por 1K tokens
- Claude: ~$0.015 por 1K tokens
- Calcular: Si son 100 noticias/día × 500 tokens = ~$1.50/día

### 3. **Tiempo de procesamiento**
- Generar explicaciones con IA: ~2-3 segundos por noticia
- 100 noticias = ~5 minutos
- Considerar procesamiento en paralelo

---

## 📊 Checklist de Integración

- [ ] Recibir export de MongoDB
- [ ] Validar estructura de datos
- [ ] Crear script de transformación
- [ ] Generar resúmenes
- [ ] Generar explicaciones con IA (youth + expert)
- [ ] Asignar tags automáticamente
- [ ] Agregar ratings de confiabilidad
- [ ] Probar script localmente
- [ ] Crear tablas en Supabase (ya están en migrations)
- [ ] Subir datos a Supabase
- [ ] Configurar `.env` con credenciales reales
- [ ] Actualizar código para usar datos reales
- [ ] Probar en desarrollo
- [ ] Configurar job diario para actualizaciones
- [ ] Documentar proceso para el equipo

---

## 🚀 Siguiente Pasos Inmediatos

1. **Ahora**: Seguir desarrollando con mock data
2. **Cuando recibas MongoDB**: 
   - Exportar a JSON
   - Crear script de transformación
   - Generar explicaciones con IA
3. **Antes de producción**:
   - Migrar todo a Supabase
   - Configurar actualización diaria
   - Testing completo

---

## 💡 Tip Pro

Mantén los mock data incluso después de integrar, útil para:
- Testing
- Desarrollo sin conexión
- Demos sin depender de BD
- Environment variable para switchear: `USE_MOCK_DATA=true/false`

