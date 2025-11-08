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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (selectedNews) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedNews(null)}
          className="mb-4 text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
        >
          <span>← Volver a noticias</span>
        </button>

        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
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
            <div className="flex items-center space-x-2 text-blue-100">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(selectedNews.published_date)}</span>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resumen</h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                {selectedNews.summary}
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>Explicación con IA</span>
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setExplanationMode('youth')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      explanationMode === 'youth'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Para Jóvenes
                  </button>
                  <button
                    onClick={() => setExplanationMode('expert')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      explanationMode === 'expert'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>Experto</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {explanationMode === 'youth'
                    ? selectedNews.youth_explanation
                    : selectedNews.expert_explanation}
                </p>
              </div>
            </div>

            {selectedNews.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-600 uppercase">Etiquetas</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedNews.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
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
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
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
        <h2 className="text-3xl font-bold text-gray-900">Noticias Explicadas</h2>
        <p className="text-gray-600 mt-1">
          Noticias políticas verificadas con explicaciones en lenguaje sencillo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {news.map((article) => (
          <article
            key={article.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100 cursor-pointer group"
            onClick={() => setSelectedNews(article)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Newspaper className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">
                    {article.source_name}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(article.reliability_rating)}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                {article.title}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                {article.summary}
              </p>

              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {article.youth_explanation}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">{formatDate(article.published_date)}</span>
                </div>

                {article.tags.length > 0 && (
                  <div className="flex items-center space-x-1">
                    {article.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{article.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-white text-sm font-medium flex items-center justify-between group-hover:from-blue-700 group-hover:to-cyan-700 transition-all">
              <span>Leer explicación completa</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </article>
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-12">
          <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay noticias disponibles</p>
        </div>
      )}
    </div>
  );
}
