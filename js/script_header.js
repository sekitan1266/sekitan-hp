// script_header.js
// ヘッダーのハンバーガーメニューやモーダル制御を担当します。

(function () {
  /**
   * モバイルナビゲーションの初期化
   */
  function initMobileNav() {
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const overlay = document.getElementById("mobile-nav-overlay");
    const closeBtn = document.getElementById("mobile-nav-close");

    if (!hamburgerBtn || !overlay || !closeBtn) return;

    // イベントリスナーの重複登録を防止
    if (hamburgerBtn.dataset.initialized) return;
    hamburgerBtn.dataset.initialized = "true";

    // メニューを開く
    hamburgerBtn.addEventListener("click", () => {
      overlay.classList.add("is-active");
      document.body.style.overflow = "hidden"; // スクロール防止
    });

    // 閉じるボタン
    closeBtn.addEventListener("click", () => {
      closeMobileNav();
    });

    // オーバーレイクリックで閉じる
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeMobileNav();
      }
    });

    // リンククリックで閉じる
    overlay.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        closeMobileNav();
      });
    });

    function closeMobileNav() {
      overlay.classList.remove("is-active");
      document.body.style.overflow = "";
    }
  }

  // ヘッダーが非同期で読み込まれるため、DOMの変更を監視して初期化する
  const observer = new MutationObserver((mutations) => {
    if (document.getElementById("hamburger-btn")) {
      initMobileNav();
      // 一度初期化できれば監視を終了（必要に応じて）
      // ただしページ遷移を伴わない更新がある場合は続行
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 既に存在する場合（ロード済みの場合）のために一度実行
  document.addEventListener("DOMContentLoaded", initMobileNav);
})();
