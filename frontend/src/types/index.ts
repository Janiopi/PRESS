export interface PoliticalParty {
  id: string;
  name: string;
  acronym: string;
  logo_url: string;
  foundation_year: number | null;
  ideology: string;
  website: string;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  party_id: string;
  full_name: string;
  position: string;
  age: number | null;
  education: string;
  experience: string;
  biography: string;
  photo_url: string;
  region: string;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  party_id: string;
  candidate_id: string | null;
  category: string;
  title: string;
  description: string;
  details: string;
  created_at: string;
}

export interface JudicialCase {
  id: string;
  candidate_id: string;
  case_title: string;
  description: string;
  status: string;
  source_url: string;
  date_filed: string | null;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  youth_explanation: string;
  expert_explanation: string;
  source_name: string;
  source_url: string;
  reliability_rating: number;
  published_date: string;
  tags: string[];
  related_candidates: string[];
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
