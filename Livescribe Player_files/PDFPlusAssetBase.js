// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.PDFPlus = LiveScribe.PDFPlus || {};


// PDF Asset Mime Types
LiveScribe.PDFPlus.MimeType = {
    AUDIO: "audio/mp4",
    PNG: "image/png",
    INK: "text/xml"
}


// PDF Plus Document Asset Base Object
LiveScribe.PDFPlus.AssetBase = function () {
    this.MimeType = null;
    this.ByteArrayData = null;
    this.Base64 = null;
    this.URI = null;
    this.Blob = null;
    this.BlobURL = null;
    this.ArrayBuffer = null;
    this.Base64Decoder = new LiveScribe.Binary.Base64Decoder();
};

LiveScribe.PDFPlus.AssetBase.prototype.InitBase = function (data, mimetype) {
    this.ByteArrayData = data;
    this.MimeType = mimetype;
};

LiveScribe.PDFPlus.AssetBase.prototype.GenerateBlob = function () {
    if (window.BlobBuilder) {
        var blobBuilder = new window.BlobBuilder();
        blobBuilder.append(this.ByteArrayData);
        this.Blob = blobBuilder.getBlob(this.MimeType);
    }
    else {
        this.Blob = new Blob([this.ByteArrayData], { type: this.MimeType });
    }
};

LiveScribe.PDFPlus.AssetBase.prototype.GenerateBlobURL = function () {
    window.URL = window.URL || window.webkitURL;
    this.BlobURL = window.URL.createObjectURL(this.Blob);
};

LiveScribe.PDFPlus.AssetBase.prototype.EncodeToBase64 = function () {
    var streamBase64 = btoa(String.fromCharCode.apply(null, this.ByteArrayData))
    this.Base64 = streamBase64;
};

LiveScribe.PDFPlus.AssetBase.prototype.DecodeFromBase64 = function () {
    var arrayBuffer = this.Base64Decoder.DecodeToArrayBuffer(this.Base64)
    this.ArrayBuffer = arrayBuffer;
};

LiveScribe.PDFPlus.AssetBase.prototype.GenerateURI = function () {
    this.URI = "data:" + this.MimeType + ";base64," + this.Base64;
};