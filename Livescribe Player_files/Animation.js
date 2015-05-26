// ***********************************************************************************************************
// Name: Animation Library
// Type: Library
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.Animation = LiveScribe.Animation || {};

//dependencies
//LiveScribe.EventHandling.js

LiveScribe.Animation.AccelerationType = {
    ZERO: '(elapsedTime * (1 / duration))',
    SINUSOIDAL: 'Math.abs(Math.sin(elapsedTime * (Math.PI / (2 * duration))))',
    EASE_IN: 'Math.pow(((1 /duration) * elapsedTime), 1.25)',
    EASE_OUT: 'Math.pow(((1 /duration) * elapsedTime), .25)',
    QUADRATIC_EASE_IN: '(elapsedTime /= duration) * elapsedTime',
    QUADRATIC_EASE_OUT: '-((elapsedTime /= duration) * (elapsedTime -2))',
    CUBIC_EASE_IN: '(elapsedTime /= duration) * elapsedTime * elapsedTime',
    CUBIC_EASE_OUT: '(( elapsedTime = elapsedTime/duration - 1) * elapsedTime * elapsedTime + 1)',
    QUARTIC_EASE_IN: '(elapsedTime /= duration)* elapsedTime * elapsedTime * elapsedTime',
    QUARTIC_EASE_OUT: '-((elapsedTime = elapsedTime/duration - 1) * elapsedTime * elapsedTime * elapsedTime - 1)',
    QUINTIC_EASE_IN: '(elapsedTime /= duration) * elapsedTime * elapsedTime * elapsedTime * elapsedTime',
    QUINTIC_EASE_OUT: '((elapsedTime = elapsedTime/duration - 1) * elapsedTime * elapsedTime * elapsedTime * elapsedTime + 1)',
    SINUSOIDAL_EASE_IN: '-(Math.cos(elapsedTime/duration * (Math.PI/2)) + c)',
    SINUSOIDAL_EASE_OUT: 'Math.sin(elapsedTime/duration * (Math.PI/2))',
    CIRCULAR_EASE_IN: '-(Math.sqrt(1 - (elapsedTime /= duration) * elapsedTime) - 1)',
    CIRCULAR_EASE_OUT: 'Math.sqrt(1 - (elapsedTime = elapsedTime / duration - 1) * elapsedTime)',
    BACK_EASE_IN: '(elapsedTime /= duration) * elapsedTime * ((1.70158 + 1) * elapsedTime - 1.70158)',
    BACK_EASE_OUT: '((elapsedTime = elapsedTime / duration - 1) * elapsedTime * ((1.70158 + 1) * elapsedTime + 1.70158) + 1)',
    COSINE: 'Math.cos(elapsedTime * (Math.PI / (2 * 300)))',
    SINE: 'Math.sin(elapsedTime * (Math.PI / (2 * 300)))',
    TANGENT: 'Math.tan(elapsedTime * (Math.PI / (2 * 300)))'
};


LiveScribe.Animation.Dimension = function (width, height) {
    this.Width = null;
    this.Height = null;

    if (width != null && width != undefined) { this.Width = width; }
    if (height != null && height != undefined) { this.Height = height; }
}


LiveScribe.Animation.Coordinate = function (posX, posY) {
    this.PositionX = null;
    this.PositionY = null;

    if (posX != null && posX != undefined) { this.PositionX = posX; }
    if (posY != null && posY != undefined) { this.PositionY = posY; }
}

LiveScribe.Animation.RGB = function (r, g, b) {
    this.Red = r;
    this.Green = g;
    this.Blue = b;
}

LiveScribe.Animation.Color = function () {
    this.m_Web = null;
    this.m_RGB = null;
};

LiveScribe.Animation.Color.prototype.Web = function (hexValue) {
    if (hexValue != null && hexValue != undefined) {
        this.m_Web = hexValue;
        this.m_RGB = LiveScribe.Animation.ConvertHexColorToRgb(hexValue);
    }

    return this.m_Web;
}

LiveScribe.Animation.Color.prototype.RGB = function (rgb) {
    if (rgb != null && rgb != undefined) {
        this.m_RGB = rgb;
        this.m_Web = LiveScribe.Animation.ConvertRgbToHexColor(this.m_RGB);
    }

    return this.m_RGB;
}

LiveScribe.Animation.GetOpacity = function (element) {
    var opacity = 100;
    if (document.attachEvent && element.currentStyle.filter) {
        var opacityString = element.currentStyle.filter;
        var matches = opacityString.match(/alpha\(opacity=(\d+)\)/);
        if (matches.length > 0) {
            opacity = (matches[1] / 10);
        }
        else {
            opacity = opacity / 10;
        }
    }
    else {
       opacity = (element.style.opacity * 10);
   }

   return opacity;

}

LiveScribe.Animation.GetColor = function (element) {
    var color = new LiveScribe.Animation.Color();
    if (document.attachEvent && element.currentStyle.backgroundColor) {
        color.Web(element.currentStyle.backgroundColor);
    }
    else {
        color.Web(element.style.backgroundColor);
    }

    return color;
}

LiveScribe.Animation.HexToDecimalMap = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "A": 10,
    "B": 11,
    "C": 12,
    "D": 13,
    "E": 14,
    "F": 15
};

LiveScribe.Animation.ConvertHexColorToRgb = function (hexValue) {
    var redHex = hexValue.substr(1, 2);
    var redRgb = LiveScribe.Animation.ConvertHexColorComponentToRgbComponent(redHex);

    var greenHex = hexValue.substr(3, 2);
    var greenRgb = LiveScribe.Animation.ConvertHexColorComponentToRgbComponent(greenHex);

    var blueHex = hexValue.substr(5, 2);
    var blueRgb = LiveScribe.Animation.ConvertHexColorComponentToRgbComponent(blueHex);

    return new LiveScribe.Animation.RGB(redRgb, greenRgb, blueRgb);
};

LiveScribe.Animation.ConvertHexColorComponentToRgbComponent = function (hexColorComponent) {
    var hex1 = LiveScribe.Animation.HexToDecimalMap[hexColorComponent.substr(0, 1).toUpperCase()];
    var hex2 = LiveScribe.Animation.HexToDecimalMap[hexColorComponent.substr(1, 1).toUpperCase()];
    var rgb = hex1 * 16 + hex2;

    return rgb;
};

LiveScribe.Animation.ConvertRgbToHexColor = function (rgb) {
    var hexColor = '#';
    hexColor = hexColor + LiveScribe.Animation.ConvertRgbComponentToHex(rgb.Red);
    hexColor = hexColor + LiveScribe.Animation.ConvertRgbComponentToHex(rgb.Green);
    hexColor = hexColor + LiveScribe.Animation.ConvertRgbComponentToHex(rgb.Blue);

    return hexColor;
};

LiveScribe.Animation.ConvertRgbComponentToHex = function (rgbValue) {
    var nybHexString = "0123456789ABCDEF";
    var hexValue = String(nybHexString.substr((rgbValue >> 4) & 0x0F, 1)) + nybHexString.substr(rgbValue & 0x0F, 1);
    return hexValue;
};

