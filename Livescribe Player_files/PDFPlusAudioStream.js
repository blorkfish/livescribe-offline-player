// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.PDFPlus = LiveScribe.PDFPlus || {};


// PDF Plus Document Audio Stream Asset Object
LiveScribe.PDFPlus.AudioStream = function (data) {
    this.WebAudioBuffer = null;
    this.InitBase(data, LiveScribe.PDFPlus.MimeType.AUDIO)

    //this.EncodeToBase64();
    //this.GenerateURI();
    //this.GenerateBlob();
    //this.GenerateBlobURL();
};

LiveScribe.PDFPlus.AudioStream.prototype = new LiveScribe.PDFPlus.AssetBase();