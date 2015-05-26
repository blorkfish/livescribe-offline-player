// ***********************************************************************************************************
// Name: Animations Library
// Type:User Library
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.Animation = LiveScribe.Animation || {};

//***********************  Animation Abstract Class ***************************
LiveScribe.Animation.AnimationBase = function () {
    this.m_Element = null;
    this.m_Duration = null;
    this.m_Interval = null;
    this.m_AccelerationType = null;
    this.m_StartTime = null;
    this.m_Timer = null;

    this.OnAnimationStart = null;
    this.OnAnimationStop = null;
    this.OnAnimationComplete = null;
    this.OnAnimationTick = null;
}

LiveScribe.Animation.AnimationBase.prototype.InitBase = function (element, duration, interval, acceleration) {
    this.m_Element = element;
    this.m_Duration = duration;
    this.m_Interval = interval;
    this.m_AccelerationType = acceleration;
}

LiveScribe.Animation.AnimationBase.prototype.Start = function () {
    if (this.OnAnimationStart != null) {
        this.OnAnimationStart();
    }

    this.InitAnimation();

    this.m_StartTime = 0;
    this.m_Timer = setInterval(LiveScribe.Events.CreateDelegate(this, this.TimerIntervalHandler), this.m_Interval);
}

LiveScribe.Animation.AnimationBase.prototype.Stop = function () {
    this.Reset();

    if (this.OnAnimationStop != null) {
        this.OnAnimationStop();
    }
}

LiveScribe.Animation.AnimationBase.prototype.Reset = function () {
    clearInterval(this.m_Timer);
    this.m_Timer = null;
}

LiveScribe.Animation.AnimationBase.prototype.AnimationComplete = function () {
    this.Reset();

    if (this.OnAnimationComplete != null) {
        this.OnAnimationComplete();
    }
}

LiveScribe.Animation.AnimationBase.prototype.GetPercentChange = function (elapsedTime) {
    var duration = this.m_Duration;

    var change = eval(this.m_AccelerationType)
    return change;
}

LiveScribe.Animation.AnimationBase.prototype.InitAnimation = function () { }

LiveScribe.Animation.AnimationBase.prototype.Animate = function (percentChange) { }

LiveScribe.Animation.AnimationBase.prototype.TimerIntervalHandler = function () {
    var elapsedTime = (this.m_StartTime += this.m_Interval);

    var percentChange = this.GetPercentChange(elapsedTime);
    this.Animate(percentChange);

    if (this.OnAnimationTick != null) {
        this.OnAnimationTick();
    }

    if (elapsedTime >= this.m_Duration) {
        this.AnimationComplete();
    }
}





//*********************** Resize Animation ***************************
LiveScribe.Animation.ResizeAnimation = function (element, endWidth, endHeight, duration, interval, acceleration) {
    this.m_StartWidth = null;
    this.m_StartHeight = null;
    this.m_EndWidth = endWidth;
    this.m_EndHeight = endHeight;

    this.m_ChangeWidth = null;
    this.m_ChangeHeight = null;

    this.InitBase(element, duration, interval, acceleration);
}

LiveScribe.Animation.ResizeAnimation.prototype = new LiveScribe.Animation.AnimationBase();

LiveScribe.Animation.ResizeAnimation.prototype.InitAnimation = function () {
    this.m_StartWidth = this.m_Element.clientWidth;
    this.m_StartHeight = this.m_Element.clientHeight;

    this.m_ChangeWidth = this.m_EndWidth - this.m_StartWidth;
    this.m_ChangeHeight = this.m_EndHeight - this.m_StartHeight;
}

LiveScribe.Animation.ResizeAnimation.prototype.Animate = function (percentChange) {
    this.m_Element.style.height = Math.abs(Math.round(this.m_StartHeight + (percentChange * this.m_ChangeHeight))) + 'px';
    this.m_Element.style.width = Math.abs(Math.round(this.m_StartWidth + (percentChange * this.m_ChangeWidth))) + 'px';
}




//*********************** Move Animation ***************************
LiveScribe.Animation.MoveAnimation = function (element, endPosX, endPosY, duration, interval, acceleration) {
    this.m_StartPosX = null;
    this.m_StartPosY = null;
    this.m_EndPosX = endPosX;
    this.m_EndPosY = endPosY;

    this.m_ChangeInPosX = null;
    this.m_ChangeInPosY = null;

    this.InitBase(element, duration, interval, acceleration);
}

