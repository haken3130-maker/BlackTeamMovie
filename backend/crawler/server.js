const express = require('express');
const fs = require('fs');
const path = require('path');
const { crawlAll, crawlCategories } = require('./index');

const app = express();
const PORT = process.env.PORT || 3002;
const CACHE_DIR = path.join(__dirname, '..', 'cache');

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function readJSON(name) {
  const fp = path.join(CACHE_DIR, `${name}.json`);
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return null; }
}

function getMovieSlugs() {
  const index = readJSON('movies_index');
  if (index?.slugs?.length) return index.slugs;
  // fallback: scan cache directory
  return fs.readdirSync(CACHE_DIR)
    .filter(f => f.startsWith('movie_') && f.endsWith('.json'))
    .map(f => f.slice(6, -5));
}

app.get('/api/movies/list', (req, res) => {
  const { type, category, country, sort_field, page = '1', limit = '24' } = req.query;
  const slugs = getMovieSlugs();
  if (!slugs.length) return res.json({ status: true, items: [], pagination: null });
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const start = (pageNum - 1) * limitNum;

  let movies = slugs.map(s => readJSON(`movie_${s}`)).filter(Boolean);
  if (type) movies = movies.filter(m => m.type === type);
  if (category) movies = movies.filter(m => m.category?.some(c => c.slug === category));
  if (country) movies = movies.filter(m => m.country?.some(c => c.slug === country));

  if (sort_field === 'view') {
    movies.sort((a, b) => (b.view || 0) - (a.view || 0));
  } else if (sort_field === 'year') {
    movies.sort((a, b) => (b.year || 0) - (a.year || 0));
  } else {
    movies.sort((a, b) => new Date(b.modified?.time || b.modified || 0).getTime() - new Date(a.modified?.time || a.modified || 0).getTime());
  }

  const total = movies.length;
  const items = movies.slice(start, start + limitNum);

  res.json({
    status: true,
    items: items.map(({ episodes, ...rest }) => rest),
    pagination: {
      totalItems: total, currentPage: pageNum, pageSize: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

app.get('/api/movies/detail/:slug', (req, res) => {
  const movie = readJSON(`movie_${req.params.slug}`);
  if (!movie) return res.status(404).json({ status: false, message: 'Not found' });
  res.json({ ...movie, status: true });
});

app.get('/api/categories', (req, res) => {
  const data = readJSON('categories');
  res.json({ status: true, data: { items: data || [] } });
});

app.get('/api/countries', (req, res) => {
  const data = readJSON('countries');
  res.json({ status: true, data: { items: data || [] } });
});

app.post('/api/crawl', async (req, res) => {
  try {
    await crawlCategories();
    await crawlAll();
    res.json({ status: true, message: 'Crawl completed' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Cache server running on http://localhost:${PORT}`);
  crawlCategories().catch(() => {});
  crawlAll().catch(() => {});
});
