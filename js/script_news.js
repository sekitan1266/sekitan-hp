const ITEMS_PER_PAGE = 5;

let currentPage = 1;
let allArticles = [];
let filteredArticles = [];
let selectedCategories = new Set();

/* ===== DOM取得 ===== */
const filterYear   = document.getElementById("filter-year");
const filterMonth  = document.getElementById("filter-month");
const filterDay    = document.getElementById("filter-day");
const untilYear    = document.getElementById("until-year");
const untilMonth   = document.getElementById("until-month");
const untilDay     = document.getElementById("until-day");

/* ===== カテゴリ表示名 ===== */
const CATEGORY_LABELS = {
  info: "お知らせ",
  release: "公開情報",
  incident: "障害・重要情報",
  other: "その他"
};

const getCategoryLabel = c => CATEGORY_LABELS[c] ?? c;

/* ===== URL操作 ===== */
const getParams = () => new URLSearchParams(location.search);
const updateURL = p => history.replaceState(null, "", "?" + p.toString());

/* ===== カテゴリフィルタ生成 ===== */
function renderCategoryFilter() {
  const box = document.getElementById("filter-category");
  box.innerHTML = "";

  [...new Set(allArticles.map(a => a.category))].forEach(cat => {
    const label = document.createElement("label");
    const cb = document.createElement("input");

    cb.type = "checkbox";
    cb.value = cat;

    cb.addEventListener("change", () => {
      const params = getParams();
      const set = new Set((params.get("cat") ?? "").split(",").filter(Boolean));

      cb.checked ? set.add(cat) : set.delete(cat);
      set.size ? params.set("cat", [...set].join(",")) : params.delete("cat");
      params.delete("page");

      updateURL(params);
      loadStateFromURL();
      applyFilter();
    });

    label.append(cb, " ", getCategoryLabel(cat));
    box.append(label, document.createElement("br"));
  });
}

/* ===== 年選択肢生成 ===== */
function renderYearFilter() {
  const years = [...new Set(
    allArticles.map(a => new Date(a.date).getFullYear())
  )].sort((a,b)=>b-a);

  [filterYear, untilYear].forEach(sel => {
    sel.querySelectorAll("option:not([value=''])").forEach(o => o.remove());
    years.forEach(y => {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      sel.appendChild(opt);
    });
  });
}

/* ===== URL → UI ===== */
function loadStateFromURL() {
  const p = getParams();

  selectedCategories.clear();
  (p.get("cat") ?? "").split(",").filter(Boolean)
    .forEach(c => selectedCategories.add(c));

  document.querySelectorAll("#filter-category input")
    .forEach(cb => cb.checked = selectedCategories.has(cb.value));

  const setDate = (val, y, m, d) => {
    if (!val) return;
    const [yy, mm, dd] = val.split("-");
    y.value = yy;
    m.value = mm;
    d.value = dd;
  };

  setDate(p.get("from"), filterYear, filterMonth, filterDay);
  setDate(p.get("until"), untilYear, untilMonth, untilDay);

  currentPage = Number(p.get("page")) || 1;
}

/* ===== UI → URL（日付正規化） ===== */
function updateDateToURL() {
  const p = getParams();

  const build = (y,m,d,end=false) => {
    if (!y) return null;
    const mm = m || (end ? "12" : "01");
    const dd = d || (end
      ? new Date(y, mm, 0).getDate().toString().padStart(2,"0")
      : "01");
    return `${y}-${mm}-${dd}`;
  };

  let from = build(filterYear.value, filterMonth.value, filterDay.value);
  let until = build(untilYear.value, untilMonth.value, untilDay.value, true);

  if (from && until && new Date(from) > new Date(until)) {
    [from, until] = [until, from];
  }

  from ? p.set("from", from) : p.delete("from");
  until ? p.set("until", until) : p.delete("until");

  p.delete("page");
  updateURL(p);
}

/* ===== フィルタ解除 ===== */
function resetFilter() {
  updateURL(new URLSearchParams());
  selectedCategories.clear();

  [filterYear,filterMonth,filterDay,untilYear,untilMonth,untilDay]
    .forEach(s => s.value = "");

  loadStateFromURL();
  applyFilter();
}

/* ===== フィルタ処理 ===== */
function applyFilter() {
  const p = getParams();
  const from = p.get("from");
  const until = p.get("until");

  filteredArticles = allArticles.filter(a => {
    if (selectedCategories.size && !selectedCategories.has(a.category)) return false;
    const d = new Date(a.date);
    if (from && d < new Date(from)) return false;
    if (until && d > new Date(until)) return false;
    return true;
  });

  renderPage(currentPage);
}
