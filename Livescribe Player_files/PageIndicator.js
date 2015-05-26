// ***********************************************************************************************************
// Name: Page Indicator UI Control
// Type:User Control
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.UI = LiveScribe.UI || {};



LiveScribe.UI.PageIndicatorControl = function (currentPageElement, totalPageElement) {
    this.CurrentPageElement = currentPageElement;
    this.TotalPageElement = totalPageElement;
}

LiveScribe.UI.PageIndicatorControl.prototype.SetTotalPages = function (count) {
    this.TotalPageElement.innerHTML = "/ " + count;
};

LiveScribe.UI.PageIndicatorControl.prototype.SetCurrentPage = function (index) {
    this.CurrentPageElement.innerHTML = index;
};