/**
 * These are the most "reliable" newspapers in Peru
 * Source: https://reutersinstitute.politics.ox.ac.uk/es/digital-news-report/2025/peru
 */
const newspapers = [
  {
    name: "El Comercio",
    url: "https://elcomercio.pe/politica/",
    rank: 1,
    selector: {
      articles: ".story-item",
      title: ".story-item__content h2 a",
      date: ".story-item__meta time",
      link: ".story-item__content h2 a",
      content: null // Se obtendrá de la página individual
    },
    needsJavascript: false
  },
  {
    name: "La República",
    url: "https://larepublica.pe/politica/",
    rank: 2,
    selector: {
      articles: "article.article-item",
      title: "h2 a",
      date: ".article-date",
      link: "h2 a",
      content: null
    },
    needsJavascript: false
  },
  {
    name: "RPP",
    url: "https://rpp.pe/politica",
    rank: 3,
    selector: {
      articles: ".article-preview",
      title: ".article-preview__title a",
      date: ".article-preview__date",
      link: ".article-preview__title a",
      content: null
    },
    needsJavascript: false
  },
  {
    name: "Gestión",
    url: "https://gestion.pe/peru/politica/",
    rank: 4,
    selector: {
      articles: ".w-content-view",
      title: "h2 a",
      date: ".time-ago",
      link: "h2 a",
      content: null
    },
    needsJavascript: true
  },
  {
    name: "Correo",
    url: "https://diariocorreo.pe/politica/",
    rank: 5,
    selector: {
      articles: ".story-item",
      title: "h2 a",
      date: ".story-item__meta time",
      link: "h2 a",
      content: null
    },
    needsJavascript: false
  }
];

export default newspapers;