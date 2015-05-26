// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.InkML = LiveScribe.InkML || {};


/*************************** inkML Trace Data ********************************/
LiveScribe.InkML.InkMLTraceGroupActiveAreaDimension = function () {
    this.X = null;
    this.Y = null;
};

LiveScribe.InkML.InkMLTraceGroupActiveArea = function () {
    this.Size = null;
    this.CropBounds = null;
    this.PageIndex = null;
    this.Units = null;
};

LiveScribe.InkML.InkMLTraceGroupTimeStamp = function () {
    this.ID = null;
    this.Time = null;
    this.TimeOffset = null;
    this.TimeStampRef = null;
};

LiveScribe.InkML.InkMLTraceGroupTracePoint = function () {
    this.X = null;
    this.Y = null;
    this.Time = null;
};


LiveScribe.InkML.InkMLTraceGroupTrace = function () {
    this.AudioStrokeIndex = null;
    this.AnnotationIndex = null;
    this.PageIndex = null;
    this.ContextRef = null;
    this.TimeOffset = null;
    this.CorrectedTimeOffset = null;
    this.PositionOffset = new LiveScribe.InkML.InkMLTraceGroupTracePoint();
    this.Points = new Array();
};

LiveScribe.InkML.InkMLTraceGroup = function () {
    this.ID = null;
    this.ActiveArea = new LiveScribe.InkML.InkMLTraceGroupActiveArea();
    this.TimeStamps = new Array();
    this.Traces = new Array();
};