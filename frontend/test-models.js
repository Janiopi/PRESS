import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBtgAzsVjTbhI0iFbQ41by_d5d8A3HvXrU';
const genAI = new GoogleGenerativeAI(API_KEY);

const modelsToTest = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-pro'
];

console.log('🧪 Probando diferentes modelos de Gemini...\n');

for (const modelName of modelsToTest) {
  try {
    console.log(`Probando: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Di solo "OK"');
    const response = await result.response;
    const text = response.text();
    console.log(`✅ ${modelName} FUNCIONA - Respuesta: ${text}\n`);
    break; // Si funciona, usar este
  } catch (error) {
    console.log(`❌ ${modelName} falló: ${error.message}\n`);
  }
}
