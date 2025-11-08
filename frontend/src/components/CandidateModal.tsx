import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Candidate, Proposal, JudicialCase, PoliticalParty, NewsArticle } from '../types';
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  FileText,
  AlertTriangle,
  Newspaper,
  ExternalLink,
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

  useEffect(() => {
    loadCandidateDetails();
  }, [candidate.id]);

  const loadCandidateDetails = async () => {
    try {
      const [partyData, proposalsData, casesData, newsData] = await Promise.all([
        supabase.from('political_parties').select('*').eq('id', candidate.party_id).maybeSingle(),
        supabase.from('proposals').select('*').eq('candidate_id', candidate.id),
        supabase.from('judicial_cases').select('*').eq('candidate_id', candidate.id),
        supabase.from('news_articles').select('*').contains('related_candidates', [candidate.id]),
      ]);

      if (partyData.data) setParty(partyData.data);
      if (proposalsData.data) setProposals(proposalsData.data);
      if (casesData.data) setJudicialCases(casesData.data);
      if (newsData.data) setRelatedNews(newsData.data);
    } catch (error) {
      console.error('Error loading candidate details:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(proposals.map((p) => p.category))];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
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
                  <User className="w-10 h-10 text-blue-600" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{candidate.full_name}</h2>
                <p className="text-blue-100">{candidate.position}</p>
                {party && <p className="text-sm text-blue-200 mt-1">{party.name}</p>}
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
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <User className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-sm text-gray-600">Edad</p>
                <p className="text-lg font-semibold text-gray-900">
                  {candidate.age || 'N/A'} años
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 md:col-span-2">
                <GraduationCap className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-sm text-gray-600">Educación</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.education || 'Información no disponible'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Biografía</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {candidate.biography || 'Información no disponible'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Briefcase className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Experiencia</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {candidate.experience || 'Información no disponible'}
              </p>
            </div>

            {proposals.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Propuestas del Partido
                </h3>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const categoryProposals = proposals.filter((p) => p.category === category);
                    return (
                      <div key={category} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-blue-700 mb-2">{category}</h4>
                        {categoryProposals.map((proposal) => (
                          <div key={proposal.id} className="mb-3">
                            <p className="font-medium text-gray-900">{proposal.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{proposal.description}</p>
                            {proposal.details && (
                              <p className="text-xs text-gray-500 mt-1">{proposal.details}</p>
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
              <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">Casos Judiciales</h3>
                </div>
                <div className="space-y-3">
                  {judicialCases.map((case_) => (
                    <div key={case_.id} className="bg-white rounded-lg p-3">
                      <p className="font-medium text-gray-900">{case_.case_title}</p>
                      <p className="text-sm text-gray-600 mt-1">{case_.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                          {case_.status}
                        </span>
                        {case_.source_url && (
                          <a
                            href={case_.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
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
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Newspaper className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">Noticias Relacionadas</h3>
                </div>
                <div className="space-y-2">
                  {relatedNews.slice(0, 3).map((news) => (
                    <a
                      key={news.id}
                      href={news.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
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
