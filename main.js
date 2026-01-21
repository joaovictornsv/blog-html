// Format date from "2026-01-15" to "15 Jan 2026"
function formatDate(dateStr) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [year, month, day] = dateStr.split('-');
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

// Parse a .txt file into post data
function parsePost(text, filename) {
  const lines = text.split('\n');
  const title = lines[0] || 'Untitled';
  const date = lines[1] || '';
  const content = lines.slice(3).join('\n').trim();
  
  return {
    title,
    date,
    content,
    slug: filename.replace('.txt', '')
  };
}

// Load and display the post list on the home page
async function loadPostList() {
  const list = document.getElementById('post-list');
  if (!list) return;

  try {
    const response = await fetch('posts/index.json');
    const posts = await response.json();
    
    for (const post of posts) {
      const slug = post.path.replace('.txt', '');
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="post.html?p=${slug}" class="post-link">${post.title}</a>
        <span class="post-date">${formatDate(post.date)}</span>
      `;
      list.appendChild(li);
    }
  } catch (e) {
    console.error('Failed to load post index:', e);
  }
}

// Load and display a single post
async function loadPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('p');
  
  if (!slug) {
    document.getElementById('post-title').textContent = 'Post not found';
    return;
  }

  try {
    const response = await fetch(`posts/${slug}.txt`);
    if (!response.ok) throw new Error('Not found');
    
    const text = await response.text();
    const post = parsePost(text, `${slug}.txt`);
    
    document.title = post.title;
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-date').textContent = formatDate(post.date);
    document.getElementById('post-body').textContent = post.content;
  } catch (e) {
    document.getElementById('post-title').textContent = 'Post not found';
  }
}
