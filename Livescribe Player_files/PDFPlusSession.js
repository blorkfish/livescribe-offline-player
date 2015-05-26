// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.PDFPlus = LiveScribe.PDFPlus || {};


LiveScribe.PDFPlus.PDFPlusSession = function () {
    this.ID = null;
    this.IsPaperless = false;
    this.PageCount = 0;
    this.PageSize = null;
    this.PageAddresses = null;
    this.Pages = null;
    this.Annotations = null;
    this.AudioSession = null;
    this.SessionStart = null;
    this.SessionDuration = null;
    this.HasAudio = true;
};

LiveScribe.PDFPlus.PDFPlusSession.prototype.GetDuration = function () {
    var duration = 0;
    for (var index = 0; index < this.AudioSession.AudioFiles.length; index++) {
        duration = duration + (this.AudioSession.AudioFiles[index].End - this.AudioSession.AudioFiles[index].Start)
    }

    return duration;
};