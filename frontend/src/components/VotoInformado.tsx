import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PoliticalParty, Candidate } from '../types';
import { Building2, ChevronRight, Filter } from 'lucide-react';
import CandidateModal from './CandidateModal';

export default function VotoInformado() {
  const [parties, setParties] = useState<(PoliticalParty & { candidates: Candidate[] })[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState<string>('all');

  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = async () => {
    try {
      const { data: partiesData } = await supabase
        .from('political_parties')
        .select('*')
        .order('name');

      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('*')
        .order('full_name');

      if (partiesData && candidatesData) {
        const partiesWithCandidates = partiesData.map((party) => ({
          ...party,
          candidates: candidatesData.filter((c) => c.party_id === party.id),
        }));
        setParties(partiesWithCandidates);
      }
    } catch (error) {
      console.error('Error loading parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const regions = ['all', 'Nacional', 'Lima', 'Junín', 'La Libertad'];

  const filteredParties = parties.map((party) => ({
    ...party,
    candidates:
      regionFilter === 'all'
        ? party.candidates
        : party.candidates.filter((c) => c.region === regionFilter),
  })).filter((party) => party.candidates.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Voto Informado 2026</h2>
          <p className="text-gray-600 mt-1">Conoce a los candidatos y sus propuestas</p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium"
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region === 'all' ? 'Todas las regiones' : region}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredParties.map((party) => (
          <div
            key={party.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100"
          >
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  {party.logo_url ? (
                    <img
                      src={party.logo_url}
                      alt={party.name}
                      className="w-16 h-16 rounded-lg object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{party.name}</h3>
                    <p className="text-sm text-blue-700 font-semibold">{party.acronym}</p>
                    <p className="text-xs text-gray-600 mt-1">{party.ideology}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Candidatos
              </h4>
              <div className="space-y-2">
                {party.candidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    onClick={() => setSelectedCandidate(candidate)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all group border border-transparent hover:border-blue-200"
                  >
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-700">
                        {candidate.full_name}
                      </p>
                      <p className="text-sm text-gray-600">{candidate.position}</p>
                      {candidate.region !== 'Nacional' && (
                        <p className="text-xs text-gray-500 mt-1">{candidate.region}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredParties.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            No se encontraron candidatos para esta región
          </p>
        </div>
      )}

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
