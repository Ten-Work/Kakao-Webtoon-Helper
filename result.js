// 從 background.js 傳遞的數據中渲染結果
const data = JSON.parse(localStorage.getItem("scrapedData"));

const tableBody = document.querySelector('#result-table tbody');
renderTable(data)

function renderTable(data) {
    tableBody.innerHTML = ""; // 清空表格
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td width="30px">${index + 1}</td>
        <td><a href="https://tw.kakaowebtoon.com${item.url}" target="_blank">${item.title}</a></td>
        <td>${item.ticketCount}張</td>
        `;
        tableBody.appendChild(row);
    });
}

// 按鈕事件綁定
document.getElementById("default-sort").addEventListener("click", () => {
    currentData = [...data]; // 恢復為預設順序
    renderTable(currentData);
});

document.getElementById("sort-by-ticket").addEventListener("click", () => {
    currentData.sort((a, b) => b.ticketCount - a.ticketCount); // 按閱讀券數量降序排序
    renderTable(currentData);
});