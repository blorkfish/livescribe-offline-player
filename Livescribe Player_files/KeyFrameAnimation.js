// ***********************************************************************************************************
// Name: Animation Library
// Type: Library
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.Animation = LiveScribe.Animation || {};

//dependencies
//LiveScribe.EventHandling.js

LiveScribe.Animation.KeyFrameAnimationPlayerOperation = {
    PLAYER_STOP: 0,
    PLAYER_START: 1
};

LiveScribe.Animation.KeyFrameAnimationResizeDimension = {
    WIDTH: 0,
    HEIGHT: 1
};

LiveScribe.Animation.KeyFrameAnimationMozillaPlayerState = {
    HIDE: 0,
    SHOW: 1
};

LiveScribe.Animation.KeyFrameAnimationWmvPlayerState = {
    STOPPED: 1,
    PAUSED: 2,
    PLAYING: 3,
    BUFFERING: 6,
    WAITING: 7,
    TRANSITIONING: 9,
    READY: 10
}

LiveScribe.Animation.KeyFrameAnimationSilverlightPlayerState = {
    STOPPED: 'Stopped',
    PAUSED: 'Paused',
    PLAYING: 'Playing',
    BUFFERING: 'Buffering'
}

LiveScribe.Animation.KeyFrameAnimationEvent = {
    BEGIN: 0,
    PLAY: 1,
    PAUSE: 2,
    STOP: 3,
    END: 4,
    INTERVAL: 5,
    FLIP: 6
}


LiveScribe.Animation.KeyFrameAnimationIntervalEventArgs = function (elapsedTime, interval) {
    this.Interval = null;
    this.ElapsedTime = null;

    if (interval != null && interval != undefined) { this.Interval = interval; }
    if (elapsedTime != null && elapsedTime != undefined) { this.ElapsedTime = elapsedTime; }
}


LiveScribe.Animation.KeyFrameAnimationEventBase = function () {
    this.Events = new Array();

    this.Events[LiveScribe.Animation.KeyFrameAnimationEvent.BEGIN] = new Array();
    this.Events[LiveScribe.Animation.KeyFrameAnimationEvent.PLAY] = new Array();
    this.Events[LiveScribe.Animation.KeyFrameAnimationEvent.PAUSE] = new Array();
    this.Events[LiveScribe.Animation.KeyFrameAnimationEvent.STOP] = new Array();
    this.Events[LiveScribe.Animation.KeyFrameAnimationEvent.END] = new Array();
    this.Events[LiveScribe.Animation.KeyFrameAnimationEvent.INTERVAL] = new Array();
    this.Events[LiveScribe.Animation.KeyFrameAnimationEvent.FLIP] = new Array();
}

LiveScribe.Animation.KeyFrameAnimationEventBase.prototype.RegisterForEvent = function (eventType, delegate) {
    this.Events[eventType].push(delegate);
}

LiveScribe.Animation.KeyFrameAnimationEventBase.prototype.FireEvent = function (eventType, args) {
    var eventDelegates = this.Events[eventType];

    for (var index = 0; index < eventDelegates.length; index++) {
        if (eventDelegates[index] != null && eventDelegates[index] != undefined) {
            eventDelegates[index](args);
        }
    }
}



//********************************** KeyFrame Animation Controller Class *********************************************
LiveScribe.Animation.KeyFrameAnimationController = function (duration, interval) {
    this.m_AnimationDuration = duration;
    this.m_AnimationInterval = interval;
    this.m_AnimationStartTime = 0;
    this.m_AnimationElapsedTime = 0;
    this.m_AnimationTimer = null;
    this.m_AnimationState = null;
    this.m_AnimationRate = 1;

    this.Playing = false;
    this.Paused = false;

    this.m_AnimationIntervalDelegate = LiveScribe.Events.CreateDelegate(this, this.AnimationIntervalHandler);
}

LiveScribe.Animation.KeyFrameAnimationController.prototype = new LiveScribe.Animation.KeyFrameAnimationEventBase();

