// script_footer-load.js

const relPathVal = (typeof relPath !== 'undefined') ? relPath : "./";
const footerPlaceholder = document.getElementById("footer-placeholder");

if (footerPlaceholder) {
  fetch(relPathVal + "footer.html")
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.text();
    })
    .then(html => {
      footerPlaceholder.innerHTML = html;

      // リンクのパス補正
      const links = footerPlaceholder.querySelectorAll("a");
      links.forEach(link => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("http") && !href.startsWith("#") && !href.startsWith("mailto")) {
          link.setAttribute("href", relPathVal + href);
        }
      });
    })
    .catch(err => console.error("フッターの読み込みに失敗しました", err));
}