// ***********************************************************************************************************
// Name:Local PDF Pencast
// Type:Pencast Document Object
// Author: Cliff Gower
//************************************************************************************************************

// Namespace
var LiveScribe = LiveScribe || {};



// Livescribe Local PDF Pencast Class
LiveScribe.LocalPdfPencast = function (pencastData, cak) {
    this.PdfPlusData = pencastData.LocalFile;
    this.PdfPlusDocument = null;
    this.InkMLDocument = null;
    this.PdfPlusDocumentParser = new LiveScribe.PDFPlus.PDFPlusDocumentParser();
    this.Sessions = null;
    
    this.OnLoadStart = null;
    this.OnLoadComplete = null;
    this.OnImageLoadComplete = null;
    this.OnInkMlLoadComplete = null;
    this.OnAudioLoadComplete = null;

    this.PdfPlusDocumentParser.OnDocumentParseStart = LiveScribe.Events.CreateDelegate(this, this.PdfPlusParserDocumentParseStartHandler);
    this.PdfPlusDocumentParser.OnDocumentParseComplete = LiveScribe.Events.CreateDelegate(this, this.PdfPlusParserDocumentParseCompleteHandler);
    this.PdfPlusDocumentParser.OnImagesParseComplete = LiveScribe.Events.CreateDelegate(this, this.PdfPlusParserImagesParseCompleteHandler);
    this.PdfPlusDocumentParser.OnInkMLParseComplete = LiveScribe.Events.CreateDelegate(this, this.PdfPlusParserInkMLParseCompleteHandler);
    this.PdfPlusDocumentParser.OnAudioParseComplete = LiveScribe.Events.CreateDelegate(this, this.PdfPlusParserAudioParseCompleteHandler);
    this.PdfPlusDocumentParser.OnMessage = LiveScribe.Events.CreateDelegate(this, this.PdfPlusParserMessageHandler);

    this.PdfPlusDocumentParser.PdfArrayBuffer = this.PdfPlusData;
    
    this.PdfPlusDocumentParser.Init();
    this.InitBase(pencastData, cak);
}

LiveScribe.LocalPdfPencast.prototype = new LiveScribe.PencastBase();

LiveScribe.LocalPdfPencast.prototype.Start = function () {
    setTimeout(LiveScribe.Events.CreateDelegate(this.PdfPlusDocumentParser, this.PdfPlusDocumentParser.ParseInkMLAndImages), 25);
};

LiveScribe.LocalPdfPencast.prototype.GetInkML = function () {
    setTimeout(LiveScribe.Events.CreateDelegate(this.PdfPlusDocumentParser, this.PdfPlusDocumentParser.ParseInkML), 25);
};

LiveScribe.LocalPdfPencast.prototype.GetImages = function () {
    setTimeout(LiveScribe.Events.CreateDelegate(this.PdfPlusDocumentParser, this.PdfPlusDocumentParser.ParseImages), 25);
};

LiveScribe.LocalPdfPencast.prototype.GetAudio = function () {
    setTimeout(LiveScribe.Events.CreateDelegate(this.PdfPlusDocumentParser, this.PdfPlusDocumentParser.GetAudio), 25);
};

LiveScribe.LocalPdfPencast.prototype.CompleteDataLoading = function () {
    this.Sessions = this.GetSessions();
    this.AudioStrokes = this.GetAllAudioStrokes();
    this.Annotations = this.GetAllAnnotations();
    this.AudioFileDataList = this.GetAllAudioFiles();
    this.Pages = this.GetPages();

    this.AdjustedAudioFiles = this.GetAdjustedAudioFiles();

    if (this.Sessions.Count() == 0) { this.HasAudio = false; }
    if (this.Pages.Count() == 0) { this.IsPaperless = true;}

    for (var index = 0; index < this.Sessions.Count() ; index++) {
        this.Duration += this.Sessions.ItemAt(index).SessionDuration;
    }

    for (var index = 0; index < this.Pages.Count() ; index++) {
        this.Pages.ItemAt(index).IdentifyStrokes();
    }

    if (this.OnDataLoadComplete != null && this.OnDataLoadComplete != undefined) {
        setTimeout(LiveScribe.Events.CreateDelegate(this, this.OnDataLoadComplete), 25);
    }

    // this.trackLaunchedEvent();

    setTimeout(LiveScribe.Events.CreateDelegate(this, this.GetAudio), 25);
}




