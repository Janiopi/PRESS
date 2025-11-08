// Scraper mejorado con Gemini AI para interpretación inteligente
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBtgAzsVjTbhI0iFbQ41by_d5d8A3HvXrU';
const genAI = new GoogleGenerativeAI(API_KEY);

// Lista de candidatos CONFIRMADOS para 2026
// Solo incluir candidatos que realmente se postularán
const candidatos = [
  // CONFIRMADOS o MUY PROBABLES para 2026
  'Keiko_Fujimori',
  'Rafael_López_Aliaga',
  'Verónika_Mendoza',
  'George_Forsyth',
  'Hernando_de_Soto_(economista)', // Especificar el economista, no el conquistador
  'César_Acuña',
  'Antauro_Humala',
  'Julio_Guzmán',
  'Alberto_Beingolea',
  'Yonhy_Lescano',
];

async function extractFullPageContent(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // Extraer TODO el contenido relevante
  let fullText = '';
  
  // Título
  fullText += 'NOMBRE: ' + $('.firstHeading').text().trim() + '\n\n';
  
  // Infobox completo
  fullText += 'INFORMACIÓN BIOGRÁFICA:\n';
  $('.infobox tr').each((i, row) => {
    const $row = $(row);
    const label = $row.find('th').text().trim();
    const value = $row.find('td').text().trim();
    if (label && value) {
      fullText += `${label}: ${value}\n`;
    }
  });
  
  fullText += '\n\nRESUMEN Y BIOGRAFÍA:\n';
  // Primeros 5 párrafos
  $('#mw-content-text .mw-parser-output > p').slice(0, 5).each((i, p) => {
    fullText += $(p).text().trim() + '\n\n';
  });
  
  // Secciones relevantes
  fullText += '\nTRAYECTORIA POLÍTICA:\n';
  let captureNext = false;
  $('h2, h3, p, ul').each((i, elem) => {
    const $elem = $(elem);
    const text = $elem.text().toLowerCase();
    
    if ($elem.is('h2, h3')) {
      captureNext = text.includes('carrera') || text.includes('trayectoria') || 
                    text.includes('política') || text.includes('elecciones') ||
                    text.includes('congreso') || text.includes('candidatura');
    } else if (captureNext && ($elem.is('p') || $elem.is('ul'))) {
      fullText += $elem.text().trim() + '\n';
    }
  });
  
  return fullText.substring(0, 8000); // Limitar para no exceder tokens
}

async function interpretarConIA(wikipediaUrl, contenido) {
  try {
    console.log(`  🤖 Interpretando datos con Gemini AI...`);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
Eres un experto en política peruana. Analiza esta información de Wikipedia y extrae datos estructurados del candidato.

CONTENIDO DE WIKIPEDIA:
${contenido}

INSTRUCCIONES:
1. Identifica el nombre completo del candidato
2. Extrae su edad ACTUAL (estamos en noviembre 2025)
3. Determina su PARTIDO POLÍTICO ACTUAL (el más reciente, para elecciones 2026)
4. Extrae su profesión u ocupación principal
5. Resume su educación (universidades, títulos)
6. Identifica sus cargos políticos más importantes
7. Determina si es candidato probable para presidenciales 2026

RESPONDE SOLO CON UN JSON VÁLIDO en este formato exacto:
{
  "nombreCompleto": "Nombre completo del candidato",
  "edad": número (edad actual en 2025),
  "fechaNacimiento": "DD de mes de YYYY",
  "lugarNacimiento": "Ciudad, País",
  "profesion": "Profesión principal",
  "educacion": "Resumen de estudios universitarios y títulos",
  "partidoActual": "Nombre del partido político ACTUAL (2025-2026)",
  "cargosImportantes": ["Cargo 1", "Cargo 2", "Cargo 3"],
  "esCandidato2026": true o false,
  "razonNoCandidato": "Razón si no es candidato (null si es candidato)",
  "resumenPolitico": "Resumen de 2-3 oraciones sobre su trayectoria política"
}

NO agregues texto antes o después del JSON. Solo el JSON válido.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Limpiar markdown
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const data = JSON.parse(text);
    data.wikipediaUrl = wikipediaUrl;
    
    return data;
    
  } catch (error) {
    console.log(`  ⚠️ Error con IA: ${error.message}`);
    return null;
  }
}

async function scrapeCandidatoMejorado(nombre) {
  try {
    const url = `https://es.wikipedia.org/wiki/${nombre}`;
    console.log(`\n🔍 Procesando: ${nombre.replace(/_/g, ' ')}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`   ❌ Error HTTP ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extraer imagen
    const infobox = $('.infobox');
    const imgSrc = infobox.find('img').first().attr('src');
    const imagen = imgSrc ? (imgSrc.startsWith('//') ? 'https:' + imgSrc : imgSrc) : '';
    
    // Extraer contenido completo
    const contenidoCompleto = await extractFullPageContent(url);
    
    // Usar IA para interpretar
    const datosIA = await interpretarConIA(url, contenidoCompleto);
    
    if (!datosIA) {
      console.log(`   ❌ No se pudo interpretar con IA`);
      return null;
    }
    
    // Validar si es candidato para 2026
    if (!datosIA.esCandidato2026) {
      console.log(`   ⚠️ NO es candidato 2026: ${datosIA.razonNoCandidato}`);
      return null;
    }
    
    const data = {
      nombre: nombre.replace(/_/g, ' '),
      nombreCompleto: datosIA.nombreCompleto,
      edad: datosIA.edad,
      fechaNacimiento: datosIA.fechaNacimiento,
      lugarNacimiento: datosIA.lugarNacimiento,
      profesion: datosIA.profesion,
      educacion: datosIA.educacion,
      partidoPolitico: datosIA.partidoActual,
      cargosAnteriores: datosIA.cargosImportantes,
      imagen: imagen,
      resumen: datosIA.resumenPolitico,
      wikipediaUrl: url
    };
    
    console.log(`   ✅ Datos extraídos:`);
    console.log(`      Edad: ${data.edad} años`);
    console.log(`      Partido: ${data.partidoPolitico}`);
    console.log(`      Educación: ${data.educacion.substring(0, 60)}...`);
    
    return data;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function scrapeAllCandidatosMejorado() {
  console.log('🗳️ Scraping MEJORADO con Gemini AI - Candidatos 2026\n');
  console.log('=' .repeat(80));
  
  const resultados = [];
  
  for (const candidato of candidatos) {
    const data = await scrapeCandidatoMejorado(candidato);
    if (data) {
      resultados.push(data);
    }
    // Pausa para no sobrecargar APIs
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Scraping completado: ${resultados.length}/${candidatos.length} candidatos válidos`);
  
  // Guardar resultados
  const fs = await import('fs');
  const outputPath = './candidatos-scraped-mejorado.json';
  fs.writeFileSync(outputPath, JSON.stringify(resultados, null, 2), 'utf-8');
  console.log(`\n💾 Datos guardados en: ${outputPath}`);
  
  // Mostrar resumen
  console.log('\n📊 Resumen por partido:\n');
  const porPartido = {};
  resultados.forEach(c => {
    if (!porPartido[c.partidoPolitico]) {
      porPartido[c.partidoPolitico] = [];
    }
    porPartido[c.partidoPolitico].push(c.nombreCompleto);
  });
  
  Object.keys(porPartido).sort().forEach(partido => {
    console.log(`\n🏛️  ${partido}:`);
    porPartido[partido].forEach(nombre => {
      console.log(`   • ${nombre}`);
    });
  });
}

scrapeAllCandidatosMejorado().catch(console.error);
