fetch('data/news.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('news-list');
    container.innerHTML = '';

    // カテゴリラベルのマッピング (script_news.jsと同期させるか、簡易的にここに持つ)
    const CATEGORY_LABELS = {
      "update": "更新情報",
      "info": "お知らせ",
      "bve": "BVE制作",
      "event": "イベント",
      "collab": "コラボ"
    };

    // 日付フォーマット関数 (YYYY-MM-DD -> YYYY.MM.DD)
    const formatDate = (dateStr) => dateStr.replace(/-/g, ".");

    const published = data.filter(d => d.published)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // トップページは最新3〜5件程度でOK
    published.slice(0, 5).forEach(item => {
      const link = document.createElement('a');
      link.className = 'news-item-link';
      link.href = item.link || `news-watch.html?id=${item.id}`;

      // news.html のスタイルに合わせつつ、日付とタイトルのみに絞り込む
      link.innerHTML = `
        <div class="news-item">
          <div class="news-date">${formatDate(item.date)}</div>
          <div class="news-body">
            <span class="news-title">${item.title}</span>
          </div>
        </div>
      `;
      container.appendChild(link);
    });
  })
  .catch(err => console.error('fetch error:', err));
