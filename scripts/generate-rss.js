const path = require('path');
const { generateRss } = require('./rss');

const HTML_DIR = path.join(__dirname, '..', 'posts');
const OUTPUT_FILE = path.join(__dirname, '..', 'rss', 'feed.xml');

generateRss({
  sourceDir: HTML_DIR,
  outputFile: OUTPUT_FILE,
  siteUrl: process.env.SITE_URL || 'https://blog.joaovictornsv.dev',
  channelTitle: "JV's blog",
  channelDescription: "Here you'll find my thoughts about life.",
  itemPathPrefix: '/posts/'
});
