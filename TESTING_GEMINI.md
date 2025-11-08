# 🎯 Testing Rápido de Gemini AI

## Pasos para probar inmediatamente:

### 1. Configura tu API Key

```bash
# Edita: frontend/.env
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 2. Reinicia el servidor

```powershell
# Ctrl+C para detener
npm run dev
```

### 3. Prueba la funcionalidad

1. Abre http://localhost:5173
2. Click en **"Voto Informado 2026"**
3. Click en cualquier candidato (ej: María Elena Sánchez)
4. En el modal, verás una sección nueva: **"Explicación con IA"** ✨
5. Click en **"Generar Explicación"**
6. Espera 3-5 segundos
7. ¡Verás un análisis completo del candidato generado por IA!

---

## 📸 Vista Previa de la Interfaz

### Antes de generar:
```
╔═══════════════════════════════════════════╗
║  ✨ Explicación con IA                    ║
║                                           ║
║  [Botón: Generar Explicación]            ║
║                                           ║
║  💡 Haz clic para obtener un análisis     ║
║     inteligente de este candidato        ║
╚═══════════════════════════════════════════╝
```

### Mientras genera:
```
╔═══════════════════════════════════════════╗
║  ✨ Explicación con IA                    ║
║                                           ║
║  [⟳ Generando...]                        ║
╚═══════════════════════════════════════════╝
```

### Después de generar:
```
╔═══════════════════════════════════════════╗
║  ✨ Explicación con IA    [Regenerar]    ║
║                                           ║
║  María Elena Sánchez Cortés es una       ║
║  economista de 52 años con sólida        ║
║  trayectoria en el sector público y      ║
║  privado...                              ║
║                                           ║
║  [Análisis completo de 3-4 párrafos]    ║
╚═══════════════════════════════════════════╝
```

---

## 🧪 Test de Verificación

### Test 1: Verificar instalación
```javascript
// Consola del navegador (F12)
import('@google/generative-ai').then(m => console.log('✅ SDK instalado:', m))
```

### Test 2: Verificar API Key
```javascript
// Consola del navegador
console.log('API Key:', import.meta.env.VITE_GEMINI_API_KEY ? '✅ Configurada' : '❌ Falta')
```

### Test 3: Test manual del servicio
```javascript
// Consola del navegador
import { generateCandidateExplanation } from './services/geminiService';

// Debería funcionar si la API key está configurada
```

---

## 💬 Ejemplos de Respuestas Generadas

### Candidato: María Elena Sánchez

**Prompt enviado a Gemini:**
```
Candidato: María Elena Sánchez Cortés
Edad: 52 años
Partido: Alianza para el Progreso
Educación: Economista por UNMSM, MBA por ESAN
...
```

**Respuesta generada por IA:**
```
María Elena Sánchez Cortés es una economista de 52 años 
con amplia experiencia en gestión pública y privada. 

Se desempeñó como Ministra de Economía entre 2018-2020, 
donde lideró reformas fiscales importantes. Previamente 
fue Gerente General de COFIDE y trabajó 15 años en el 
sector bancario, lo que le otorga una sólida comprensión 
del sistema financiero peruano.

Sus propuestas principales incluyen:
1. **Formalización empresarial**: Programa para formalizar 
   500,000 MYPES con beneficios tributarios por 3 años
2. **Educación técnica**: Inversión de S/. 2,000 millones 
   en institutos tecnológicos
3. **Sistema Único de Salud**: Integración de EsSalud, 
   SIS y sanidad policial

En cuanto a aspectos legales, tuvo una investigación por 
presunto conflicto de intereses en 2021, la cual fue 
archivada por la Fiscalía al no encontrar evidencia 
suficiente. Este caso está cerrado desde 2022.
```

---

## ⚡ Performance

- **Tiempo de generación**: 2-5 segundos
- **Tamaño de respuesta**: ~250-300 palabras
- **Costo**: Gratis (hasta 60 req/min)
- **Precisión**: Alta (basada en datos proporcionados)

---

## 🔧 Troubleshooting Rápido

### Error: "API key no configurada"
```
✅ Solución: Agrega VITE_GEMINI_API_KEY en .env
✅ Reinicia el servidor
```

### Error: "Failed to fetch"
```
✅ Verifica conexión a internet
✅ Verifica que la API key sea válida
✅ Revisa la consola para más detalles
```

### Botón deshabilitado
```
✅ Verifica que se hayan cargado los datos del candidato
✅ Revisa la consola por errores
```

---

## 📊 Métricas de Éxito

Una vez funcionando, deberías ver:

✅ Botón "Generar Explicación" visible
✅ Loading state al generar (ícono girando)
✅ Respuesta coherente en 2-5 segundos
✅ Texto formateado en párrafos
✅ Botón "Regenerar" después de generar
✅ Sin errores en consola

---

## 🚀 Próximos Tests

Una vez que funcione el básico, prueba:

1. **Regenerar**: Click en "Regenerar" genera nueva explicación
2. **Múltiples candidatos**: Prueba con diferentes candidatos
3. **Sin propuestas**: Prueba con candidato sin propuestas
4. **Con denuncias**: Verifica que mencione casos judiciales
5. **Offline**: Verifica el mensaje de error apropiado

---

¡Listo para probar! 🎉
