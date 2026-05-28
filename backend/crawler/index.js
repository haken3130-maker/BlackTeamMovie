const config = require('./config');
const fs = require('fs');
const path = require('path');

if (!fs.existsSync(config.cacheDir)) fs.mkdirSync(config.cacheDir, { recursive: true });

const CDN = 'https://img.ophim.live/uploads/movies/';

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

function normUrl(u) {
  return u?.startsWith('http') ? u : `${CDN}${u}`;
}

function normCat(c) {
  return typeof c === 'object' ? { id: c.id || c._id, name: c.name, slug: c.slug } : { id: '', name: String(c), slug: '' };
}

function readCache(name) {
  const fp = path.join(config.cacheDir, `${name}.json`);
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return null; }
}

function writeCache(name, data) {
  fs.writeFileSync(path.join(config.cacheDir, `${name}.json`), JSON.stringify(data, null, 2), 'utf-8');
}

async function crawlList(type, page) {
  const url = `${config.ophimBaseUrl}/v1/api/danh-sach?type=${type}&page=${page}&limit=24`;
  const res = await fetchJSON(url);
  if (!res.data?.items?.length) return null;
  return {
    items: res.data.items.map(m => ({
      ...m,
      poster_url: normUrl(m.poster_url),
      thumb_url: normUrl(m.thumb_url),
      category: Array.isArray(m.category) ? m.category.map(normCat) : [],
      country: Array.isArray(m.country) ? m.country.map(normCat) : [],
      view: typeof m.view === 'number' ? m.view : parseInt(m.view) || 0,
    })),
    pagination: res.data.pagination,
  };
}

async function crawlDetail(slug) {
  const url = `${config.ophimBaseUrl}/phim/${slug}`;
  const res = await fetchJSON(url);
  const movie = res.movie;
  return {
    ...movie,
    poster_url: normUrl(movie.poster_url),
    thumb_url: normUrl(movie.thumb_url),
    category: Array.isArray(movie.category) ? movie.category.map(normCat) : [],
    country: Array.isArray(movie.country) ? movie.country.map(normCat) : [],
    view: typeof movie.view === 'number' ? movie.view : parseInt(movie.view) || 0,
    episodes: (res.episodes || []).map(s => ({
      server_name: s.server_name,
      server_data: (s.server_data || []).map(ep => ({
        name: ep.name, slug: ep.slug, filename: ep.filename,
        link_embed: ep.link_embed || '', link_m3u8: ep.link_m3u8 || '',
      })),
    })),
  };
}

async function crawlAll() {
  log('Starting crawl...');
  const allSlugs = new Set();
  const seenSlugs = new Set();

  // Collect slugs from list pages (series and single)
  for (const type of ['series', 'single']) {
    for (let page = 1; page <= config.pageLimit; page++) {
      try {
        const data = await crawlList(type, page);
        if (!data) break;
        data.items.forEach(m => { if (m.slug) allSlugs.add(m.slug); });
        log(`List ${type} page ${page}/${data.pagination?.totalPages || '?'}: ${data.items.length} movies`);
      } catch (err) {
        log(`Error on list ${type} page ${page}: ${err.message}`);
        break;
      }
    }
  }

  log(`Total unique slugs: ${allSlugs.size}`);

  // Read existing cache to skip unchanged
  const existing = readCache('movies_index') || { slugs: [] };
  const oldSlugs = new Set(existing.slugs);
  const newSlugs = [...allSlugs].filter(s => !oldSlugs.has(s));

  if (newSlugs.length === 0) {
    log('No new movies, skipping detail crawl');
    writeCache('last_crawl', { time: Date.now(), total: allSlugs.size });
    return;
  }

  log(`New movies to crawl: ${newSlugs.length}`);

  // Crawl details concurrently
  const queue = [...newSlugs];
  let done = 0;
  async function worker() {
    while (queue.length) {
      const slug = queue.shift();
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);
      try {
        const detail = await crawlDetail(slug);
        writeCache(`movie_${slug}`, detail);
        done++;
        if (done % 10 === 0) log(`Detail progress: ${done}/${newSlugs.length}`);
      } catch (err) {
        log(`Error detail ${slug}: ${err.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: config.concurrency }, () => worker()));

  writeCache('movies_index', { slugs: [...allSlugs], updated: Date.now() });
  writeCache('last_crawl', { time: Date.now(), total: allSlugs.size });
  log(`Crawl done: ${done} new movies cached`);
}

async function crawlCategories() {
  try {
    const [cats, countries] = await Promise.all([
      fetchJSON(`${config.ophimBaseUrl}/v1/api/the-loai`),
      fetchJSON(`${config.ophimBaseUrl}/v1/api/quoc-gia`),
    ]);
    writeCache('categories', (cats.data?.items || []).map(c => ({ _id: c._id, name: c.name, slug: c.slug })));
    writeCache('countries', (countries.data?.items || []).map(c => ({ _id: c._id, name: c.name, slug: c.slug })));
    log('Categories & countries cached');
  } catch (err) {
    log(`Error caching categories: ${err.message}`);
  }
}

if (require.main === module) {
  (async () => {
    log('Crawler started');
    await crawlCategories();
    await crawlAll();

    // Schedule periodic crawl
    setInterval(async () => {
      log('Scheduled crawl running...');
      await crawlAll();
    }, config.intervalMs);

    log(`Next crawl in ${config.intervalMs / 60000} minutes`);
  })();
}

module.exports = { crawlAll, crawlCategories, crawlList, crawlDetail };
