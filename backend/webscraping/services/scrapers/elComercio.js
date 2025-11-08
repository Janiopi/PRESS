// scrapers/puppeteerScraper.js
import puppeteer from 'puppeteer';
import { isPoliticalNews } from './utils.js';

// Función para evitar ser detectado como bot
async function setupBrowser() {
  return puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ],
    defaultViewport: { width: 1366, height: 768 }
  });
}

// Función para simular comportamiento humano
async function humanBehavior(page) {
  // Scroll aleatorio
  await page.evaluate(() => {
    const scrollAmount = Math.floor(Math.random() * 500) + 100;
    window.scrollBy(0, scrollAmount);
  });
  
  // Esperar un tiempo aleatorio entre operaciones
  await page.waitForTimeout(Math.floor(Math.random() * 1000) + 500);
}

// Función principal de scraping
export async function scrapeElComercio(newspaper) {
  let browser;
  try {
    console.log(`Iniciando scraping de ${newspaper.name} con Puppeteer`);
    browser = await setupBrowser();
    const page = await browser.newPage();
    
    // Configurar user-agent para parecer más un navegador normal
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
    
    // Navegar a la URL
    await page.goto(newspaper.url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Simular comportamiento humano
    await humanBehavior(page);
    
    // Esperar a que los elementos se carguen
    await page.waitForSelector(newspaper.selector.articles, { timeout: 10000 });
    
    // Extraer información básica de los artículos
    const articlePreviews = await page.evaluate((selectors) => {
      const articles = Array.from(document.querySelectorAll(selectors.articles));
      // Limitar a 10 artículos
      const limitedArticles = articles.slice(0, 10);
      
      return limitedArticles.map(article => {
        const titleElement = article.querySelector(selectors.title);
        const title = titleElement ? titleElement.textContent.trim() : '';
        
        // URL del artículo
        let url = '';
        if (titleElement && titleElement.href) {
          url = titleElement.href;
        } else if (article.querySelector(selectors.link)) {
          url = article.querySelector(selectors.link).href;
        }
        
        // Encontrar imagen (si existe)
        let imageURL = '';
        const imgElement = article.querySelector('img');
        if (imgElement) {
          imageURL = imgElement.src || imgElement.getAttribute('data-src') || '';
        }
        
        return { title, url, imageURL };
      }).filter(item => item.title && item.url);
    }, newspaper.selector);
    
    // Filtrar noticias políticas
    const politicalArticles = articlePreviews.filter(article => 
      isPoliticalNews(article.title)
    );
    
    console.log(`Encontrados ${politicalArticles.length} artículos políticos en ${newspaper.name}`);
    
    // Obtener detalles completos de cada artículo político
    const articles = [];
    for (const preview of politicalArticles) {
      try {
        console.log(`Procesando artículo: ${preview.title}`);
        await page.goto(preview.url, { waitUntil: 'networkidle2', timeout: 30000 });
        await humanBehavior(page);
        
        // Extraer fecha y contenido
        const details = await page.evaluate((selectors) => {
          // Buscar la fecha en varios posibles elementos
          let dateText = '';
          
          // Opción 1: Meta tags
          const metaDate = document.querySelector('meta[property="article:published_time"], meta[name="publication_date"]');
          if (metaDate) {
            dateText = metaDate.getAttribute('content');
          }
          
          // Opción 2: Elementos específicos con fecha
          if (!dateText) {
            const dateElements = document.querySelectorAll('.story-contents__time, time, .date, [itemprop="datePublished"]');
            for (const el of dateElements) {
              if (el.textContent.trim()) {
                dateText = el.textContent.trim();
                break;
              }
            }
          }
          
          // Buscar el contenido en varios posibles elementos
          let content = '';
          
          // Intentar con selectores específicos primero
          const paragraphs = Array.from(document.querySelectorAll('article p, .story-contents__font-paragraph, .article-body p, .news-text-content p'));
          if (paragraphs.length > 0) {
            content = paragraphs
              .map(p => p.textContent.trim())
              .filter(text => text && !text.includes('LEE TAMBIÉN') && !text.includes('MIRA TAMBIÉN'))
              .join('\n\n');
          }
          
          // Si no se encontró contenido, intentar con el cuerpo principal
          if (!content) {
            content = document.querySelector('article, .story-contents, .article-body, .news-text-content')?.textContent.trim() || '';
          }
          
          // Buscar una imagen mejor si existe
          let betterImageURL = '';
          const mainImage = document.querySelector('.story-contents__gallery img, .main-image img, article img.featured');
          if (mainImage) {
            betterImageURL = mainImage.src || mainImage.getAttribute('data-src') || '';
          }
          
          return { 
            dateText, 
            content,
            betterImageURL
          };
        }, newspaper.selector);
        
        // Procesar la fecha
        let date;
        if (details.dateText) {
          try {
            date = new Date(details.dateText);
            if (isNaN(date.getTime())) {
              // Si no se puede parsear directamente, intentar formatear manualmente
              const dateMatch = details.dateText.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
              if (dateMatch) {
                const [, day, month, year] = dateMatch;
                date = new Date(`${year}-${month}-${day}`);
              } else {
                // Usar la fecha actual como fallback
                date = new Date();
              }
            }
          } catch (e) {
            date = new Date();
          }
        } else {
          date = new Date();
        }
        
        // Usar la mejor imagen encontrada, o mantener la original
        const imageURL = details.betterImageURL || preview.imageURL || '';
        
        articles.push({
          title: preview.title,
          newspaper: newspaper.name,
          date: date.toISOString(),
          content: details.content,
          url: preview.url,
          imageURL
        });
      } catch (error) {
        console.error(`Error obteniendo detalles de ${preview.url}: ${error.message}`);
      }
    }
    
    return articles;
  } catch (error) {
    console.error(`Error scraping ${newspaper.name}: ${error.message}`);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

/*
// Test
const searchService = new SearchService();
const results = await searchService.search('test');

console.log('\nRESULTS...');
console.dir(results, { depth: null, colors: true });
*/