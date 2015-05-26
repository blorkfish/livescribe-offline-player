// ***********************************************************************************************************
// Name: Slider UI Control
// Type:User Control
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.UI = LiveScribe.UI || {};

//dependencies
//Framework.EventHandling.js


LiveScribe.UI.SliderDisplayState = {
    DISPLAY: 'block',
    HIDE: 'none'
};



//------------------------------------ Slider Coordinate Data ------------------------------------
LiveScribe.UI.SliderControlMoveCoordinate = function () {
    this.PositionX = null;
    this.PositionY = null;
};



//------------------------------------ Scrubber Control ------------------------------------
LiveScribe.UI.SliderScrubberControl = function (sliderScrubberElement, sliderElement) {
    this.ScrubberElement = sliderScrubberElement;
    this.SliderElement = sliderElement;

    this.IsEnabled = false;
    this.LastMousePositionX = null;
    this.LastMousePositionY = null;
    this.CurrentPercentComplete = 0;
    this.MinConstraintX = 0;
    this.MaxConstraintX = this.SliderElement.clientWidth - this.ScrubberElement.clientWidth + 14;
    this.SliderWidth = this.SliderElement.clientWidth;

    this.SupportsMSPointerEvents = (window.navigator.msPointerEnabled) ? true : false;
    this.SupportsTouchEvents = ('ontouchstart' in this.SliderElement) ? true : false;
    this.SupportsMouseEvents = ('onmousedown' in this.SliderElement) ? true : false;

    this.ScrubberMouseDownDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseDownHandler);
    this.ScrubberMouseUpDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseUpHandler);
    this.ScrubberMouseMoveDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseMoveHandler);
    this.ScrubberMouseOverDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseOverHandler);
    this.ScrubberMouseOutDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseUpHandler);

    this.OnScrubberEnable = null;
    this.OnScrubberDisable = null;
    this.OnScrubberMouseDown = null;
    this.OnScrubberMouseUp = null;
    this.OnScrubberMouseOver = null;
    this.OnScrubberMouseOut = null;
    this.OnScrubberMouseMove = null;
    this.OnScrubberPositionChange = null;

    LiveScribe.Events.AddHandler(window, 'resize', LiveScribe.Events.CreateDelegate(this, this.WindowResizeHandler));

    this.ScrubberElement.style.display = LiveScribe.UI.SliderDisplayState.HIDE;
};

LiveScribe.UI.SliderScrubberControl.prototype.Enable = function () {
    if (this.SupportsMSPointerEvents) {
        LiveScribe.Events.AddHandler(this.ScrubberElement, 'MSPointerDown', this.ScrubberMouseDownDelegate);
        LiveScribe.Events.AddHandler(this.ScrubberElement, 'MSPointerOver', this.ScrubberMouseOverDelegate);
    }
    else if (this.SupportsMouseEvents) {
        LiveScribe.Events.AddHandler(this.ScrubberElement, 'mousedown', this.ScrubberMouseDownDelegate);
        LiveScribe.Events.AddHandler(this.ScrubberElement, 'mouseover', this.ScrubberMouseOverDelegate);

        if (this.SupportsTouchEvents) {
            LiveScribe.Events.AddHandler(this.ScrubberElement, 'touchstart', this.ScrubberMouseDownDelegate);
        }
    }

    this.ScrubberElement.style.display = LiveScribe.UI.SliderDisplayState.DISPLAY;

    this.MaxConstraintX = this.SliderElement.clientWidth - this.ScrubberElement.clientWidth + 14;
    this.SliderWidth = this.SliderElement.clientWidth;

    this.IsEnabled = true;

    if (this.OnScrubberEnable != null) {
        this.OnScrubberEnable(this);
    }
};

LiveScribe.UI.SliderScrubberControl.prototype.Disable = function () {
    if (this.SupportsMSPointerEvents) {
        LiveScribe.Events.AddHandler(this.ScrubberElement, 'MSPointerDown', this.ScrubberMouseDownDelegate);
        LiveScribe.Events.AddHandler(this.ScrubberElement, 'MSPointerOver', this.ScrubberMouseOverDelegate);
    }
    else if (this.SupportsMouseEvents) {
        LiveScribe.Events.RemoveHandler(this.ScrubberElement, 'mousedown', this.ScrubberMouseDownDelegate);
        LiveScribe.Events.RemoveHandler(this.ScrubberElement, 'mouseover', this.ScrubberMouseOverDelegate);

        if (this.SupportsTouchEvents) {
            LiveScribe.Events.RemoveHandler(this.ScrubberElement, 'touchstart', this.ScrubberMouseDownDelegate);
        }
    }
    
    this.ScrubberElement.style.display = LiveScribe.UI.SliderDisplayState.HIDE;

    this.IsEnabled = false;

    if (this.OnScrubberDisable != null) {
        this.OnScrubberDisable(this);
    }
};

