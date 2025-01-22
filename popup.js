document.addEventListener("DOMContentLoaded", () => {
  const lastBtn = document.getElementById("last-btn");
  const result = document.getElementById("result");    
    // 檢查是否已有資料
    if (chrome.storage.local.get("scrapedData") != null) {
      lastBtn.style.display = "block";
    } else {
      lastBtn.style.display = "none";
    }
    // 檢查是否掃描中
    chrome.runtime.sendMessage({ type: "checkScanStatus" }, (response) => {
      if (response.isScan) {
        result.textContent = "掃描中⋯⋯";
      }
    });
    
    document.getElementById("popup-btn").addEventListener("click", () => {
      result.textContent = "掃描中⋯⋯";
      
      chrome.runtime.sendMessage({ type: "fetchAllLinks"} , 
        (response) => {
          if (response.success) {
            result.textContent = "掃描完成，結果已顯示在新標籤頁。";
            showBooks();
          } else {
            result.textContent = "掃描失敗。";
          }
    });
  });

  lastBtn.addEventListener("click", () => {
    showBooks();
  });
});

function showBooks() {
  chrome.tabs.create({
    url: chrome.runtime.getURL(`result.html`),
  });
}