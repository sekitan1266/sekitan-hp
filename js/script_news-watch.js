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
      <h2>${article.title}</h2>
      <p><strong>日付:</strong> ${article.date}</p>
      <p><strong>カテゴリ:</strong> ${CATEGORY_LABELS[article.category] || article.category}</p>
      <p>${article.summary}</p>
      ${article.content ? `<div>${article.content}</div>` : ""}
    `;

    /* ===== 前後記事 ===== */
    const nav = document.createElement("div");
    nav.id = "article-nav";

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

    /* ===== SNS シェア ===== */
    const share = document.createElement("div");
    share.id = "share-buttons";

    const url = encodeURIComponent(location.href);
    const text = encodeURIComponent(article.title);

    share.innerHTML = `
      <a href="https://twitter.com/intent/tweet?text=${text}&url=${url}" target="_blank">
        Xでシェア
      </a>
    `;

    detail.appendChild(share);
  })
  .catch(err => {
    console.error(err);
    $("news-detail").textContent = "記事の読み込み中にエラーが発生しました。";
  });

$("back-button").addEventListener("click", () => history.back());
