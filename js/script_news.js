/* ===== 状態 ===== */
const itemsPerPage = 8; // 固定値（UIなし）
let allArticles = [];
let filteredArticles = [];
let selectedCategories = new Set();
let currentPage = 1;

const $ = id => document.getElementById(id);

/* ===== URL ===== */
function params() {
  return new URLSearchParams(location.search);
}

function updateURL(p) {
  history.replaceState(null, "", "?" + p.toString());
}

/* ===== 日付表示（YYYY-MM-DD → YYYY.MM.DD） ===== */
function formatDate(dateStr) {
  return dateStr.replace(/-/g, ".");
}

/* ===== 日付組み立て ===== */
function buildDate(y, m, d, isEnd) {
  if (!y) return null;

  const mm = m || (isEnd ? "12" : "01");
  const dd = d || (
    isEnd
      ? new Date(Number(y), Number(mm), 0)
        .getDate()
        .toString()
        .padStart(2, "0")
      : "01"
  );

  return `${y}-${mm}-${dd}`;
}

/* ===== 日数調整 ===== */
function adjustDaySelect(prefix) {
  const y = $(prefix + "-year").value;
  const m = $(prefix + "-month").value;
  const daySel = $(prefix + "-day");
  if (!y || !m) return;

  const maxDay = new Date(Number(y), Number(m), 0).getDate();
  const current = daySel.value;

  daySel.querySelectorAll("option:not([value=''])").forEach(o => o.remove());

  for (let d = 1; d <= maxDay; d++) {
    const opt = document.createElement("option");
    opt.value = String(d).padStart(2, "0");
    opt.textContent = d;
    daySel.appendChild(opt);
  }

  if (current) {
    daySel.value =
      Number(current) <= maxDay
        ? current
        : String(maxDay).padStart(2, "0");
  }
}

/* ===== カテゴリUI（トグルボタン形式） ===== */
function renderCategoryFilter() {
  const box = $("filter-category");
  box.innerHTML = "";

  const categories = [...new Set(allArticles.map(a => a.category))];

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-btn";
    btn.dataset.category = cat;
    btn.textContent = CATEGORY_LABELS[cat] || cat;

    btn.addEventListener("click", () => {
      const p = params();
      const set = new Set(
        (p.get("cat") || "").split(",").filter(Boolean)
      );

      // トグル処理
      if (set.has(cat)) {
        set.delete(cat);
        btn.classList.remove("is-selected");
      } else {
        set.add(cat);
        btn.classList.add("is-selected");
      }

      set.size
        ? p.set("cat", [...set].join(","))
        : p.delete("cat");

      p.delete("page");

      updateURL(p);
      loadFromURL();
      applyFilter();
    });

    box.appendChild(btn);
  });
}

/* ===== 年選択肢 ===== */
function renderYearFilter() {
  const years = [...new Set(
    allArticles.map(a => new Date(a.date).getFullYear())
  )].sort((a, b) => b - a);

  ["filter-year", "until-year"].forEach(id => {
    const sel = $(id);
    sel.querySelectorAll("option:not([value=''])").forEach(o => o.remove());

    years.forEach(y => {
      const o = document.createElement("option");
      o.value = y;
      o.textContent = y;
      sel.appendChild(o);
    });
  });
}

/* ===== URL → UI ===== */
function loadFromURL() {
  const p = params();

  selectedCategories.clear();
  (p.get("cat") || "")
    .split(",")
    .filter(Boolean)
    .forEach(c => selectedCategories.add(c));

  document
    .querySelectorAll("#filter-category .category-btn")
    .forEach(btn => {
      if (selectedCategories.has(btn.dataset.category)) {
        btn.classList.add("is-selected");
      } else {
        btn.classList.remove("is-selected");
      }
    });

  ["filter", "until"].forEach(prefix => {
    $(prefix + "-year").value = "";
    $(prefix + "-month").value = "";
    $(prefix + "-day").value = "";
  });

  const from = p.get("from");
  const until = p.get("until");

  if (from) {
    const [y, m, d] = from.split("-");
    $("filter-year").value = y;
    $("filter-month").value = m;
    adjustDaySelect("filter");
    $("filter-day").value = d;
  }

  if (until) {
    const [y, m, d] = until.split("-");
    $("until-year").value = y;
    $("until-month").value = m;
    adjustDaySelect("until");
    $("until-day").value = d;
  }

  currentPage = Number(p.get("page")) || 1;
}

