# PRESS

**Press** - Plataforma de Información Política Verificada para las Elecciones 2026

Sistema web que proporciona información política verificada con explicaciones generadas por IA, diseñado para ayudar a los ciudadanos a tomar decisiones informadas en las elecciones.

## 📋 Características

- **Voto Informado 2026**: Información detallada sobre candidatos y sus propuestas
- **Chat Político**: Asistente de IA para responder preguntas sobre política
- **Noticias Explicadas**: Noticias políticas verificadas con explicaciones simplificadas

## 🛠️ Tecnologías

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase Client
- Lucide React (iconos)

### Backend
- Supabase (Base de datos PostgreSQL + Auth + Storage)

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- Una cuenta en [Supabase](https://supabase.com)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Janiopi/PRESS.git
cd PRESS
```

### 2. Configurar el Frontend

#### 2.1 Navegar a la carpeta del frontend

```bash
cd frontend
```

#### 2.2 Instalar dependencias

```bash
npm install
```

#### 2.3 Configurar Variables de Entorno

Crea o edita el archivo `.env` en la carpeta `frontend/` con tus credenciales de Supabase:

```env
# Supabase Configuration
VITE_SUPABASE_URL=tu_project_url_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**¿Cómo obtener las credenciales de Supabase?**

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 3. Configurar la Base de Datos (Supabase)

#### 3.1 Crear las Tablas

En tu proyecto de Supabase, ve a **SQL Editor** y ejecuta el script de migración ubicado en:

```
supabase/migrations/20251108042126_create_press_schema.sql
```

Este script creará todas las tablas necesarias:
- `candidates` - Información de candidatos
- `news_articles` - Artículos de noticias verificadas
- `chat_messages` - Historial de conversaciones del chat político

#### 3.2 Importar Datos (Web Scraping)

Una vez que el equipo de web scraping entregue la base de datos:

1. Exporta los datos desde su formato original
2. Importa los datos a las tablas correspondientes usando:
   - **Supabase Dashboard** → **Table Editor** → **Import data**
   - O mediante scripts SQL
   - O usando la API de Supabase

### 4. Ejecutar el Proyecto

#### Modo Desarrollo

Desde la carpeta `frontend/`:

```bash
npm run dev
```

El proyecto estará disponible en: `http://localhost:5173`

#### Modo Producción

Para compilar el proyecto:

```bash
npm run build
```

Los archivos compilados estarán en `frontend/dist/`

Para previsualizar la build de producción:

```bash
npm run preview
```

## 📂 Estructura del Proyecto

```
PRESS/
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── Header.tsx
│   │   │   ├── VotoInformado.tsx
│   │   │   ├── ChatPolitico.tsx
│   │   │   ├── NoticiasExplicadas.tsx
│   │   │   └── CandidateModal.tsx
│   │   ├── lib/
│   │   │   └── supabase.ts   # Cliente de Supabase
│   │   ├── types/
│   │   │   └── index.ts      # Tipos TypeScript
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── supabase/
│   │   └── migrations/       # Scripts SQL
│   ├── .env                  # Variables de entorno (NO SUBIR A GIT)
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── backend/
│   └── (pendiente)           # Servicios adicionales si es necesario
└── README.md
```

## 🎨 Personalización de Estilos

El proyecto usa Tailwind CSS con colores personalizados definidos en `tailwind.config.js`:

- **primary**: Morado oscuro/medio
- **accent**: Rojo/burdeo y rosa
- **background**: Fondos oscuros para tarjetas y fondo general

Para modificar los colores, edita el archivo `frontend/tailwind.config.js`

## 🔧 Scripts Disponibles

Desde la carpeta `frontend/`:

```bash
npm run dev        # Ejecutar en modo desarrollo
npm run build      # Compilar para producción
npm run preview    # Previsualizar build de producción
npm run lint       # Ejecutar linter
npm run typecheck  # Verificar tipos TypeScript
```

## 🗃️ Schema de Base de Datos

### Tabla: `candidates`
- Información de candidatos políticos
- Propuestas, partido político, biografía, etc.

### Tabla: `news_articles`
- Noticias políticas verificadas
- Incluye resumen, explicaciones para jóvenes/expertos
- Rating de confiabilidad de la fuente

### Tabla: `chat_messages`
- Historial de conversaciones del chat político
- Mensajes de usuarios y respuestas de IA

## 🤝 Contribuir

### Para el equipo de Web Scraping

1. Asegúrense de que los datos extraídos coincidan con el schema de la base de datos
2. Los datos deben incluir:
   - **Candidatos**: Nombre, partido, propuestas, biografía, foto
   - **Noticias**: Título, resumen, fuente, URL, fecha, tags, explicaciones
3. Formato recomendado: CSV o JSON para facilitar la importación

### Workflow de Git

```bash
# Crear una rama para tu feature
git checkout -b feature/nombre-feature

# Hacer commits
git add .
git commit -m "Descripción del cambio"

# Subir cambios
git push origin feature/nombre-feature

# Crear Pull Request en GitHub
```

## 🐛 Solución de Problemas

### El frontend muestra pantalla en blanco
- Verifica que las variables de entorno en `.env` estén configuradas correctamente
- Revisa la consola del navegador para ver errores
- Asegúrate de que el servidor de desarrollo esté corriendo

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env` existe en la carpeta `frontend/`
- Asegúrate de que las variables tienen valores válidos (URLs deben comenzar con `http`)
- Reinicia el servidor de desarrollo después de modificar `.env`

### Error al cargar datos
- Verifica que las tablas existan en Supabase
- Revisa los permisos (RLS - Row Level Security) en las tablas
- Asegúrate de que hay datos en las tablas

## 📝 Notas Importantes

- **NO subir el archivo `.env` al repositorio** (ya está en `.gitignore`)
- Cada desarrollador debe crear su propio archivo `.env` con sus credenciales
- Las credenciales de Supabase son sensibles, no las compartas públicamente
- Para producción, usa variables de entorno del hosting (Vercel, Netlify, etc.)

## 📧 Contacto

Para dudas o problemas, contactar al equipo de desarrollo.

---

**Press** - Información Política Verificada para las Elecciones 2026