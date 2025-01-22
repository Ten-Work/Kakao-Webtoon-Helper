chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ isScan: false }); // 預設沒掃描
  });

// 接收 UI 傳來的訊息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "popup") {
        chrome.tabs.create({
        url: chrome.extension.getURL("popup.html")
        })
    }

    if (message.type === "checkScanStatus") {
        chrome.storage.local.get("isScan", (data) => {
            sendResponse({ isScan: data.isScan });
        });
        return true; // 必須返回 true 以允許異步響應
    }    

    if (message.type === "fetchAllLinks") {
        chrome.storage.local.set({ isScan: true });
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
            // 將結果存儲到 Local Storage
            chrome.storage.local.set( { scrapedData: JSON.stringify(results) }, () => {
                return { success: true };
            });
        };

        fetchAllLinks().then((results) => {
            chrome.storage.local.set({ isScan: false });
            sendResponse(results);
        });
        return true; // 必須返回 true 以允許異步處理
    }
});