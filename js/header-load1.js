const headerPlaceholder = document.getElementById("header-placeholder");

fetch("../header.html")
  .then(res => res.text())
  .then(html => {
    headerPlaceholder.innerHTML = html;
  })
  .catch(err => console.error("ヘッダーの読み込みに失敗しました", err));