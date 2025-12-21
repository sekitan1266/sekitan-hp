const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let articles = [];

function renderPage(page) {
  const container = document.getElementById('news-list');
  container.innerHTML = '';
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  articles.slice(start, end).forEach(item => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${item.date}</strong> <a href="${item.link}">${item.title}</a><br>${item.summary}`;
    container.appendChild(div);
  });

  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.disabled = (i === page);
    btn.onclick = () => { currentPage = i; renderPage(i); };
    pagination.appendChild(btn);
  }
}

fetch('data/news.json')
  .then(res => res.json())
  .then(data => {
    articles = data.filter(d => d.published)
                   .sort((a,b) => new Date(b.date) - new Date(a.date));
    renderPage(currentPage);
  })
  .catch(err => console.error('fetch error:', err));