//----------------------------------------- Page Data ------------------------------------------
LiveScribe.LocalPdfPencast.prototype.GetPages = function () {
    var pages = new LiveScribe.Collections.NamedList();

    for (var index = 0; index < this.PdfPlusDocument.PageAddresses.length; index++) {
        var page = this.GetPage(this.PdfPlusDocument.PageAddresses[index])
        if (null == pages.Item(page.ID)) {
            //Add this page, it doesnt already exist..
            pages.Add(page.ID, page);
        }
    }
    return pages;
}

LiveScribe.LocalPdfPencast.prototype.GetPage = function (pageAddress) {
    var page = new LiveScribe.PDFPlus.PDFPlusPage()
    page.ID = pageAddress;
    page.BackgroundImage = this.GetPageBackgroundImage(pageAddress);
    page.TraceGroup = this.GetTraceGroup(pageAddress);

    //Changed by MNaqvi
    var sessionOnPage = this.InkMLDocument.AudioSessions.ItemAt(0);
    if (sessionOnPage != null && sessionOnPage != undefined) {
        page.AudioStrokes = sessionOnPage.AudioStrokes;
        page.SessionStart = sessionOnPage.Start;   
    }
    page.IdentifyStrokes(); 
    
    return page;
};

LiveScribe.LocalPdfPencast.prototype.GetPageCount = function () {
    return this.PdfPlusDocument.PageCount;
};

LiveScribe.LocalPdfPencast.prototype.GetPageIndex = function (pageAddress) {
    for (var index =0; index < this.PdfPlusDocument.PageAddresses.length; index++) {
        if (pageAddress == this.PdfPlusDocument.PageAddresses[index]) {
            return index;
        }
    }
    return 0;
    //return this.InkMLDocument.TraceGroups.FindItemIndex(pageAddress);
};

LiveScribe.LocalPdfPencast.prototype.GetPageList = function () {
    return this.PdfPlusDocument.Pages;
};

LiveScribe.LocalPdfPencast.prototype.GetFirstPage = function () {
    var page = this.GetPageByIndex(0);
    return page;
};

LiveScribe.LocalPdfPencast.prototype.GetPageByIndex = function (index) {
    var pageAddress = this.InkMLDocument.TraceGroups.ItemAt(index).ID;
    var page = this.GetPage(pageAddress);

    return page;
};




//----------------------------------------- Session Data ------------------------------------------
LiveScribe.LocalPdfPencast.prototype.GetSessions = function () {
    var sessions = new LiveScribe.Collections.NamedList();

    for (var index = 0; index < this.InkMLDocument.AudioSessions.Count(); index++) {
        var session = this.GetSession(index);
        sessions.Add(session.ID, session);
    }

    return sessions;
}

LiveScribe.LocalPdfPencast.prototype.GetSession = function (sessionIndex) {
    var session = new LiveScribe.PDFPlus.PDFPlusSession(); 
    session.AudioSession = this.InkMLDocument.AudioSessions.ItemAt(sessionIndex);
    session.ID = session.AudioSession.Name;
    session.Start = session.AudioSession.Start;
    session.SessionDuration = session.GetDuration();
    session.PageCount = this.PdfPlusDocument.PageCount;
    session.PageAddresses = this.PdfPlusDocument.PageAddresses;
    

    if (this.InkMLDocument.TraceGroups.Count() <= 0) {
        session.IsPaperless = true;
    }
    else {
        session.Pages = this.GetPages();

        for (var index = 0; index < session.Pages.Count(); index++) {
            var page = session.Pages.ItemAt(index);
            if (page.TraceGroup.ActiveArea.Size != null) {
                session.PageSize = page.TraceGroup.ActiveArea.Size;
            }
        }
    }

    return session;
};



//----------------------------------------- Audio File Data ------------------------------------------


function compare(a,b) {
  if (a.Start < b.Start)
     return -1;
  if (a.Start > b.Start)
    return 1;
  return 0;
}

LiveScribe.LocalPdfPencast.prototype.GetAllAudioFiles = function () {
    var audioFiles = new Array();

    if (this.HasAudio) {
        for (var sessionIndex = 0; sessionIndex < this.Sessions.Count() ; sessionIndex++) {
            var session = this.Sessions.ItemAt(sessionIndex);
            var sortedAudioFiles = session.AudioSession.AudioFiles.sort(compare);

            for (var index = 0; index < sortedAudioFiles.length; index++) {

                var audioFilesItem = sortedAudioFiles[index]

                var audioFile = new LiveScribe.InkML.InkMLAudioSessionAudioStroke();
                audioFile.Key = audioFilesItem.Key;
                audioFile.Start = audioFilesItem.Start;
                audioFile.End = audioFilesItem.End;

                audioFiles.push(audioFile);
            }
        }
    }

    return audioFiles;
};

