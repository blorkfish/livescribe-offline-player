// ***********************************************************************************************************
// Name: Custom Event Handling Base Class
// Type: Base Class
// Author: Cliff Gower
//************************************************************************************************************

//dependencies
//Collections.NamedList.js

var LiveScribe = LiveScribe || {};
LiveScribe.Events = LiveScribe.Events || {};

LiveScribe.Events.CustomEventHandlingBase = function () {
    this.Events = new LiveScribe.Collections.NamedList();
}

LiveScribe.Events.CustomEventHandlingBase.prototype.AddEvent = function (event) {
    var eventHandlerList = new LiveScribe.Collections.NamedList();
    this.Events.Add(event, eventHandlerList);
};

LiveScribe.Events.CustomEventHandlingBase.prototype.RemoveEvent = function (event) {
    this.Events.Remove(event);
};

LiveScribe.Events.CustomEventHandlingBase.prototype.RegisterEventHandler = function (eventHandler) {
    if (this.Events.Item(eventHandler.Event) == null || this.Events.Item(eventHandler.Event) == undefined) {
        this.AddEvent(eventHandler.Event);
    }

    this.Events.Item(eventHandler.Event).Add(eventHandler.Name, eventHandler);
};

LiveScribe.Events.CustomEventHandlingBase.prototype.UnregisterEventHandler = function (eventHandlerName, event) {
    this.Events.Item(event).Remove(eventHandlerName);
};

LiveScribe.Events.CustomEventHandlingBase.prototype.FireEvent = function (event, eventArgs) {
    var eventToFire = this.Events.Item(event);
    for (var index = 0; index < eventToFire.Count() ; index++) {
        eventToFire.ItemAt(index).Delegate(eventArgs);
    }
};


LiveScribe.Events.CustomEventHandler = function (name, event, delegate) {
    this.Name = null;
    this.Event = null;
    this.Delegate = null;

    if (name != null && name != undefined) {
        this.Name = name;
    }

    if (event != null && event != undefined) {
        this.Event = event;
    }

    if (delegate != null && delegate != undefined) {
        this.Delegate = delegate;
    }
}


