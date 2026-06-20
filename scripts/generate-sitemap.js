const path = require('path');
const { getCanonicalUrl } = require('./seo-utils');
const { collectHtmlFiles, generateSitemap, generateRobotsTxt } = require('./sitemap');

const ROOT = path.join(__dirname, '..');
const SITE_URL = process.env.SITE_URL || 'https://blog.joaovictornsv.dev';

const pages = [
  getCanonicalUrl(path.join(ROOT, 'index.html')),
  getCanonicalUrl(path.join(ROOT, 'my-book-recommendations.html')),
  ...collectHtmlFiles(path.join(ROOT, 'posts')).map((file) => getCanonicalUrl(file)),
];

generateSitemap({
  siteUrl: SITE_URL,
  pages,
  outputFile: path.join(ROOT, 'sitemap.xml'),
});

generateRobotsTxt({
  siteUrl: SITE_URL,
  outputFile: path.join(ROOT, 'robots.txt'),
});
