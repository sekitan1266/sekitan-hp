const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let allArticles = [];
let filteredArticles = [];

// 状態
let selectedCategories = new Set();
let filterYear = "";
let filterMonth = "";
let untilYear = "";
let untilMonth = "";

/* =========================
   URLパラメータ処理
========================= */
function loadFromURL() {
  const params = new URLSearchParams(location.search);

  if (params.get("category")) {
    params.get("category").split(",").forEach(c => selectedCategories.add(c));
  }

  filterYear = params.get("year") || "";
  filterMonth = params.get("month") || "";
  untilYear = params.get("untilYear") || "";
  untilMonth = params.get("untilMonth") || "";
}

function updateURL() {
  const params = new URLSearchParams();

  if (selectedCategories.size > 0) {
    params.set("category", [...selectedCategories].join(","));
  }
  if (filterYear) params.set("year", filterYear);
  if (filterMonth) params.set("month", filterMonth);
  if (untilYear) params.set("untilYear", untilYear);
  if (untilMonth) params.set("untilMonth", untilMonth);

  history.replaceState(null, "", "?" + params.toString());
}

/* =========================
   フィルタ条件
========================= */
function matchCategory(item) {
  if (selectedCategories.size === 0) return true;
  return selectedCategories.has(item.category);
}

function matchDate(item) {
  const d = new Date(item.date);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;

  if (filterYear && y !== Number(filterYear)) return false;
  if (filterMonth && m !== Number(filterMonth)) return false;
  return true;
}

function matchUntil(item) {
  if (!untilYear) return true;

  const itemDate = new Date(item.date);
  const endDate = new Date(
    Number(untilYear),
    untilMonth ? Number(untilMonth) - 1 : 11,
    31
  );
  return itemDate <= endDate;
}

function applyFilter() {
  filteredArticles = allArticles.filter(item =>
    matchCategory(item) &&
    matchDate(item) &&
    matchUntil(item)
  );

  currentPage = 1;
  updateURL();
  renderPage(currentPage);
}

/* =========================
   描画
========================= */
function renderPage(page) {
  const container = document.getElementById("news-list");
  container.innerHTML = "";

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;

  filteredArticles.slice(start, end).forEach(item => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${item.date}</strong>
      [${item.category.toUpperCase()}]
      <a href="${item.link}">${item.title}</a><br>
      ${item.summary}
    `;
    container.appendChild(div);
  });

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = (i === currentPage);
    btn.onclick = () => {
      currentPage = i;
      renderPage(i);
    };
    pagination.appendChild(btn);
  }
}

/* =========================
   初期化
========================= */
fetch("data/news.json")
  .then(res => res.json())
  .then(data => {
    allArticles = data
      .filter(d => d.published)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    loadFromURL();
    setupUI();
    applyFilter();
  });

function setupUI() {
  // 年セレクト生成
  const years = [...new Set(allArticles.map(a => new Date(a.date).getFullYear()))];
  years.sort((a, b) => b - a);

  const yearSelects = [
    document.getElementById("filter-year"),
    document.getElementById("until-year")
  ];

  yearSelects.forEach(select => {
    years.forEach(y => {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      select.appendChild(opt);
    });
  });

  // URL反映 → UI反映
  document.querySelectorAll("input[type=checkbox]").forEach(cb => {
    if (selectedCategories.has(cb.value)) cb.checked = true;
    cb.onchange = () => {
      cb.checked ? selectedCategories.add(cb.value) : selectedCategories.delete(cb.value);
      applyFilter();
    };
  });

  document.getElementById("filter-year").value = filterYear;
  document.getElementById("filter-month").value = filterMonth;
  document.getElementById("until-year").value = untilYear;
  document.getElementById("until-month").value = untilMonth;

  document.getElementById("filter-year").onchange = e => {
    filterYear = e.target.value;
    applyFilter();
  };
  document.getElementById("filter-month").onchange = e => {
    filterMonth = e.target.value;
    applyFilter();
  };
  document.getElementById("until-year").onchange = e => {
    untilYear = e.target.value;
    applyFilter();
  };
  document.getElementById("until-month").onchange = e => {
    untilMonth = e.target.value;
    applyFilter();
  };
}
