const fs = require('fs');
const path = require('path');

function extractPostData(htmlContent, filename) {
  const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1] : filename;

  const bodyMatch = htmlContent.match(/<div id="post-body">([\s\S]*?)<\/div>/);
  let dateObj = null;
  let content = '';
  if (bodyMatch) {
    const bodyContent = bodyMatch[1];

    const timeMatch = bodyContent.match(/<time[^>]*datetime="([^"]+)"[^>]*>/);
    if (timeMatch) {
      dateObj = new Date(timeMatch[1]);
      if (isNaN(dateObj)) dateObj = null;
    } else {
      const firstLineMatch = bodyContent.match(/^([^<\n]+)/);
      if (firstLineMatch) {
        const dateStr = firstLineMatch[1].trim();
        dateObj = new Date(dateStr);
        if (isNaN(dateObj)) dateObj = null;
      }
    }

    content = bodyContent.replace(/<[^>]+>/g, '');
    content = content.replace(/&nbsp;/g, ' ');
    content = content.trim();
  }

  return { title, date: dateObj, content, filename };
}

function generateRssXml(posts, config) {
  const {
    siteUrl,
    channelTitle,
    channelDescription,
    itemPathPrefix,
    language = 'en-us'
  } = config;

  let itemsXml = '';
  for (const post of posts) {
    const link = `${siteUrl}${itemPathPrefix}${post.filename}`;
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
    <title>${channelTitle}</title>
    <link>${siteUrl}</link>
    <description>${channelDescription}</description>
    <language>${language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${itemsXml}
  </channel>
</rss>`;
}

function generateRss(config) {
  const { sourceDir, outputFile, excludeFiles = ['index.html'] } = config;
  const files = fs.existsSync(sourceDir)
    ? fs.readdirSync(sourceDir).filter(f => f.endsWith('.html') && !excludeFiles.includes(f))
    : [];

  const posts = files.map(filename => {
    const filePath = path.join(sourceDir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return extractPostData(content, filename);
  });

  posts.sort((a, b) => {
    return (b.date || new Date()) - (a.date || new Date());
  });

  const rss = generateRssXml(posts, config);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, rss);

  console.log(`Generated: ${path.basename(outputFile)} with ${posts.length} posts`);
}

module.exports = {
  generateRss
};
