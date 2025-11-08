/**
 * These are the most "reliable" newspapers in Peru
 * Source: https://reutersinstitute.politics.ox.ac.uk/es/digital-news-report/2025/peru
 */
const newspapers = [
  {
    name: "El Comercio",
    url: "https://elcomercio.pe/politica/",
    rank: 3,
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
    name: "El Peruano",
    url: "https://elperuano.pe/politica",
    rank: 4,
    selector: {
      // Use broader fallbacks because El Peruano markup varies between sections
      articles: ".card, .card-content, .contenedor-cards-categoria .card, article.article-item",
      title: "h2 a",
      date: ".article-date",
      link: "h2 a",
      content: null,
      // Candidate selectors tried when extracting title from a preview card
      candidateSelectors: ['.nota-height .card-content a', '.card-content a', '.titulo-card a', 'h2 a', 'h3 a', 'a[href*="/noticia/"]']
    },
    needsJavascript: false
  },

  {
    name: "La República",
    url: "https://larepublica.pe/politica/",
    rank: 2,
    selector: {
      articles: ".ListSection_list__section--item__zeP_z",
      title: ".ListSection_list__section--title__hwhjX a",
      date: ".ListSection_list__section--time__2cnSA",
      link: "a",
      content: null
    },
    // By default we attempted to filter only political articles; set to false to return all
    needsJavascript: true,
    filterPolitical: false
  },


];

export default newspapers;