// script_header-load.js

const relPathValHead = (typeof relPath !== 'undefined') ? relPath : "./";
const headerPlaceholder = document.getElementById("header-placeholder");

if (headerPlaceholder) {
  fetch(relPathValHead + "header.html")
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.text();
    })
    .then(html => {
      headerPlaceholder.innerHTML = html;

      // リンクのパス補正
      const links = headerPlaceholder.querySelectorAll("a");
      links.forEach(link => {
        const href = link.getAttribute("href");
        // 外部リンク、アンカー、メール、絶対パス以外を補正
        if (href && !href.startsWith("http") && !href.startsWith("#") && !href.startsWith("mailto") && !href.startsWith("/")) {
          link.setAttribute("href", relPathValHead + href);
        }
      });
    })
    .catch(err => console.error("ヘッダーの読み込みに失敗しました", err));
}
