var LiveScribe = LiveScribe || {};
LiveScribe.Events = LiveScribe.Events || {};

//*********************** Event Handler Creation ***************************
LiveScribe.Events.AddHandler = function (object, eventName, handler) {
    if (object.addEventListener) { object.addEventListener(eventName, handler, false); }
    else { object.attachEvent("on" + eventName, handler); }
};

LiveScribe.Events.RemoveHandler = function (object, eventName, handler) {
    if (object.removeEventListener) { object.removeEventListener(eventName, handler, false); }
    else { object.detachEvent("on" + eventName, handler); }
};

LiveScribe.Events.AddWheelHandler = function (object, handler) {
    if (object.addEventListener) {
        object.addEventListener('DOMMouseScroll', handler, false);
        object.addEventListener('mousewheel', handler, false);
    }
    else {
        object.attachEvent("onmousewheel", handler);
    }
};

LiveScribe.Events.RemoveWheelHandler = function (object, handler) {
    if (object.removeEventListener) {
        object.removeEventListener('DOMMouseScroll', handler, false);
        object.removeEventListener('mousewheel', handler, false);
    }
    else {
        object.detachEvent("onmousewheel", handler);
    }
};

LiveScribe.Events.CreateDelegate = function (object, method) {

    return (function () {
        //try{
            return method.apply(object, arguments);
        //}
        //catch (exception) {
        //    console.log(exception.name)
        //    console.log(exception.message)
        //    console.log(exception.description)
        //}
    })
};