LiveScribe.Animation.MoveAnimation.prototype = new LiveScribe.Animation.AnimationBase();

LiveScribe.Animation.MoveAnimation.prototype.InitAnimation = function () {
    this.m_StartPosX = this.m_Element.offsetLeft;
    this.m_StartPosY = this.m_Element.offsetTop;

    this.m_ChangeInPosX = this.m_EndPosX - this.m_StartPosX;
    this.m_ChangeInPosY = this.m_EndPosY - this.m_StartPosY;
}

LiveScribe.Animation.MoveAnimation.prototype.Animate = function (percentChange) {
    this.m_Element.style.left = Math.round(this.m_StartPosX + (percentChange * this.m_ChangeInPosX)) + 'px';
    this.m_Element.style.top = Math.round(this.m_StartPosY + (percentChange * this.m_ChangeInPosY)) + 'px';
}


//*********************** Move By Animation ***************************
LiveScribe.Animation.MoveByAnimation = function (element, changeInPosX, changeInPosY, duration, interval, acceleration) {
    this.m_StartPosX = null;
    this.m_StartPosY = null;
    this.m_ChangeInPosX = changeInPosX;
    this.m_ChangeInPosY = changeInPosY;

    this.InitBase(element, duration, interval, acceleration);
}

LiveScribe.Animation.MoveAnimation.prototype = new LiveScribe.Animation.AnimationBase();

LiveScribe.Animation.MoveAnimation.prototype.InitAnimation = function () {
    this.m_StartPosX = this.m_Element.offsetLeft;
    this.m_StartPosY = this.m_Element.offsetTop;
}

LiveScribe.Animation.MoveAnimation.prototype.Animate = function (percentChange) {
    this.m_Element.style.left = Math.round(this.m_StartPosX + (percentChange * this.m_ChangeInPosX)) + 'px';
    this.m_Element.style.top = Math.round(this.m_StartPosY + (percentChange * this.m_ChangeInPosY)) + 'px';
}



//*********************** Horizontal Move Animation ***************************
LiveScribe.Animation.HorizontalMoveAnimation = function (element, endPosX, duration, interval, acceleration) {
    this.m_StartPosX = null;
    this.m_EndPosX = endPosX;

    this.InitBase(element, duration, interval, acceleration);
}

LiveScribe.Animation.HorizontalMoveAnimation.prototype = new LiveScribe.Animation.AnimationBase();

LiveScribe.Animation.HorizontalMoveAnimation.prototype.InitAnimation = function () {
    this.m_StartPosX = this.m_Element.offsetLeft;
    this.m_ChangeInPosX = this.m_EndPosX - this.m_StartPosX;
}

LiveScribe.Animation.HorizontalMoveAnimation.prototype.Animate = function (percentChange) {
    this.m_Element.style.left = Math.round(this.m_StartPosX + (percentChange * this.m_ChangeInPosX)) + 'px';
}



//*********************** Horizontal Move By Animation ***************************
LiveScribe.Animation.HorizontalMoveByAnimation = function (element, changeInPosX, duration, interval, acceleration) {
    this.m_StartPosX = null;
    this.m_ChangeInPosX = changeInPosX;

    this.InitBase(element, duration, interval, acceleration);
}

LiveScribe.Animation.HorizontalMoveByAnimation.prototype = new LiveScribe.Animation.AnimationBase();

LiveScribe.Animation.HorizontalMoveByAnimation.prototype.InitAnimation = function () {
    this.m_StartPosX = this.m_Element.offsetLeft;
}

LiveScribe.Animation.HorizontalMoveByAnimation.prototype.Animate = function (percentChange) {
    this.m_Element.style.left = Math.round(this.m_StartPosX + (percentChange * this.m_ChangeInPosX)) + 'px';
}



//*********************** Vertical Move Animation ***************************
LiveScribe.Animation.VerticalMoveAnimation = function (element, endPosY, duration, interval, acceleration) {
    this.m_StartPosY = null
    this.m_EndPosY = endPosY;
    this.m_ChangeInPosY = null;

    this.InitBase(element, duration, interval, acceleration);
}

