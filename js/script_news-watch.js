const $ = id => document.getElementById(id);

const params = new URLSearchParams(location.search);
const articleId = params.get("id");

fetch("data/news.json")
  .then(res => res.json())
  .then(data => {
    const articles = data
      .filter(a => a.published)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const index = articles.findIndex(a => a.id === articleId);
    const article = articles[index];
    const detail = $("news-detail");

    if (!article) {
      detail.innerHTML = "<p>記事が見つかりませんでした。</p>";
      return;
    }

    detail.innerHTML = `
      <header class="news-header">
        <p class="news-meta">
          <time datetime="${article.date}">${article.date}</time>
          <span class="news-category">${CATEGORY_LABELS[article.category] || article.category}</span>
        </p>
        <h1 class="news-title">${article.title}</h1>
      </header>

      <section class="news-body">
        ${article.content || ""}
      </section>
    `;

    /* ===== 前後記事ナビ ===== */
    const nav = document.createElement("nav");
    nav.className = "news-nav";

    if (articles[index - 1]) {
      const prev = document.createElement("a");
      prev.href = `news-watch.html?id=${articles[index - 1].id}`;
      prev.textContent = "← 前の記事";
      nav.appendChild(prev);
    }

    if (articles[index + 1]) {
      const next = document.createElement("a");
      next.href = `news-watch.html?id=${articles[index + 1].id}`;
      next.textContent = "次の記事 →";
      nav.appendChild(next);
    }

    detail.appendChild(nav);

    /* ===== SNSシェア（X） ===== */
    const share = document.createElement("div");
    share.className = "share-buttons";

    const url = encodeURIComponent(location.href);
    const text = encodeURIComponent(article.title);

    share.innerHTML = `
      <a href="https://twitter.com/intent/tweet?text=${text}&url=${url}" target="_blank">
        <i class="fab fa-x-twitter"></i> Xでシェア
      </a>
    `;

    detail.appendChild(share);

  })
  .catch(err => {
    console.error(err);
    $("news-detail").textContent = "記事の読み込み中にエラーが発生しました。";
  });

$("back-button").addEventListener("click", () => history.back());
