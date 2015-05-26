// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.InkML = LiveScribe.InkML || {};


/*************************** inkML Parser ********************************/
LiveScribe.InkML.InkMLParser = function () {
    this.RawData = null;
    this.XMLDom = null;
    this.InkMLDocument = null;
    this.ParseActivities = new Array();

    this.OnDocumentParseComplete = null;
}

LiveScribe.InkML.InkMLParser.prototype.Parse = function () {
    this.InkMLDocument = new LiveScribe.InkML.InkMLDocument();

    var domParser = new DOMParser();
    try {
        this.XMLDom = domParser.parseFromString(this.RawData, 'text/xml');
    }
    catch (err) {
        var error = err;
    }

    this.ParseActivities.push(LiveScribe.Events.CreateDelegate(this, this.GetDocumentID));
    this.ParseActivities.push(LiveScribe.Events.CreateDelegate(this, this.GetPages));
    this.ParseActivities.push(LiveScribe.Events.CreateDelegate(this, this.GetInkSource));
    this.ParseActivities.push(LiveScribe.Events.CreateDelegate(this, this.GetBackgroundImages));
    this.ParseActivities.push(LiveScribe.Events.CreateDelegate(this, this.GetAudioSessions));
    this.ParseActivities.push(LiveScribe.Events.CreateDelegate(this, this.GetTraceGroups));

    setTimeout(LiveScribe.Events.CreateDelegate(this, this.ParseData), 25);
}

LiveScribe.InkML.InkMLParser.prototype.ParseData = function () {
    if (this.ParseActivities.length > 0) {
        this.ParseActivities.shift()();
    }
    else {
        if (this.OnDocumentParseComplete != null & this.OnDocumentParseComplete != undefined) {
            this.OnDocumentParseComplete(this.InkMLDocument);
        }
    }
}

LiveScribe.InkML.InkMLParser.prototype.GetDocumentID = function () {
    var rootNode = this.XMLDom.getElementsByTagName("ink")[0];
    this.InkMLDocument.DocumentID = rootNode.getAttribute("documentID");

    setTimeout(LiveScribe.Events.CreateDelegate(this, this.ParseData), 25);
};

LiveScribe.InkML.InkMLParser.prototype.GetPages = function () {
    var traceGroupNodes = this.XMLDom.getElementsByTagName("traceGroup");

    for (var traceGroupNodeIndex = 0; traceGroupNodeIndex < traceGroupNodes.length; traceGroupNodeIndex++) {
        var traceGroupNode = traceGroupNodes[traceGroupNodeIndex];
        var pageID = traceGroupNode.getAttribute("xml:id");

        var traceGroupActiveAreaNode = traceGroupNode.getElementsByTagName("activeArea")[0];
        if (traceGroupActiveAreaNode != null && traceGroupActiveAreaNode != undefined) {
            var pageIndex = parseInt(traceGroupActiveAreaNode.getAttribute("pageIndex"));
        }

        this.InkMLDocument.Pages.Add(pageID, pageIndex);
    }

    setTimeout(LiveScribe.Events.CreateDelegate(this, this.ParseData), 25);
}

LiveScribe.InkML.InkMLParser.prototype.GetInkSource = function () {
    var inkSourceNode = this.XMLDom.getElementsByTagName("inkSource")[0];

    this.InkMLDocument.InkSource.ID = inkSourceNode.getAttribute('xml:id');
    this.InkMLDocument.InkSource.Manufacturer = inkSourceNode.getAttribute('manufacturer');
    this.InkMLDocument.InkSource.Model = inkSourceNode.getAttribute('model');
    this.InkMLDocument.InkSource.SerialNumber = inkSourceNode.getAttribute('serialNo');

    var inkSourceSampleRateNode = inkSourceNode.getElementsByTagName("sampleRate")[0];

    this.InkMLDocument.InkSource.SampleRate.Uniform = inkSourceSampleRateNode.getAttribute('uniform');
    this.InkMLDocument.InkSource.SampleRate.Value = parseInt(inkSourceSampleRateNode.getAttribute('value'));

    var inkSourceTraceFormatNode = inkSourceNode.getElementsByTagName("traceFormat")[0];
    var inkSourceTraceFormatChannelNodes = inkSourceTraceFormatNode.getElementsByTagName("channel");

    for (var index = 0; index < inkSourceTraceFormatChannelNodes.length; index++) {
        var inkSourceTraceFormatChannelNode = inkSourceTraceFormatChannelNodes[index];

        var inkSourceTraceFormatChannel = new LiveScribe.InkML.InkMLInkSourceSampleRateTraceFormatChannel();
        inkSourceTraceFormatChannel.Name = inkSourceTraceFormatChannelNode.getAttribute("name");
        inkSourceTraceFormatChannel.Type = inkSourceTraceFormatChannelNode.getAttribute("type");
        inkSourceTraceFormatChannel.Units = inkSourceTraceFormatChannelNode.getAttribute("units");

        this.InkMLDocument.InkSource.TraceFormat.Channels.push(inkSourceTraceFormatChannel);
    }

    setTimeout(LiveScribe.Events.CreateDelegate(this, this.ParseData), 25);
}

