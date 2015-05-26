// ***********************************************************************************************************
// Name:Control Objects
// Type:User Control
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.UI = LiveScribe.UI || {};


LiveScribe.UI.Trigger = function (triggerElement, triggerEvent, triggerType) {
    this.TriggerElement = triggerElement;
    this.TriggerEvent = triggerEvent;
    this.TriggerType = triggerType;

    this.OnTriggerEvent = null;
    this.OnTriggerEventWithArgs = null;

    LiveScribe.Events.AddHandler(this.TriggerElement, this.TriggerEvent, LiveScribe.Events.CreateDelegate(this, this.TriggerElementEventHandler));
    LiveScribe.Events.AddHandler(this.TriggerElement, this.TriggerEvent, LiveScribe.Events.CreateDelegate(this, this.TriggerElementEventWithArgsHandler));
};

LiveScribe.UI.Trigger.prototype.TriggerElementEventHandler = function () {
    if (this.OnTriggerEvent != null && this.OnTriggerEvent != undefined) {
        this.OnTriggerEvent(this.TriggerType);
    }
};

LiveScribe.UI.Trigger.prototype.TriggerElementEventWithArgsHandler = function (e) {
    if (this.OnTriggerEventWithArgs != null && this.OnTriggerEventWithArgs != undefined) {
        this.OnTriggerEventWithArgs(e);
    }
};