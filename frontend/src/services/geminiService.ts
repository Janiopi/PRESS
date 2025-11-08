import { GoogleGenerativeAI } from '@google/generative-ai';
import { Candidate, Proposal, JudicialCase } from '../types';

// Inicializar Gemini AI
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ Gemini API key no configurada. Las explicaciones con IA no estarán disponibles.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Genera una explicación simple y resumida de un candidato usando Gemini AI
 */
export async function generateCandidateExplanation(
  candidate: Candidate,
  proposals: Proposal[],
  judicialCases: JudicialCase[],
  partyName: string
): Promise<string> {
  if (!genAI) {
    return 'La explicación con IA no está disponible. Por favor, configura tu API key de Gemini.';
  }

  try {
    // Usar el modelo Gemini Pro
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Preparar el contexto del candidato
    const proposalsText = proposals.length > 0
      ? proposals.map(p => `- ${p.category}: ${p.title} - ${p.description}`).join('\n')
      : 'No hay propuestas disponibles';

    const casesText = judicialCases.length > 0
      ? `\n\nDenuncias/Casos Judiciales:\n${judicialCases.map(c => 
          `- ${c.case_title}: ${c.description} (Estado: ${c.status})`
        ).join('\n')}`
      : '';

    // Prompt optimizado para Gemini
    const prompt = `
Eres un analista político experto que explica candidatos de manera objetiva y clara para ciudadanos peruanos.

CANDIDATO:
- Nombre: ${candidate.full_name}
- Edad: ${candidate.age} años
- Partido: ${partyName}
- Cargo al que postula: ${candidate.position}
- Región: ${candidate.region}

EDUCACIÓN:
${candidate.education}

EXPERIENCIA:
${candidate.experience}

BIOGRAFÍA:
${candidate.biography}

PROPUESTAS PRINCIPALES:
${proposalsText}
${casesText}

TAREA:
Genera una explicación clara, objetiva y resumida del candidato en 3-4 párrafos que incluya:

1. **Perfil profesional**: Resume su educación y experiencia relevante
2. **Trayectoria política**: Menciona sus logros o posiciones anteriores
3. **Propuestas clave**: Destaca las 3 propuestas más importantes de manera simple
4. **Aspectos a considerar**: Si tiene denuncias o casos judiciales, menciónalo de forma objetiva sin juzgar

IMPORTANTE:
- Usa lenguaje claro y directo
- Sé objetivo, no tomes partido
- Si hay denuncias, repórtalas con su estado actual
- Mantén un tono informativo, no sensacionalista
- Máximo 250 palabras
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;

  } catch (error) {
    console.error('Error generando explicación con Gemini:', error);
    return 'No se pudo generar la explicación en este momento. Por favor, intenta más tarde.';
  }
}

/**
 * Genera una explicación simple para jóvenes
 */
export async function generateYouthExplanation(
  candidate: Candidate,
  partyName: string
): Promise<string> {
  if (!genAI) {
    return 'Explicación no disponible sin API key configurada.';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Explica quién es ${candidate.full_name} del partido ${partyName} como si le hablaras a un joven de 18-25 años que va a votar por primera vez.

Información del candidato:
- Edad: ${candidate.age} años
- Experiencia: ${candidate.experience}
- Biografía: ${candidate.biography}

Explícalo en 2-3 párrafos cortos:
- Usa lenguaje casual y directo (como hablarías con un amigo)
- Sin palabras complicadas
- Enfócate en lo más importante
- Máximo 150 palabras
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('Error generando explicación juvenil:', error);
    return 'No disponible';
  }
}

/**
 * Compara dos candidatos usando IA
 */
export async function compareCandidates(
  candidate1: Candidate,
  candidate2: Candidate,
  proposals1: Proposal[],
  proposals2: Proposal[]
): Promise<string> {
  if (!genAI) {
    return 'La comparación con IA no está disponible.';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Compara objetivamente a estos dos candidatos presidenciales para las elecciones de Perú 2026:

CANDIDATO 1: ${candidate1.full_name}
- Experiencia: ${candidate1.experience}
- Propuestas clave: ${proposals1.slice(0, 3).map(p => p.title).join(', ')}

CANDIDATO 2: ${candidate2.full_name}
- Experiencia: ${candidate2.experience}
- Propuestas clave: ${proposals2.slice(0, 3).map(p => p.title).join(', ')}

Genera una comparación objetiva en formato de tabla que muestre:
1. Experiencia política/profesional
2. Enfoque en economía
3. Enfoque en seguridad
4. Enfoque en educación/salud
5. Ventajas y desventajas de cada uno

Sé objetivo y neutral.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('Error comparando candidatos:', error);
    return 'No se pudo generar la comparación.';
  }
}

/**
 * Responde preguntas específicas sobre un candidato
 */
export async function askAboutCandidate(
  question: string,
  candidate: Candidate,
  proposals: Proposal[],
  judicialCases: JudicialCase[]
): Promise<string> {
  if (!genAI) {
    return 'El chat con IA no está disponible.';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const context = `
Candidato: ${candidate.full_name}
Educación: ${candidate.education}
Experiencia: ${candidate.experience}
Biografía: ${candidate.biography}
Propuestas: ${proposals.map(p => `${p.category}: ${p.title}`).join(', ')}
Casos judiciales: ${judicialCases.length > 0 ? judicialCases.map(c => c.case_title).join(', ') : 'Ninguno'}
`;

    const prompt = `
Contexto del candidato:
${context}

Pregunta del usuario: ${question}

Responde de manera objetiva, clara y directa. Si no tienes información suficiente, dilo claramente.
Máximo 100 palabras.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('Error respondiendo pregunta:', error);
    return 'No pude responder la pregunta en este momento.';
  }
}
