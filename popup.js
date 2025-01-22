document.addEventListener("DOMContentLoaded", () => {
  const lastBtn = document.getElementById("last-btn");
    const result = document.getElementById("result");    
    // 檢查是否已有資料
    if (localStorage.getItem("scrapedData") != null) {
      lastBtn.style.display = "block";
    } else {
      lastBtn.style.display = "none";
    }
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

  lastBtn.addEventListener("click", () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL(`result.html`),
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