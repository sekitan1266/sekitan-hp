const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const articleId = params.get("id");

fetch("data/news.json")
  .then(res => res.json())
  .then(data => {
    const article = data.find(a => a.id === articleId);
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
  })
  .catch(err => {
    console.error(err);
    $("news-detail").textContent = "記事の読み込み中にエラーが発生しました。";
  });

// 戻るボタン
$("back-button").addEventListener("click", () => history.back());