LiveScribe.LocalPdfPencast.prototype.GetAdjustedAudioFiles = function () {

    if (null != this.AdjustedAudioFiles && undefined != this.AdjustedAudioFiles) {
        return this.AdjustedAudioFiles;
    }

    var audioFiles = new Array();
    if (this.HasAudio) {
        var start = 0;
        var sortedAudioFiles = this.AudioFileDataList.sort(compare);

        for (var index = 0; index < sortedAudioFiles.length; index++) {
            var audioFile = sortedAudioFiles[index];

            var adjustedAudioFile = new LiveScribe.InkML.InkMLAudioSessionAudioFile();
            adjustedAudioFile.Key = audioFile.Key;
            adjustedAudioFile.Start = start;
            adjustedAudioFile.End = adjustedAudioFile.Start + (audioFile.End - audioFile.Start);

            start = adjustedAudioFile.End;

            console.log("Pushing " + adjustedAudioFile.Key + " with duration " + (audioFile.End - audioFile.Start) + ", total duration now " + start);
            audioFiles.push(adjustedAudioFile);
        }
    }

    this.AdjustedAudioFiles = audioFiles;

    return this.AdjustedAudioFiles;
}

LiveScribe.LocalPdfPencast.prototype.GetAudioFileIndexByPosition = function (position) {
    var audioFiles = this.GetAdjustedAudioFiles();

    for (var index = 0; index < audioFiles.length; index++) {
        var audioFile = audioFiles[index];
        if (position >= audioFile.Start && position <= audioFile.End) {
            return index;
        }
    }
};

LiveScribe.LocalPdfPencast.prototype.GetAudioFileDataByPosition = function (position) {
    var audioFiles = this.GetAdjustedAudioFiles();

    for (var index = 0; index < audioFiles.length; index++) {
        var audioFile = audioFiles[index];
        if (position >= audioFile.Start && position <= audioFile.End) {
            return audioFile;
        }
    }
};

LiveScribe.LocalPdfPencast.prototype.GetAudioFileIndexByAudioStroke = function (audioStroke) {
    for (var index = 0; index < this.AudioFileDataList.length; index++) {
        var audioFile = this.AudioFileDataList[index];
        if (audioStroke.Start >= audioFile.Start && audioStroke.Start <= audioFile.End) {
            return index;
        }
    }
}

LiveScribe.LocalPdfPencast.prototype.GetAudioFileIndexByAnnotation = function (annotation) {
    for (var index = 0; index < this.AudioFileDataList.length; index++) {
        var audioFile = this.AudioFileDataList[index];
        if (annotation.CorrectedStart >= audioFile.Start && annotation.CorrectedStart <= audioFile.End) {
            return index;
        }
    }
}



//----------------------------------------- Audio Stroke Data ------------------------------------------
LiveScribe.LocalPdfPencast.prototype.GetAudioStrokes = function (pageAddress) {
    var pageAudioStrokes = new Array();

    for (var index = 0; index < this.AudioStrokes.length; index++) {
        var audioStroke = this.AudioStrokes[index]
        if (audioStroke.PageAddress == pageAddress) {
            pageAudioStrokes.push(audioStroke);
        }
    }

    return pageAudioStrokes;
};

LiveScribe.LocalPdfPencast.prototype.GetAllAudioStrokes = function () {
    var pageAudioStrokes = new Array();

    if (this.HasAudio) {
        for (var sessionIndex = 0; sessionIndex < this.Sessions.Count() ; sessionIndex++) {
            var session = this.Sessions.ItemAt(sessionIndex);

            for (var index = 0; index < session.AudioSession.AudioStrokes.length; index++) {
                var audioStrokeItem = session.AudioSession.AudioStrokes[index];
                pageAudioStrokes.push(audioStrokeItem);
            }
        }
    }

    return pageAudioStrokes;
};

