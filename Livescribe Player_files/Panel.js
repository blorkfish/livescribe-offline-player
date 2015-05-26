// ***********************************************************************************************************
// Name: Panel Panel
// Type: User Control
// Author: Cliff Gower
//************************************************************************************************************


var LiveScribe = LiveScribe || {};
LiveScribe.UI = LiveScribe.UI || {};


LiveScribe.UI.PanelDisplayType = {
    SHOW: "block",
    HIDE: "none"
}


//*********************** modal panel object  ***************************
LiveScribe.UI.Panel = function (panelElementId, showButton, hideButton) {
    this.PanelElementID = panelElementId;
    this.ShowPanelButton = showButton;
    this.HidePanelButton = hideButton;

    this.ShowPanelButton.OnClick = LiveScribe.Events.CreateDelegate(this, this.Show)
    this.HidePanelButton.OnClick = LiveScribe.Events.CreateDelegate(this, this.Hide)

    this.OnShowModal = null;
    this.OnHideModal = null;
};

LiveScribe.UI.Panel.prototype.Show = function () {
    if (this.ShowPanelButton != null && this.ShowPanelButton != undefined) {
        this.ShowPanelButton.ButtonElement.style = LiveScribe.UI.PanelDisplayType.HIDE;
    }

    jQuery("#" + this.PanelElementID).animate({ top: '-200px', height: '200px' }, 500, LiveScribe.Events.CreateDelegate(this, this.ShowCompleteHandler));

    if (this.OnShowModal != null) {
        this.OnShowModal();
    }
};

LiveScribe.UI.Panel.prototype.Hide = function () {

    jQuery("#" + this.PanelElementID).animate({ top: '0', height: '0' }, 500, LiveScribe.Events.CreateDelegate(this, this.HideCompleteHandler));

    if (this.OnHideModal != null) {
        this.OnHideModal();
    }
};

LiveScribe.UI.Panel.prototype.ShowCompleteHandler = function () {
    if (this.HidePanelButton != null && this.HidePanelButton != undefined) {
        this.HidePanelButton.ButtonElement.style = LiveScribe.UI.PanelDisplayType.SHOW;
    }
};

LiveScribe.UI.Panel.prototype.HideCompleteHandler = function () {
    if (this.HidePanelButton != null && this.HidePanelButton != undefined) {
        this.HidePanelButton.ButtonElement.style = LiveScribe.UI.PanelDisplayType.HIDE;
    }

    if (this.ShowPanelButton != null && this.ShowPanelButton != undefined) {
        this.ShowPanelButton.ButtonElement.style = LiveScribe.UI.PanelDisplayType.SHOW;
    }
};