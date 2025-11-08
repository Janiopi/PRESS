// Servicio para conectar con la API del JNE (Jurado Nacional de Elecciones)
// Documentación: https://plataformaelectoral.jne.gob.pe

const JNE_BASE_URL = 'https://plataformaelectoral.jne.gob.pe';

export interface JNECandidate {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  organizacionPolitica: string;
  cargo: string;
  procesoElectoral: string;
  foto?: string;
  hojaVida?: string;
  planGobierno?: string;
  sentencias?: any[];
  denuncias?: any[];
}

export interface JNEResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Obtiene la lista de candidatos presidenciales para un proceso electoral
 */
export async function getCandidatosPresidenciales(
  procesoElectoral: string = '2026'
): Promise<JNECandidate[]> {
  try {
    // TODO: Reemplazar con el endpoint real una vez lo descubramos
    const endpoint = `${JNE_BASE_URL}/api/candidatos?proceso=${procesoElectoral}&cargo=PRESIDENTE`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error obteniendo candidatos del JNE:', error);
    throw error;
  }
}

/**
 * Obtiene el detalle completo de un candidato por DNI
 */
export async function getCandidatoDetalle(dni: string): Promise<JNECandidate | null> {
  try {
    // TODO: Reemplazar con el endpoint real
    const endpoint = `${JNE_BASE_URL}/api/candidatos/${dni}`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error obteniendo detalle del candidato:', error);
    return null;
  }
}

/**
 * Obtiene el plan de gobierno de una organización política
 */
export async function getPlanGobierno(
  organizacionPolitica: string,
  procesoElectoral: string = '2026'
): Promise<any> {
  try {
    // TODO: Reemplazar con el endpoint real
    const endpoint = `${JNE_BASE_URL}/api/planes-gobierno?organizacion=${organizacionPolitica}&proceso=${procesoElectoral}`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error obteniendo plan de gobierno:', error);
    return null;
  }
}

/**
 * Obtiene sentencias y denuncias de un candidato
 */
export async function getSentenciasYDenuncias(dni: string): Promise<any[]> {
  try {
    // TODO: Reemplazar con el endpoint real
    const endpoint = `${JNE_BASE_URL}/api/candidatos/${dni}/sentencias`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error obteniendo sentencias:', error);
    return [];
  }
}

/**
 * Busca candidatos por nombre
 */
export async function buscarCandidatos(
  nombre: string,
  procesoElectoral: string = '2026'
): Promise<JNECandidate[]> {
  try {
    // TODO: Reemplazar con el endpoint real
    const endpoint = `${JNE_BASE_URL}/api/candidatos/buscar?q=${encodeURIComponent(nombre)}&proceso=${procesoElectoral}`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error buscando candidatos:', error);
    return [];
  }
}

/**
 * Transforma un candidato del JNE al formato de nuestra aplicación
 */
export function transformJNECandidateToAppFormat(jneCandidate: JNECandidate): any {
  return {
    id: jneCandidate.id || jneCandidate.dni,
    full_name: `${jneCandidate.nombre} ${jneCandidate.apellidoPaterno} ${jneCandidate.apellidoMaterno}`,
    party_id: jneCandidate.organizacionPolitica,
    education: '', // Extraer de hoja de vida si está disponible
    experience: '', // Extraer de hoja de vida
    photo_url: jneCandidate.foto || '/placeholder.jpg',
    created_at: new Date().toISOString(),
    // Agregar más campos según necesitemos
  };
}
