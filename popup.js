document.addEventListener("DOMContentLoaded", () => {
    const freeUserDiv = document.getElementById("free-user");
    const paidUserDiv = document.getElementById("paid-user");
    const upgradeBtn = document.getElementById("upgrade-btn");
    const result = document.getElementById("result");
  
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
      result.textContent = "掃描中⋯⋯";
        // 假設獲取的數據（測試用）
        // const bookLinks = ["/content/偉大的夙願/17", "/content/尋找父親的兒子/498"];
        // chrome.runtime.sendMessage({ type: "fetchContentData", links: bookLinks }, (results) => {
        //   showBooks(results);
        // });
        
        chrome.runtime.sendMessage({ type: "fetchAllLinks"} , 
          (response) => {
            if (response.success) {
              result.textContent = "掃描完成，結果已顯示在新標籤頁。";
              showBooks(response.results);
            } else {
              result.textContent = "掃描失敗。";
            }
    });
  });
});

function showBooks(result) {
    // 將結果存儲到 Local Storage
  localStorage.setItem("scrapedData", JSON.stringify(result));
  chrome.tabs.create({
    url: chrome.runtime.getURL(`result.html`),
  });
}