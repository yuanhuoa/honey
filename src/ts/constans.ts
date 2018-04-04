export const BUY_URL = "https://www.amazon.com/gp/buy";
export const PRODUCT_URL = "https://www.amazon.com/dp/";
export const UNIFIED_PRICE_DIV = "unifiedPrice_feature_div";
export const SAVE_BTN = `<button class="save-btn" id="popup-btn"><p class="h-title h-title-white">h</p><p class="save-text">Save</p></button>`;
export const BEST_DEAL_BTN = `<button class="best-deal-btn" id="popup-btn"><p class="h-title h-title-orange">h</p><p class="best-deal-btn-text">Best Deal</p></button>`;

export function SAVE_POPUP(salePrice, price, coupon): string {
    console.log(parseFloat(price), parseFloat(salePrice), (parseFloat(price) - parseFloat(salePrice)))
    let couponBlock: string = coupon ?
        `<div class="product-block">
            <p style="display: inline">coupon:</p>
            <p style="display: inline; float: right; margin-top: 0px">-$` + coupon['discount'] + `</p>
        </div>
        <br />`
        : "";

    let result: string = `
    <div id="popup" class="save">
        <div data-radium="true" class="outer-pointer">
            <div data-radium="true" class="inner-pointer"></div>
        </div>
        <p class="h-title h-title-black">h</p>
        <button type="button" id="close-btn" class="close-btn"><i class="material-icons">clear</i></button>
        <p class="save-descr">Save <strong>$` + (parseFloat(price) - parseFloat(salePrice)).toFixed(2).toString() + `</strong> buying from a different Amazon saler</p>
        <div id="cur-product" class="product cur-product selected-product">
            <p class="product-title">Original total.</p>
            <hr style="width: 170px">
            <div class="product-block">
                <p style="display: inline">price:</p>
                <p style="display: inline; float: right; margin-top: 0px">` + price + `</p>
            </div>
            <br />
            <div class="product-block">
                <p style="display: inline">Shipping & Tax:</p>
                <p style="display: inline; float: right; margin-top: 0px">Included</p>
            </div>
            <br />
            <hr style="width: 170px">
            <p class="product-total-cost ">` + price + `</p>
        </div>
        <div id="best-product" class="product best-product">
            <p class="product-title">New total.</p>
            <hr style="width: 170px">
            <div class="product-block">
                <p style="display: inline">price:</p>
                <p style="display: inline; float: right; margin-top: 0px">` + salePrice + `</p>
            </div>
            <br />
            <div class="product-block">
                <p style="display: inline">Shipping & Tax:</p>
                <p style="display: inline; float: right; margin-top: 0px">Included</p>
            </div>
            <br />`
        + couponBlock +
        `<hr style="width: 170px">
            <p class="product-total-cost ">` + salePrice + `</p>
        </div>
        <button id="select-btn" class="select-btn">Select Best Deal</button>
    </div>
    `;
    return result;
}

export function CAROUSEL_ELEMENT(data, idx, starIcon): string {
    let result =
        `<li class="a-carousel-card" role="listitem" aria-setsize="115" aria-posinset="` + (idx + 1) + `" aria-hidden="false" style="margin-left: 22px;">
            <div id="sp_detail_` + data['asins'][idx] + `" data-asin=` + data['asins'][idx] + ` data-p13n-asin-metadata="{&quot;ref&quot;:&quot;sspa_dk_detail_0&quot;,&quot;asin&quot;:&quot;` + data['asins'][idx] + `&quot;}" class="a-section sp_offerVertical p13n-asin">
                <a class="a-link-normal" target="_top" rel="noopener" title="` + data['items_names'][idx] + `"
                    href="https://www.amazon.com/dp/` + data['asins'][idx] + `">
                    <img style="height: 160px" alt=` + data['items_names'][idx] + ` src=` + data['items_images'][idx] + `>
                    <div data-rows="4" aria-hidden="true" class="sponsored-products-truncator-truncated">` + data['items_names'][idx].substr(0, 83) + `...</div>
                </a>
                <div class="a-row">
                    <a class="a-link-normal adReviewLink a-text-normal" target="_top" rel="noopener" title=` + data['items_names'][idx] + ` href="https://www.amazon.com/product-reviews/` + data['asins'][idx] + `">
                        <i class="a-icon a-icon-star a-star-` + starIcon + `"></i>
                        <span class="a-color-link">` + data['items_review_number'][idx] + `</span>
                    </a>
                </div>
                <div class="a-row a-color-price">
                    <span class="a-color-price">$` + data['items_price'][idx] + `</span>
                </div>
            </div>
        </li>
    `;
    return result;
}

