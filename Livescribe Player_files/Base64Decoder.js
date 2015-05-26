
var LiveScribe = LiveScribe || {};
LiveScribe.Binary = LiveScribe.Binary || {};


LiveScribe.Binary.BASE64_KEY_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

LiveScribe.Binary.Base64Decoder = function() { 
};

    /* will return a  Uint8Array type */
LiveScribe.Binary.Base64Decoder.prototype.DecodeToArrayBuffer = function (input) {
    var bytes = (input.length / 4) * 3;
    var buffer = new ArrayBuffer(bytes);

    this.DecodeToUint8Array(input, buffer);

    return buffer;
};


LiveScribe.Binary.Base64Decoder.prototype.DecodeToUint8Array = function(input, arrayBuffer) {
    var lkey1 = LiveScribe.Binary.BASE64_KEY_STRING.indexOf(input.charAt(input.length - 1));
    var lkey2 = LiveScribe.Binary.BASE64_KEY_STRING.indexOf(input.charAt(input.length - 2));

    var bytes = (input.length / 4) * 3;
    if (lkey1 == 64) { bytes--; }
    if (lkey2 == 64) { bytes--; }

    var uarray;
    
    if (arrayBuffer) {
        uarray = new Uint8Array(arrayBuffer);
    }
    else {
        uarray = new Uint8Array(bytes);
    }


    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    var position = 0;
    for (var index = 0; index < bytes; index += 3) {
        var enc1 = LiveScribe.Binary.BASE64_KEY_STRING.indexOf(input.charAt(position++));
        var enc2 = LiveScribe.Binary.BASE64_KEY_STRING.indexOf(input.charAt(position++));
        var enc3 = LiveScribe.Binary.BASE64_KEY_STRING.indexOf(input.charAt(position++));
        var enc4 = LiveScribe.Binary.BASE64_KEY_STRING.indexOf(input.charAt(position++));

        var chr1 = (enc1 << 2) | (enc2 >> 4);
        var chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        var chr3 = ((enc3 & 3) << 6) | enc4;

        uarray[index] = chr1;
        if (enc3 != 64) uarray[index + 1] = chr2;
        if (enc4 != 64) uarray[index + 2] = chr3;
    }

    return uarray;
};
