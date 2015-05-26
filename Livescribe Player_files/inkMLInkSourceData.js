// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.InkML = LiveScribe.InkML || {};


/*************************** inkML Ink Source ********************************/
LiveScribe.InkML.InkMLInkSourceSampleRate = function () {
    this.Uniform = false;
    this.Value = null;
};


LiveScribe.InkML.InkMLInkSourceSampleRateTraceFormatChannel = function () {
    this.Name = null;
    this.Type = null;
    this.Units = null;
};


LiveScribe.InkML.InkMLInkSourceSampleRateTraceFormat = function () {
    this.Channels = new Array();
};


LiveScribe.InkML.InkMLInkSource = function () {
    this.ID = null;
    this.Manufacturer = null;
    this.Model = null;
    this.SerialNumber = null;
    this.SampleRate = new LiveScribe.InkML.InkMLInkSourceSampleRate();
    this.TraceFormat = new LiveScribe.InkML.InkMLInkSourceSampleRateTraceFormat();
};