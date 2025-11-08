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
    // Usar Gemini 2.5 Flash - Modelo más reciente y rápido
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

/**
 * Chat político RAG - Responde preguntas sobre política peruana usando contexto
 */
export async function chatPoliticalAssistant(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  if (!genAI) {
    return 'El chat con IA no está disponible. Por favor, configura tu API key de Gemini.';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Construir historial de conversación
    const history = conversationHistory
      .slice(-6) // Últimos 6 mensajes para contexto
      .map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`)
      .join('\n');

    const prompt = `
Eres un asistente político especializado en las elecciones presidenciales de Perú 2026.

CONTEXTO DE CANDIDATOS DISPONIBLES:
1. María Elena Sánchez (APP) - Economista, ex Ministra de Economía
   - Propuestas: Formalización de MYPES, educación técnica, Sistema Único de Salud
   - Denuncias: Investigación archivada por conflicto de intereses (2021)

2. Carlos Alberto Mendoza (Fuerza Popular) - Abogado, congresista
   - Propuestas: Seguridad ciudadana, reforma judicial, exoneración tributaria
   - Denuncias: Investigación por enriquecimiento ilícito (en curso)

3. Jorge Luis Pacheco (Acción Popular) - Ingeniero, ex alcalde de Cusco
   - Propuestas: Descentralización fiscal, modernización del agro, turismo
   - Denuncias: Multa administrativa pagada, denuncia por nepotismo desestimada

4. Rafael Antonio Gutiérrez (Renovación Popular) - Empresario
   - Propuestas: Reducir el Estado, apertura comercial, estado de emergencia
   - Denuncias: Demanda laboral (resuelta), investigación tributaria (multa pagada)

5. Ana Patricia Torres (Juntos por el Perú) - Socióloga, activista
   - Propuestas: Educación pública gratuita, salud universal, bono familiar
   - Denuncias: Denuncia por difamación archivada, investigación ONG sin responsabilidad penal

6. Fernando José Castillo (Avanza País) - Médico, ex Ministro de Salud
   - Propuestas: Salud preventiva, hub científico, Estado digital
   - Denuncias: Investigación compras COVID archivada, negligencia médica desestimada

HISTORIAL DE CONVERSACIÓN:
${history}

PREGUNTA ACTUAL DEL USUARIO:
${userMessage}

INSTRUCCIONES:
- Responde de manera objetiva, clara y directa
- Usa la información del contexto cuando sea relevante
- Si mencionas denuncias, siempre incluye su estado actual
- Si no tienes información exacta, sugiere revisar "Voto Informado 2026"
- Mantén un tono neutral, no tomes partido
- Máximo 150 palabras
- Si te preguntan por otros candidatos no listados, indica que la información aún se está actualizando

Responde en español de forma natural y conversacional:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error('❌ Error en chat político:', error);
    console.error('Error detallado:', {
      message: error?.message,
      status: error?.status,
      response: error?.response
    });
    
    // Mensajes de error más específicos
    if (error?.message?.includes('API key')) {
      return '⚠️ Error: API key inválida o no configurada correctamente. Por favor verifica tu configuración.';
    }
    if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
      return '⚠️ Se ha alcanzado el límite de solicitudes. Por favor intenta más tarde.';
    }
    
    return `Disculpa, tuve un problema procesando tu mensaje. Error: ${error?.message || 'Desconocido'}`;
  }
}
