// 初始化用戶付費狀態
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ isPaidUser: false }); // 預設免費
  });
  
// 接收 UI 傳來的訊息，檢查或設定付費狀態
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
if (message.type === "checkPaidStatus") {
    chrome.storage.local.get("isPaidUser", (data) => {
    sendResponse({ isPaidUser: data.isPaidUser });
    });
    return true; // 必須返回 true 以允許異步響應
}

if (message.type === "setPaidStatus") {
    chrome.storage.local.set({ isPaidUser: message.isPaidUser });
    sendResponse({ success: true });
}

if (message.type === "popup") {
    chrome.tabs.create({
    url: chrome.extension.getURL("popup.html")
  })
}

if (message.type === "fetchAllLinks") {
    const fetchAllLinks = async () => {
    const collectedLinks = new Set(); // 用來收集已發現的作品連結

    try {
        let hasMoreContent = true;

        while (hasMoreContent) {
        // 模擬滾動到底部
        window.scrollTo(0, document.body.scrollHeight);

        // 等待一段時間，讓新內容加載
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // 提取新內容的 <a> 元素
        const anchors = Array.from(
            document.querySelectorAll('a[href^="/content/"]')
        );

        // 確保新的 <a> 元素被加入
        anchors.forEach((a) => collectedLinks.add(a.getAttribute("href")));

        // 判斷是否還有更多內容
        const loadMoreIndicator = document.querySelector(".loading-spinner");
        hasMoreContent = Boolean(loadMoreIndicator);
        }

        // 返回收集的所有連結
        return Array.from(collectedLinks);
    } catch (error) {
        console.error("抓取作品列表失敗", error);
        return [];
    }
    };

    fetchAllLinks().then((links) => {
    sendResponse({ links });
    });
    return true; // 必須返回 true 以允許異步處理
}

if (message.type === "fetchContentData") {
    const { links } = message;

    // 串行處理每個漫畫頁面的請求
    const fetchDataWithDelay = async () => {
        const results = [];
        for (let i = 0; i < links.length; i++) {
        const link = links[i].split("/")[3];

        // 爬取漫畫頁面內容
        try {
            const response = await fetch(`https://gateway.tw.kakaowebtoon.com/ticket/v2/views/content-home/available-tickets?contentId=${link}`, {
                credentials: "include",
            });
            const text = await response.text();
            console.log(`${i}`, text);

            // 解析 JSON 字串為 JavaScript 物件
            const data = JSON.parse(text);

            // 提取 ticketCount 的值
            const ticketCount = data.data.ticketCount;

            if (parseInt(ticketCount, 10) > 0) {
                results.push({ url: links[i], coupon: `${ticketCount}張` });
            }
        } catch (error) {
            console.error(`爬取失敗: ${link}`, error);
        }

        // 延遲 3 秒
        if (i < links.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        }
        return results;
    };

    // 開始執行爬取任務
    fetchDataWithDelay().then((results) => {
        sendResponse(results);
    });

    return true; // 必須返回 true 以允許異步處理
    }
});