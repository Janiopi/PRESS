import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBtgAzsVjTbhI0iFbQ41by_d5d8A3HvXrU';

console.log('🔍 Listando modelos disponibles con tu API key...\n');

try {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.models && data.models.length > 0) {
    console.log('✅ Modelos disponibles:\n');
    data.models.forEach((model) => {
      console.log(`📌 ${model.name}`);
      console.log(`   Soporta: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });
  } else {
    console.log('⚠️ No se encontraron modelos');
  }
} catch (error) {
  console.error('❌ Error al listar modelos:');
  console.error(error.message);
  
  if (error.message.includes('403')) {
    console.log('\n⚠️ Error 403: La API key puede ser inválida o no tener los permisos necesarios.');
    console.log('👉 Verifica tu API key en: https://aistudio.google.com/app/apikey');
  } else if (error.message.includes('429')) {
    console.log('\n⚠️ Error 429: Has excedido el límite de solicitudes.');
  }
}
