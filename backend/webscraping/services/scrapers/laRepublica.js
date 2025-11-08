// scrapers/laRepublicaScraper.js
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { isPoliticalNews } from './utils.js';

// enable stealth plugin to help bypass basic bot detections
puppeteerExtra.use(StealthPlugin());

export async function scrapeRepublica(newspaper) {
  let browser;
  try {
    const name = (newspaper && newspaper.name) ? newspaper.name : 'La República';
    console.log(`Iniciando scraping de ${name} con Puppeteer`);
    browser = await puppeteerExtra.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
    
    // Navegar a la sección configurada (fallback a política)
    const startUrl = (newspaper && newspaper.url) ? newspaper.url : 'https://larepublica.pe/politica/';
    await page.goto(startUrl, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Esperar a que carguen los artículos
    // selector for article previews can be provided via config
    const articlesSelector = (newspaper && newspaper.selector && newspaper.selector.articles) ? newspaper.selector.articles : '.ListSection_list__section--item__zeP_z';
    await page.waitForSelector(articlesSelector, { 
      timeout: 10000 
    }).catch(() => console.log('No se encontró el selector de lista de artículos, continuando...'));
    
    // Obtener la lista de noticias
    const articlePreviews = await page.evaluate((articlesSelector, candidateSelectors) => {
      const nodes = Array.from(document.querySelectorAll(articlesSelector));
      const limited = nodes.slice(0, 25);

      return limited.map(node => {
        const linkEl = node.querySelector('a[href]');

        const selectors = Array.isArray(candidateSelectors) && candidateSelectors.length ? candidateSelectors : ['.ListSection_list__section--title__hwhjX a', 'h2 a', 'h3 a', 'a'];
        let title = '';
        for (const s of selectors) {
          const el = node.querySelector(s);
          if (el && el.textContent) { title = el.textContent.trim(); break; }
        }
        if (!title && linkEl && linkEl.textContent) title = linkEl.textContent.trim();

        const urlRaw = linkEl ? (linkEl.getAttribute('href') || linkEl.href) : '';
        const url = urlRaw && urlRaw.startsWith('http') ? urlRaw : (`https://larepublica.pe${urlRaw.startsWith('/') ? '' : '/'}${urlRaw}`);

        const img = node.querySelector('img');
        const imageURL = img ? (img.src || img.getAttribute('data-src') || '') : '';

        const tagEl = node.querySelector('.ListSection_list__section--tag__9n0iT, .tag');
        const tag = tagEl ? tagEl.textContent.trim() : '';

        const authorEl = node.querySelector('.AuthorSign_authorSign__name__FXLMu, .author');
        const author = authorEl ? authorEl.textContent.trim() : '';

        const dateEl = node.querySelector('.ListSection_list__section--time__2cnSA, time, .date');
        const dateText = dateEl ? dateEl.textContent.trim() : '';

        const isVideo = !!node.querySelector('.video-type');

        return { title, url, imageURL, tag, author, dateText, isVideo };
      }).filter(a => a.title && a.url);
    }, articlesSelector, (newspaper && newspaper.selector && newspaper.selector.candidateSelectors) || []);
    
    console.log(`Encontrados ${articlePreviews.length} artículos en La República`);
    
    // Obtener detalles completos de cada artículo
    const articles = [];
    for (const preview of articlePreviews) {
      try {
        // Optionally filter by politics depending on config; by default the other utils/orchestrator can filter
        const shouldFilter = newspaper && (typeof newspaper.filterPolitical !== 'undefined' ? newspaper.filterPolitical : true);
        if (shouldFilter && typeof preview.title === 'string') {
          const tagLower = (preview.tag || '').toString().toLowerCase();
          if (!isPoliticalNews(preview.title) && !tagLower.includes('polit')) continue;
        }
        
        console.log(`Procesando artículo: ${preview.title}`);
        
            // Open article in a fresh page to reduce detection and allow custom headers
            const articlePage = await browser.newPage();
            try {
              await articlePage.setUserAgent(await page.evaluate(() => navigator.userAgent).catch(() => 'Mozilla/5.0'));
            } catch (e) {
              // fallback
              await articlePage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36');
            }
            try { await articlePage.setExtraHTTPHeaders({ referer: startUrl, 'accept-language': 'es-ES,es;q=0.9' }); } catch (e) { /* ignore */ }

            const contentSelector = (newspaper && newspaper.selector && newspaper.selector.content) ? newspaper.selector.content : '.MainContent_main__body__i6gEa';
            const contentSelectorFallbacks = [contentSelector, 'article', 'main', '.article__body', '.ArticleBody', '.content'].filter(Boolean);

            let content = '';
            let detailsDate = '';
            const maxAttempts = 2;
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              try {
                await articlePage.goto(preview.url, { waitUntil: 'networkidle2', timeout: 30000 });

                // try multiple selector fallbacks
                let found = false;
                for (const sel of contentSelectorFallbacks) {
                  const exists = await articlePage.$(sel);
                  if (!exists) continue;

                  content = await articlePage.evaluate((s) => {
                    const root = document.querySelector(s);
                    if (!root) return '';
                    const toRemove = root.querySelectorAll('.ad-container, .channel-whatsapp__container, [class*="ads_"], .Quote_wrapper__quote__X6oMp, .share, .related');
                    toRemove.forEach(n => n.remove());

                    const paragraphs = Array.from(root.querySelectorAll('p')).map(p => p.textContent.trim()).filter(t => t && !/LEE TAMBI?N/i.test(t));
                    const lists = Array.from(root.querySelectorAll('ol li, ul li')).map((li, idx) => `${idx + 1}. ${li.textContent.trim()}`);
                    const headings = Array.from(root.querySelectorAll('h1,h2,h3')).map(h => h.textContent.trim());
                    return ([...headings, ...paragraphs, ...lists].filter(Boolean)).join('\n\n').trim();
                  }, sel);

                  detailsDate = await articlePage.evaluate((s) => {
                    const root = document.querySelector(s);
                    if (!root) return '';
                    const timeEl = root.querySelector('time, .date, .ArticleDate');
                    if (timeEl) return timeEl.textContent.trim();
                    const meta = document.querySelector('meta[property="article:published_time"], meta[name="publication_date"]');
                    return meta ? (meta.getAttribute('content') || '') : '';
                  }, sel);

                  if (content && content.length > 60) { found = true; break; }
                }

                if (found) break;
                // backoff
                await new Promise(res => setTimeout(res, 600 * attempt));
              } catch (err) {
                console.log(`Attempt ${attempt} failed for ${preview.url}: ${err.message}`);
                if (attempt === maxAttempts) break;
                await new Promise(res => setTimeout(res, 500 * attempt));
              }
            }

            try { await articlePage.close(); } catch (e) { /* ignore */ }
        
        // Procesar la fecha
        let date = new Date();
        if (preview.dateText) {
          // Formato típico: "19:52 | 07/11/2025"
          try {
            const parts = preview.dateText.split('|');
            if (parts.length === 2) {
              const timePart = parts[0].trim();
              const datePart = parts[1].trim();
              
              const [day, month, year] = datePart.split('/');
              const [hours, minutes] = timePart.split(':');
              
              date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
            }
          } catch (e) {
            console.error(`Error al procesar fecha "${preview.dateText}": ${e.message}`);
          }
        }
        
        // Solo agregar si tenemos contenido suficiente
        if (content && content.length > 50) {
          articles.push({
            title: preview.title,
            newspaper: name,
            date: date.toISOString(),
            content,
            url: preview.url,
            imageURL: preview.imageURL,
            author: preview.author,
            tag: preview.tag
          });
        }
      } catch (error) {
        console.error(`Error obteniendo detalles de ${preview.url}: ${error.message}`);
      }
    }
    
    console.log(`Se procesaron completamente ${articles.length} artículos de La República`);
    return articles;
  } catch (error) {
    console.error(`Error en el scraping de La República: ${error.message}`);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}