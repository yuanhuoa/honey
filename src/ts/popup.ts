import "../css/popup.css";
setGoogleIcons();
import {
    SAVE_BTN,
    BEST_DEAL_BTN,
    SAVE_POPUP, BEST_DEAL_POPUP,
    UNIFIED_PRICE_DIV, COUPON_BUTTON_TEXT,
    PRODUCT_URL, CAROUSEL_ELEMENT,
    CAROUSER_BOX
} from "./constans";

let isClicked: boolean = true;
let similarPageNumber: number = 0;
let relatedItemsPerPage: number = 6.0;
let pageMax: number = -1;
let data: Object;

let closeBtn: HTMLElement

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.title === "buy-product") {
        let hiddenInput: HTMLElement = document.getElementsByName("dupOrderCheckArgs")[0];
        let reg: RegExp = /^([A-Za-z0-9]{10})/g;
        let matches: Array<string> = reg.exec(hiddenInput['value']);
        let coupon = getCoupon(matches[0]);
        if (coupon) {
            createCouponBtn(coupon);
        }
    } else if (message.title === "select-product") {
        let bestDeal: Object;
        let data = getDataForCarouser(9, message.asin);
        if(data) {
            bestDeal = findBestDeal(data);
        }
        console.log("bestDeal", bestDeal)
        bestDeal ? createSavePopup(bestDeal) : createBestDealPopup();
        createDefaultPopupButtonsListener();
        addCarouselWithListener(message.asin);
    }
    return true;
});

/**
 * 有优惠  创建节省多少money按钮
 */
function createSavePopup(bestDeal: Object): void {
    let priceDivs: Array<HTMLElement> = [
        document.getElementById("priceblock_dealprice"),
        document.getElementById("priceblock_ourprice"),
        document.getElementById("priceblock_saleprice")
    ]
    let price: string;
    for (let i in priceDivs) {
        priceDivs[i] && (price = priceDivs[i]['innerText']);
    }
    console.log("PRICE", price)

    let newDealCoupon: Object = bestDeal['coupon'];
    let newDealPrice: number;
    let salePrice: string = bestDeal['price'];
    if (newDealCoupon) {
        newDealPrice = parseFloat(price.substr(1, length));
        salePrice = "$" + (newDealPrice - newDealCoupon['discount']).toFixed(2).toString();
    }
    let popupBtn: HTMLElement = document.getElementById("popup-btn");
    popupBtn && document.removeChild(popupBtn);
    let popup: HTMLElement = document.getElementById("popup");
    popup && document.removeChild(popup);

    let unifiedPrice: HTMLElement = document.getElementById(UNIFIED_PRICE_DIV);
    let popupBtnStr = SAVE_BTN;
    let popupDivStr = SAVE_POPUP(salePrice, price.substring(1, price.length), newDealCoupon);
    unifiedPrice.innerHTML = popupDivStr + unifiedPrice.innerHTML;
    unifiedPrice.innerHTML = popupBtnStr + unifiedPrice.innerHTML;

    let selectBtn: HTMLElement = document.getElementById("select-btn");
    selectBtn.onclick = _ => {
        let selectProduct = document.getElementsByClassName("selected-product");
        if (selectProduct[0]['id'] === "cur-product") {
            closeBtn.click();
        } else {
            parent.window.location.href = PRODUCT_URL + bestDeal['asin'];
        }
    };

    let curProduct: HTMLElement = document.getElementById("cur-product");
    let bestProduct: HTMLElement = document.getElementById("best-product");
    curProduct.onclick = _ => {
        curProduct.className = "product cur-product selected-product";
        bestProduct.className = "product best-product";
    };
    bestProduct.onclick = _ => {
        bestProduct.className = "product best-product selected-product";
        curProduct.className = "product cur-product";
    };
}

/**
 * 没有更优惠的创建 bestDeal 按钮
 */