LiveScribe.UI.SliderScrubberControl.prototype.UpdateProgress = function (percentComplete) {
    var progressPositionX = percentComplete * this.SliderElement.clientWidth;
    this.ScrubberElement.style.left = progressPositionX - 14 + 'px';
    this.CurrentPercentComplete = percentComplete;
}

LiveScribe.UI.SliderScrubberControl.prototype.Move = function (sliderCoordinate) {
  
    if (sliderCoordinate.PositionX <= this.MinConstraintX) { sliderCoordinate.PositionX = this.MinConstraintX; }
    if (sliderCoordinate.PositionX >= this.MaxConstraintX) { sliderCoordinate.PositionX = this.MaxConstraintX; }

    this.ScrubberElement.style.left = sliderCoordinate.PositionX + 'px';
    


    this.CurrentPercentComplete = (sliderCoordinate.PositionX + 14) / this.SliderWidth;
    
    if (this.OnScrubberPositionChange != null && this.OnScrubberPositionChange != undefined) {
        setTimeout(LiveScribe.Events.CreateDelegate(this, this.OnScrubberPositionChange), 0, [this.CurrentPercentComplete]);
    };
}

LiveScribe.UI.SliderScrubberControl.prototype.Reset = function () {
    this.ScrubberElement.style.left = -14 + 'px';

    this.LastMousePositionX = null;
    this.LastMousePositionY = null;

    this.CurrentPercentComplete = 0;
};

LiveScribe.UI.SliderScrubberControl.prototype.Resize = function () {
    this.UpdateProgress(this.CurrentPercentComplete);
};

LiveScribe.UI.SliderScrubberControl.prototype.MouseDownHandler = function (e) {
    e = e || window.event;

    if (e.stopPropagation) { e.stopPropagation(); }
    else { e.cancelBubble = true; }

    e.preventDefault();

    this.LastMousePositionX = e.clientX ? e.clientX : e.changedTouches[0].pageX;
    this.LastMousePositionY = e.clientY ? e.clientY : e.changedTouches[0].pageY;

    if (this.SupportsMSPointerEvents) {
        LiveScribe.Events.AddHandler(window, 'MSPointerUp', this.ScrubberMouseUpDelegate);
        LiveScribe.Events.AddHandler(window, 'MSPointerMove', this.ScrubberMouseMoveDelegate);
    }
    else if (this.SupportsMouseEvents) {
        LiveScribe.Events.AddHandler(window, 'mouseup', this.ScrubberMouseUpDelegate);
        LiveScribe.Events.AddHandler(window, 'mousemove', this.ScrubberMouseMoveDelegate);

        if (this.SupportsTouchEvents) {
            LiveScribe.Events.AddHandler(window, 'touchmove', this.ScrubberMouseMoveDelegate);
            LiveScribe.Events.AddHandler(window, 'touchend', this.ScrubberMouseUpDelegate);
        }
    }

    if (this.OnScrubberMouseDown != null) {
        this.OnScrubberMouseDown(this);
    }
};

LiveScribe.UI.SliderScrubberControl.prototype.MouseUpHandler = function (e) {
    e = e || window.event;

    if (e.stopPropagation) { e.stopPropagation(); }
    else { e.cancelBubble = true; }

    e.preventDefault();

    if (this.SupportsMSPointerEvents) {
        LiveScribe.Events.RemoveHandler(window, 'MSPointerUp', this.ScrubberMouseUpDelegate);
        LiveScribe.Events.RemoveHandler(window, 'MSPointerMove', this.ScrubberMouseMoveDelegate);
    }
    else if (this.SupportsMouseEvents) {
        LiveScribe.Events.RemoveHandler(window, 'mouseup', this.ScrubberMouseUpDelegate);
        LiveScribe.Events.RemoveHandler(window, 'mousemove', this.ScrubberMouseMoveDelegate);

        if (this.SupportsTouchEvents) {
            LiveScribe.Events.RemoveHandler(window, 'touchmove', this.ScrubberMouseMoveDelegate);
            LiveScribe.Events.RemoveHandler(window, 'touchend', this.ScrubberMouseUpDelegate);
        }
    }

    if (this.OnScrubberMouseUp != null) {
        this.OnScrubberMouseUp(this.CurrentPercentComplete);
    }
};


LiveScribe.UI.SliderScrubberControl.prototype.MouseOverHandler = function (e) {
    e = e || window.event;

    if (e.stopPropagation) { e.stopPropagation(); }
    else { e.cancelBubble = true; }

    e.preventDefault();

    if (this.OnScrubberMouseOver != null) {
        this.OnScrubberMouseOver(this);
    }
};

