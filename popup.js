document.addEventListener("DOMContentLoaded", () => {
    const freeUserDiv = document.getElementById("free-user");
    const paidUserDiv = document.getElementById("paid-user");
    const upgradeBtn = document.getElementById("upgrade-btn");
  
    // 檢查用戶是否付費
    chrome.runtime.sendMessage({ type: "checkPaidStatus" }, (response) => {
      if (response.isPaidUser) {
        freeUserDiv.style.display = "none";
        paidUserDiv.style.display = "block";
      } else {
        freeUserDiv.style.display = "block";
        paidUserDiv.style.display = "none";
      }
    });
  
    // 升級到付費版
    upgradeBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "setPaidStatus", isPaidUser: true }, () => {
        alert("升級成功！");
        location.reload();
      });
    });

    document.getElementById("popup-btn").addEventListener("click", () => {
        // 假設獲取的數據（測試用）
        const bookLinks = ["/content/偉大的夙願/17", "/content/尋找父親的兒子/498"];
        chrome.runtime.sendMessage({ type: "fetchContentData", links: bookLinks }, (results) => {
        const freeList = document.getElementById("book-list");
        const detailedList = document.getElementById("detailed-book-list");
    
        results.forEach((result) => {
            const freeItem = document.createElement("li");
            freeItem.textContent = result.url.split("/")[2]; // 作品名
            freeList.appendChild(freeItem);
    
            const paidItem = document.createElement("li");
            paidItem.innerHTML = `<a href="https://tw.kakaowebtoon.com${result.url}" target="_blank">${result.url.split("/")[2]}</a> - ${result.coupon}`;
            detailedList.appendChild(paidItem);
        });
      });
    });
});