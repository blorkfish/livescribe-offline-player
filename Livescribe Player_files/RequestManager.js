// ***********************************************************************************************************
// Name:Request Manager
// Type:AJAX Request Library
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.Net = LiveScribe.Net || {};


LiveScribe.Net.RequestMethod = {
    GET: "GET",
    HEAD: "HEAD",
    POST: "POST"
}

LiveScribe.Net.RequestType = {
    ASYNCHRONOUS: true,
    SYNCHRONOUS: false
}

LiveScribe.Net.JSONRequestElementTagName = 'script';
LiveScribe.Net.JSONRequestElementType = 'text/javascript';




// Request Manager Collection
LiveScribe.Net.RequestManager = function () {
    this.Requests = new LiveScribe.Collections.NamedList();
};




//Request Object Base Class
LiveScribe.Net.RequestBase = function () {
    this.RequestMethod = null;
    this.RequestType = null;
    this.RequestURL = null;
    this.RequestCallBack = null;
    this.Username = null;
    this.Password = null;
    this.HTTPRequestObject = null;

    this.OnRequestError = null;
};

LiveScribe.Net.RequestBase.prototype.InitBase = function (requestURL, requestCallback, requestMethod, requestType, cors, username, password) {
    this.RequestMethod = requestMethod;
    this.RequestType = requestType;
    this.RequestURL = requestURL;
    this.RequestCallBack = requestCallback;
    this.CORS = cors;

    if (username != null && username != undefined) { this.Username = username; }
    if (password != null && password != undefined) { this.Password = password; }

    this.HTTPRequestObject = this.CreateHTTPRequestObject();

    this.OpenRequest();


    if (this.CORS) {
        this.HTTPRequestObject.setRequestHeader("Authorization", window.userId);
        this.HTTPRequestObject.setRequestHeader("Accept", "text/javascript, text/xml, */*");

        this.HTTPRequestObject.onload = LiveScribe.Events.CreateDelegate(this, this.RequestReadyStateHandler);
    }
    else {
        this.HTTPRequestObject.onreadystatechange = LiveScribe.Events.CreateDelegate(this, this.RequestReadyStateHandler);
    }


};

LiveScribe.Net.RequestBase.prototype.OpenRequest = function () {
    if (this.CORS && window.XDomainRequest) {
        try{
            this.HTTPRequestObject.open(this.RequestMethod, this.RequestURL);
        }
        catch (ex) {
            var error = ex.message;
        }
    }
    else {
        if (this.Username != null && this.Password != null) {
            this.HTTPRequestObject.open(this.RequestMethod, this.RequestURL, this.RequestType, this.Username, this.Password);
        }
        else {
            this.HTTPRequestObject.open(this.RequestMethod, this.RequestURL, this.RequestType);
        }
    }
};

LiveScribe.Net.RequestBase.prototype.SendRequest = function () {
    this.HTTPRequestObject.send();
};

LiveScribe.Net.RequestBase.prototype.CancelRequest = function () {
    this.HTTPRequestObject.abort();
};

LiveScribe.Net.RequestBase.prototype.RequestReadyStateHandler = function () { };

LiveScribe.Net.RequestBase.prototype.CreateHTTPRequestObject = function () {
    var xmlhttp = null;

    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    }
    else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    return xmlhttp;
};



// XML Request Object
LiveScribe.Net.XMLRequest = function (requestURL, requestCallback, cors, username, password) {
    this.InitBase(requestURL, requestCallback, LiveScribe.Net.RequestMethod.GET, LiveScribe.Net.RequestType.ASYNCHRONOUS, cors, username, password);
};

LiveScribe.Net.XMLRequest.prototype = new LiveScribe.Net.RequestBase();

LiveScribe.Net.XMLRequest.prototype.RequestReadyStateHandler = function () {
    var response = null;

    if (this.HTTPRequestObject.readyState != 4) {
        return;
    }

    if (this.HTTPRequestObject.status == 200) {
        response = this.HTTPRequestObject.responseText;
        this.RequestCallBack(response);
    } else {
        if (this.OnRequestError != null) {
            this.OnRequestError();
        }
    }



};



// JSON Request Object
LiveScribe.Net.JSONRequest = function (requestURL, requestCallback, cors, username, password) {
    this.InitBase(requestURL, requestCallback, LiveScribe.Net.RequestMethod.GET, LiveScribe.Net.RequestType.ASYNCHRONOUS, cors, username, password);
};

LiveScribe.Net.JSONRequest.prototype = new LiveScribe.Net.RequestBase();

LiveScribe.Net.JSONRequest.prototype.RequestReadyStateHandler = function () {
    var response = null;

    if (this.HTTPRequestObject.readyState != 4) {
        return;
    }

    if (this.HTTPRequestObject.status == 200) {
        response = this.HTTPRequestObject.response || this.HTTPRequestObject.responseText;
        this.RequestCallBack(response);
    } else {
        if (this.OnRequestError != null) {
            this.OnRequestError();
        }
    }
};



