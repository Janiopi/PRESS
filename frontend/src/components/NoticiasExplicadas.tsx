import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { NewsArticle } from '../types';
import {
  Newspaper,
  Star,
  Calendar,
  ExternalLink,
  Sparkles,
  GraduationCap,
  Tag,
} from 'lucide-react';

export default function NoticiasExplicadas() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [explanationMode, setExplanationMode] = useState<'youth' | 'expert'>('youth');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const { data } = await supabase
        .from('news_articles')
        .select('*')
        .order('published_date', { ascending: false });

      if (data) {
        setNews(data);
      }
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-pink border-t-transparent"></div>
      </div>
    );
  }

  if (selectedNews) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedNews(null)}
          className="mb-4 text-accent-pink hover:text-white font-medium flex items-center space-x-2"
        >
          <span>← Volver a noticias</span>
        </button>

        <article className="bg-background-card rounded-xl shadow-lg overflow-hidden border border-primary-light">
          <div className="bg-gradient-to-r from-accent-red to-primary text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Newspaper className="w-5 h-5" />
                <span className="font-semibold">{selectedNews.source_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(selectedNews.reliability_rating)}
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3">{selectedNews.title}</h1>
            <div className="flex items-center space-x-2 text-pink-100">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(selectedNews.published_date)}</span>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Resumen</h3>
              <p className="text-gray-200 leading-relaxed bg-primary-dark p-4 rounded-lg">
                {selectedNews.summary}
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary via-primary-dark to-accent-red rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-accent-pink" />
                  <span>Explicación con IA</span>
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setExplanationMode('youth')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      explanationMode === 'youth'
                        ? 'bg-accent-red text-white shadow-md'
                        : 'bg-background-card text-gray-200 hover:bg-primary-dark'
                    }`}
                  >
                    Para Jóvenes
                  </button>
                  <button
                    onClick={() => setExplanationMode('expert')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      explanationMode === 'expert'
                        ? 'bg-accent-red text-white shadow-md'
                        : 'bg-background-card text-gray-200 hover:bg-primary-dark'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>Experto</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-background-card rounded-lg p-4">
                <p className="text-gray-200 leading-relaxed">
                  {explanationMode === 'youth'
                    ? selectedNews.youth_explanation
                    : selectedNews.expert_explanation}
                </p>
              </div>
            </div>

            {selectedNews.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-300" />
                  <h3 className="text-sm font-semibold text-gray-300 uppercase">Etiquetas</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedNews.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-dark text-accent-pink rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <a
              href={selectedNews.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-accent-pink hover:text-white font-medium"
            >
              <span>Leer artículo completo</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Noticias Explicadas</h2>
        <p className="text-gray-300 mt-1">
          Noticias políticas verificadas con explicaciones en lenguaje sencillo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {news.map((article) => (
          <article
            key={article.id}
            className="bg-background-card rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-primary-light cursor-pointer group"
            onClick={() => setSelectedNews(article)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Newspaper className="w-4 h-4 text-accent-pink" />
                  <span className="text-sm font-semibold text-accent-pink">
                    {article.source_name}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(article.reliability_rating)}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-accent-pink transition-colors line-clamp-2">
                {article.title}
              </h3>

              <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                {article.summary}
              </p>

              <div className="bg-primary-dark rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-accent-pink flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-200 line-clamp-2">
                    {article.youth_explanation}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-primary-light">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">{formatDate(article.published_date)}</span>
                </div>

                {article.tags.length > 0 && (
                  <div className="flex items-center space-x-1">
                    {article.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-dark text-gray-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > 2 && (
                      <span className="text-xs text-gray-400">
                        +{article.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-accent-red to-primary px-6 py-3 text-white text-sm font-medium flex items-center justify-between group-hover:from-accent-pink group-hover:to-accent-red transition-all">
              <span>Leer explicación completa</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </article>
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-12">
          <Newspaper className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No hay noticias disponibles</p>
        </div>
      )}
    </div>
  );
}
