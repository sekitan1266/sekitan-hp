// HTML側で定義した relPath を使って fetch 先を決める
const footerPath = (typeof relPath !== 'undefined') ? relPath + "footer.html" : "footer.html";

fetch(footerPath)
  .then(res => res.text())
  .then(html => {
    // 1. フッターの中身を挿入
    document.getElementById("footer-placeholder").innerHTML = html;

    // 2. 【重要】挿入した後のリンク（aタグ）のパスも relPath で補正する
    const footer = document.getElementById("footer-placeholder");
    const links = footer.querySelectorAll("a");
    
    links.forEach(link => {
      const href = link.getAttribute("href");
      // 外部リンク（http...）でなければ、パスを補正
      if (href && !href.startsWith("http") && !href.startsWith("#")) {
        link.setAttribute("href", relPath + href);
      }
    });
  })
  .catch(err => console.error("フッターの読み込みに失敗しました", err));