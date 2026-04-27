const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'txt');
const OUTPUT_DIR = path.join(__dirname, 'html');

// Parse a .txt file into post data
function parsePost(text, filename) {
  const lines = text.split('\n');
  const title = lines[0] || 'Untitled';
  const content = lines.slice(1).join('\n').trim();
  
  return {
    title,
    content,
    slug: filename.replace('.txt', '')
  };
}

// Generate HTML for a post
function generatePostHtml(post) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title}</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <main>
    <a href="../index.html" class="back">&lt; back</a>
    
    <article id="post-content">
      <h1 id="post-title">${post.title}</h1>
      <div id="post-body">${post.content}</div>
    </article>
  </main>
</body>
</html>
`;
}

// Main build function for a single file
function buildSingle(filename) {
  if (!filename) {
    console.error('Usage: node build-single.js <filename.txt>');
    console.error('Example: node build-single.js my-new-post.txt');
    process.exit(1);
  }

  // Ensure filename ends with .txt
  if (!filename.endsWith('.txt')) {
    filename = filename + '.txt';
  }

  const filePath = path.join(POSTS_DIR, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read and parse the post
  const text = fs.readFileSync(filePath, 'utf-8');
  const post = parsePost(text, filename);

  // Generate and write HTML
  const html = generatePostHtml(post);
  const outputPath = path.join(OUTPUT_DIR, `${post.slug}.html`);
  fs.writeFileSync(outputPath, html);

  console.log(`✓ Generated: html/${post.slug}.html`);
  console.log(`  Title: ${post.title}`);
  console.log(`\nAdd this to index.html:`);
  console.log(`  <li><a href="html/${post.slug}.html">${post.title}</a></li>`);
}

const filename = process.argv[2];
buildSingle(filename);
