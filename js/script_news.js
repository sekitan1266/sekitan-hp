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

/* ===== URL 操作 ===== */
function getParams() {
  return new URLSearchParams(location.search);
}

function updateURL(params) {
  history.replaceState(null, "", "?" + params.toString());
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
      const params = getParams();
      const cats = new Set((params.get("cat") ?? "").split(",").filter(Boolean));

      checkbox.checked ? cats.add(cat) : cats.delete(cat);

      cats.size ? params.set("cat", [...cats].join(",")) : params.delete("cat");
      params.delete("page");

      updateURL(params);
      loadStateFromURL();
      applyFilter();
    });

    label.appendChild(checkbox);
    label.append(" " + getCategoryLabel(cat));
    container.appendChild(label);
    container.appendChild(document.createElement("br"));
  });
}

/* ===== 年選択肢生成 ===== */
function renderYearFilter() {
  const years = [...new Set(
    allArticles.map(a => new Date(a.date).getFullYear())
  )].sort((a, b) => b - a);

  ["filter-year", "until-year"].forEach(id => {
    const select = document.getElementById(id);
    select.querySelectorAll("option:not([value=''])")
      .forEach(opt => opt.remove());

    years.forEach(y => {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      select.appendChild(opt);
    });
  });
}

/* ===== URL → 状態反映 ===== */
function loadStateFromURL() {
  const params = getParams();

  /* --- カテゴリ --- */
  selectedCategories.clear();
  (params.get("cat") ?? "")
    .split(",")
    .filter(Boolean)
    .forEach(c => selectedCategories.add(c));

  document
    .querySelectorAll("#filter-category input[type=checkbox]")
    .forEach(cb => cb.checked = selectedCategories.has(cb.value));

  /* --- 日時 --- */
  const from = params.get("from");
  const until = params.get("until");

  if (from) {
    const [y, m, d] = from.split("-");
    document.getElementById("filter-year").value = y;
    document.getElementById("filter-month").value = m;
    document.getElementById("filter-day").value = d;
  }

  if (until) {
    const [y, m, d] = until.split("-");
    document.getElementById("until-year").value = y;
    document.getElementById("until-month").value = m;
    document.getElementById("until-day").value = d;
  }

  currentPage = Number(params.get("page")) || 1;
}

/* ===== 日時 → URL（正規化込み） ===== */
function updateDateToURL() {
  const params = getParams();

  function buildDate(y, m, d, isEnd) {
    if (!y) return null;
    const mm = m || (isEnd ? "12" : "01");
    const dd = d || (isEnd
      ? new Date(y, mm, 0).getDate().toString().padStart(2, "0")
      : "01");
    return `${y}-${mm}-${dd}`;
  }

  let from = buildDate(
    filterYear.value,
    filterMonth.value,
    filterDay.value,
    false
  );

  let until = buildDate(
    untilYear.value,
    untilMonth.value,
    untilDay.value,
    true
  );

  if (from && until && new Date(from) > new Date(until)) {
    [from, until] = [until, from];
  }

  from ? params.set("from", from) : params.delete("from");
  until ? params.set("until", until) : params.delete("until");

  params.delete("page");
  updateURL(params);
}

/* ===== フィルタ全解除 ===== */
function resetFilter() {
  updateURL(new URLSearchParams());
  loadStateFromURL();
  applyFilter();
}

/* ===== フィルタ処理 ===== */
function applyFilter() {
  const params = getParams();
  const from = params.get("from");
  const until = params.get("until");

  filteredArticles = allArticles.filter(item => {
    if (selectedCategories.size &&
        !selectedCategories.has(item.category)) return false;

    const d = new Date(item.date);
    if (from && d < new Date(from)) return false;
    if (until && d > new Date(until)) return false;

    return true;
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

  if (!filteredArticles.length) {
    noNews.style.display = "block";
    return;
  }
  noNews.style.display = "none";

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  currentPage = Math.min(page, totalPages);

  filteredArticles
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    .forEach(item => {
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${item.date}</strong>
        [${getCategoryLabel(item.category)}]
        <a href="${item.link}">${item.title}</a><br>
        ${item.summary}
      `;
      list.appendChild(div);
    });

  const params = getParams();
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.onclick = () => {
      params.set("page", i);
      updateURL(params);
      loadStateFromURL();
      renderPage(i);
    };
    pagination.appendChild(btn);
  }
}

/* ===== 初期化 ===== */
fetch("data/news.json")
  .then(r => r.json())
  .then(data => {
    allArticles = data.filter(d => d.published)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    renderCategoryFilter();
    renderYearFilter();
    loadStateFromURL();
    applyFilter();

    document.getElementById("filter-reset")
      .addEventListener("click", resetFilter);

    [
      filterYear, filterMonth, filterDay,
      untilYear, untilMonth, untilDay
    ].forEach(el =>
      el.addEventListener("change", () => {
        updateDateToURL();
        loadStateFromURL();
        applyFilter();
      })
    );
  })
  .catch(console.error);
