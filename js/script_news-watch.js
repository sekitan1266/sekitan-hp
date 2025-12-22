const $ = id => document.getElementById(id);

// URL から ?link=xxxx を取得
const params = new URLSearchParams(location.search);
const articleId = params.get("link");

// JSON を取得して該当記事を表示
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
      <p><strong>カテゴリ:</strong> ${article.category}</p>
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

// renderPage() 内の記事描画部分を修正
filteredArticles
  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  .forEach(a => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${a.date}</strong>
      [${CATEGORY_LABELS[a.category] || a.category}]
      <a href="news-watch.html?link=${a.id}">${a.title}</a><br>
      ${a.summary}
    `;
    list.appendChild(div);
  });