LiveScribe.LocalPdfPencast.prototype.GetAdjustedAudioStrokeTimes = function () {
    var audioStrokes = new Array();

    if (this.HasAudio) {
        var adjustedAudioFiles = this.GetAdjustedAudioFiles();

        for (var index = 0; index < this.AudioStrokes.length; index++) {
            var audioStroke = this.AudioStrokes[index];
            var audioFileIndex = this.GetAudioFileIndexByAudioStroke(audioStroke);
            

            var newAudioStroke = new LiveScribe.InkML.InkMLAudioSessionAudioStroke();
            newAudioStroke.PageAddress = audioStroke.PageAddress;

            //MNaqvi
            if (null != audioFileIndex || undefined != audioFileIndex) {
                if (audioFileIndex == 0) {
                    newAudioStroke.Start = audioStroke.Start - this.AudioFileDataList[audioFileIndex].Start;
                    newAudioStroke.End = audioStroke.End - this.AudioFileDataList[audioFileIndex].Start;
                }
                else {
                    var audioFileStartDelta = this.AudioFileDataList[audioFileIndex].Start - adjustedAudioFiles[audioFileIndex].Start;
                    newAudioStroke.Start = audioStroke.Start - audioFileStartDelta;
                    newAudioStroke.End = audioStroke.End - audioFileStartDelta;
                }
            }



            audioStrokes.push(newAudioStroke);
        }
    }

    return audioStrokes;
};




//----------------------------------------- Annotation Data ------------------------------------------
LiveScribe.LocalPdfPencast.prototype.GetAllAnnotations = function () {
    var annotations = new Array();

    if (this.HasAudio) {
        for (var sessionIndex = 0; sessionIndex < this.Sessions.Count() ; sessionIndex++) {
            var session = this.Sessions.ItemAt(sessionIndex);

            for (var index = 0; index < session.AudioSession.Annotations.length; index++) {
                var audioSessionAnnotationItem = session.AudioSession.Annotations[index];
                annotations.push(audioSessionAnnotationItem);
            }
        }
    }

    return annotations;
};

LiveScribe.LocalPdfPencast.prototype.GetAdjustedAnnotationTimes = function () {
    var annotations = new Array();

    if (this.HasAudio) {
        var adjustedAudioFiles = this.GetAdjustedAudioFiles();

        for (var index = 0; index < this.Annotations.length; index++) {
            var annotation = this.Annotations[index];
            var audioFileIndex = this.GetAudioFileIndexByAnnotation(annotation);

            var newAnnotation = new LiveScribe.InkML.InkMLAudioSessionAnnotation();
            newAnnotation.PageAddress = annotation.PageAddress;

            if (audioFileIndex == 0) {
                newAnnotation.Start = annotation.Start - this.AudioFileDataList[audioFileIndex].Start;
                newAnnotation.End = annotation.End - this.AudioFileDataList[audioFileIndex].Start;
                newAnnotation.CorrectedStart = annotation.CorrectedStart - this.AudioFileDataList[audioFileIndex].Start;
                newAnnotation.CorrectedEnd = annotation.CorrectedEnd - this.AudioFileDataList[audioFileIndex].Start;
            }
            else {
                var audioFileStartDelta = this.AudioFileDataList[audioFileIndex].Start - adjustedAudioFiles[audioFileIndex].Start;
                newAnnotation.Start = annotation.Start - audioFileStartDelta;
                newAnnotation.End = annotation.End - audioFileStartDelta;
                newAnnotation.CorrectedStart = annotation.CorrectedStart - audioFileStartDelta;
                newAnnotation.CorrectedEnd = annotation.CorrectedEnd - audioFileStartDelta;
            }

            annotations.push(newAnnotation);
        }
    }

    return annotations;
};




//----------------------------------------- Trace Data ------------------------------------------
LiveScribe.LocalPdfPencast.prototype.GetTraceGroup = function (pageAddress) {
    return this.InkMLDocument.TraceGroups.Item(pageAddress);
};

