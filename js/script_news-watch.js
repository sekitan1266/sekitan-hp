const $ = id => document.getElementById(id);

fetch("data/news.json")
.then(res => res.json())
.then(data => {
    const list = $("news-list");
    list.innerHTML = "";

    if (!data.length) {
    list.textContent = "現在監視対象のニュースはありません。";
    return;
    }

    data.forEach(n => {
    const div = document.createElement("div");
    div.innerHTML = `
        <strong>${n.date}</strong><br>
        ${n.title}<br>
        ${n.summary || ""}
    `;
    list.appendChild(div);
    });
})
.catch(err => {
    console.error(err);
    $("news-list").textContent = "ニュースの読み込み中にエラーが発生しました。";
});