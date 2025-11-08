// Transformador mejorado - Usa datos scrapeados con IA
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const API_KEY = 'AIzaSyBtgAzsVjTbhI0iFbQ41by_d5d8A3HvXrU';
const genAI = new GoogleGenerativeAI(API_KEY);

// Leer datos scrapeados MEJORADOS
const scrapedData = JSON.parse(fs.readFileSync('./candidatos-scraped-mejorado.json', 'utf-8'));

console.log(`📊 Datos cargados: ${scrapedData.length} candidatos\n`);

async function generarPropuestasConIA(candidato) {
  console.log(`  🤖 Generando propuestas para ${candidato.nombreCompleto}...`);
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
Basándote en el perfil político real de ${candidato.nombreCompleto}:

INFORMACIÓN DEL CANDIDATO:
- Partido: ${candidato.partidoPolitico}
- Edad: ${candidato.edad} años
- Profesión: ${candidato.profesion}
- Educación: ${candidato.educacion}
- Cargos anteriores: ${candidato.cargosAnteriores.join(', ')}
- Resumen político: ${candidato.resumen}

Genera 3 propuestas REALISTAS y ESPECÍFICAS que este candidato podría tener para las elecciones presidenciales de Perú 2026.
Las propuestas deben ser coherentes con su ideología política, historial y partido.

Cada propuesta debe tener:
1. Categoría (Economía, Educación, Salud, Seguridad, Justicia, Infraestructura, etc.)
2. Título corto y concreto (máximo 8 palabras)
3. Descripción detallada (3-4 oraciones) con medidas específicas

Responde SOLO con un JSON válido en este formato:
[
  {
    "category": "Economía",
    "title": "Título específico de la propuesta",
    "description": "Descripción detallada con medidas concretas..."
  }
]

NO incluyas texto adicional, solo el JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const propuestas = JSON.parse(text);
    return propuestas;
    
  } catch (error) {
    console.log(`  ⚠️ Error generando propuestas: ${error.message}`);
    return [
      {
        category: 'Economía',
        title: 'Reactivación económica',
        description: 'Propuesta para impulsar el crecimiento económico del país.'
      }
    ];
  }
}

