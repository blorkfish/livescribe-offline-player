// ***********************************************************************************************************
// Name: Button UI Control
// Type:User Control
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.UI = LiveScribe.UI || {};

//dependencies
//Framework.EventHandling.js


LiveScribe.UI.ButtonState = {
    UP: 'notClicked',
    DOWN: 'Clicked'
};

LiveScribe.UI.ButtonDisplayState = {
    DISPLAY: 'block',
    HIDE: 'none'
};


LiveScribe.UI.ButtonControl = function (buttonElement) {
    this.ButtonElement = buttonElement;
    this.ButtonArgument = null;
    this.IsEnabled = false;

    this.SupportsMSPointerEvents = (window.navigator.msPointerEnabled) ? true : false;
    this.SupportsTouchEvents = ('ontouchstart' in this.ButtonElement) ? true : false;
    this.SupportsMouseEvents = ('mousedown' in this.ButtonElement) ? true : false;

    this.OnButtonClick = null;
    this.OnButtonMouseDown = null;
    this.OnButtonMouseUp = null;
    this.OnButtonMouseOver = null;
    this.OnButtonMouseOut = null;
    this.OnButtonEnable = null;
    this.OnButtonDisable = null;

    this.ButtonClickDelegate = LiveScribe.Events.CreateDelegate(this, this.ClickHandler);
    this.ButtonMouseDownDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseDownHandler);
    this.ButtonMouseUpDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseUpHandler);
    this.ButtonMouseOverDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseOverHandler);
    this.ButtonMouseOutDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseOutHandler);

    this.ButtonElement.style.display = LiveScribe.UI.ButtonDisplayState.HIDE;
};

LiveScribe.UI.ButtonControl.prototype.Enable = function () {
    LiveScribe.Events.AddHandler(this.ButtonElement, 'click', this.ButtonClickDelegate);
    
    if (this.SupportsMSPointerEvents) {
        LiveScribe.Events.AddHandler(this.ButtonElement, 'MSPointerDown', this.ButtonMouseDownDelegate);
        LiveScribe.Events.AddHandler(this.ButtonElement, 'MSPointerUp', this.ButtonMouseUpDelegate);
        LiveScribe.Events.AddHandler(this.ButtonElement, 'MSPointerOver', this.ButtonMouseOverDelegate);
        LiveScribe.Events.AddHandler(this.ButtonElement, 'MSPointerOut', this.ButtonMouseOutDelegate);
    }
    else if (this.SupportsTouchEvents) {
        LiveScribe.Events.AddHandler(this.ButtonElement, 'touchstart', this.ButtonMouseDownDelegate);
        LiveScribe.Events.AddHandler(this.ButtonElement, 'touchend', this.ButtonMouseUpDelegate);
    }
    else {
        LiveScribe.Events.AddHandler(this.ButtonElement, 'mousedown', this.ButtonMouseDownDelegate);
        LiveScribe.Events.AddHandler(this.ButtonElement, 'mouseup', this.ButtonMouseUpDelegate);
        LiveScribe.Events.AddHandler(this.ButtonElement, 'mouseover', this.ButtonMouseOverDelegate);
        LiveScribe.Events.AddHandler(this.ButtonElement, 'mouseout', this.ButtonMouseOutDelegate);
    }

    this.ButtonElement.style.display = LiveScribe.UI.ButtonDisplayState.DISPLAY;

    this.IsEnabled = true;

    if (this.OnButtonEnable != null) {
        this.OnButtonEnable(this);
    }
};

LiveScribe.UI.ButtonControl.prototype.Disable = function () {
    LiveScribe.Events.RemoveHandler(this.ButtonElement, 'click', this.ButtonClickDelegate);

    if (this.SupportsMSPointerEvents) {
        LiveScribe.Events.RemoveHandler(this.ButtonElement, 'MSPointerDown', this.ButtonMouseDownDelegate);
        LiveScribe.Events.RemoveHandler(this.ButtonElement, 'MSPointerUp', this.ButtonMouseUpDelegate);
        LiveScribe.Events.RemoveHandler(this.ButtonElement, 'MSPointerOver', this.ButtonMouseOverDelegate);
        LiveScribe.Events.RemoveHandler(this.ButtonElement, 'MSPointerOut', this.ButtonMouseOutDelegate);
    }
    else if (this.SupportsTouchEvents) {
        LiveScribe.Events.RemoveHandler(this.ButtonElement, 'touchstart', this.ButtonMouseDownDelegate);
        LiveScribe.Events.RemoveHandler(this.ButtonElement, 'touchend', this.ButtonMouseUpDelegate);
    }
    else {
        LiveScribe.Events.RemoveHandler(this.ButtonElement, 'mousedown', this.ButtonMouseDownDelegate);
        LiveScribe.Events.RemoveHandler(this.ButtonElement, 'mouseup', this.ButtonMouseUpDelegate);
        LiveScribe.Events.RemoveHandler(this.ButtonElement, 'mouseover', this.ButtonMouseOverDelegate);
        LiveScribe.Events.RemoveHandler(this.ButtonElement, 'mouseout', this.ButtonMouseOutDelegate);
    }

    this.ButtonElement.style.display = LiveScribe.UI.ButtonDisplayState.HIDE;

    this.IsEnabled = false;

    if (this.OnButtonDisable != null) {
        this.OnButtonDisable(this);
    }
};

LiveScribe.UI.ButtonControl.prototype.Display = function () {
    if (!this.Enabled) {
        this.Enable();
    }
    this.ButtonElement.style.display = LiveScribe.UI.ButtonDisplayState.DISPLAY;
};

LiveScribe.UI.ButtonControl.prototype.Hide = function () {
    if (this.Enabled) {
        this.Disable();
    }
    this.ButtonElement.style.display = LiveScribe.UI.ButtonDisplayState.HIDE;
};

LiveScribe.UI.ButtonControl.prototype.ToggleButtonState = function (state) {
    this.ButtonElement.className = state;
};

LiveScribe.UI.ButtonControl.prototype.ClickHandler = function () {
    if (this.OnButtonClick != null) {
        this.OnButtonClick(this);
    }
};

LiveScribe.UI.ButtonControl.prototype.MouseDownHandler = function () {
    this.ToggleButtonState(LiveScribe.UI.ButtonState.DOWN);

    if (this.OnButtonMouseDown != null) {
        this.OnButtonMouseDown(this);
    }
};

LiveScribe.UI.ButtonControl.prototype.MouseUpHandler = function () {
    this.ToggleButtonState(LiveScribe.UI.ButtonState.UP);

    if (this.OnButtonMouseUp != null) {
        this.OnButtonMouseUp(this);
    }
};

LiveScribe.UI.ButtonControl.prototype.MouseOverHandler = function () {
    if (this.OnButtonMouseOver != null) {
        this.OnButtonMouseOver(this);
    }
};

LiveScribe.UI.ButtonControl.prototype.MouseOutHandler = function () {
    this.ToggleButtonState(LiveScribe.UI.ButtonState.UP);

    if (this.OnButtonMouseOut != null) {
        this.OnButtonMouseOut(this);
    }
};