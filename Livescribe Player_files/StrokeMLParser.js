// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.StrokeML = LiveScribe.StrokeML || {};


/*************************** StrokeML Parser ********************************/
LiveScribe.StrokeML.StrokeMLParser = function () {
    this.PageID = null;
    this.RawData = null;
    this.XMLDom = null;
    this.StrokeMLDocument = null;
    this.ParseActivities = new Array();

    this.OnDocumentParseComplete = null;
};

LiveScribe.StrokeML.StrokeMLParser.prototype.Parse = function () {
    this.StrokeMLDocument = new LiveScribe.StrokeML.StrokeMLDocument();

    var domParser = new DOMParser();
    try {
        this.XMLDom = domParser.parseFromString(this.RawData, 'text/xml');
    }
    catch (err) {
        var error = err;
    }

    this.ParseActivities.push(LiveScribe.Events.CreateDelegate(this, this.GetStrokeData));

    setTimeout(LiveScribe.Events.CreateDelegate(this, this.ExecuteParseActivity), 25);
}

LiveScribe.StrokeML.StrokeMLParser.prototype.ExecuteParseActivity = function () {
    if (this.ParseActivities.length > 0) {
        this.ParseActivities.shift()();
    }
    else {
        if (this.OnDocumentParseComplete != null & this.OnDocumentParseComplete != undefined) {
            this.OnDocumentParseComplete(this.StrokeMLDocument);
        }
    }
};

LiveScribe.StrokeML.StrokeMLParser.prototype.GetStrokeData = function () {
    var traceGroupNodes = this.XMLDom.getElementsByTagName("strokes");

    for (var traceGroupNodeIndex = 0; traceGroupNodeIndex < traceGroupNodes.length; traceGroupNodeIndex++) {
        var traceGroupNode = traceGroupNodes[traceGroupNodeIndex];

        var traceGroup = new LiveScribe.InkML.InkMLTraceGroup();
        traceGroup.ID = this.PageID

        var timeStamp = new LiveScribe.InkML.InkMLTraceGroupTimeStamp();
        timeStamp.Time = 0;
        traceGroup.TimeStamps.push(timeStamp);

        var timeStamp2 = new LiveScribe.InkML.InkMLTraceGroupTimeStamp();
        timeStamp2.TimeOffset = parseInt(traceGroupNode.getElementsByTagName("stroke")[0].getAttribute("timestamp"));
        traceGroup.TimeStamps.push(timeStamp2);


        var traceGroupTraceNodes = traceGroupNode.getElementsByTagName("stroke");
        for (var traceGroupTraceNodeIndex = 0; traceGroupTraceNodeIndex < traceGroupTraceNodes.length; traceGroupTraceNodeIndex++) {
            var traceGroupTraceNode = traceGroupTraceNodes[traceGroupTraceNodeIndex];

            var trace = new LiveScribe.InkML.InkMLTraceGroupTrace();
            trace.ContextRef = "";
            trace.TimeOffset = parseInt(traceGroupTraceNode.getAttribute("timestamp"));
            trace.PositionOffset.X = 0;
            trace.PositionOffset.Y = 0;

            var traceGroupPointNodes = traceGroupTraceNode.getElementsByTagName("coord");
            for (var traceGroupPointNodesIndex = 0; traceGroupPointNodesIndex < traceGroupPointNodes.length; traceGroupPointNodesIndex++) {
                var traceGroupPointNode = traceGroupPointNodes[traceGroupPointNodesIndex];

                var traceGroupPoint = new LiveScribe.InkML.InkMLTraceGroupTracePoint();
                traceGroupPoint.X = MM2AU(parseInt(traceGroupPointNode.getAttribute("x")));
                traceGroupPoint.Y = MM2AU(parseInt(traceGroupPointNode.getAttribute("y")));
                traceGroupPoint.Time = parseInt(traceGroupPointNode.getAttribute("d"));

                trace.Points.push(traceGroupPoint);
            }

            traceGroup.Traces.push(trace);
        }

        this.StrokeMLDocument.Strokes.Add(traceGroup.ID, traceGroup);
    }

    setTimeout(LiveScribe.Events.CreateDelegate(this, this.ExecuteParseActivity), 25);
};