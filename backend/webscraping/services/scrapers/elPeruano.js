import puppeteer from 'puppeteer';
import { isPoliticalNews } from './utils.js';

export async function scrapeElPeruano(newspaper) {
  let browser;
  try {
    const name = (newspaper && newspaper.name) ? newspaper.name : 'El Peruano';
    console.log(`Iniciando scraping de ${name} con Puppeteer`);
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
    
    // Navegar a la sección configurada
    const startUrl = (newspaper && newspaper.url) ? newspaper.url : 'https://elperuano.pe/politica';
    await page.goto(startUrl, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Esperar a que carguen los elementos del listado de noticias
    const articlesSelector = newspaper && newspaper.selector && newspaper.selector.articles ? newspaper.selector.articles : '.card, .card-content, .contenedor-cards-categoria .card';
    await page.waitForSelector(articlesSelector, { 
      timeout: 10000 
    }).catch(() => console.log('No se encontró el selector esperado, continuando...'));
    
    // Obtener la lista de noticias
    const articlePreviews = await page.evaluate((articlesSelector, candidateSelectors) => {
      const newsCards = Array.from(document.querySelectorAll(articlesSelector));

      return newsCards.slice(0, 20).map(card => {
        // Preferir enlaces que apuntan a '/noticia/' (son los artículos)
        let linkElement = card.querySelector('a[href*="/noticia/"], a[href*="noticia/"]');
        if (!linkElement) linkElement = card.querySelector('a');

        // Intentar extraer título: evitar tomar el span con fecha (p.ej. '07/11/2025')
        let title = '';
        const defaultCandidateSelectors = ['.nota-height .card-content a', '.nota-height a:not(.seccionrojo)', '.card-content a:not(.seccionrojo)', '.titulo-card a', 'h2 a', 'h3 a', 'a[href*="/noticia/"]'];
        const selectorsToTry = Array.isArray(candidateSelectors) && candidateSelectors.length ? candidateSelectors : defaultCandidateSelectors;
        for (const sel of selectorsToTry) {
          const el = card.querySelector(sel);
          if (el && el.textContent) {
            const txt = el.textContent.trim();
            // si el texto parece una fecha, saltarlo
            if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(txt)) continue;
            if (txt.length > 0) { title = txt; break; }
          }
        }

        // Si no encontramos título, tomar texto del primer <p> o del primer <a>
        if (!title) {
          const p = card.querySelector('p');
          if (p && p.textContent && p.textContent.trim().length > 10) title = p.textContent.trim();
          else if (linkElement && linkElement.textContent && linkElement.textContent.trim() && !/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(linkElement.textContent.trim())) title = linkElement.textContent.trim();
        }

  // URL
  const url = linkElement ? (linkElement.href || linkElement.getAttribute('href') || '') : '';

        // Extraer fecha si aparece en la tarjeta
        let dateText = '';
        const dateElement = card.querySelector('.card-title3, .fecha, span.fecha, .card-title, .card-title3');
        if (dateElement) dateText = dateElement.textContent.trim();

        // Imagen
        let imageURL = '';
        const imgElement = card.querySelector('img');
        if (imgElement) imageURL = imgElement.src || imgElement.getAttribute('data-src') || '';

        // Resumen
        let summary = '';
        const summaryElement = card.querySelector('.card-content p, .resumen-card, .resumen');
        if (summaryElement) summary = summaryElement.textContent.trim();

        return { title, url, dateText, imageURL, summary };
      }).filter(article => article.title && article.url && !article.title.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/));
    }, articlesSelector, (newspaper && newspaper.selector && newspaper.selector.candidateSelectors) || []);
    
    console.log(`Encontrados ${articlePreviews.length} artículos en El Peruano`);
    
    // Obtener detalles completos de cada artículo
    const articles = [];
    for (const preview of articlePreviews) {
      try {
        console.log(`Procesando artículo: ${preview.title}`);
        await page.goto(preview.url, { 
          waitUntil: 'networkidle2', 
          timeout: 30000 
        });
        
        // Esperar a que cargue el contenido
        await page.waitForSelector('#contenido, .contenido, article', { 
          timeout: 10000 
        }).catch(() => console.log('No se encontró el selector de contenido, continuando...'));
        
        // Extraer fecha y contenido
        const details = await page.evaluate(() => {
          // Extraer fecha (intentar varios selectores específicos de El Peruano)
          let dateText = '';
          const dateElements = document.querySelectorAll('strong.red-text, abbr strong.red-text, .fecha, .date');
          for (const el of dateElements) {
            const text = el.textContent.trim();
            if (text && (text.includes('/') || text.match(/\d{2}\/\d{2}\/\d{4}/))) {
              dateText = text;
              break;
            }
          }
          
          // Si no encontramos fecha en los elementos específicos, buscar en meta tags
          if (!dateText) {
            const metaDate = document.querySelector('meta[property="article:published_time"], meta[name="publication_date"]');
            if (metaDate) {
              dateText = metaDate.getAttribute('content');
            }
          }
          
          // Extraer contenido
          let content = '';
          // Primero intentar con el contenedor principal
          const contentElement = document.querySelector('#contenido, .contenido, article .content');
          if (contentElement) {
            // Excluir elementos no deseados como widgets de Twitter
            const twitterElements = contentElement.querySelectorAll('.twitter-tweet, [id^="twitter-widget"]');
            for (const el of twitterElements) {
              el.remove(); // Remover temporalmente para no incluirlo en el texto
            }
            
            // Obtener todos los párrafos y elementos de texto
            const textElements = contentElement.querySelectorAll('p, div:not(.twitter-tweet)');
            const paragraphs = [];
            
            for (const el of textElements) {
              const text = el.textContent.trim();
              // Filtrar textos vacíos o muy cortos
              if (text && text.length > 5 && !text.includes('Lea también')) {
                paragraphs.push(text);
              }
            }
            
            content = paragraphs.join('\n\n');
          }
          
          // Buscar imágenes en el contenido
          let mainImageURL = '';
          const imgElement = document.querySelector('#contenido img, .contenido img, article img');
          if (imgElement) {
            mainImageURL = imgElement.src;
          }
          
          return {
            dateText,
            content,
            mainImageURL
          };
        });
        
        // Procesar la fecha
        let date = new Date();
        if (details.dateText) {
          try {
            // Primero intentar con formato estándar
            date = new Date(details.dateText);
            
            // Si no funciona, intentar con formato peruano: DD/MM/YYYY
            if (isNaN(date.getTime())) {
              const dateMatch = details.dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
              if (dateMatch) {
                const [, day, month, year] = dateMatch;
                date = new Date(`${year}-${month}-${day}`);
              }
            }
          } catch (e) {
            console.error(`Error procesando fecha: ${details.dateText}`, e);
            // Usar fecha de hoy como fallback
            date = new Date();
          }
        }
        
        // Usar la mejor imagen encontrada
        const imageURL = details.mainImageURL || preview.imageURL || '';
        
        // Solo agregar si tenemos contenido
        if (details.content && details.content.length > 100) {
          const isPolitical = isPoliticalNews(preview.title || details.content.slice(0, 200));
          articles.push({
            title: preview.title,
            newspaper: "El Peruano",
            date: date.toISOString(),
            content: details.content,
            url: preview.url,
            imageURL,
            isPolitical
          });
        }
      } catch (error) {
        console.error(`Error obteniendo detalles de ${preview.url}: ${error.message}`);
      }
    }
    
    console.log(`Se procesaron completamente ${articles.length} artículos de El Peruano`);
    return articles;
  } catch (error) {
    console.error(`Error en el scraping de El Peruano: ${error.message}`);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}