function createBestDealPopup(): void {
    let unifiedPrice: HTMLElement = document.getElementById(UNIFIED_PRICE_DIV);
    let popupBtnStr: string = BEST_DEAL_BTN;
    let popupDivStr = BEST_DEAL_POPUP;
    unifiedPrice.innerHTML = popupDivStr + unifiedPrice.innerHTML;
    unifiedPrice.innerHTML = popupBtnStr + unifiedPrice.innerHTML;
}

/**
 * 创建复制优惠码按钮
 */
function createCouponBtn(coupon: Object): void {
    let couponBtn: HTMLElement = document.getElementById("coupon-btn");
    let couponDiv: Element = document.getElementsByClassName("a-column a-span6 a-span-last")[0];
    let orderSummaryBox: HTMLElement = document.getElementById("order-summary-box");
    if (orderSummaryBox && couponDiv && !couponBtn) {
        let couponButtonText: string = COUPON_BUTTON_TEXT;
        couponDiv.innerHTML += couponButtonText;
        couponBtn = document.getElementById("coupon-btn");
        couponBtn.onclick = _ => {
            let climeCode: HTMLElement = document.getElementsByName("claimCode")[0];
            climeCode['value'] = coupon['couponCode'];

            let gcError: HTMLElement = document.getElementById("gc-error");
            let gcSuccess: HTMLElement = document.getElementById("gc-promo-success");
            let observer: MutationObserver = new MutationObserver(mutations => {
                for (let i in mutations) {
                    if (mutations[i]['target']['id'] === "gc-promo-success" && (gcSuccess.style.display == "block" || gcSuccess.style.display == "")) {
                        let audio: HTMLAudioElement = new Audio(chrome.runtime.getURL('drop-coin.mp3'));
                        let couponBtnText = document.getElementById("coupon-btn-text");
                        couponBtnText.innerHTML = "Congrats! $" + coupon['discount'] + " saved";
                        couponBtnText.style.fontSize = "13px";
                        audio.play();
                    }
                }
            });
            observer.observe(gcSuccess, { attributes: true });
            // observer.observe(gcError, { attributes: true });

            let applyCouponBtn: HTMLElement = document.getElementsByClassName("a-declarative a-button-text")[0] as HTMLElement;
            applyCouponBtn.click();
        }
    }
}

/**
 * 按钮点击显示隐藏弹框
 */
function createDefaultPopupButtonsListener(): void {
    let popupBtn: HTMLElement = document.getElementById("popup-btn");
    popupBtn.onclick = _ => {
        if (isClicked) {
            document.getElementById("popup").style['opacity'] = "1";
            document.getElementById("popup").style['z-index'] = 999999;
            isClicked = false;
        } else {
            document.getElementById("popup").style['opacity'] = "0";
            document.getElementById("popup").style['z-index'] = -999999;
            isClicked = true;
        }
    };
    closeBtn = document.getElementById("close-btn");
    closeBtn.onclick = _ => {
        document.getElementById("popup").style['opacity'] = "0";
        document.getElementById("popup").style['z-index'] = -999999;
        isClicked = true;
    };
}

/**
 * 增加一个浏览器宽度变化的监听，一旦宽度变化，每页显示的有优惠商品数量跟着变化
 */
function addCarouselWithListener(asin: string): void {
    data = getDataForCarouser(relatedItemsPerPage, asin);
    let pageMaxDec: number = data['items_count'] / relatedItemsPerPage;
    pageMax = Math.floor(pageMaxDec) + (pageMaxDec - Math.floor(pageMaxDec) > 0 ? 1 : 0);
    let carouselElements: string = createCarouselElements(data);
    addCarousel(carouselElements, relatedItemsPerPage, asin);

    addWidthChangeListener(document.body, _ => {
        let relateCarouselItems: HTMLElement = document.getElementById("relate-carousel-items");
        relatedItemsPerPage = Math.floor(relateCarouselItems.clientWidth / 182);
        let pageMaxDec: number = data['items_count'] / relatedItemsPerPage;
        pageMax = Math.floor(pageMaxDec) + (pageMaxDec - Math.floor(pageMaxDec) > 0 ? 1 : 0);
        similarPageNumber >= pageMax && (similarPageNumber = pageMax - 1);
        data = getDataForCarouser(relatedItemsPerPage, asin);
        let carouselElements: string = createCarouselElements(data);
        addCarousel(carouselElements, relatedItemsPerPage, asin);
    });
}