LiveScribe.InkML.InkMLParser.prototype.GetBackgroundImages = function () {
    var LsMetadataNode = this.XMLDom.getElementsByTagName("annotationXML")[0];
    var backgroundImageNodes = LsMetadataNode.getElementsByTagName("backgroundImage");

    console.log("Number of BGImages contained inside the PDF = " + backgroundImageNodes.length);

    if (backgroundImageNodes.length > 0) {
        // background images are provided inside the PDF
        for (var index = 0; index < backgroundImageNodes.length; index++) {
            var backgroundImageNode = backgroundImageNodes[index];

            var backgroundImage = new LiveScribe.InkML.InkMLImageFile();
            backgroundImage.PageAddress = backgroundImageNode.getAttribute("page_address");
            backgroundImage.Key = backgroundImageNode.getAttribute("metadata_key");

            this.InkMLDocument.BackgroundImages.Add(backgroundImage.PageAddress, backgroundImage);
        }
    } else {
        // Get the page address from traceGroup
        var traceGroupNodes = this.XMLDom.getElementsByTagName("traceGroup");

        for (var traceGroupNodeIndex = 0; traceGroupNodeIndex < traceGroupNodes.length; traceGroupNodeIndex++) {
            var traceGroupNode = traceGroupNodes[traceGroupNodeIndex];

            var backgroundImage = new LiveScribe.InkML.InkMLImageFile();
            backgroundImage.PageAddress = traceGroupNode.getAttribute("xml:id");
            this.InkMLDocument.BackgroundImages.Add(backgroundImage.PageAddress, backgroundImage);
        }
    }
    

    setTimeout(LiveScribe.Events.CreateDelegate(this, this.ParseData), 25);
}

LiveScribe.InkML.InkMLParser.prototype.GetAudioSessions = function () {
    var lsMetadataNode = this.XMLDom.getElementsByTagName("annotationXML")[0];
    var audioSessionNodes = lsMetadataNode.getElementsByTagName("audioSession");

    for (var sessionNodeIndex = 0; sessionNodeIndex < audioSessionNodes.length; sessionNodeIndex++) {
        var audioSessionNode = audioSessionNodes[sessionNodeIndex];

        var audioSession = new LiveScribe.InkML.InkMLAudioSession();
        audioSession.Name = audioSessionNode.getAttribute("name");
        audioSession.Start = parseInt(audioSessionNode.getAttribute("start"));
        audioSession.End = parseInt(audioSessionNode.getAttribute("end"));

        var audioFileNodes = audioSessionNode.getElementsByTagName("audio_file");
        for (var audioFileNodeIndex = 0; audioFileNodeIndex < audioFileNodes.length; audioFileNodeIndex++) {
            var audioFileNode = audioFileNodes[audioFileNodeIndex];

            var audioFile = new LiveScribe.InkML.InkMLAudioSessionAudioFile();
            audioFile.Key = audioFileNode.getAttribute("file_attachment_key");
            audioFile.Start = parseInt(audioFileNode.getAttribute("start"));
            audioFile.End = parseInt(audioFileNode.getAttribute("end"));

            audioSession.AudioFiles.push(audioFile);
        }

        var audioStrokeNodes = lsMetadataNode.getElementsByTagName("audio_stroke");
        for (var audioStrokeNodeIndex = 0; audioStrokeNodeIndex < audioStrokeNodes.length; audioStrokeNodeIndex++) {
            var audioStrokeNode = audioStrokeNodes[audioStrokeNodeIndex];

            var audioStroke = new LiveScribe.InkML.InkMLAudioSessionAudioStroke();
            audioStroke.PageAddress = audioStrokeNode.getAttribute("page_address");
            audioStroke.Start = parseInt(audioStrokeNode.getAttribute("start"));
            audioStroke.End = parseInt(audioStrokeNode.getAttribute("end"));
            audioStroke.Offset = parseInt(audioStrokeNode.getAttribute("offset"));

            audioSession.AudioStrokes.push(audioStroke);
        }


        this.InkMLDocument.AudioSessions.Add(audioSession.Name, audioSession);
    }

    setTimeout(LiveScribe.Events.CreateDelegate(this, this.ParseData), 25);
}

