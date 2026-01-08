fetch('data/news.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('news-list');
    container.innerHTML = '';

    const published = data.filter(d => d.published)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    published.slice(0, 5).forEach(item => {
      const link = document.createElement('a');
      link.className = 'top-news-item';
      link.href = item.link || 'news.html';

      link.innerHTML = `
        <div class="top-news-date">${item.date}</div>
        <div class="top-news-title">${item.title}</div>
      `;
      container.appendChild(link);
    });
  })
  .catch(err => console.error('fetch error:', err));
