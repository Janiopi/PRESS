import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBtgAzsVjTbhI0iFbQ41by_d5d8A3HvXrU';
const genAI = new GoogleGenerativeAI(API_KEY);

console.log('🧪 Probando gemini-2.5-flash...\n');

try {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent('Responde en español: ¿Estás funcionando correctamente?');
  const response = await result.response;
  const text = response.text();
  
  console.log('✅ ¡ÉXITO! gemini-2.5-flash funciona perfectamente');
  console.log('📝 Respuesta:', text);
} catch (error) {
  console.log('❌ Error:', error.message);
}
