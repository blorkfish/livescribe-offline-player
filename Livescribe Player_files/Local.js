// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.Local = LiveScribe.Local || {};



// Local Asset Loader Object
LiveScribe.Local.LocalAssetLoader = function (pdfPlusData) {
    this.PdfPlusData = pdfPlusData;
    this.PdfPlusDocument = null;

    this.PdfPlusDocumentParser = new LiveScribe.PDFPlus.PDFPlusDocumentParser();
    this.PdfPlusDocumentParser.OnDocumentParseComplete = LiveScribe.Events.CreateDelegate(this, this.PdfPlusParserDocumentParseCompleteHandler);
    this.PdfPlusDocumentParser.OnImagesParseComplete = LiveScribe.Events.CreateDelegate(this, this.PdfPlusParserImagesParseCompleteHandler);
    this.PdfPlusDocumentParser.OnInkMLParseComplete = LiveScribe.Events.CreateDelegate(this, this.PdfPlusParserInkMLParseCompleteHandler);
    this.PdfPlusDocumentParser.OnAudioParseComplete = LiveScribe.Events.CreateDelegate(this, this.PdfPlusParserAudioParseCompleteHandler);
    this.PdfPlusDocumentParser.OnMessage = LiveScribe.Events.CreateDelegate(this, this.PdfPlusParserMessageHandler);

    this.OnAssetLoadStart = null;
    this.OnAssetLoadComplete = null;
    this.OnImageLoadComplete = null;
    this.OnInkMLLoadComplete = null;
    this.OnAudioLoadComplete = null;

    this.PdfPlusDocumentParser.PdfArrayBuffer = this.PdfPlusData;
    this.PdfPlusDocumentParser.Init();
};

LiveScribe.Local.LocalAssetLoader.prototype.GetPencastData = function () {
    var pencastData = new LiveScribe.PencastData();
    pencastData.DocumentId = this.InkMLDocument.DocumentID;
    pencastData.PageId = this.InkMLDocument.TraceGroups.ItemAt(0).ID;
    pencastData.SessionId = this.ParseInkMLDocument.ItemAt(0).Name;

    return pencastData;
};

LiveScribe.Local.LocalAssetLoader.prototype.ParseAssets = function () {
    setTimeout(LiveScribe.Events.CreateDelegate(this, this.FireOnAssetLoadStart), 25);
    setTimeout(LiveScribe.Events.CreateDelegate(this, this.ParsePdfPlusDocument), 25);
};

LiveScribe.Local.LocalAssetLoader.prototype.GetAudio = function () {
    setTimeout(LiveScribe.Events.CreateDelegate(this.PdfPlusDocumentParser, this.PdfPlusDocumentParser.GetAudio), 25);
};

LiveScribe.Local.LocalAssetLoader.prototype.ParsePdfPlusDocument = function () {
    setTimeout(LiveScribe.Events.CreateDelegate(this.PdfPlusDocumentParser, this.PdfPlusDocumentParser.ParseInkMLAndImages), 25);
};

LiveScribe.Local.LocalAssetLoader.prototype.CompleteAssetLoading = function (file) {
    var totalTimeToLoad = (new Date().getTime() - this.mStartTime) / 1000;
    setTimeout(LiveScribe.Events.CreateDelegate(this, this.FireOnAssetLoadComplete), 25);
};

LiveScribe.Local.LocalAssetLoader.prototype.FireOnAssetLoadStart = function () {
    if (this.OnAssetLoadStart != null && this.OnAssetLoadStart != undefined) {
        this.OnAssetLoadStart();
    }
};

LiveScribe.Local.LocalAssetLoader.prototype.FireOnAssetLoadComplete = function () {
    if (this.OnAssetLoadComplete != null && this.OnAssetLoadComplete != undefined) {
        this.OnAssetLoadComplete();
    }
};

LiveScribe.Local.LocalAssetLoader.prototype.PdfPlusParserDocumentParseStartHandler = function () {
}

LiveScribe.Local.LocalAssetLoader.prototype.PdfPlusParserDocumentParseCompleteHandler = function (pdf) {
    this.PdfPlusDocument = pdf;
    setTimeout(LiveScribe.Events.CreateDelegate(this, this.CompleteAssetLoading), 25);
};

LiveScribe.Local.LocalAssetLoader.prototype.PdfPlusParserImagesParseCompleteHandler = function (imageCollection) {
    if (this.OnImageLoadComplete != null && this.OnImageLoadComplete != undefined) {
        this.OnImageLoadComplete();
    }
};

LiveScribe.Local.LocalAssetLoader.prototype.PdfPlusParserInkMLParseCompleteHandler = function (inkMLColection) {
    if (this.OnInkMLLoadComplete != null && this.OnInkMLLoadComplete != undefined) {
        this.OnInkMLLoadComplete();
    }
};

LiveScribe.Local.LocalAssetLoader.prototype.PdfPlusParserAudioParseCompleteHandler = function (audioCollection) {
    if (this.OnAudioLoadComplete != null && this.OnAudioLoadComplete != undefined) {
        this.OnAudioLoadComplete();
    }
};