LiveScribe.Animation.VerticalMoveAnimation.prototype = new LiveScribe.Animation.AnimationBase();

LiveScribe.Animation.VerticalMoveAnimation.prototype.InitAnimation = function () {
    this.m_StartPosY = this.m_Element.offsetTop;
    this.m_ChangeInPosY = this.m_EndPosY - this.m_StartPosY;
}

LiveScribe.Animation.VerticalMoveAnimation.prototype.Animate = function (percentChange) {
    this.m_Element.style.top = Math.round(this.m_StartPosY + (percentChange * this.m_ChangeInPosY)) + 'px';
}



//*********************** Vertical Move Animation ***************************
LiveScribe.Animation.VerticalMoveByAnimation = function (element, changeInPosY, duration, interval, acceleration) {
    this.m_StartPosY = null
    this.m_ChangeInPosY = changeInPosY;

    this.InitBase(element, duration, interval, acceleration);
}

LiveScribe.Animation.VerticalMoveByAnimation.prototype = new LiveScribe.Animation.AnimationBase();

LiveScribe.Animation.VerticalMoveByAnimation.prototype.InitAnimation = function () {
    this.m_StartPosY = this.m_Element.offsetTop;
}

LiveScribe.Animation.VerticalMoveByAnimation.prototype.Animate = function (percentChange) {
    this.m_Element.style.top = Math.round(this.m_StartPosY + (percentChange * this.m_ChangeInPosY)) + 'px';
}



//*********************** Opacity Animation ***************************
LiveScribe.Animation.OpacityAnimation = function (element, endOpacity, duration, interval, acceleration) {
    this.m_StartOpacity = null;
    this.m_EndOpacity = endOpacity;
    this.m_ChangeOpacity = null;

    this.InitBase(element, duration, interval, acceleration);
}

LiveScribe.Animation.OpacityAnimation.prototype = new LiveScribe.Animation.AnimationBase();

LiveScribe.Animation.OpacityAnimation.prototype.InitAnimation = function () {
    this.m_StartOpacity = LiveScribe.Animation.GetOpacity(this.m_Element);
    this.m_ChangeOpacity = this.m_EndOpacity - this.m_StartOpacity;
}

LiveScribe.Animation.OpacityAnimation.prototype.Animate = function (percentChange) {
    var newOpacity = Math.round(this.m_StartOpacity + (percentChange * this.m_ChangeOpacity));
    this.m_Element.style.filter = 'alpha(opacity=' + (newOpacity * 10) + ')';
    this.m_Element.style.opacity = newOpacity / 10;
}




//*********************** Color Animation ***************************
LiveScribe.Animation.ColorAnimation = function (element, endColor, duration, interval, acceleration) {
    this.m_StartColor = null;
    this.m_EndColor = endColor;
    this.m_ChangeColor = new LiveScribe.Animation.RGB(null, null, null);

    this.InitBase(element, duration, interval, acceleration);
}

LiveScribe.Animation.ColorAnimation.prototype = new LiveScribe.Animation.AnimationBase();

LiveScribe.Animation.ColorAnimation.prototype.InitAnimation = function () {
    this.m_StartColor = LiveScribe.Animation.GetColor(this.m_Element);
    this.m_ChangeColor.Red = this.m_EndColor.RGB().Red - this.m_StartColor.RGB().Red;
    this.m_ChangeColor.Green = this.m_EndColor.RGB().Green - this.m_StartColor.RGB().Green;
    this.m_ChangeColor.Blue = this.m_EndColor.RGB().Blue - this.m_StartColor.RGB().Blue;
}

LiveScribe.Animation.ColorAnimation.prototype.Animate = function (percentChange) {
    var newColorRgb = new LiveScribe.Animation.RGB(null, null, null);
    newColorRgb.Red = Math.round(this.m_StartColor.RGB().Red + (percentChange * this.m_ChangeColor.Red));
    newColorRgb.Green = Math.round(this.m_StartColor.RGB().Green + (percentChange * this.m_ChangeColor.Green));
    newColorRgb.Blue = Math.round(this.m_StartColor.RGB().Blue + (percentChange * this.m_ChangeColor.Blue));

    var newColor = new LiveScribe.Animation.Color();
    newColor.RGB(newColorRgb);

    this.m_Element.style.backgroundColor = newColor.Web();
}