/* ===== 日付 → URL ===== */
function updateDateURL() {
  const p = params();

  let from = buildDate(
    $("filter-year").value,
    $("filter-month").value,
    $("filter-day").value,
    false
  );

  let until = buildDate(
    $("until-year").value,
    $("until-month").value,
    $("until-day").value,
    true
  );

  if (from && until && new Date(from) > new Date(until)) {
    [from, until] = [until, from];
  }

  from ? p.set("from", from) : p.delete("from");
  until ? p.set("until", until) : p.delete("until");
  p.delete("page");

  updateURL(p);
}

/* ===== フィルタ ===== */
function applyFilter() {
  const p = params();
  const from = p.get("from");
  const until = p.get("until");

  filteredArticles = allArticles.filter(a => {
    if (
      selectedCategories.size &&
      !selectedCategories.has(a.category)
    ) return false;

    const d = new Date(a.date);
    if (from && d < new Date(from)) return false;
    if (until && d > new Date(until)) return false;

    return true;
  });

  renderPage(currentPage);
}

/* ===== 描画（フェード対応） ===== */
function renderPage(page) {
  const list = $("news-list");
  const pag = $("pagination");
  const none = $("no-news");

  // フェード開始
  list.classList.add("is-switching");

  requestAnimationFrame(() => {
    list.innerHTML = "";
    pag.innerHTML = "";

    if (!filteredArticles.length) {
      none.style.display = "block";
      list.classList.remove("is-switching");
      return;
    }
    none.style.display = "none";

    const total = Math.ceil(filteredArticles.length / itemsPerPage);
    currentPage = Math.min(page, total);

    filteredArticles
      .slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
      .forEach(a => {
        const link = document.createElement("a");
        const href = a.link || `news-watch.html?id=${a.id}`;

        link.href = href;
        link.className = "news-item-link";

        link.innerHTML = `
          <div class="news-item">
            <div class="news-date">${formatDate(a.date)}</div>
            <div class="news-body">
              <div class="news-meta">
                [${CATEGORY_LABELS[a.category] || a.category}]
              </div>
              <span class="news-title">${a.title}</span>
              <div class="news-summary">${a.summary}</div>
            </div>
          </div>
        `;

        list.appendChild(link);
      });

    const p = params();
    for (let i = 1; i <= total; i++) {
      const b = document.createElement("button");
      b.textContent = i;
      b.disabled = i === currentPage;

      b.onclick = () => {
        p.set("page", i);
        updateURL(p);
        loadFromURL();
        renderPage(i);
      };

      pag.appendChild(b);
    }

    // フェード解除
    setTimeout(() => {
      list.classList.remove("is-switching");
    }, 200);
  });
}

/* ===== 全解除 ===== */
function resetFilter() {
  updateURL(new URLSearchParams());
  loadFromURL();
  applyFilter();
}

/* ===== 初期化 ===== */
fetch("data/news.json")
  .then(r => r.json())
  .then(data => {
    allArticles = data
      .filter(d => d.published)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    renderCategoryFilter();
    renderYearFilter();
    loadFromURL();
    applyFilter();

    $("filter-reset").addEventListener("click", resetFilter);

    [
      "filter-year", "filter-month", "filter-day",
      "until-year", "until-month", "until-day"
    ].forEach(id =>
      $(id).addEventListener("change", () => {
        adjustDaySelect(id.startsWith("filter") ? "filter" : "until");
        updateDateURL();
        loadFromURL();
        applyFilter();
      })
    );
  })
  .catch(console.error);
