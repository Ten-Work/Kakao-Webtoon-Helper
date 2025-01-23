let scrapedData = []; // 用於排序的數據副本
// 從 background.js 傳遞的數據中渲染結果
chrome.storage.local.get("scrapedData", (data) => {
    scrapedData = [...JSON.parse(data.scrapedData)]; // 用於排序的數據副本
    renderTable(scrapedData)
});

function renderTable(data) {
    const tableBody = document.querySelector('#result-table tbody');
    const summary = document.getElementById('summary');
    let coupon = 0
    tableBody.innerHTML = ""; // 清空表格
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td width="30px">${index + 1}</td>
        <td><a href="https://tw.kakaowebtoon.com${item.url}" target="_blank">${item.title}</a></td>
        <td>${item.ticketCount}張</td>
        `;
        tableBody.appendChild(row);
        coupon += item.ticketCount;
    });
    summary.textContent = `總計${data.length}件作品，${coupon}張閱讀券未用畢。`
}

// 按鈕事件綁定
document.getElementById("default-sort").addEventListener("click", () => {
    renderTable(scrapedData);
});

document.getElementById("sort-by-ticket").addEventListener("click", () => {
    let currentData = [...scrapedData]; // 恢復為預設順序
    currentData.sort((a, b) => b.ticketCount - a.ticketCount); // 按閱讀券數量降序排序
    renderTable(currentData);
});