LiveScribe.UI.SliderScrubberControl.prototype.MouseMoveHandler = function (e) {
    e = e || window.event;

    if (e.stopPropagation) { e.stopPropagation(); }
    else { e.cancelBubble = true; }

    e.preventDefault();
    
    var posX = e.clientX ? e.clientX : e.changedTouches[0].pageX;
    var posY = e.clientY ? e.clientY : e.changedTouches[0].pageY;

    var deltaX = posX - this.LastMousePositionX;
    var deltaY = posY - this.LastMousePositionY;

    this.LastMousePositionX = posX;
    this.LastMousePositionY = posY;

    var sliderCoordinate = new LiveScribe.UI.SliderControlMoveCoordinate();
    sliderCoordinate.PositionX = this.ScrubberElement.offsetLeft + deltaX;
    sliderCoordinate.PositionY = this.ScrubberElement.offsetTop + deltaY;

    this.Move(sliderCoordinate);

    if (this.OnScrubberMouseMove != null) {
        this.OnScrubberMouseMove(sliderCoordinate);
    }
};

LiveScribe.UI.SliderScrubberControl.prototype.WindowResizeHandler = function () {
    this.MaxConstraintX = this.SliderElement.clientWidth - this.ScrubberElement.clientWidth + 14;
    this.SliderWidth = this.SliderElement.clientWidth;
}

LiveScribe.UI.SliderScrubberControl.prototype.PlaybackCompleteHandler = function () {
    this.Reset();
}





//------------------------------------ Slider Control ------------------------------------
LiveScribe.UI.SliderControl = function (sliderElement, sliderprogressElement) {
    this.SliderElement = sliderElement;
    this.SliderProgressElement = sliderprogressElement;
    this.IsEnabled = false;
    this.CurrentPercentComplete = 0;

    this.SupportsMSPointerEvents = (window.navigator.msPointerEnabled) ? true : false;
    this.SupportsTouchEvents = ('ontouchstart' in this.SliderElement) ? true : false;
    this.SupportsMouseEvents = ('mousedown' in this.SliderElement) ? true : false;

    this.OnSliderPositionChange = null;

    this.SliderClickDelegate = LiveScribe.Events.CreateDelegate(this, this.ClickHandler);

    this.SliderElement.style.display = LiveScribe.UI.SliderDisplayState.HIDE;
};

LiveScribe.UI.SliderControl.prototype.Enable = function () {
    LiveScribe.Events.AddHandler(this.SliderElement, 'click', this.SliderClickDelegate);

    this.SliderElement.style.display = LiveScribe.UI.SliderDisplayState.DISPLAY;

    this.IsEnabled = true;

    if (this.OnSliderEnable != null) {
        this.OnSliderEnable(this);
    }
};

LiveScribe.UI.SliderControl.prototype.Disable = function () {
    LiveScribe.Events.RemoveHandler(this.SliderElement, 'click', this.SliderClickDelegate);

    this.SliderElement.style.display = LiveScribe.UI.SliderDisplayState.HIDE;

    this.IsEnabled = false;

    if (this.OnSliderDisable != null) {
        this.OnSliderDisable(this);
    }
};

LiveScribe.UI.SliderControl.prototype.UpdateProgress = function (percentComplete) {
    var progressWidth = percentComplete * this.SliderElement.clientWidth;
    this.SliderProgressElement.style.width = progressWidth + 'px';
    this.CurrentPercentComplete = percentComplete;
}

LiveScribe.UI.SliderControl.prototype.MoveToNewPosition = function (sliderCoordinate) {  
    var percentChange = (sliderCoordinate.PositionX - this.SliderElement.getBoundingClientRect().left) / this.SliderElement.clientWidth;
  
    if (this.OnSliderPositionChange != null) {
        this.OnSliderPositionChange(percentChange);
    }
};

LiveScribe.UI.SliderControl.prototype.GetPosition = function (e) {
    var sliderCoordinate = new LiveScribe.UI.SliderControlMoveCoordinate();

    if (this.SupportsMSPointerEvents) {
        sliderCoordinate.PositionX = e.clientX;
        sliderCoordinate.PositionY = e.clientY;
    }
    else if (this.SupportsTouchEvents) {
        if(e.touches){
            sliderCoordinate.PositionX = e.touches[0].pageX;
            sliderCoordinate.PositionY = e.touches[0].pageY;
        }
        else {
            sliderCoordinate.PositionX = e.pageX;
            sliderCoordinate.PositionY = e.pageY;
        }
    }
    else {
        sliderCoordinate.PositionX = e.clientX;
        sliderCoordinate.PositionY = e.clientY;
    }

    return sliderCoordinate;
};

LiveScribe.UI.SliderControl.prototype.Resize = function () {
    this.UpdateProgress(this.CurrentPercentComplete);
};

LiveScribe.UI.SliderControl.prototype.Reset = function () {
    this.SliderProgressElement.style.width = 0 + 'px';
    this.CurrentPercentComplete = 0;
};

LiveScribe.UI.SliderControl.prototype.ClickHandler = function (e) {
    e = e || window.event;

    var sliderCoordinate = this.GetPosition(e);
    this.MoveToNewPosition(sliderCoordinate);
};

LiveScribe.UI.SliderControl.prototype.PlaybackCompleteHandler = function () {
    this.Reset();
}



