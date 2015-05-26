// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.InkML = LiveScribe.InkML || {};


/*************************** inkML Audio Data ********************************/
LiveScribe.InkML.InkMLAudioSessionAudioFile = function () {
    this.Key = null;
    this.Start = null;
    this.End = null;
};

LiveScribe.InkML.InkMLAudioSessionAnnotation = function () {
    this.PageAddress = null;
    this.AudioStartTime = null;
    this.Start = null;
    this.End = null;
    this.CorrectedStart = null;
    this.CorrectedEnd = null;
    this.Offset = null;
};

LiveScribe.InkML.InkMLAudioSessionAudioStroke = function () {
    this.PageAddress = null;
    this.Start = null;
    this.End = null;
    this.Offset = null;
};

LiveScribe.InkML.InkMLAudioSession = function () {
    this.Name = null;
    this.Start = null;
    this.End = null;
    this.AudioFiles = new Array();
    this.AudioStrokes = new Array();
    this.Annotations = new Array();
};