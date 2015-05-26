var LiveScribe = LiveScribe || {};
LiveScribe.Web = LiveScribe.Web || {};


LiveScribe.Web.ContextFormFactorType = {
    MOBILE: 0,
    DESKTOP: 1
};

LiveScribe.Web.ContextDeviceType = {
    IPHONE: 0,
    IPAD: 1,
    IPOD: 2,
    ANDROID: 3,
    WEB_OS: 4,
    WINDOWS_PHONE: 5,
    WINDOWS_DESKTOP: 6,
    MAC: 7
};

LiveScribe.Web.ContextPlatformType = {
    ANDROID: "Android",
    IOS: "iOS",
    IOS1: "iOS1",
    IOS2: "iOS2",
    IOS3: "iOS3",
    IOS4: "iOS4",
    IOS5: "iOS5",
    IOS6: "iOS6",
    IOS7: "iOS7",
    MAC: "Mac",
    CHROME_OS: "chromeOS",
    WEB_OS: "webOS",
    WINDOWS_PHONE: "Windows Phone",
    WINDOWS_PHONE: "Windows Phone 7",
    WINDOWS_PHONE: "Windows Phone 8",
    WINDOWS_DESKTOP: "Windows",
};

LiveScribe.Web.ContextBrowserType = {
    IE6: "IE6",
    IE7: "IE7",
    IE8: "IE8",
    IE9: "IE9",
    IE10: "IE10",
    IE11: "IE11",
    SAFARI: "Safari",
    CHROME: "Chrome",
    FIREFOX: "Firefox"
};


LiveScribe.Web.Context = function () {
    this.URL = location.href;
    this.Host = location.host;
    this.HostName = location.hostname;
    this.PathName = location.pathname;
    this.Port = location.port;
    this.Protocol = location.protocol;
    this.ReferringURL = document.referrer;
    this.Browser = navigator.appName;
    this.BrowserVersion = navigator.appVersion;
    this.Language = navigator.browserLanguage || navigator.language;
    this.Plugins = navigator.plugins;
    this.Platform = navigator.platform;
    this.UserAgent = navigator.userAgent;
    this.QueryString = null;
    this.QueryStringParameters = null;
    this.QueryStringParameterCount = 0;

    this.ParseURL();
};

LiveScribe.Web.Context.prototype.ParseURL = function () {
    if (this.URL.indexOf("?") > -1) {
        this.Location = this.URL.split("?")[0];
        this.QueryString = this.URL.split("?")[1];
    }

    if (this.QueryString != null) {
        this.QueryStringParameters = new Array();

        var parameterStrings = this.QueryString.split(";");

        for (var index = 0; index < parameterStrings.length; index++) {
            var parameterParts = parameterStrings[index].split("=");
            this.QueryStringParameters[parameterParts[0]] = parameterParts[1];
            this.QueryStringParameterCount++;
        }
    }
};

LiveScribe.Web.Context.prototype.ParameterExists = function (parameterName) {
    if (this.QueryStringParameters[parameterName] != null
        && this.QueryStringParameters[parameterName] != undefined) {
        return true;
    }
    else {
        return false;
    }
};

LiveScribe.Web.Context.prototype.GetParameter = function (parameterName) {
    if (this.ParameterExists(parameterName)) {
        return this.QueryStringParameters[parameterName];
    }
    else {
        return null;
    }
};

LiveScribe.Web.Context.prototype.GetFormFactorType = function () {
    if (this.IsiPad() || this.IsiPod() || this.IsiPhone()) {
        return LiveScribe.Web.ContextFormFactorType.MOBILE
    }
    if (this.IsAndroid()) { return LiveScribe.Web.ContextFormFactorType.MOBILE; }
    if (this.IsWebOS()) { return LiveScribe.Web.ContextFormFactorType.MOBILE; }
    if (this.IsWindowsPhone()) { return LiveScribe.Web.ContextFormFactorType.MOBILE; }
    if (this.IsWindowsDesktop()) { return LiveScribe.Web.ContextFormFactorType.DESKTOP; }
    if (this.IsMacDesktop()) { return LiveScribe.Web.ContextFormFactorType.DESKTOP; }
};

LiveScribe.Web.Context.prototype.GetPlatformType = function () {

    if (this.IsChromeOS()) { return LiveScribe.Web.ContextPlatformType.CHROME_OS}
    if (this.IsiPad() || this.IsiPod() || this.IsiPhone()) {
        return LiveScribe.Web.ContextPlatformType.IOS
    }
    if (this.IsAndroid()) { return LiveScribe.Web.ContextPlatformType.ANDROID; }
    if (this.IsWebOS()) { return LiveScribe.Web.ContextPlatformType.WEB_OS; }
    if (this.IsWindowsPhone()) { return LiveScribe.Web.ContextPlatformType.WINDOWS_PHONE; }
    if (this.IsWindowsDesktop()) { return LiveScribe.Web.ContextPlatformType.WINDOWS_DESKTOP; }
    if (this.IsMacDesktop()) { return LiveScribe.Web.ContextPlatformType.MAC; }
};

