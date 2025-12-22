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

/* ===== URL操作ユーティリティ ===== */
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

      if (checkbox.checked) {
        cats.add(cat);
      } else {
        cats.delete(cat);
      }

      cats.size
        ? params.set("cat", [...cats].join(","))
        : params.delete("cat");

      params.delete("page"); // フィルタ変更時は1ページ目
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

/* ===== 年フィルタ生成 ===== */
function renderYearFilter() {
  const fromYear = document.getElementById("filter-year");
  const untilYear = document.getElementById("until-year");

  const years = [...new Set(
    allArticles.map(a => new Date(a.date).getFullYear())
  )].sort((a, b) => b - a);

  [fromYear, untilYear].forEach(select => {
    select.querySelectorAll("option:not([value=''])")
      .forEach(opt => opt.remove());

    years.forEach(year => {
      const opt = document.createElement("option");
      opt.value = year;
      opt.textContent = year;
      select.appendChild(opt);
    });
  });
}

/* ===== URL → 状態反映 ===== */
function loadStateFromURL() {
  const params = getParams();

  /* --- カテゴリ --- */
  selectedCategories.clear();
  const cats = (params.get("cat") ?? "").split(",").filter(Boolean);
  cats.forEach(c => selectedCategories.add(c));

  document
    .querySelectorAll("#filter-category input[type=checkbox]")
    .forEach(cb => cb.checked = selectedCategories.has(cb.value));

  /* --- 年月 --- */
  const from = params.get("from");
  const until = params.get("until");

  if (from) {
    const [y, m] = from.split("-");
    document.getElementById("filter-year").value = y;
    document.getElementById("filter-month").value = m ?? "";
  }

  if (until) {
    const [y, m] = until.split("-");
    document.getElementById("until-year").value = y;
    document.getElementById("until-month").value = m ?? "";
  }

  /* --- ページ --- */
  currentPage = Number(params.get("page")) || 1;
}

/* ===== 年月 → URL反映（正規化含む） ===== */
function updateDateToURL() {
  const params = getParams();

  const fy = document.getElementById("filter-year").value;
  const fm = document.getElementById("filter-month").value;
  const uy = document.getElementById("until-year").value;
  const um = document.getElementById("until-month").value;

  let from = fy ? `${fy}-${fm || "01"}` : null;
  let until = uy ? `${uy}-${um || "12"}` : null;

  /* --- 不正範囲の正規化 --- */
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
    /* カテゴリ */
    if (selectedCategories.size > 0 && !selectedCategories.has(item.category)) {
      return false;
    }

    /* 年月 */
    const d = new Date(item.date);
    if (from && d < new Date(from + "-01")) return false;
    if (until && d > new Date(until + "-31")) return false;

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

  if (filteredArticles.length === 0) {
    noNews.style.display = "block";
    return;
  }
  noNews.style.display = "none";

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  currentPage = Math.min(page, totalPages);

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
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

  const params = getParams();

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = (i === currentPage);
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
  .then(res => res.json())
  .then(data => {
    allArticles = data
      .filter(d => d.published)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    renderCategoryFilter();
    renderYearFilter();
    loadStateFromURL();
    applyFilter();

    document.getElementById("filter-reset")
      .addEventListener("click", resetFilter);

    ["filter-year", "filter-month", "until-year", "until-month"]
      .forEach(id => {
        document.getElementById(id).addEventListener("change", () => {
          updateDateToURL();
          loadStateFromURL();
          applyFilter();
        });
      });
  })
  .catch(err => console.error("fetch error:", err));
