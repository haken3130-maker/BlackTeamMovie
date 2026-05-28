const path = require('path');

module.exports = {
  ophimBaseUrl: process.env.OPHIM_BASE_URL || 'https://ophim1.com',
  cacheDir: path.join(__dirname, '..', 'cache'),
  intervalMs: parseInt(process.env.CRAWL_INTERVAL || '3600000'),
  pageLimit: parseInt(process.env.CRAWL_PAGE_LIMIT || '20'),
  concurrency: 3,
};
