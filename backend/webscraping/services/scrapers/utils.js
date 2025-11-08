// Minimal helper used by elComercio scraper for testing
export function isPoliticalNews(title = '') {
  if (!title) return false;
  const t = title.toLowerCase();
  const keywords = [
    'presid', 'gobierno', 'congreso', 'ministro', 'elección', 'elecciones', 'política', 'parlament',
    'senador', 'senadora', 'ley', 'partido', 'oposición', 'presidente', 'presidenta', 'ministerio',
    'voto', 'diputado', 'tribunal', 'corrupción'
  ];
  return keywords.some(k => t.includes(k));
}
