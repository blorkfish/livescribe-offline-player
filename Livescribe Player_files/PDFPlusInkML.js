// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.PDFPlus = LiveScribe.PDFPlus || {};


// PDF Plus Document InkML Asset Object
LiveScribe.PDFPlus.InkML = function (data) {
    this.XMLString = null;
    this.XMLStreamMaxLength = 65535;


    this.IsSafari = /Safari/.test(navigator.userAgent) ? true : false;
    this.IsChrome = /Chrome/.test(navigator.userAgent) ? true : false;
    this.IsChromeOrSafari = (this.IsChrome || this.IsSafari) ? true : false;

    this.InitBase(data, LiveScribe.PDFPlus.MimeType.INK)
    this.GenerateXMLString();

    //this.EncodeToBase64();
    //this.GenerateURI();
    //this.GenerateBlob();
    //this.GenerateBlobURL();
};

LiveScribe.PDFPlus.InkML.prototype = new LiveScribe.PDFPlus.AssetBase();

LiveScribe.PDFPlus.InkML.prototype.GenerateXMLString = function () {
    var xmlString = '';
    console.log("XMLStream max length = " + this.XMLStreamMaxLength);
    console.log("ByteArrayData length = " + this.ByteArrayData.length);
        
    if (this.ByteArrayData.length < this.XMLStreamMaxLength && this.IsChromeOrSafari) {
        for (var index = 0; index < this.ByteArrayData.length; index++) {
            xmlString += String.fromCharCode(this.ByteArrayData[index]);
        }
    }
    else {
        // For larger buffer array..
        xmlString = largeArrayBufferToString(this.ByteArrayData);
    }

    // if xml doesn't have "<?xml version...", add the same..
    var index = xmlString.indexOf("<\?xml version\=\"1.0\" encoding");
    if (index < 0) {
        xmlString = '<?xml version="1.0" encoding="utf-8" ?>' + xmlString;
    }

    this.XMLString = xmlString;
    //console.log(this.XMLString);
}

LiveScribe.PDFPlus.InkML.prototype.GenerateBlob = function () {
    if (window.Blob) {
        this.Blob = new Blob([this.XMLString], { 'type': this.MimeType });
    }
    else if (window.MSBlobBuilder) {
        var blobBuilder = new MSBlobBuilder();
        blobBuilder.append(this.XMLString);
        this.Blob = blobBuilder.getBlob(this.MimeType);
    }
}