export function CAROUSER_BOX(similarPageNumber: number, pageMax: number, carouselElements: string): string {
    let result: string = `
        <div id="related-carousel" class="related-carousel">
            <hr class="a-divider-normal bucketDivider">
            <div id="sp_detail" class="a-carousel-firstvisibleitem" value="1">
                <div class="a-row a-carousel-header-row a-size-large pa_componentTitleTest">
                    <div class="a-column a-span8">
                        <h2 class="a-carousel-heading">Similar products with coupon</h2>
                    </div>
                    <div class="a-column a-span4 a-span-last a-text-right">
                        <span class="a-carousel-pagination a-size-base" style="visibility: visible;">
                            <span class="a-carousel-page-count">Page
                                <span class="a-carousel-page-current">` + (similarPageNumber + 1) + `</span> of
                                <span class="a-carousel-page-max">` + pageMax + `</span>
                            </span>
                            <span class="a-carousel-restart-container" style="display: none;">
                                <span class="a-text-separator"></span>
                                <a class="a-carousel-restart" href="#">Start over</a>
                            </span>
                            <span class="a-carousel-accessibility-page-info a-offscreen" aria-live="polite">Page 1 of 20</span>
                        </span>
                    </div>
                </div>
                <div class="a-row a-carousel-controls a-carousel-row a-carousel-has-buttons">
                    <div class="a-carousel-row-inner">
                        <div class="a-carousel-col a-carousel-left" style="height: 274px; visibility: visible;">
                            <a class="a-button a-button-image a-carousel-button a-carousel-goto-prevpage"
                                style="top: 109.594px;" id="a-autoid-similar-prev">
                                <span class="a-button-inner">
                                    <i class="a-icon a-icon-previous">
                                        <span class="a-icon-alt">Previous page</span>
                                    </i>
                                </span>
                            </a>
                        </div>
                        <div class="a-carousel-col a-carousel-center">
                            <div class="a-carousel-viewport" id="anonCarousel1" style="height: 274px;">
                                <ol id="relate-carousel-items" class="a-carousel" role="list" aria-busy="false">
                                    ` + carouselElements + `
                                </ol>
                            </div>
                        </div>
                        <div class="a-carousel-col a-carousel-right" style="height: 274px; visibility: visible;">
                            <a class="a-button a-button-image a-carousel-button a-carousel-goto-nextpage"
                                style="top: 109.594px;" id="a-autoid-similar-next">
                                <span class="a-button-inner">
                                    <i class="a-icon a-icon-next">
                                        <span class="a-icon-alt">Next page</span>
                                    </i>
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <script type="text/javascript">   P.when('A', 'a-carousel-framework', 'AmazonClicks').execute(function (A, CF, AC) { CF.getCarousel(document.getElementById("sp_detail")); AC.registerFeedbackEvents("sp_detail_carousel", "sp_detail_feedbackMessage", "Ad feedback", "Hide feedback", "pa_feedbackForm_container_sp_detail"); }); </script>
        </div>
    `;
    return result;
}

export const BEST_DEAL_POPUP: string =
    `<div id="popup" class="best-deal">
        <div data-radium="true" class="outer-pointer">
            <div data-radium="true" class="inner-pointer"></div>
        </div>
        <p class="h-title h-title-black">h</p>
        <button type="button" id="close-btn" class="close-btn"><i class="material-icons">clear</i></button>
        <div class="best-deal-text">
            <p style="font-size: 12pt; text-align: center">This is the best deal of all Amazons sellers.</p>
            <p style="text-align: center">Honey takes shipping, text, Prime status and seller reputation before account to get you the best deal</p>
        </div>
    </div>
`;

export const COUPON_BUTTON_TEXT: string = `
    <div id="coupon-btn" class="coupon-btn">
        <p class="coupon-btn-title h-title-white no-select">h</p>
        <a id="coupon-btn-text" class="coupon-text no-select">Copy Coupon</a>
    </div>
`;