LiveScribe.Animation.KeyFrameAnimationController.prototype.FlipFrame = function (elapsedTime) {
    this.m_AnimationElapsedTime = elapsedTime;

    if (this.m_AnimationElapsedTime < this.m_AnimationDuration) {
        this.FireEvent(LiveScribe.Animation.KeyFrameAnimationEvent.FLIP, new LiveScribe.Animation.KeyFrameAnimationIntervalEventArgs(this.m_AnimationElapsedTime));
    }
    else {
        this.ResetAnimations();
        this.FireEvent(LiveScribe.Animation.KeyFrameAnimationEvent.END);
    }
}

LiveScribe.Animation.KeyFrameAnimationController.prototype.AnimationRate = function(newRate) {
  if (newRate != null) {
    this.m_AnimationRate = newRate;
  };

  return this.m_AnimationRate;
}

LiveScribe.Animation.KeyFrameAnimationController.prototype.ElapsedTime = function() {
  return this.m_AnimationElapsedTime;
}

LiveScribe.Animation.KeyFrameAnimationController.prototype.AnimationIntervalHandler = function () {
    var currentTime = Date.now() - this.m_AnimationStartTime;
    this.m_AnimationElapsedTime += this.m_AnimationInterval * this.AnimationRate();

    if (this.m_AnimationElapsedTime < (currentTime - 300)) {
        this.m_AnimationElapsedTime = currentTime;
    }

    if (this.m_AnimationElapsedTime < this.m_AnimationDuration) {
        this.FireEvent(LiveScribe.Animation.KeyFrameAnimationEvent.INTERVAL, new LiveScribe.Animation.KeyFrameAnimationIntervalEventArgs(this.m_AnimationElapsedTime));
    }
    else {
        this.ResetAnimations();
        this.FireEvent(LiveScribe.Animation.KeyFrameAnimationEvent.END);
    }
}

LiveScribe.Animation.KeyFrameAnimationController.prototype.AddAnimation = function (animation) {
    this.RegisterForEvent(LiveScribe.Animation.KeyFrameAnimationEvent.INTERVAL, LiveScribe.Events.CreateDelegate(animation, animation.KeyFrameAnimationIntervalHandler));
    this.RegisterForEvent(LiveScribe.Animation.KeyFrameAnimationEvent.FLIP, LiveScribe.Events.CreateDelegate(animation, animation.KeyFrameAnimationFlipFrameHandler));
}

LiveScribe.Animation.KeyFrameAnimationController.prototype.ResetAnimations = function () {
    clearInterval(this.m_AnimationTimer);
    this.m_AnimationElapsedTime = 0;
}

LiveScribe.Animation.KeyFrameAnimationController.prototype.Play = function () {
    if (this.Playing && !this.Paused) { return; }

    this.Playing = true;
    this.Paused = false;

    this.FireEvent(LiveScribe.Animation.KeyFrameAnimationEvent.PLAY);
    this.m_AnimationTimer = setInterval(this.m_AnimationIntervalDelegate, this.m_AnimationInterval);
    this.m_AnimationStartTime = Date.now();
}

LiveScribe.Animation.KeyFrameAnimationController.prototype.Pause = function () {
    this.Paused = true;

    clearInterval(this.m_AnimationTimer);
    this.FireEvent(LiveScribe.Animation.KeyFrameAnimationEvent.PAUSE);
}

LiveScribe.Animation.KeyFrameAnimationController.prototype.Stop = function () {
    this.Playing = false;
    this.Paused = false;

    this.ResetAnimations();
    this.FireEvent(LiveScribe.Animation.KeyFrameAnimationEvent.STOP);
}




//********************************** KeyFrame Animation Base Class *********************************************
LiveScribe.Animation.KeyFrameAnimationBase = function () {
    this.Name = null;
    this.VisualElement = null;
    this.StartTime = null;
    this.EndTime = null;
    this.ElapsedTime = null;
    this.Acceleration = null;
}

LiveScribe.Animation.KeyFrameAnimationBase.prototype.KeyFrameAnimationIntervalHandler = function (animationIntervalEventArgs) {
    this.UpdateAnimation(animationIntervalEventArgs.ElapsedTime);
}

