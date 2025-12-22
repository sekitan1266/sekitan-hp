const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let allArticles = [];
let filteredArticles = [];
let selectedCategories = new Set();

/* ===== カテゴリ表示名 ===== */
const CATEGORY_LABELS = {
  info: "お知らせ",
  release: "公開情報",
  incident: "障害・重要情報",
  other: "その他"
};

function getCategoryLabel(cat) {
  return CATEGORY_LABELS[cat] ?? cat;
}

/* ===== カテゴリフィルタ生成 ===== */
function renderCategoryFilter() {
  const container = document.getElementById("filter-category");
  container.innerHTML = "";

  const categories = [...new Set(allArticles.map(a => a.category))];

  categories.forEach(cat => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.value = cat;

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedCategories.add(cat);
      } else {
        selectedCategories.delete(cat);
      }
      currentPage = 1;
      applyFilter();
    });

    label.appendChild(checkbox);
    label.append(" " + getCategoryLabel(cat));

    container.appendChild(label);
    container.appendChild(document.createElement("br"));
  });
}

/* ===== フィルタ処理 ===== */
function applyFilter() {
  filteredArticles = allArticles.filter(item => {
    if (selectedCategories.size === 0) return true;
    return selectedCategories.has(item.category);
  });

  renderPage(currentPage);
}

/* ===== ページ描画 ===== */
function renderPage(page) {
  const list = document.getElementById("news-list");
  const pagination = document.getElementById("pagination");
  const noNews = document.getElementById("no-news");

  list.innerHTML = "";
  pagination.innerHTML = "";

  if (filteredArticles.length === 0) {
    noNews.style.display = "block";
    return;
  } else {
    noNews.style.display = "none";
  }

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;

  filteredArticles.slice(start, end).forEach(item => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${item.date}</strong>
      [${getCategoryLabel(item.category)}]
      <a href="${item.link}">${item.title}</a><br>
      ${item.summary}
    `;
    list.appendChild(div);
  });

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = (i === page);
    btn.onclick = () => {
      currentPage = i;
      renderPage(i);
    };
    pagination.appendChild(btn);
  }
}

/* ===== 初期化 ===== */
fetch("data/news.json")
  .then(res => res.json())
  .then(data => {
    allArticles = data
      .filter(d => d.published)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    renderCategoryFilter();
    applyFilter();
  })
  .catch(err => console.error("fetch error:", err));
