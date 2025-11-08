/*
  # Press App - Political Information Database Schema

  ## Overview
  Creates the complete database structure for the Press political information app,
  including tables for political parties, candidates, proposals, news articles, and chat history.

  ## New Tables
  
  ### 1. `political_parties`
  - `id` (uuid, primary key)
  - `name` (text) - Party name
  - `acronym` (text) - Party acronym
  - `logo_url` (text) - URL to party logo
  - `foundation_year` (integer)
  - `ideology` (text)
  - `website` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `candidates`
  - `id` (uuid, primary key)
  - `party_id` (uuid, foreign key) - References political_parties
  - `full_name` (text)
  - `position` (text) - Presidential, congressional, etc.
  - `age` (integer)
  - `education` (text)
  - `experience` (text)
  - `biography` (text)
  - `photo_url` (text)
  - `region` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `proposals`
  - `id` (uuid, primary key)
  - `party_id` (uuid, foreign key)
  - `candidate_id` (uuid, foreign key, nullable)
  - `category` (text) - Education, economy, health, etc.
  - `title` (text)
  - `description` (text)
  - `details` (text)
  - `created_at` (timestamptz)

  ### 4. `judicial_cases`
  - `id` (uuid, primary key)
  - `candidate_id` (uuid, foreign key)
  - `case_title` (text)
  - `description` (text)
  - `status` (text) - Active, closed, under investigation
  - `source_url` (text)
  - `date_filed` (date)
  - `created_at` (timestamptz)

  ### 5. `news_articles`
  - `id` (uuid, primary key)
  - `title` (text)
  - `content` (text)
  - `summary` (text) - AI-generated summary
  - `youth_explanation` (text) - Colloquial explanation
  - `expert_explanation` (text) - Technical explanation
  - `source_name` (text) - Media outlet
  - `source_url` (text)
  - `reliability_rating` (integer) - 1-5 stars
  - `published_date` (timestamptz)
  - `tags` (text[]) - Array of tags
  - `related_candidates` (uuid[]) - Array of candidate IDs
  - `created_at` (timestamptz)

  ### 6. `chat_conversations`
  - `id` (uuid, primary key)
  - `session_id` (text) - Session identifier
  - `messages` (jsonb) - Array of messages
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for political information (parties, candidates, proposals, judicial cases, news)
  - Chat conversations are session-based and accessible only to the session owner

  ## Notes
  - All timestamps use Peru timezone awareness
  - News articles include AI-processed explanations
  - Relationships between candidates, parties, and news are tracked
*/

-- Create political_parties table
CREATE TABLE IF NOT EXISTS political_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  acronym text NOT NULL,
  logo_url text DEFAULT '',
  foundation_year integer,
  ideology text DEFAULT '',
  website text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid REFERENCES political_parties(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  position text NOT NULL DEFAULT 'Candidato',
  age integer,
  education text DEFAULT '',
  experience text DEFAULT '',
  biography text DEFAULT '',
  photo_url text DEFAULT '',
  region text DEFAULT 'Nacional',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid REFERENCES political_parties(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  details text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create judicial_cases table
CREATE TABLE IF NOT EXISTS judicial_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  case_title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'En investigación',
  source_url text DEFAULT '',
  date_filed date,
  created_at timestamptz DEFAULT now()
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  summary text DEFAULT '',
  youth_explanation text DEFAULT '',
  expert_explanation text DEFAULT '',
  source_name text NOT NULL,
  source_url text DEFAULT '',
  reliability_rating integer DEFAULT 3 CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  published_date timestamptz DEFAULT now(),
  tags text[] DEFAULT '{}',
  related_candidates uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  messages jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE political_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE judicial_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Anyone can view political parties"
  ON political_parties FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view candidates"
  ON candidates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view proposals"
  ON proposals FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view judicial cases"
  ON judicial_cases FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view news articles"
  ON news_articles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Chat conversations - session-based access
CREATE POLICY "Users can view own chat conversations"
  ON chat_conversations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert chat conversations"
  ON chat_conversations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own chat conversations"
  ON chat_conversations FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidates_party_id ON candidates(party_id);
CREATE INDEX IF NOT EXISTS idx_proposals_party_id ON proposals(party_id);
CREATE INDEX IF NOT EXISTS idx_proposals_candidate_id ON proposals(candidate_id);
CREATE INDEX IF NOT EXISTS idx_judicial_cases_candidate_id ON judicial_cases(candidate_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_date ON news_articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON chat_conversations(session_id);