// アーカイブ専用ヘッダー読み込みスクリプト
// moka-railway/js/script_header.js

(function () {
  // relPath変数が未定義の場合はカレントディレクトリと仮定
  // 各HTML側で const relPath = "..."; と定義されている前提
  const rootPath = (typeof relPath !== 'undefined') ? relPath : "./";

  // アーカイブヘッダーHTMLファイルへのパス
  // sekitan.net/moka-railway/header_archive.html を指すように組み立てる
  const headerUrl = rootPath + "moka-railway/header_archive.html";

  const headerPlaceholder = document.getElementById("header-placeholder");

  if (headerPlaceholder) {
    fetch(headerUrl)
      .then(res => {
        if (!res.ok) throw new Error("Header load failed: " + res.status);
        return res.text();
      })
      .then(html => {
        headerPlaceholder.innerHTML = html;

        // リンクパスの自動補正
        // header_archive.html 内のリンクは "moka-railway/" フォルダ直下からの相対パスで書かれている想定
        // これを各ページからのパスに変換する

        // 変換ロジック:
        // アーカイブ内のページは階層がバラバラ。
        // 単純に rootPath + "moka-railway/" + href属性値 で絶対パス(ルート相対)的に解決するのが一番安全。

        const links = headerPlaceholder.querySelectorAll("a");
        links.forEach(link => {
          const originalHref = link.getAttribute("href");

          if (originalHref &&
            !originalHref.startsWith("http") &&
            !originalHref.startsWith("#") &&
            !originalHref.startsWith("mailto") &&
            !originalHref.startsWith("/")) {

            // 例: originalHref = "index.html" (アーカイブトップ)
            // rootPath = "../../" (vehicles/moka14/index.htmlの場合)
            // 結果: "../../moka-railway/index.html"
            link.setAttribute("href", rootPath + "moka-railway/" + originalHref);
          }
        });

        // ハンバーガーメニューの動作スクリプト
        // ヘッダー読み込み後にイベントリスナーを設定
        setupHamburgerMenu();
      })
      .catch(err => console.error("Archive Header Error:", err));
  }

  function setupHamburgerMenu() {
    const btn = document.getElementById('hamburger-btn');
    const overlay = document.getElementById('mobile-nav-overlay');
    const closeBtn = document.getElementById('mobile-nav-close');

    if (btn && overlay && closeBtn) {
      btn.addEventListener('click', () => {
        overlay.classList.add('is-active');
      });

      closeBtn.addEventListener('click', () => {
        overlay.classList.remove('is-active');
      });

      // オーバーレイ背景クリックで閉じる
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('is-active');
        }
      });
    }
  }
})();