LiveScribe.Animation.KeyFrameAnimationBase.prototype.KeyFrameAnimationFlipFrameHandler = function (animationIntervalEventArgs) {
    this.UpdateAnimation(animationIntervalEventArgs.ElapsedTime);
}

LiveScribe.Animation.KeyFrameAnimationBase.prototype.InitBase = function (name, startTime, endTime, acceleration) {
    this.Name = name;
    this.StartTime = startTime;
    this.EndTime = endTime;
    this.Acceleration = acceleration;
}

LiveScribe.Animation.KeyFrameAnimationBase.prototype.UpdateAnimation = function (elapsedTime) {
    this.ElapsedTime = elapsedTime;

    var percentChange = this.GetPercentChange();
    if (this.ElapsedTimeIsBetweenKeyFrames()) {
        this.Animate(percentChange);
    }
    else if (this.ElapsedTimeIsAfterKeyFrames()) {
        //this.Persist();
    }
}

LiveScribe.Animation.KeyFrameAnimationBase.prototype.ElapsedTimeIsBetweenKeyFrames = function () {
    if (this.StartTime <= this.ElapsedTime && this.EndTime >= this.ElapsedTime) {
        return true;
    }
    else {
        return false;
    }
}

LiveScribe.Animation.KeyFrameAnimationBase.prototype.ElapsedTimeIsAfterKeyFrames = function () {
    if (this.EndTime < this.ElapsedTime) {
        return true;
    }
    else {
        return false;
    }
}

LiveScribe.Animation.KeyFrameAnimationBase.prototype.GetPercentChange = function () {
    var duration = this.EndTime - this.StartTime;
    var elapsedTime = this.ElapsedTime - this.StartTime;
    var change = eval(this.Acceleration)
    return change;
}

LiveScribe.Animation.KeyFrameAnimationBase.prototype.Animate = function (percentChange) { };

LiveScribe.Animation.KeyFrameAnimationBase.prototype.Persist = function () { };





//********************************** KeyFrame Stroke Animation Class *********************************************
LiveScribe.Animation.KeyFrameStrokeAnimation = function (name, stroke, offsetX, offsetY, startTime, endTime, acceleration) {
    this.Stroke = stroke;
    this.OffsetX = offsetX;
    this.OffsetY = offsetY;
    this.OnAnimate = null;
    this.OnPersist = null;
    this.InitBase(name, startTime, endTime, acceleration);
};

LiveScribe.Animation.KeyFrameStrokeAnimation.prototype = new LiveScribe.Animation.KeyFrameAnimationBase();

LiveScribe.Animation.KeyFrameStrokeAnimation.prototype.Animate = function (percentChange) {
    if (percentChange <= 0) { return; }

    var pointCount = Math.round(this.Stroke.Points.length * percentChange);
    if (pointCount <= 0) { return; }

    if (this.OnAnimate != null && this.OnAnimate != undefined) {
        this.OnAnimate(this.Stroke, pointCount, this.OffsetX, this.OffsetY);
    }
};

LiveScribe.Animation.KeyFrameStrokeAnimation.prototype.Persist = function () {
    if (this.OnPersist != null && this.OnPersist != undefined) {
        this.OnPersist(this.Stroke, this.OffsetX, this.OffsetY);
    }
};




//********************************** KeyFrame Page Change Animation Class *********************************************
LiveScribe.Animation.KeyFramePageChangeAnimation = function (name, page, startTime, endTime, acceleration) {
    this.Page = page;
    this.OnAnimate = null;
    this.InitBase(name, startTime, endTime, acceleration);
}

LiveScribe.Animation.KeyFramePageChangeAnimation.prototype = new LiveScribe.Animation.KeyFrameAnimationBase();

LiveScribe.Animation.KeyFramePageChangeAnimation.prototype.Animate = function (percentChange) {
    if (this.OnAnimate != null && this.OnAnimate != undefined) {
        this.OnAnimate(this.Page);
    }
};