LiveScribe.LocalPdfPencast.prototype.GetAdjustedSessionStrokes = function (pageIndex) {
    var sessionStrokes = this.Pages.ItemAt(pageIndex).SessionStrokes;
    var traceGroup = this.Pages.ItemAt(pageIndex).TraceGroup;
    var adjustedAudioFiles = this.GetAdjustedAudioFiles();

    var strokes = new Array();

    if (this.HasAudio) {
        for (var index = 0; index < sessionStrokes.length; index++) {
            var stroke = sessionStrokes[index];

            var audioFileIndex;
            if (stroke.AudioStrokeIndex != null) {
                var audioStroke = this.AudioStrokes[stroke.AudioStrokeIndex];
                audioFileIndex = this.GetAudioFileIndexByAudioStroke(audioStroke);
            }
            else {
                var annotation = this.Annotations[stroke.AnnotationIndex];
                audioFileIndex = this.GetAudioFileIndexByAnnotation(annotation);
            }

            
            var adjustedStroke = new LiveScribe.InkML.InkMLTraceGroupTrace();
            adjustedStroke.PageIndex = pageIndex;
            adjustedStroke.AudioStrokeIndex = stroke.AudioStrokeIndex;
            adjustedStroke.AnnotationIndex = stroke.AnnotationIndex;
            adjustedStroke.Points = stroke.Points;
            adjustedStroke.ContextRef = stroke.ContextRef;
            adjustedStroke.PositionOffset = stroke.PositionOffset;

            if (null != audioFileIndex && undefined != audioFileIndex) {
                if (audioFileIndex == 0) {
                    adjustedStroke.TimeOffset = ((traceGroup.TimeStamps[0].Time - this.AudioFileDataList[audioFileIndex].Start) + stroke.TimeOffset);
                }
                else {
                    var audioFileStartDelta = this.AudioFileDataList[audioFileIndex].Start - adjustedAudioFiles[audioFileIndex].Start;
                    adjustedStroke.TimeOffset = ((traceGroup.TimeStamps[0].Time + stroke.TimeOffset) - audioFileStartDelta);
                }
            }

            strokes.push(adjustedStroke);
        }
    }

    return strokes;
};




//----------------------------------------- Assets ------------------------------------------
LiveScribe.LocalPdfPencast.prototype.GetSessionAudioFile = function (id) {
    return this.PdfPlusDocument.AudioStreamCollection.Item(id);
};

LiveScribe.LocalPdfPencast.prototype.GetPageBackgroundImage = function (pageAddress) {
    if (this.InkMLDocument.BackgroundImages.Count() > 0) {
        try{
            var imageKey = this.InkMLDocument.BackgroundImages.Item(pageAddress).Key;
            var imageURI = this.PdfPlusDocument.ImageCollection.Item(imageKey).BlobURL;

            var image = new Image();
            image.src = imageURI;

            return image;
        }
        catch(exception){
            return null;
        }
    }
    else {
        return null;
    }
};



// -----------------------------------------  MixPanel Events Tracker  ------------------------------

LiveScribe.LocalPdfPencast.prototype.trackLaunchedEvent = function() {

    // Pencast is 'launched', track the event..
    // mixpanel.track("Pencast_Launched", {
    //     "source": "Local PDF File",
    //     "audioAndStrokes": !this.IsPaperless && this.HasAudio,
    //     "audioOnly": this.IsPaperless,
    //     "strokesOnly": !this.HasAudio,
    //     "numberOfPauses": this.AudioFileDataList.length - 1,
    //     "duration": TimeDuration2String(this.Duration)
    // });
}


//----------------------------------------- Event Handlers ------------------------------------------
LiveScribe.LocalPdfPencast.prototype.PdfPlusParserDocumentParseStartHandler = function () {
    if(this.OnLoadStart != null || this.OnLoadStart != undefined){
        this.OnLoadStart();
    }
};

LiveScribe.LocalPdfPencast.prototype.PdfPlusParserDocumentParseCompleteHandler = function (pdfPlusDocument) {
    this.PdfPlusDocument = pdfPlusDocument;

    if (this.OnLoadComplete != null || this.OnLoadComplete != undefined) {
        this.OnLoadComplete();
    }
};

LiveScribe.LocalPdfPencast.prototype.PdfPlusParserImagesParseCompleteHandler = function () {
    if (this.OnImageLoadComplete != null || this.OnImageLoadComplete != undefined) {
        this.OnImageLoadComplete();
    }
};

LiveScribe.LocalPdfPencast.prototype.PdfPlusParserInkMLParseCompleteHandler = function (inkMLDocument) {
    this.InkMLDocument = inkMLDocument;

    if (this.OnInkMlLoadComplete != null || this.OnInkMlLoadComplete != undefined) {
        this.OnInkMlLoadComplete();
    }

    this.CompleteDataLoading();
};

LiveScribe.LocalPdfPencast.prototype.PdfPlusParserAudioParseCompleteHandler = function (audioCollection) {
    this.PdfPlusDocument.AudioStreamCollection = audioCollection;

    if (this.OnAudioLoadComplete != null || this.OnAudioLoadComplete != undefined) {
        this.OnAudioLoadComplete();
    }
};

LiveScribe.LocalPdfPencast.prototype.PdfPlusParserMessageHandler = function () { };
