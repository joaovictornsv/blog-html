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

// Load and display the post list on the home page
async function loadPostList() {
  const list = document.getElementById('post-list');
  if (!list) return;

  list.textContent = 'loading...';

  try {
    const response = await fetch('posts/index.json');
    const posts = await response.json();
    
    list.textContent = '';
    for (const post of posts) {
      const slug = post.path.replace('.txt', '');
      const li = document.createElement('li');
      li.innerHTML = `<a href="post.html?p=${slug}">${post.title}</a>`;
      list.appendChild(li);
    }
  } catch (e) {
    console.error('Failed to load post index:', e);
    list.textContent = '';
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

  document.getElementById('post-body').textContent = 'loading...';

  try {
    const response = await fetch(`posts/${slug}.txt`);
    if (!response.ok) throw new Error('Not found');
    
    const text = await response.text();
    const post = parsePost(text, `${slug}.txt`);
    
    document.title = post.title;
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-body').textContent = post.content;
  } catch (e) {
    document.getElementById('post-title').textContent = 'Post not found';
  }
}
