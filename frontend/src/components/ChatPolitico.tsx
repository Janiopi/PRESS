import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';

export default function ChatPolitico() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy tu asistente político especializado. Puedo ayudarte con información sobre candidatos, propuestas y noticias políticas. ¿Qué te gustaría saber?',
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
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: generateResponse(input),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('keiko') || lowerQuery.includes('fujimori')) {
      return 'Keiko Fujimori es la candidata de Fuerza Popular. Ha sido candidata presidencial en 2011, 2016 y 2021. Su partido propone reformas en educación, economía y salud. Puedes ver más detalles en la sección "Voto Informado 2026".';
    }

    if (lowerQuery.includes('rafael') || lowerQuery.includes('lópez aliaga')) {
      return 'Rafael López Aliaga es el candidato de Renovación Popular y actual alcalde de Lima. Es empresario y político conservador. Sus propuestas se centran en la reactivación económica y reformas sociales.';
    }

    if (lowerQuery.includes('propuesta') || lowerQuery.includes('educación')) {
      return 'Los partidos tienen diversas propuestas en educación: modernización del sistema educativo, implementación de tecnología en aulas, capacitación docente y aumento del presupuesto educativo. Revisa la sección "Voto Informado 2026" para ver propuestas específicas por partido.';
    }

    if (lowerQuery.includes('economía') || lowerQuery.includes('inflación')) {
      return 'Las propuestas económicas incluyen: reducción de impuestos a pequeñas empresas, programas de empleo juvenil, apoyo a sectores productivos y control de la inflación. Cada partido tiene su propio enfoque económico.';
    }

    if (lowerQuery.includes('salud')) {
      return 'Las propuestas en salud incluyen: construcción de hospitales en zonas rurales, contratación de personal médico, acceso gratuito a medicamentos esenciales y fortalecimiento del sistema de salud pública.';
    }

    if (lowerQuery.includes('denuncias') || lowerQuery.includes('judicial')) {
      return 'Algunos candidatos tienen casos judiciales en proceso. Puedes ver los detalles de cada caso, su estado actual y las fuentes oficiales en el perfil de cada candidato en la sección "Voto Informado 2026".';
    }

    if (lowerQuery.includes('comparar') || lowerQuery.includes('diferencia')) {
      return 'Para comparar candidatos o propuestas, te recomiendo revisar la sección "Voto Informado 2026" donde puedes ver las propuestas de cada partido organizadas por categoría (educación, economía, salud, etc.).';
    }

    return 'Entiendo tu pregunta. Te recomiendo explorar la sección "Voto Informado 2026" para ver información detallada de candidatos y propuestas, o la sección "Noticias Explicadas" para estar al día con las últimas novedades políticas. ¿Hay algo específico sobre algún candidato o propuesta que quieras saber?';
  };

  const suggestedQuestions = [
    '¿Qué propone Keiko Fujimori sobre educación?',
    'Compara las propuestas económicas de los partidos',
    '¿Cuántas denuncias tiene Rafael López Aliaga?',
    'Explícame las propuestas de salud',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Chat RAG Político</h2>
            <p className="text-sm text-purple-100">Asistente con información verificada</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
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
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                  : 'bg-gradient-to-br from-blue-500 to-cyan-500'
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
                    ? 'bg-white shadow-md text-gray-800'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
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
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-3">Preguntas sugeridas:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg text-sm text-gray-700 hover:text-blue-700 transition-colors border border-gray-200 hover:border-blue-300"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border-t border-gray-200 p-4 rounded-b-xl">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta sobre candidatos, propuestas o noticias..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 rounded-full hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
