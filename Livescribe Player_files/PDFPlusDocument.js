// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.PDFPlus = LiveScribe.PDFPlus || {};


LiveScribe.PDFPlus.PDFPlusDocument = function () {
    this.MainCatalog = null;
    this.LivescribeCatalog = null;
    this.NamesCatalog = null;
    this.EmbeddedFileNamesCatalog = null;
    this.EmbeddedFileCatalog = null;
    this.InkMLCollection = new LiveScribe.Collections.NamedList();
    this.ImageCollection = new LiveScribe.Collections.NamedList();
    this.AudioStreamCollection = new LiveScribe.Collections.NamedList();
    this.PageCount = 0;
    this.PageAddresses = new Array();
};