LiveScribe.Web.Context.prototype.GetiOSPlatformVersion = function () {
    if (this.IsiOS1) { return LiveScribe.Web.ContextPlatformType.IOS1 }
    if (this.IsiOS2) { return LiveScribe.Web.ContextPlatformType.IOS2 }
    if (this.IsiOS3) { return LiveScribe.Web.ContextPlatformType.IOS3 }
    if (this.IsiOS4) { return LiveScribe.Web.ContextPlatformType.IOS4 }
    if (this.IsiOS5) { return LiveScribe.Web.ContextPlatformType.IOS5 }
    if (this.IsiOS6) { return LiveScribe.Web.ContextPlatformType.IOS6 }
    if (this.IsiOS7) { return LiveScribe.Web.ContextPlatformType.IOS7 }
};

LiveScribe.Web.Context.prototype.GetDeviceType = function () {
    if (this.IsiPad()) { return LiveScribe.Web.ContextDeviceType.IPAD; }
    if (this.IsiPod()) { return LiveScribe.Web.ContextDeviceType.IPOD; }
    if (this.IsiPhone()) { return LiveScribe.Web.ContextDeviceType.IPHONE; }
    if (this.IsAndroid()) { return LiveScribe.Web.ContextDeviceType.ANDROID; }
    if (this.IsWebOS()) { return LiveScribe.Web.ContextDeviceType.WEB_OS; }
    if (this.IsWindowsPhone()) { return LiveScribe.Web.ContextDeviceType.WINDOWS_PHONE; }
    if (this.IsWindowsDesktop()) { return LiveScribe.Web.ContextDeviceType.WINDOWS_DESKTOP; }
    if (this.IsMacDesktop()) { return LiveScribe.Web.ContextDeviceType.MAC; }
};

LiveScribe.Web.Context.prototype.GetBrowserType = function () {
    if (this.IsIE6()) { return LiveScribe.Web.ContextBrowserType.IE6; }
    if (this.IsIE7()) { return LiveScribe.Web.ContextBrowserType.IE7; }
    if (this.IsIE8()) { return LiveScribe.Web.ContextBrowserType.IE8; }
    if (this.IsIE9()) { return LiveScribe.Web.ContextBrowserType.IE9; }
    if (this.IsIE10()) { return LiveScribe.Web.ContextBrowserType.IE10; }
    if (this.IsIE11()) { return LiveScribe.Web.ContextBrowserType.IE11; }
    if (this.IsChrome()) { return LiveScribe.Web.ContextBrowserType.CHROME; }
    if (this.IsSafari()) { return LiveScribe.Web.ContextBrowserType.SAFARI; }
    if (this.IsFireFox()) { return LiveScribe.Web.ContextBrowserType.FIREFOX; }
};



LiveScribe.Web.Context.prototype.IsIE6 = function () {
    return /MSIE (6)/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsIE7 = function () {
    return /MSIE (7)/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsIE8 = function () {
    return /MSIE (8)/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsIE9 = function () {
    return /MSIE (9)/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsIE10 = function () {
    //return /rv:10.0/.test(navigator.userAgent) ? true : false;
    return /MSIE 10/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsIE11 = function () {
    return /rv:11.0/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsFireFox = function () {
    return /Firefox/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsSafari = function () {
    if (/Chrome/.test(navigator.userAgent)) { return false;}
    if (/Safari/.test(navigator.userAgent)) { return true;}
};

LiveScribe.Web.Context.prototype.IsSafari7 = function () {
    return /7.(\d).(\d) Safari/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsChrome = function () {
    return /Chrome/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsChrome31or = function () {
    return /Chrome/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsiPad = function () {
    return /iPad/.test(navigator.platform) ? true : false;
};

LiveScribe.Web.Context.prototype.IsiPhone = function () {
    return /iPhone/.test(navigator.platform) ? true : false;
};

LiveScribe.Web.Context.prototype.IsiPod = function () {
    return /iPod/.test(navigator.platform) ? true : false;
};

LiveScribe.Web.Context.prototype.IsiOS = function () {
    if (this.IsiPad() || this.IsiPod() || this.IsiPhone()) { return true; }
    else { return false; }
};

LiveScribe.Web.Context.prototype.IsiOS1 = function () {
    return /OS 1_0/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsiOS2 = function () {
    return /OS 2_0/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsiOS3 = function () {
    return /OS 3_0/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsiOS4 = function () {
    return /OS 4_0/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsiOS5 = function () {
    return /OS 5_0/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsiOS6 = function () {
    return /OS 6_0/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsiOS7 = function () {
    return /OS 7_0/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsAndroid = function () {
    return /Android/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.IsWebOS = function () {
    return /webOS/.test(navigator.platform) ? true : false;
};

LiveScribe.Web.Context.prototype.IsWindowsPhone = function () {
    return /Windows Phone/.test(navigator.platform) ? true : false;
};

LiveScribe.Web.Context.prototype.IsWindowsDesktop = function () {
    return /Win/.test(navigator.appVersion) ? true : false;
};

LiveScribe.Web.Context.prototype.IsMacDesktop = function () {
    return /Mac/.test(navigator.appVersion) ? true : false;
};

LiveScribe.Web.Context.prototype.IsChromeOS = function () {
    return /CrOS/.test(navigator.userAgent) ? true : false;
};

LiveScribe.Web.Context.prototype.GetPencastType = function() {
  if (this.QueryStringParameterCount == 0) {
      return LiveScribe.PencastType.LOCAL_PDF;
  } else if (this.ParameterExists('cak')) {
      return LiveScribe.PencastType.REMOTE_CLASSIC; 
  } else {
      return LiveScribe.PencastType.REMOTE_PDF;      
  }  
  
}