async function transformarDatosMejorados() {
  console.log('🔄 Transformando datos mejorados a formato de aplicación\n');
  console.log('=' .repeat(80));
  
  const partidos = new Map();
  const candidatos = [];
  const propuestas = [];
  
  let candidatoId = 1;
  let propuestaId = 1;
  
  for (const scraped of scrapedData) {
    console.log(`\n${candidatoId}. ${scraped.nombreCompleto}`);
    console.log(`   Partido: ${scraped.partidoPolitico}`);
    console.log(`   Edad: ${scraped.edad} años`);
    
    // Agregar partido si no existe
    if (!partidos.has(scraped.partidoPolitico)) {
      const partidoId = partidos.size + 1;
      
      // Detectar ideología y color
      const ideology = scraped.partidoPolitico.toLowerCase().includes('popular') ||
                       scraped.partidoPolitico.toLowerCase().includes('renovación') ? 'Derecha' :
                       scraped.partidoPolitico.toLowerCase().includes('nuevo perú') ||
                       scraped.partidoPolitico.toLowerCase().includes('libre') ? 'Izquierda' :
                       'Centro';
      
      const colores = {
        'Fuerza Popular': '#FF6B35',
        'Renovación Popular': '#1E90FF',
        'Nuevo Perú': '#E63946',
        'Alianza para el Progreso': '#4CAF50',
        'Somos Perú': '#FFA726',
        'Progresemos (2024-2025)': '#9C27B0',
        'Cooperación Popular': '#D32F2F'
      };
      
      partidos.set(scraped.partidoPolitico, {
        id: partidoId,
        name: scraped.partidoPolitico,
        acronym: scraped.partidoPolitico.split(' ').map(w => w[0]).join('').toUpperCase(),
        color: colores[scraped.partidoPolitico] || '#607D8B',
        ideology: ideology,
        founded_year: 2000,
        logo_url: null,
        created_at: new Date().toISOString()
      });
    }
    
    const partidoId = partidos.get(scraped.partidoPolitico).id;
    
    // Crear candidato con TODOS los datos
    const candidato = {
      id: candidatoId,
      full_name: scraped.nombreCompleto,
      party_id: partidoId,
      birth_date: scraped.fechaNacimiento,
      age: scraped.edad,
      education: scraped.educacion,
      experience: scraped.cargosAnteriores.join('. '),
      biography: scraped.resumen,
      profile_image_url: scraped.imagen,
      photo_url: scraped.imagen, // Compatibilidad
      wikipedia_url: scraped.wikipediaUrl,
      position: 'Candidato Presidencial 2026',
      region: 'Nacional',
      created_at: new Date().toISOString()
    };
    
    candidatos.push(candidato);
    
    // Generar propuestas con IA
    const propuestasIA = await generarPropuestasConIA(scraped);
    
    propuestasIA.forEach((prop, index) => {
      propuestas.push({
        id: propuestaId++,
        candidate_id: candidatoId,
        party_id: partidoId,
        category: prop.category,
        title: prop.title,
        description: prop.description,
        details: prop.description,
        created_at: new Date().toISOString()
      });
      console.log(`    ✅ ${prop.category}: ${prop.title}`);
    });
    
    candidatoId++;
    
    // Pausa para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 2500));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Transformación completada!');
  console.log(`   📊 Partidos: ${partidos.size}`);
  console.log(`   👤 Candidatos: ${candidatos.length}`);
  console.log(`   📋 Propuestas: ${propuestas.length}\n`);
  
  // Guardar datos transformados
  const output = {
    partidos: Array.from(partidos.values()),
    candidatos: candidatos,
    propuestas: propuestas,
    metadata: {
      generated_at: new Date().toISOString(),
      source: 'Wikipedia + Gemini AI 2.5-Flash',
      version: '2.0-mejorado'
    }
  };
  
  fs.writeFileSync('./candidatos-transformed-mejorado.json', JSON.stringify(output, null, 2), 'utf-8');
  console.log('💾 Datos guardados en: ./candidatos-transformed-mejorado.json');
  
  // Generar archivos TypeScript
  generarArchivosMock(output);
}

function generarArchivosMock(data) {
  console.log('\n📝 Generando archivos TypeScript mejorados...\n');
  
  // Partidos
  const partidosTS = `// Datos REALES de partidos políticos
// Fuente: Wikipedia + Gemini AI
// Generado: ${new Date().toLocaleString('es-PE')}
// Candidatos confirmados para Perú 2026

export const partidos = ${JSON.stringify(data.partidos, null, 2)};
`;
  
  fs.writeFileSync('./frontend/src/data/partidosReales.ts', partidosTS, 'utf-8');
  console.log('✅ frontend/src/data/partidosReales.ts');
  
  // Candidatos
  const candidatosTS = `// Datos REALES de candidatos presidenciales Perú 2026
// Fuente: Wikipedia + Gemini AI
// Generado: ${new Date().toLocaleString('es-PE')}

import { Candidate } from '../types';

export const candidatos: Candidate[] = ${JSON.stringify(data.candidatos, null, 2)};
`;
  
  fs.writeFileSync('./frontend/src/data/candidatosReales.ts', candidatosTS, 'utf-8');
  console.log('✅ frontend/src/data/candidatosReales.ts');
  
  // Propuestas
  const propuestasTS = `// Propuestas generadas con IA basadas en perfiles reales
// Fuente: Gemini AI 2.5-Flash
// Generado: ${new Date().toLocaleString('es-PE')}

import { Proposal } from '../types';

export const propuestas: Proposal[] = ${JSON.stringify(data.propuestas, null, 2)};
`;
  
  fs.writeFileSync('./frontend/src/data/propuestasReales.ts', propuestasTS, 'utf-8');
  console.log('✅ frontend/src/data/propuestasReales.ts');
  
  console.log('\n🎉 ¡Archivos TypeScript generados correctamente!');
  console.log('\n📊 Resumen por partido:');
  
  const porPartido = {};
  data.candidatos.forEach(c => {
    const partido = data.partidos.find(p => p.id === c.party_id);
    if (partido) {
      if (!porPartido[partido.name]) {
        porPartido[partido.name] = [];
      }
      porPartido[partido.name].push(c.full_name);
    }
  });
  
  Object.keys(porPartido).sort().forEach(partido => {
    console.log(`\n🏛️  ${partido}:`);
    porPartido[partido].forEach(nombre => {
      console.log(`   • ${nombre}`);
    });
  });
}

transformarDatosMejorados().catch(console.error);