// Asset Request Object
LiveScribe.Net.AssetRequest = function (requestURL, requestCallback, cors, username, password) {
    this.InitBase(requestURL, requestCallback, LiveScribe.Net.RequestMethod.GET, LiveScribe.Net.RequestType.ASYNCHRONOUS, cors, username, password);
};

LiveScribe.Net.AssetRequest.prototype = new LiveScribe.Net.RequestBase();

LiveScribe.Net.AssetRequest.prototype.RequestReadyStateHandler = function () {
    var response = null;

    if (this.HTTPRequestObject.readyState != 4) {
        return;
    }

    if (this.HTTPRequestObject.status == 200) {
        response = this.HTTPRequestObject.responseText;
        this.RequestCallBack(response);
    } else {
        if (this.OnRequestError != null) {
            this.OnRequestError();
        }
    }
};



// SOAP Request Object
LiveScribe.Net.SOAPRequest = function (requestURL, requestCallback, cors) {
    this.InitBase(requestURL, requestCallback, RequestMethod.POST, LiveScribe.Net.RequestType.ASYNCHRONOUS, cors);

    this.HTTPRequestObject.setRequestHeader("Man", "POST " + this.RequestURL + " HTTP/1.1");
    this.HTTPRequestObject.setRequestHeader("MessageType", "CALL");
    this.HTTPRequestObject.setRequestHeader("Content-Type", "text/xml");
};

LiveScribe.Net.SOAPRequest.prototype = new LiveScribe.Net.RequestBase();

LiveScribe.Net.SOAPRequest.prototype.RequestReadyStateHandler = function () {
    var response = null;

    if (this.HTTPRequestObject.readyState == 4) {
        response = this.HTTPRequestObject.responseText;
    }

    this.RequestCallBack(response); var response = this.HTTPRequestObject.responseText;
    this.RequestCallBack(response);
};



// Header Request Object
LiveScribe.Net.HeadRequest = function (requestURL, requestCallback, cors) {
    this.InitBase(requestURL, requestCallback, LiveScribe.Net.RequestMethod.HEAD, LiveScribe.Net.RequestType.ASYNCHRONOUS, cors);
};

LiveScribe.Net.HeadRequest.prototype = new LiveScribe.Net.RequestBase();

LiveScribe.Net.HeadRequest.prototype.RequestReadyStateHandler = function () {
    var response = null;

    if (this.HTTPRequestObject.readyState == 4) {
        response = this.HTTPRequestObject.getAllResponseHeaders();
    }

    this.RequestCallBack(response);
};



// JSONP Request Object
LiveScribe.Net.JSONPRequest = function (requestURL, requestCallback) {
    this.RequestURL = null;
    this.RequestCallBack = null;

    if (requestURL != null && requestURL != '') { this.RequestURL = requestURL };
    if (requestCallback != null && requestCallback != '') { this.RequestCallBack = requestCallback };

    this.CallbackScriptElement = null;
    this.CallbackObject = null;
};

LiveScribe.Net.JSONPRequest.prototype.SendRequest = function () {
    var jsonpCallBackHandlerName = "jsonpCallbackHandler" + new Date().getTime();

    //this.CreateCallbackScriptElement(jsonpCallBackHandlerName);
    this.CreateRequestScriptElement(jsonpCallBackHandlerName);
};

LiveScribe.Net.JSONPRequest.prototype.CancelRequest = function () {
    this.CallbackObject.ResponseCallback = function () { };
};

LiveScribe.Net.JSONPRequest.prototype.CreateRequestScriptElement = function (callback) {
    var requestElement = document.createElement(LiveScribe.Net.JSONRequestElementTagName);
    requestElement.type = LiveScribe.Net.JSONRequestElementType;
    requestElement.src = this.RequestURL + "&callback=" + this.RequestCallBack;

    var documentBody = document.body;
    documentBody.appendChild(requestElement);
};

LiveScribe.Net.JSONPRequest.prototype.CreateCallbackScriptElement = function (callback) {
    var callbackScript = "var " + callback + " = new LiveScribe.Net.JSONPCallBackHandler();";

    this.CallbackScriptElement = document.createElement(LiveScribe.Net.JSONRequestElementTagName);
    this.CallbackScriptElement.type = LiveScribe.Net.JSONRequestElementType;
    this.CallbackScriptElement.innerHTML = callbackScript;

    document.body.appendChild(this.CallbackScriptElement);

    this.CallbackObject = eval(callback);
    this.CallbackObject.RequestCallBack = LiveScribe.CreateDelegate(this, this.RequestReadyStateHandler);
};

LiveScribe.Net.JSONPRequest.prototype.RequestReadyStateHandler = function (response) {
    this.RequestCallBack(response);
};

LiveScribe.Net.JSONPCallBackHandler = function () {
    this.ResponseCallback = null;
}

LiveScribe.Net.GetRemoteResourceAsArrayBuffer = function(requestURL, loadCallback, progressCallback) {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', requestURL, true);
  xhr.responseType = 'arraybuffer';
  xhr.onprogress = progressCallback;
  xhr.onload = function(progressEvent) {
    loadCallback(progressEvent.target.response);
  }

  xhr.send();
}
