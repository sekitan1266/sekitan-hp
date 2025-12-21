fetch('../data/news.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('news-list');
    const published = data.filter(d => d.published)
                          .sort((a,b) => new Date(b.date) - new Date(a.date));
    published.slice(0,5).forEach(item => {
      const div = document.createElement('div');
      div.innerHTML = `<strong>${item.date}</strong> <a href="${item.link}">${item.title}</a><br>${item.summary}`;
      container.appendChild(div);
    });
  })
  .catch(err => console.error('fetch error:', err));
