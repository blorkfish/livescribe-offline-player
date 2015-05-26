// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.PDFPlus = LiveScribe.PDFPlus || {};


// Image Asset Object
LiveScribe.PDFPlus.Image = function (data) {
    this.InitBase(data, LiveScribe.PDFPlus.MimeType.PNG);

    //this.EncodeToBase64();
    //this.GenerateURI();
    this.GenerateBlob();
    this.GenerateBlobURL();
};

LiveScribe.PDFPlus.Image.prototype = new LiveScribe.PDFPlus.AssetBase();