function addWidthChangeListener(block, callback) {
    var lastWidth = block.clientWidth, newWidth;
    (function run() {
        newWidth = block.clientHeight;
        lastWidth != newWidth && callback();
        lastWidth = newWidth;
        block.onElementWidthChangeTimer && clearTimeout(block.onElementWidthChangeTimer);
        block.onElementWidthChangeTimer = setTimeout(run, 200);
    })();
}

function getDataForCarouser(itemsCount: number, asin: string): Object {
    let items_count: number = 9;
    let result: Object;
    // asin = "B072HH45Q9";

    if (asin === "B072HH45Q9") {
        result = {
            asins: [
                "B01G7AZB96",
                "B0752W4WX1",
                "B01MUBU0YC",
                "B074PFP64G",
                "B074D8KKKW",
                "B075QLZQDV",
                "B075PMNHRG",
                "B002KUJVB2",
                "B06XK2FQJC",
            ],
            items_names: [
                "AquaBliss High Output Universal Shower Filter with Replaceable Multi-Stage Filter Cartridge - Chrome (1 Pack)",
                "2-Stage Shower Water Filter - 2 Cartridge Included - Removes Chlorine, Impurities & Unpleasant Odors - Boosts Skin and Hair Health - For Any Shower Head and Handheld Shower AquaHomeGroup",
                "AquaBliss High Output 12-Stage Shower Filter - Reduces Dry Itchy Skin, Dandruff, Eczema, and Dramatically Improves the Condition Of Your Skin, Hair And Nails - Chrome",
                "Shower Filter | Water Softener 10-Stage,for Any Shower Head and Handheld Shower,2 Cartridges incld. Softens Hard Water, Removes Chlorine and Heavy Metals, improves Skin and Hair Health",
                "Water filter, Wingsol Healthy Faucet Water Filter System - Tap Water Purifier Filter Water Purifying Device for Home Kitchen with stainless-steel",
                "Shower Water Filter Multi-Stage Shower Filter For Hard Water Removes Chlorine Fluoride and Harmful Substances - Showerhead Filter High Output Prevents Hair and Skin Dryness - By Torti Lia",
                "12-Stage Shower Water Filter-Shower Filter for Hard Water-Filtered Shower Head with 2 Replaceable Cartridges-Shower Filters to Remove Chlorine and Impurities-Boosts Skin and Hair Health",
                "3M Aqua-Pure Whole House Replacement Water Filter – Model AP817",
                "Universal Shower Filter to remove 99% chlorine and water impurifies, shower head filter with 3 stage Carbon filtration system and lifetime indicator,miniwell L730, soften skin and healthier hairs"
            ],
            items_images: [
                "https://images-na.ssl-images-amazon.com/images/I/81W7uxWg4qL._SL1500_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/81NhcQ2wyoL._SL1500_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/71up7BopkuL._SL1500_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/819yzxtsiqL._SL1500_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/61rthTI-92L._SL1200_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/81Aw-MkebZL._SL1500_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/71IrPuENhGL._SL1200_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/41Gun1lNI1L._SL1024_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/61vAZZL8p6L._SL1000_.jpg"
            ],
            items_review_star: [4.4, 4.4, 4.6, 4.5, 4.3, 4.2, 4, 4.1, 3.9],
            items_review_number: [1064, 463, 22, 118, 34, 56, 24, 1, 0],
            items_price: [31.86, 38.85, 37.86, 14.99, 39.99, 26.99, 34.55, 25.67, 16.78]
        };
    } else if (asin === "B079N67NF2") {
        result = {
            asins: [
                "B078G3PCWX",
                "B01NCFGY9K",
                "B002R8FSTQ",
                "B00LY39A4Y",
                "B01MYO3JB9",
                "B0749N4GR2",
                "B078XB1YF8",
                "B01N0J0HTF",
                "B071ZDPHX3",
                "B00C4WWFLO",
                "B0711XH757",
            ],
            items_names: [
                "25 Frosted Sea Glass Round Beads 10mm Matte - Dark Violet",
                "Bingcute Wholesale 5040 Austria Crystal Rondelle AB Beads Gemstone Loose Beads Choice 4mm 6mm 8mm 10mm 12mm",
                "10mm Rosary carved Beads (500 beads) - Bethlehem Olive wood",
                "Jerusalem Olive Wood making a rosary beads supplies 10mm ( 500 Beads )",
                "RUBYCA Assorted Round Frosted Crackle Glass Loose Beads Druk Czech Crystal Mixed Color 10mm 100pcs",
                "SouthBeat Micro Pave CZ Bulldog Beads Dog Head Bead for Men Charm Bracelet Spacer Beads Jewelry DIY Accessories 13x11mm 10Pcs MixColor",
                "150pcs 10mm Pave Disco Ball Clay Beads, Shamballa Beads for Jewelry Making (White)",
                "Universal Shower Filter to remove 99% chlorine and water impurifies, shower head filter with 3 stage Carbon filtration system and lifetime indicator,miniwell L730, soften skin and healthier hairs",
                "JARTC Natural Stone Beads Green Dongling Jade Round Loose Beads For Jewelry Making Diy Bracelet Necklace (10mm)",
                "RUBYCA Natural AAA Grade Quartz Crystal Mix Round Translucent Crackle Jewelry Making (1 strand 10mm)",
                "The Crafts Outlet 144-Piece Flat Back Round Rhinestones, 10mm, Devil Red Wine"
            ],
            items_images: [
                "https://images-na.ssl-images-amazon.com/images/I/81W7uxWg4qL._SL1500_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/81NhcQ2wyoL._SL1500_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/71up7BopkuL._SL1500_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/819yzxtsiqL._SL1500_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/61rthTI-92L._SL1200_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/81Aw-MkebZL._SL1500_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/71IrPuENhGL._SL1200_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/41Gun1lNI1L._SL1024_.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/61vAZZL8p6L._SL1000_.jpg"
            ],
            items_review_star: [4.4, 4.4, 4.6, 4.5, 4.3, 4.2, 4, 4.1, 3.9],
            items_review_number: [1064, 463, 22, 118, 34, 56, 24, 1, 0],
            items_price: [14.99, 9.75, 7.99, 36.49, 24.95, 17.99, 15.99, 10.79, 8.99, 13.99, 6.96]
        };
    } else {
        return undefined;
    }

    let p: number = similarPageNumber;
    var asins = result['asins'].slice(p * itemsCount, (p + 1) * itemsCount);
    var items_names = result['items_names'].slice(p * itemsCount, (p + 1) * itemsCount);
    var items_images = result['items_images'].slice(p * itemsCount, (p + 1) * itemsCount);
    var items_review_star = result['items_review_star'].slice(p * itemsCount, (p + 1) * itemsCount);
    var items_review_number = result['items_review_number'].slice(p * itemsCount, (p + 1) * itemsCount);
    var items_price = result['items_price'].slice(p * 6, (p + 1) * itemsCount);
    return { items_count, asins, items_names, items_images, items_review_star, items_review_number, items_price };
}

