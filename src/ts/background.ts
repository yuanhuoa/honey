import { BUY_URL, UNIFIED_PRICE_DIV } from "./constans";
let coupon: Object = {};
let callbackData: Object = {};

// chrome.alarms.create("clear-coupon-var", { delayInMinutes: 360.0 });

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === "clear-coupon-var") {
        Object.keys(coupon).forEach(k => delete coupon[k]);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.title === "get-coupon") {
        // get coupon from server
        sendResponse(callbackData);
    }
    return true;
});

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info['status'] === "complete") {
        chrome.tabs.executeScript({ code: `document.URL` }, url => {
            if (url[0].indexOf(BUY_URL) !== -1) {
                chrome.tabs.executeScript(tabId, { file: "popup.js" }, _ => {
                    chrome.tabs.sendMessage(tabId, { title: "buy-product" });
                });
            } else {
                let asin: string = getAsinFromUrl(url);
                if (asin) {
                    checkFiedPriceDiv(isFindDiv => {
                        isFindDiv && chrome.tabs.executeScript(tabId, { file: "popup.js" }, _ => {
                            chrome.tabs.sendMessage(tabId, { title: "select-product", asin: asin });
                        });
                    });
                }
            }
        });
    }
})

function getAsinFromUrl(url: Array<string>): string {
    if (url) {
        let reg: RegExp = /\/([A-Za-z0-9]{10})(?:\/|\?|$)/g;
        let matches: Array<string> = reg.exec(url[0]);
        if (matches && matches[1]) {
            return matches[1];
        }
    }
    return undefined;
}

function checkFiedPriceDiv(callback: Function): void {
    chrome.tabs.executeScript({ code: `document.getElementById("` + UNIFIED_PRICE_DIV + `")` }, div => {
        callback(div && div[0] ? true : false);
    });
}

function getResponse(url, obj) {
    return fetch(url, obj)
        .then(response => {
            callbackData['status'] = response.status;
            if (response.headers.get("content-type").indexOf("text/html") == 0) {
                return response.text();
            } else {
                return response.json();
            }
        });
}