import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatPoliticalAssistant } from '../services/geminiService';

export default function ChatPolitico() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy tu asistente político especializado potenciado con IA. Puedo ayudarte con información sobre candidatos, propuestas y noticias políticas de las elecciones 2026. ¿Qué te gustaría saber?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Usar Gemini AI para generar la respuesta
      console.log('🤖 Enviando mensaje a Gemini:', userInput);
      const response = await chatPoliticalAssistant(userInput, messages);
      console.log('✅ Respuesta recibida:', response);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('❌ Error en chat:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error?.message || 'Problema desconocido'}. Por favor, revisa la consola para más detalles.`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const suggestedQuestions = [
    '¿Qué propone María Elena Sánchez sobre economía?',
    'Compara las propuestas de salud de los candidatos',
    '¿Cuáles candidatos tienen denuncias activas?',
    'Explícame las propuestas de descentralización',
    '¿Quién propone educación gratuita?',
    'Háblame de la experiencia de Fernando Castillo',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-accent-red via-primary to-primary-dark text-white p-6 rounded-t-xl border border-accent-pink">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Chat Político con IA</h2>
            <p className="text-sm text-pink-100">Asistente inteligente con información verificada</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-background-card border-x border-primary-light p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.role === 'assistant'
                  ? 'bg-gradient-to-br from-accent-red to-primary'
                  : 'bg-gradient-to-br from-primary to-accent-pink'
              }`}
            >
              {message.role === 'assistant' ? (
                <Bot className="w-6 h-6 text-white" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div
              className={`flex-1 max-w-[80%] ${
                message.role === 'user' ? 'text-right' : ''
              }`}
            >
              <div
                className={`inline-block p-4 rounded-2xl ${
                  message.role === 'assistant'
                    ? 'bg-primary-dark shadow-lg text-gray-200 border border-primary-light'
                    : 'bg-gradient-to-r from-accent-red to-primary text-white shadow-lg'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2">
                {new Date(message.timestamp).toLocaleTimeString('es-PE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent-red to-primary flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
            <div className="bg-primary-dark p-4 rounded-2xl shadow-lg border border-primary-light">
              <p className="text-gray-400 text-sm">Pensando con IA...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="bg-background-card border-x border-t border-primary-light p-4">
          <p className="text-sm text-gray-400 mb-3 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-accent-pink" />
            <span>Preguntas sugeridas:</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="text-left p-3 bg-primary-dark hover:bg-accent-red rounded-lg text-sm text-gray-300 hover:text-white transition-all border border-primary-light hover:border-accent-pink"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-background-card border-x border-b border-primary-light p-4 rounded-b-xl">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Pregunta sobre candidatos, propuestas o noticias..."
            className="flex-1 px-4 py-3 bg-primary-dark border border-primary-light text-white placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-accent-red to-primary text-white p-3 rounded-full hover:from-accent-pink hover:to-accent-red transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