/**
 * 创建  Similar products with coupon 节点下的每一个图片信息并拼接成完整div
 */
function createCarouselElements(data: Object): string {
    let result: string = "";
    for (let i = 0; i < data['asins'].length; ++i) {
        let starIcon: string;
        if (data['items_review_star'][i] == 5) starIcon = "5";
        else if (data['items_review_star'][i] >= 4.5) starIcon = "4-5";
        else if (data['items_review_star'][i] >= 4.0) starIcon = "4";
        else if (data['items_review_star'][i] >= 3.5) starIcon = "3-5";
        else if (data['items_review_star'][i] >= 3.0) starIcon = "3";
        else if (data['items_review_star'][i] >= 2.5) starIcon = "2-5";
        else if (data['items_review_star'][i] >= 2.0) starIcon = "2";
        else if (data['items_review_star'][i] >= 1.5) starIcon = "1-5";
        else if (data['items_review_star'][i] >= 1.0) starIcon = "1";
        else if (data['items_review_star'][i] >= 0.5) starIcon = "0-5";
        else if (data['items_review_star'][i] >= 0.0) starIcon = "0";
        result += CAROUSEL_ELEMENT(data, i, starIcon);
    }
    return result;
}

/**
 * 将div插入界面
 */
function addCarousel(carouselElements: string, itemsCount: number, asin: string): void {
    let bottomRow: HTMLElement = document.getElementById("bottomRow");
    let relatedCarousel: HTMLElement = document.getElementById("related-carousel");
    relatedCarousel && bottomRow.removeChild(relatedCarousel);
    bottomRow.innerHTML += CAROUSER_BOX(similarPageNumber, pageMax, carouselElements);
    carouselNextPrevListener(data, carouselElements, itemsCount, asin);
}

