// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.PDFPlus = LiveScribe.PDFPlus || {};


LiveScribe.PDFPlus.PDFPlusPage = function () {
    this.ID = null;
    this.BackgroundImage = null;
    this.AudioStrokes = null;
    this.Annotations = null;
    this.TraceGroup = null;
    this.SessionStart = null;
    this.SessionDuration = null;
    this.SessionStrokes = new Array();
    this.NonSessionStrokes = new Array();
    this.AdjustedSessionStrokes = new Array();
};

LiveScribe.PDFPlus.PDFPlusPage.prototype.IdentifyStrokes = function () {
    for (var traceIndex = 0; traceIndex < this.TraceGroup.Traces.length; traceIndex++) {
        var isInSession = false;
        var trace = this.TraceGroup.Traces[traceIndex]
        var traceOffset = this.TraceGroup.TimeStamps[0].Time + trace.TimeOffset;

        if (this.AudioStrokes != null) {
            for (var asIndex = 0; asIndex < this.AudioStrokes.length; asIndex++) {
                var audioStroke = this.AudioStrokes[asIndex];

                if (traceOffset >= audioStroke.Start && traceOffset <= audioStroke.End) {
                    trace.AudioStrokeIndex = asIndex;
                    isInSession = true;
                }
            }
        }

        if (this.Annotations != null) {
            for (var anIndex = 0; anIndex < this.Annotations.length; anIndex++) {
                var annotation = this.Annotations[anIndex];

                if (traceOffset >= annotation.Start && traceOffset <= annotation.End) {
                    trace.AnnotationIndex = anIndex;
                    isInSession = true;
                }
            }
        }

        if (isInSession) {
            this.SessionStrokes.push(trace);
        }
        else {
            this.NonSessionStrokes.push(trace);
        }
    }
};



