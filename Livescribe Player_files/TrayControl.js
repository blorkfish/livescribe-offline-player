// ***********************************************************************************************************
// Name:Tray Control
// Type:User Control
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.UI = LiveScribe.UI || {};


LiveScribe.UI.TrayControlTriggerType = {
    OPEN: 0,
    CLOSE: 1,
    BOTH: 2,
    NONE: 3
}

LiveScribe.UI.HorizontalTrayControlAnchorDirection = {
    LEFT: 0,
    RIGHT: 1
}

LiveScribe.UI.VerticalTrayControlAnchorDirection = {
    TOP: 0,
    BOTOM: 1
}

LiveScribe.UI.TrayState = {
    OPEN: 0,
    CLOSED: 1,
    ANIMATING: 2
};

LiveScribe.UI.TrayStartState = {
    OPEN: true,
    CLOSED: false
};


LiveScribe.UI.TrayControlBase = function () {
    this.TrayElement = null;
    this.TrayState = null;

    this.OnOpenStart = null;
    this.OnOpenComplete = null;
    this.OnCloseStart = null;
    this.OnCloseComplete = null;

    this.OpenAnimation = null;
    this.CloseAnimation = null;
};

LiveScribe.UI.TrayControlBase.prototype.InitTrayControlBase = function (trayElement) {
    this.TrayElement = trayElement;
}

LiveScribe.UI.TrayControlBase.prototype.AddTrigger = function (trigger) {
    trigger.OnTriggerEvent = LiveScribe.Events.CreateDelegate(this, this.TriggerEventHandler);
}

LiveScribe.UI.TrayControlBase.prototype.Open = function () {
    if (this.OnOpenStart != null) {
        this.OnOpenStart();
    }

    this.TrayState = LiveScribe.UI.TrayState.ANIMATING;
    this.OpenAnimation.Start();
}

LiveScribe.UI.TrayControlBase.prototype.Close = function () {
    if (this.OnCloseStart != null) {
        this.OnCloseStart();
    }

    this.TrayState = LiveScribe.UI.TrayState.ANIMATING;
    this.CloseAnimation.Start();
}

LiveScribe.UI.TrayControlBase.prototype.TriggerEventHandler = function (triggerType) {
    if (this.TrayState == LiveScribe.UI.TrayState.ANIMATING) { return; }
    if (triggerType == LiveScribe.UI.TrayControlTriggerType.NONE) { return; }

    if (this.TrayState == LiveScribe.UI.TrayState.OPEN) {
        if (triggerType != LiveScribe.UI.TrayControlTriggerType.OPEN) {
            this.Close();
        }
    }
    else {
        if (triggerType != LiveScribe.UI.TrayControlTriggerType.CLOSE) {
            this.Open();
        }
    }
}

LiveScribe.UI.TrayControlBase.prototype.OpenComplete = function () {
    if (this.OnOpenComplete != null) {
        this.OnOpenComplete(this);
    }

    this.TrayState = LiveScribe.UI.TrayState.OPEN;
};

LiveScribe.UI.TrayControlBase.prototype.CloseComplete = function () {
    if (this.OnCloseComplete != null) {
        this.OnCloseComplete(this);
    }

    this.TrayState = LiveScribe.UI.TrayState.CLOSED;
};




LiveScribe.UI.HorizontalTrayControl = function (trayElement, direction, startState, trayWidth, trayActionTime, interval, acceleration) {
    this.InitTrayControlBase(trayElement);
    this.SetInitialState(startState, direction, trayWidth);

    this.OpenAnimation = new LiveScribe.Animation.HorizontalMoveByAnimation(this.TrayElement, trayWidth, trayActionTime, interval, acceleration);
    this.OpenAnimation.OnAnimationComplete = LiveScribe.Events.CreateDelegate(this, this.OpenComplete);

    this.CloseAnimation = new LiveScribe.Animation.HorizontalMoveByAnimation(this.TrayElement, -trayWidth, trayActionTime, interval, acceleration);
    this.CloseAnimation.OnAnimationComplete = LiveScribe.Events.CreateDelegate(this, this.CloseComplete);
};

LiveScribe.UI.HorizontalTrayControl.prototype = new LiveScribe.UI.TrayControlBase();

LiveScribe.UI.HorizontalTrayControl.prototype.SetInitialState = function (startState, direction, trayWidth) {

    if (startState) {
        this.TrayState = LiveScribe.UI.TrayState.OPEN;

        var trayPosition = (direction == LiveScribe.UI.HorizontalTrayControlAnchorDirection.LEFT) ? trayWidth : -trayWidth;
        this.TrayElement.style.left = trayPosition + 'px';
    }
    else {
        this.TrayState = LiveScribe.UI.TrayState.CLOSED;

        var trayPosition = (direction == LiveScribe.UI.HorizontalTrayControlAnchorDirection.RIGHT) ? -trayWidth : trayWidth;
        this.TrayElement.style.left = trayPosition + 'px';
    }
}





LiveScribe.UI.VerticalTrayControl = function (trayElement, direction, startState, trayHeight, trayActionTime, interval, acceleration) {
    this.InitTrayControlBase(trayElement);
    this.SetInitialState(startState, direction, trayHeight);

    this.OpenAnimation = new LiveScribe.Animation.VerticalMoveByAnimation(this.TrayElement, trayHeight, trayActionTime, interval, acceleration);
    this.OpenAnimation.OnAnimationComplete = LiveScribe.Events.CreateDelegate(this, this.OpenComplete);

    this.CloseAnimation = new LiveScribe.Animation.VerticalMoveByAnimation(this.TrayElement, -trayHeight, trayActionTime, interval, acceleration);
    this.CloseAnimation.OnAnimationComplete = LiveScribe.Events.CreateDelegate(this, this.CloseComplete);
};

LiveScribe.UI.VerticalTrayControl.prototype = new LiveScribe.UI.TrayControlBase();

LiveScribe.UI.VerticalTrayControl.prototype.SetInitialState = function (startState, direction, trayHeight) {
    if (startState) {
        this.TrayState = LiveScribe.UI.TrayState.OPEN;

        var trayPosition = direction == LiveScribe.UI.VerticalTrayControlAnchorDirection.TOP ? -trayHeight : trayHeight;
        this.TrayElement.style.top = trayPosition + 'px';
    }
    else {
        this.TrayState = LiveScribe.UI.TrayState.CLOSED;

        var trayPosition = direction == LiveScribe.UI.VerticalTrayControlAnchorDirection.BOTOM ? trayHeight : -trayHeight;
        this.TrayElement.style.top = trayPosition + 'px';
    }
}