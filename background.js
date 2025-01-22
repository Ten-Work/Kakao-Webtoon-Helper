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
        const results = [];

        let offset = 0;
        let hasMoreContent = true;
        let limit = 48;

        while (hasMoreContent) {
            try {
                const response = await fetch(`https://gateway.tw.kakaowebtoon.com/history/v2/views/purchased-content?offset=${offset}&limit=${limit}`, {
                    credentials: "include",
                });
                const text = await response.text();
                // console.log(`${i}`, text);
    
                // 解析 JSON 字串為 JavaScript 物件
                const data = JSON.parse(text);
                if (Array.isArray(data.data)) {
                    for (let i = 0; i < data.data.length; i++) {
                        // console.log(`${i}`, data.data[i]);
                        // 提取 ticketCount 的值
                        const ticketCount = data.data[i].remainTicketCount;
                        const content = data.data[i].content;
                        // console.log(`${i}`, ticketCount);
                        if (parseInt(ticketCount, 10) > 0) {
                            results.push({ title: content.title, url: `/content/${content.seoId}/${content.id}`, ticketCount: ticketCount });
                        }
                    }
                    if (data.data.length < limit) {
                        hasMoreContent = false;
                    }
                } else {
                    console.error("data.data 不是一個陣列", data.data);
                    return { success: false, error: "data.data 不是一個陣列" };
                }
            } catch (error) {
                console.error("抓取作品列表失敗", error);
                return { success: false, error: error };
            }
            offset += limit;

            // 延遲 3 秒
            if (hasMoreContent) {
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
        }
        return { success: true, results: results };
    };

    fetchAllLinks().then((results) => {
        sendResponse(results);
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
            // console.log(`${i}`, text);

            // 解析 JSON 字串為 JavaScript 物件
            const data = JSON.parse(text);

            // 提取 ticketCount 的值
            const ticketCount = data.data.ticketCount;

            if (parseInt(ticketCount, 10) > 0) {
                results.push({ title: links[i].split("/")[2], url: links[i], ticketCount: ticketCount });
            }
        } catch (error) {
            console.error(`爬取失敗: ${link}`, error);
            return { success: false, error: error };
        }

        // 延遲 3 秒
        if (i < links.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        }
        return { success: true, results: results };
    };

    // 開始執行爬取任務
    fetchDataWithDelay().then((results) => {
        sendResponse(results);
    });

    return true; // 必須返回 true 以允許異步處理
    }
});