/**
 * 前进后退获取同类优惠券并创建节点显示
 */
function carouselNextPrevListener(data: Object, carouselElements: string, itemsCount: number, asin: string): void {
    let carouselNext: HTMLElement = document.getElementById("a-autoid-similar-next");
    let carouselPrev: HTMLElement = document.getElementById("a-autoid-similar-prev");
    carouselNext.onclick = _ => {
        if (similarPageNumber + 1 < pageMax) {
            similarPageNumber++;
            data = getDataForCarouser(itemsCount, asin);
            carouselElements = createCarouselElements(data);
            addCarousel(carouselElements, itemsCount, asin);
        }
    };
    carouselPrev.onclick = _ => {
        if (similarPageNumber - 1 >= 0) {
            similarPageNumber--;
            data = getDataForCarouser(itemsCount, asin);
            carouselElements = createCarouselElements(data);
            addCarousel(carouselElements, itemsCount, asin);
        }
    };
}

function getCoupon(asin): Object {
    if (asin === "B072HH45Q9") {
        return { isCouponExisiting: 1, discount: 10, couponCode: "3LI5GUI7" }
    } else if (asin === "B079N67NF2") {
        return { isCouponExisiting: 1, discount: 7.64, couponCode: "F9VYIDDA" }
    } else {
        return undefined;
    }
}

function setGoogleIcons(): void {

    let iconsLink: HTMLElement = document.createElement("link");
    iconsLink['href'] = "https://fonts.googleapis.com/icon?family=Material+Icons";
    iconsLink['rel'] = "stylesheet";
    document.head.appendChild(iconsLink);
}

/**
 *  找出最小价格商品
 */
function findBestDeal(data: Object): Object {
    let result = undefined;
    let minPrice: number = 99999999.0;
    let minPriceIndex: number = -1;
    console.log(data)
    for (let i = 0; i < data['items_count']; ++i) {
        if (data['items_price'][i] < minPrice) {
            minPrice = data['items_price'][i];
            minPriceIndex = i;
        }
    }

    console.log("minPriceIndex", minPriceIndex)
    if (minPrice < 19.99) {
        result = { price: data['items_price'][minPriceIndex], coupon: undefined, asin: data['asins'][minPriceIndex] }
    }

    console.log("DATA!!!!", result);
    return result;
}