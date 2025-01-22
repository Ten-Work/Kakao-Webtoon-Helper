
// 從 background.js 傳遞的數據中渲染結果
const data = JSON.parse(localStorage.getItem("scrapedData"));

const tableBody = document.querySelector('#result-table tbody');
data.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
    <td width="30px">${index + 1}</td>
    <td><a href="https://tw.kakaowebtoon.com${item.url}" target="_blank">${item.title}</a></td>
    <td>${item.ticketCount}張</td>
    `;
    tableBody.appendChild(row);
});