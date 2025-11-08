import newspapers from '../config/newspapers.js';

// Map of friendly names to scraper modules. Each entry is an async function that returns
// an array of articles or throws.
const SCRAPERS = {
  'el comercio': async () => {
    const mod = await import('./scrapers/elComercio.js');
    const cfg = newspapers.find(n => n.name && n.name.toLowerCase().includes('el comercio'));
    if (!cfg) throw new Error('No config found for El Comercio');
    return mod.scrapeElComercio(cfg);
  },
  'la república': async () => {
    const mod = await import('./scrapers/laRepublica.js');
    const cfg = newspapers.find(n => n.name && n.name.toLowerCase().includes('la república'));
    if (!cfg) throw new Error('No config found for La República');
    return mod.scrapeRepublica(cfg);
  },
  'el peruano': async () => {
    const mod = await import('./scrapers/elPeruano.js');
    const cfg = newspapers.find(n => n.name && n.name.toLowerCase().includes('elperuano') || n.name.toLowerCase().includes('el peruano'));
    if (!cfg) throw new Error('No config found for El Peruano');
    return mod.scrapeElPeruano(cfg);
  }
};

function normalizeSourceName(name) {
  if (!name) return '';
  return name.toString().trim().toLowerCase();
}

function timeoutPromise(p, ms) {
  return Promise.race([
    p,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`Timeout after ${ms}ms`)), ms))
  ]);
}

export async function runScrapers({ sources = 'all', concurrency = 2, perScraperTimeout = 120000 } = {}) {
  const available = Object.keys(SCRAPERS);

  let toRun;
  if (!sources || sources === 'all') {
    toRun = available.slice();
  } else if (Array.isArray(sources)) {
    toRun = sources.map(normalizeSourceName).filter(s => s);
  } else {
    toRun = [normalizeSourceName(sources)];
  }

  // Filter unknowns but keep note
  const tasks = toRun.map(name => ({ name, implemented: available.includes(name) }));

  const results = [];

  // Simple concurrency pool
  const queue = tasks.slice();
  const running = [];

  async function runOne(task) {
    const start = Date.now();
    if (!task.implemented) {
      const err = `No scraper implemented for "${task.name}"`;
      results.push({ source: task.name, status: 'error', error: err, durationMs: 0, count: 0 });
      return;
    }

    const fn = SCRAPERS[task.name];
    try {
      const articles = await timeoutPromise(fn(), perScraperTimeout);
      const durationMs = Date.now() - start;
      results.push({ source: task.name, status: 'ok', articles, durationMs, count: Array.isArray(articles) ? articles.length : 0 });
    } catch (err) {
      const durationMs = Date.now() - start;
      results.push({ source: task.name, status: 'error', error: err.message || String(err), durationMs, count: 0 });
    }
  }

  // Kick off workers up to concurrency
  while (queue.length > 0 || running.length > 0) {
    while (queue.length > 0 && running.length < concurrency) {
      const task = queue.shift();
      const p = runOne(task).then(() => {
        const idx = running.indexOf(p);
        if (idx >= 0) running.splice(idx, 1);
      });
      running.push(p);
    }

    if (running.length > 0) {
      // Wait for any to finish
      await Promise.race(running);
    }
  }

  return results;
}

export default { runScrapers };
