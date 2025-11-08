import express from 'express';
import News from '../models/news.js';
import { runScrapers } from '../services/baseScraper.js';
import { saveArticles } from '../services/dbSaver.js';

const router = express.Router();

// GET /api/articles
// Query params: newspaper, tag, isPolitical (true/false), q (text search), limit, skip, sort
router.get('/articles', async (req, res) => {
  try {
    const { newspaper, tag, isPolitical, q } = req.query;
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const skip = parseInt(req.query.skip || '0', 10) || 0;

    const filter = {};
    if (newspaper) filter.newspaper = new RegExp(newspaper, 'i');
    if (tag) filter.tag = new RegExp(tag, 'i');
    if (typeof isPolitical !== 'undefined') filter.isPolitical = String(isPolitical).toLowerCase() === 'true';
    if (q) filter.$text = { $search: q };

    const [items, total] = await Promise.all([
      News.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean().exec(),
      News.countDocuments(filter).exec()
    ]);

    res.json({ ok: true, total, count: items.length, items });
  } catch (err) {
    console.error('GET /api/articles error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/scrape
// Body (optional): { sources: 'all' | ['el comercio','el peruano'], concurrency, perScraperTimeout }
// This runs the scrapers (via baseScraper.runScrapers) and saves results using saveArticles.
router.post('/scrape', async (req, res) => {
  try {
    const opts = req.body || {};
    // Immediately respond with 202 and run the job; but to keep it simple we'll run synchronously and return the summary.
    const runResults = await runScrapers(opts);

    // Aggregate articles and save per-source
    const saveSummaries = [];
    for (const r of runResults) {
      if (r.status === 'ok' && Array.isArray(r.articles) && r.articles.length > 0) {
        // Limit saved per source optionally
        const limit = opts.limitPerSource ? parseInt(opts.limitPerSource, 10) : 30;
        const slice = r.articles.slice(0, limit);
        const summary = await saveArticles(slice);
        saveSummaries.push({ source: r.source, scrapeCount: r.count, saveSummary: summary });
      } else {
        saveSummaries.push({ source: r.source, status: r.status, error: r.error || null, scrapeCount: r.count || 0 });
      }
    }

    res.json({ ok: true, runResults, saveSummaries });
  } catch (err) {
    console.error('POST /api/scrape error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
