// ***********************************************************************************************************
// Name: Color Picker UI Control
// Type:User Control
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.UI = LiveScribe.UI || {};

//dependencies
//Framework.EventHandling.js



// **********************************  Color Picker Event ****************************************************
LiveScribe.UI.ColorPickerEvent = {
    COLOR_CHANGE: 0
};



// **********************************  Color Pair ****************************************************
LiveScribe.UI.ColorPair = function(){
    this.Foreground = null;
    this.Background = null;
};




// **********************************  Color Picker Item ****************************************************
LiveScribe.UI.ColorPickerItem = function (foregroundColorElement, backgroundColorElement) {
    this.ForegroundColorElement = foregroundColorElement;
    this.BackgroundColorElement = backgroundColorElement;
    this.Active = false;

    this.OnColorPickerItemClick = null;

    LiveScribe.Events.AddHandler(this.ForegroundColorElement, 'click', LiveScribe.Events.CreateDelegate(this, this.ClickHandler));
    LiveScribe.Events.AddHandler(this.BackgroundColorElement, 'click', LiveScribe.Events.CreateDelegate(this, this.ClickHandler));
};

LiveScribe.UI.ColorPickerItem.prototype.ClickHandler = function () {
    if (this.OnColorPickerItemClick != null && this.OnColorPickerItemClick != undefined) {
        this.OnColorPickerItemClick(this);
    }
};

LiveScribe.UI.ColorPickerItem.prototype.ColorPickerChangeHandler = function (colorPair) {
    if (this.ForegroundColorElement.style.backgroundColor == colorPair.Foreground) {
        this.ForegroundColorElement.style.borderColor = '#FFFFFF';
        this.BackgroundColorElement.style.borderColor = '#FFFFFF';
    }
    else {
        this.ForegroundColorElement.style.borderColor = this.ForegroundColorElement.style.backgroundColor;
        this.BackgroundColorElement.style.borderColor = this.BackgroundColorElement.style.backgroundColor;
    }
};



// **********************************  Color Picker ****************************************************
LiveScribe.UI.ColorPicker = function () {
    this.ColorPickerClickDelegate = LiveScribe.Events.CreateDelegate(this, this.ColorPickerItemClickHandler);
    this.AddEvent(LiveScribe.UI.ColorPickerEvent.COLOR_CHANGE);
};

LiveScribe.UI.ColorPicker.prototype = new LiveScribe.Events.CustomEventHandlingBase();

LiveScribe.UI.ColorPicker.prototype.AddColorPickerItem = function (colorPickerItem) {
    colorPickerItem.OnColorPickerItemClick = this.ColorPickerClickDelegate;

    this.RegisterEventHandler(new LiveScribe.Events.CustomEventHandler(colorPickerItem.ForegroundColorElement.id,
        LiveScribe.UI.ColorPickerEvent.COLOR_CHANGE,
        LiveScribe.Events.CreateDelegate(colorPickerItem, colorPickerItem.ColorPickerChangeHandler)));
};

LiveScribe.UI.ColorPicker.prototype.ColorPickerItemClickHandler = function (colorPickerItem) {
    var colorPair = new LiveScribe.UI.ColorPair();
    colorPair.Foreground = colorPickerItem.ForegroundColorElement.style.backgroundColor;
    colorPair.Background = colorPickerItem.BackgroundColorElement.style.backgroundColor;

    this.FireEvent(LiveScribe.UI.ColorPickerEvent.COLOR_CHANGE, colorPair);
};