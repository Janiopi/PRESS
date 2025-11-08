import { Vote, MessageSquare, Newspaper } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Header({ activeSection, onSectionChange }: HeaderProps) {
  const sections = [
    { id: 'voto', label: 'Voto Informado 2026', icon: Vote },
    { id: 'chat', label: 'Chat Político', icon: MessageSquare },
    { id: 'noticias', label: 'Noticias Explicadas', icon: Newspaper },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Vote className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Press</h1>
          </div>

          <nav className="hidden md:flex space-x-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="md:hidden">
            <select
              value={activeSection}
              onChange={(e) => onSectionChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
