import { useState } from 'react';
import Header from './components/Header';
import VotoInformado from './components/VotoInformado';
import ChatPolitico from './components/ChatPolitico';
import NoticiasExplicadas from './components/NoticiasExplicadas';

function App() {
  const [activeSection, setActiveSection] = useState('voto');

  const renderSection = () => {
    switch (activeSection) {
      case 'voto':
        return <VotoInformado />;
      case 'chat':
        return <ChatPolitico />;
      case 'noticias':
        return <NoticiasExplicadas />;
      default:
        return <VotoInformado />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      <Header activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderSection()}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Press - Información Política Verificada para las Elecciones 2026
          </p>
          <p className="text-center text-gray-500 text-xs mt-2">
            Fuentes verificadas y explicaciones con IA para un voto informado
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
