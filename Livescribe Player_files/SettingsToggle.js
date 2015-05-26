// ***********************************************************************************************************
// Name: Settings Toggle UI Control
// Type:User Control
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.UI = LiveScribe.UI || {};

//dependencies
//Framework.EventHandling.js



LiveScribe.UI.SettingsToggleState = {
    ON: true,
    OFF: false
};



LiveScribe.UI.SettingsToggle = function (toggleElement, defaultState) {
    this.ToggleElement = toggleElement;
    this.ToggleState = defaultState;
    this.IsEnabled = false;

    this.OnToggleClick = null;
    this.OnToggleChange = null;
    this.OnToggleEnable = null;
    this.OnToggleDisable = null;

    this.ToggleClickDelegate = LiveScribe.Events.CreateDelegate(this, this.ClickHandler);
    this.ToggleChangeDelegate = LiveScribe.Events.CreateDelegate(this, this.ChangeHandler);

    this.ToggleElement.checked = defaultState;
};

LiveScribe.UI.SettingsToggle.prototype.Enable = function () {
    LiveScribe.Events.AddHandler(this.ToggleElement, 'click', this.ToggleClickDelegate);
    LiveScribe.Events.AddHandler(this.ToggleElement, 'change', this.ToggleChangeDelegate);

    this.IsEnabled = true;

    if (this.OnToggleEnable != null) {
        this.OnToggleEnable(this);
    }
};

LiveScribe.UI.SettingsToggle.prototype.Disable = function () {
    LiveScribe.Events.RemoveHandler(this.ToggleElement, 'click', this.ToggleClickDelegate);
    LiveScribe.Events.RemoveHandler(this.ToggleElement, 'change', this.ToggleChangeDelegate);

    this.IsEnabled = false;

    if (this.OnToggleDisable != null) {
        this.OnToggleDisable(this);
    }
};

LiveScribe.UI.SettingsToggle.prototype.ClickHandler = function () {
    if (this.OnToggleClick != null) {
        this.OnToggleClick(this);
    }
};

LiveScribe.UI.SettingsToggle.prototype.ChangeHandler = function () {
    this.ToggleState = this.ToggleElement.checked;

    if (this.OnToggleChange != null) {
        this.OnToggleChange(this.ToggleState);
    }
};