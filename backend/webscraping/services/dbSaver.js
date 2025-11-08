import connectDB from '../config/db.js';
import News from '../models/news.js';

export async function saveArticles(articles = []) {
  if (!Array.isArray(articles) || articles.length === 0) return { inserted: 0, updated: 0, skipped: 0 };

  // If MONGO_URI is not set, skip saving and return skipped count to avoid crashing the runner.
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI not set — skipping DB save. Set MONGO_URI in environment to enable persistence.');
    return { inserted: 0, updated: 0, skipped: articles.length };
  }

  await connectDB();

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const a of articles) {
    try {
      // normalize fields
      const doc = {
        title: (a.title || '').trim(),
        newspaper: (a.newspaper || '').trim(),
        date: a.date ? new Date(a.date) : new Date(),
        content: (a.content || '').trim(),
        url: (a.url || '').trim(),
        imageURL: (a.imageURL || '').trim()
      };

      if (!doc.title || !doc.url) {
        skipped++;
        continue;
      }

      // Upsert by url
      let res;
      try {
        res = await News.findOneAndUpdate(
          { url: doc.url },
          { $set: doc, $setOnInsert: { createdAt: new Date() } },
          { upsert: true, new: true }
        ).exec();
      } catch (err) {
        // If we get a duplicate-key error (e.g. imageURL unique constraint), try to recover by updating the document
        // that already has the same imageURL. This merges the incoming doc into the existing record keyed by imageURL.
        if (err && err.code === 11000) {
          console.warn(`Duplicate key on upsert by url for ${doc.url} — attempting recovery using imageURL`);
          try {
            res = await News.findOneAndUpdate(
              { imageURL: doc.imageURL },
              { $set: doc, $setOnInsert: { createdAt: new Date() } },
              { upsert: true, new: true }
            ).exec();
          } catch (err2) {
            console.error(`Recovery by imageURL failed for ${doc.imageURL}: ${err2.message}`);
            continue; // skip this article
          }
        } else {
          throw err;
        }
      }

      // Determine whether it was an insert or update by checking createdAt; heuristic: recent createdAt -> inserted
      const createdAt = res && (res.createdAt || (res._doc && res._doc.createdAt));
      if (createdAt && (new Date() - new Date(createdAt)) < 3000) inserted++;
      else updated++;
    } catch (err) {
      // Log and continue
      console.error(`Error saving article (${a.url || a.title}): ${err.message}`);
    }
  }

  return { inserted, updated, skipped };
}