LiveScribe.InkML.InkMLParser.prototype.GetTraceGroups = function () {
    var traceGroupNodes = this.XMLDom.getElementsByTagName("traceGroup");

    for (var traceGroupNodeIndex = 0; traceGroupNodeIndex < traceGroupNodes.length; traceGroupNodeIndex++) {
        var traceGroupNode = traceGroupNodes[traceGroupNodeIndex];

        var traceGroup = new LiveScribe.InkML.InkMLTraceGroup();
        traceGroup.ID = traceGroupNode.getAttribute("xml:id");

        var traceGroupActiveAreaNode = traceGroupNode.getElementsByTagName("activeArea")[0];

        if (traceGroupActiveAreaNode != null && traceGroupActiveAreaNode != undefined) {
            traceGroup.ActiveArea.Size = this.ExtractDimensionPair(traceGroupActiveAreaNode.getAttribute("mediaSize"));
            traceGroup.ActiveArea.CropBounds = this.ExtractCropBounds(traceGroupActiveAreaNode.getAttribute("cropBounds"));
            traceGroup.ActiveArea.PageIndex = parseInt(traceGroupActiveAreaNode.getAttribute("pageIndex"));
            traceGroup.ActiveArea.Units = traceGroupActiveAreaNode.getAttribute("units");
        }

        var traceGroupTimeStampNodes = traceGroupNode.getElementsByTagName("timestamp");
        for (var traceGroupTimeStampNodeIndex = 0; traceGroupTimeStampNodeIndex < traceGroupTimeStampNodes.length; traceGroupTimeStampNodeIndex++) {
            var traceGroupTimeStampNode = traceGroupTimeStampNodes[traceGroupTimeStampNodeIndex];

            var timeStamp = new LiveScribe.InkML.InkMLTraceGroupTimeStamp();
            timeStamp.ID = traceGroupTimeStampNode.getAttribute("xml:id");

            if (traceGroupTimeStampNode.hasAttribute("time")) {
                timeStamp.Time = parseInt(traceGroupTimeStampNode.getAttribute("time"));
            }

            if (traceGroupTimeStampNode.hasAttribute("timeOffset")) {
                timeStamp.TimeOffset = parseInt(traceGroupTimeStampNode.getAttribute("timeOffset"));
            }

            if (traceGroupTimeStampNode.hasAttribute("timestampRef")) {
                timeStamp.TimeStampRef = traceGroupTimeStampNode.getAttribute("timestampRef");
            }

            traceGroup.TimeStamps.push(timeStamp);
        }


        var traceGroupTraceNodes = traceGroupNode.getElementsByTagName("trace");
        for (var traceGroupTraceNodeIndex = 0; traceGroupTraceNodeIndex < traceGroupTraceNodes.length; traceGroupTraceNodeIndex++) {
            var traceGroupTraceNode = traceGroupTraceNodes[traceGroupTraceNodeIndex];

            var trace = new LiveScribe.InkML.InkMLTraceGroupTrace();
            trace.ContextRef = traceGroupTraceNode.getAttribute("contextRef");
            trace.TimeOffset = parseInt(traceGroupTraceNode.getAttribute("timeOffset"));

            var traceGroupTracePointsString = traceGroupTraceNode.textContent;
            var traceGroupPoints = traceGroupTracePointsString.split(', ');
            for (var traceGroupPointValuesIndex = 0; traceGroupPointValuesIndex < traceGroupPoints.length; traceGroupPointValuesIndex++) {
                var traceGroupPointValues = traceGroupPoints[traceGroupPointValuesIndex].split(' ');

                if (traceGroupPointValuesIndex == 0) {
                    trace.PositionOffset.X = parseInt(traceGroupPointValues[0]);
                    trace.PositionOffset.Y = parseInt(traceGroupPointValues[1]);
                }
                else {
                    var traceGroupPoint = new LiveScribe.InkML.InkMLTraceGroupTracePoint();
                    traceGroupPoint.X = parseInt(traceGroupPointValues[0]);
                    traceGroupPoint.Y = parseInt(traceGroupPointValues[1]);
                    traceGroupPoint.Time = (this.InkMLDocument.InkSource.SampleRate.Value * traceGroupPointValuesIndex);

                    trace.Points.push(traceGroupPoint);
                }
            }

            traceGroup.Traces.push(trace);
        }

        this.InkMLDocument.TraceGroups.Add(traceGroup.ID, traceGroup);
    }

    setTimeout(LiveScribe.Events.CreateDelegate(this, this.ParseData), 25);
}

LiveScribe.InkML.InkMLParser.prototype.ExtractCropBounds = function (value) {
    var cropboundsString = value.replace('{', '');
    cropboundsString = cropboundsString.replace('}', '');

    var cropboundsArray = cropboundsString.split('), (');

    var cropbounds = new Array();
    cropbounds.push(this.ExtractDimensionPair(cropboundsArray[0]));
    cropbounds.push(this.ExtractDimensionPair(cropboundsArray[1]));

    return cropbounds;
};

LiveScribe.InkML.InkMLParser.prototype.ExtractDimensionPair = function (value) {
    var pairString = value.replace('(', '');
    pairString = pairString.replace(')', '');

    var pairArray = pairString.split(',');

    var pair = new LiveScribe.InkML.InkMLTraceGroupActiveAreaDimension();
    pair.X = pairArray[0];
    pair.Y = pairArray[1];

    return pair;
};