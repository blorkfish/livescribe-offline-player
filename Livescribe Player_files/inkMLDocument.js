// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.InkML = LiveScribe.InkML || {};


/*************************** inkML Document ********************************/
LiveScribe.InkML.InkMLDocument = function () {
    this.DocumentID = null;
    this.Pages = new LiveScribe.Collections.NamedList();
    this.InkSource = new LiveScribe.InkML.InkMLInkSource();
    this.BackgroundImages = new LiveScribe.Collections.NamedList();
    this.AudioSessions = new LiveScribe.Collections.NamedList();
    this.TraceGroups = new LiveScribe.Collections.NamedList();
}