const fs = require('fs');
const path = require('path');

const HTML_DIR = path.join(__dirname, 'html');
const OUTPUT_FILE = path.join(__dirname, 'feed.xml');

function extractPostData(htmlContent, filename) {
  const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1] : filename;

  const bodyMatch = htmlContent.match(/<div id="post-body">([\s\S]*?)<\/div>/);
  let dateObj = null;
  let content = '';
  if (bodyMatch) {
    const bodyContent = bodyMatch[1];
    const firstLineMatch = bodyContent.match(/^([^<\n]+)/);
    if (firstLineMatch) {
      const dateStr = firstLineMatch[1].trim();
      dateObj = new Date(dateStr);
      if (isNaN(dateObj)) {
        dateObj = null;
      }
    }
    
    content = bodyContent.replace(/<[^>]+>/g, '');
    content = content.replace(/&nbsp;/g, ' ');
    content = content.trim();
  }

  return { title, date: dateObj, content, filename };
}

function generateRssXml(posts) {
  const siteUrl = 'https://joaovictornsv.dev';
  
  let itemsXml = '';
  for (const post of posts) {
    const link = `${siteUrl}/html/${post.filename}`;
    const pubDate = post.date ? post.date.toUTCString() : new Date().toUTCString();
    const contentEscaped = post.content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    
    itemsXml += `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${contentEscaped.substring(0, 500)}...]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
    </item>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>JV's blog</title>
    <link>${siteUrl}</link>
    <description>Thoughts about technology and life</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${itemsXml}
  </channel>
</rss>`;
}

function generateRss() {
  const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'));
  
  const posts = files.map(filename => {
    const filePath = path.join(HTML_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return extractPostData(content, filename);
  });

  posts.sort((a, b) => {
    return (b.date || new Date()) - (a.date || new Date());
  });

  const rss = generateRssXml(posts);
  fs.writeFileSync(OUTPUT_FILE, rss);
  
  console.log(`Generated: feed.xml with ${posts.length} posts`);
}

generateRss();
