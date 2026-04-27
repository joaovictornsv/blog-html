const path = require('path');
const { generateRss } = require('./rss');

const DEVLOG_DIR = path.join(__dirname, '..', 'devlog');
const OUTPUT_FILE = path.join(__dirname, '..', 'rss', 'devlog-feed.xml');

generateRss({
  sourceDir: DEVLOG_DIR,
  outputFile: OUTPUT_FILE,
  siteUrl: process.env.DEVLOG_SITE_URL || process.env.SITE_URL || 'https://devlog.joaovictornsv.dev',
  channelTitle: "JV's devlog",
  channelDescription: 'Software development notes and technical experiments',
  itemPathPrefix: '/devlog/'
});
