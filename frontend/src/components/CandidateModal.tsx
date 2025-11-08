import { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase'; // Comentado temporalmente
import { Candidate, Proposal, JudicialCase, PoliticalParty, NewsArticle } from '../types';
// Datos reales scrapeados de Wikipedia + generados con IA
import { partidos as mockParties } from '../data/partidosReales';
import { propuestas as mockProposals } from '../data/propuestasReales';
import { mockJudicialCases } from '../data/mockJudicialCases'; // Datos simulados
import { mockNews } from '../data/mockNews'; // Datos simulados
import { generateCandidateExplanation } from '../services/geminiService'; // IA con Gemini
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  FileText,
  AlertTriangle,
  Newspaper,
  ExternalLink,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface CandidateModalProps {
  candidate: Candidate;
  onClose: () => void;
}

export default function CandidateModal({ candidate, onClose }: CandidateModalProps) {
  const [party, setParty] = useState<PoliticalParty | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [judicialCases, setJudicialCases] = useState<JudicialCase[]>([]);
  const [relatedNews, setRelatedNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    loadCandidateDetails();
  }, [candidate.id]);

  const loadCandidateDetails = async () => {
    try {
      // TODO: Reemplazar con datos reales de Supabase cuando esté listo
      // const [partyData, proposalsData, casesData, newsData] = await Promise.all([
      //   supabase.from('political_parties').select('*').eq('id', candidate.party_id).maybeSingle(),
      //   supabase.from('proposals').select('*').eq('candidate_id', candidate.id),
      //   supabase.from('judicial_cases').select('*').eq('candidate_id', candidate.id),
      //   supabase.from('news_articles').select('*').contains('related_candidates', [candidate.id]),
      // ]);

      // Usando datos simulados por ahora
      await new Promise(resolve => setTimeout(resolve, 300)); // Simular delay
      
      const partyData = mockParties.find(p => p.id === candidate.party_id);
      const proposalsData = mockProposals.filter(p => p.candidate_id === candidate.id);
      const casesData = mockJudicialCases.filter(c => c.candidate_id === candidate.id);
      const newsData = mockNews.filter(n => 
        n.related_candidates && n.related_candidates.includes(String(candidate.id))
      );

      if (partyData) setParty(partyData);
      setProposals(proposalsData);
      setJudicialCases(casesData);
      setRelatedNews(newsData);
      
    } catch (error) {
      console.error('Error loading candidate details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generar explicación con IA
  const generateAIExplanation = async () => {
    if (!party) return;
    
    setGeneratingAI(true);
    try {
      const explanation = await generateCandidateExplanation(
        candidate,
        proposals,
        judicialCases,
        party.name
      );
      setAiExplanation(explanation);
    } catch (error) {
      console.error('Error generando explicación:', error);
      setAiExplanation('No se pudo generar la explicación. Por favor, intenta nuevamente.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const categories = [...new Set(proposals.map((p) => p.category))];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-background-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-primary-light">
        <div className="sticky top-0 bg-gradient-to-r from-accent-red to-primary text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                {candidate.photo_url ? (
                  <img
                    src={candidate.photo_url}
                    alt={candidate.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-accent-red" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{candidate.full_name}</h2>
                <p className="text-pink-100">{candidate.position}</p>
                {party && <p className="text-sm text-pink-200 mt-1">{party.name}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-pink border-t-transparent"></div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Sección de Explicación con IA */}
            <div className="bg-gradient-to-r from-accent-red via-primary to-primary-dark rounded-xl p-6 border border-accent-pink">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-accent-pink" />
                  <h3 className="text-xl font-bold text-white">Explicación con IA</h3>
                </div>
                <button
                  onClick={generateAIExplanation}
                  disabled={generatingAI}
                  className="px-4 py-2 bg-accent-pink hover:bg-accent-red text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {generatingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{aiExplanation ? 'Regenerar' : 'Generar Explicación'}</span>
                    </>
                  )}
                </button>
              </div>

              {aiExplanation ? (
                <div className="bg-background-card rounded-lg p-4">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                    {aiExplanation}
                  </p>
                </div>
              ) : (
                <div className="bg-background-card rounded-lg p-4 text-center">
                  <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">
                    Haz clic en "Generar Explicación" para obtener un análisis inteligente de este candidato
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary-dark rounded-lg p-4">
                <User className="w-6 h-6 text-accent-pink mb-2" />
                <p className="text-sm text-gray-400">Edad</p>
                <p className="text-lg font-semibold text-white">
                  {candidate.age || 'N/A'} años
                </p>
              </div>
              <div className="bg-primary-dark rounded-lg p-4 md:col-span-2">
                <GraduationCap className="w-6 h-6 text-accent-pink mb-2" />
                <p className="text-sm text-gray-400">Educación</p>
                <p className="text-sm font-medium text-white">
                  {candidate.education || 'Información no disponible'}
                </p>
              </div>
            </div>

            <div className="bg-primary-dark rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-accent-pink" />
                <h3 className="text-lg font-semibold text-white">Biografía</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {candidate.biography || 'Información no disponible'}
              </p>
            </div>

            <div className="bg-primary-dark rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Briefcase className="w-5 h-5 text-accent-pink" />
                <h3 className="text-lg font-semibold text-white">Experiencia</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {candidate.experience || 'Información no disponible'}
              </p>
            </div>

            {proposals.length > 0 && (
              <div className="bg-background-card rounded-lg border border-primary-light p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Propuestas del Partido
                </h3>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const categoryProposals = proposals.filter((p) => p.category === category);
                    return (
                      <div key={category} className="border-l-4 border-accent-red pl-4">
                        <h4 className="font-semibold text-accent-pink mb-2">{category}</h4>
                        {categoryProposals.map((proposal) => (
                          <div key={proposal.id} className="mb-3">
                            <p className="font-medium text-white">{proposal.title}</p>
                            <p className="text-sm text-gray-300 mt-1">{proposal.description}</p>
                            {proposal.details && (
                              <p className="text-xs text-gray-400 mt-1">{proposal.details}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {judicialCases.length > 0 && (
              <div className="bg-accent-red bg-opacity-20 rounded-lg border border-accent-red p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-accent-pink" />
                  <h3 className="text-lg font-semibold text-white">Casos Judiciales</h3>
                </div>
                <div className="space-y-3">
                  {judicialCases.map((case_) => (
                    <div key={case_.id} className="bg-background-card rounded-lg p-3 border border-primary-light">
                      <p className="font-medium text-white">{case_.case_title}</p>
                      <p className="text-sm text-gray-300 mt-1">{case_.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs px-2 py-1 bg-accent-red text-white rounded">
                          {case_.status}
                        </span>
                        {case_.source_url && (
                          <a
                            href={case_.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent-pink hover:underline flex items-center space-x-1"
                          >
                            <span>Ver fuente</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {relatedNews.length > 0 && (
              <div className="bg-background-card rounded-lg border border-primary-light p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Newspaper className="w-5 h-5 text-accent-pink" />
                  <h3 className="text-lg font-semibold text-white">Noticias Relacionadas</h3>
                </div>
                <div className="space-y-2">
                  {relatedNews.slice(0, 3).map((news) => (
                    <a
                      key={news.id}
                      href={news.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-primary-dark rounded-lg hover:bg-accent-red transition-colors"
                    >
                      <p className="font-medium text-gray-900 text-sm">{news.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{news.source_name}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
