// ***********************************************************************************************************
// Name:Remote Classic Pencast
// Type:Pencast Document Object
// Author: Cliff Gower
//************************************************************************************************************

// Namespace
var LiveScribe = LiveScribe || {};


// Livescribe Local PDF Pencast Class
LiveScribe.RemoteClassicPencast = function (pencastData, cak) {
    this.BaseURL = null;
    this.URLSuffix = null;
    this.EnvironmentManager = new LiveScribe.Web.EnvironmentManager();
    this.RequestManager = new LiveScribe.Net.RequestManager();
    this.StrokeMLParser = new LiveScribe.StrokeML.StrokeMLParser();
    this.PageLoadActivities = new Array();
    this.AudioLoadActivities = new Array();
    this.CurrentLoadingPageID = null;
    this.CurrentLoadingAudioID = null;

    this.PageInstances = new LiveScribe.Collections.NamedList();
    this.PageTemplates = new LiveScribe.Collections.NamedList();
    this.PageStrokes = new LiveScribe.Collections.NamedList();
    this.AudioFiles = new LiveScribe.Collections.NamedList();

    this.SessionStartTimes = new Array();
    this.SessionCorrectedStartTimes = new Array();
    this.SessionStartTimeCorrectionDeltas = new Array();
    
    this.SessionLoadedDelegate = LiveScribe.Events.CreateDelegate(this, this.SessionLoadedHandler);
    this.SessionAudioLoadedDelegate = LiveScribe.Events.CreateDelegate(this, this.SessionAudioLoadedHandler);
    this.PageInstanceLoadedDelegate = LiveScribe.Events.CreateDelegate(this, this.PageInstanceLoadedHandler);
    this.PageTemplateLoadedDelegate = LiveScribe.Events.CreateDelegate(this, this.PageTemplateLoadedHandler);
    this.StrokesLoadedDelegate = LiveScribe.Events.CreateDelegate(this, this.PageStrokesLoadedHandler);
    this.StrokeMLParseCompleteDelegate = LiveScribe.Events.CreateDelegate(this, this.StrokeMLParseCompleteHandler);
    this.StrokeMLParser.OnDocumentParseComplete = this.StrokeMLParseCompleteDelegate;


    this.OnLoadStart = null;
    this.OnDataLoadComplete = null;
    this.OnLoadComplete = null;
    this.OnPageInstanceLoadComplete = null;
    this.OnPageTemplateLoadComplete = null;
    this.OnPageStrokesLoadComplete = null;
    this.OnSessionAudioLoadComplete = null;
    this.OnPageStrokesParseComplete = null;

    this.InitBase(pencastData, cak);
    this.GenerateUrlParts();
};

LiveScribe.RemoteClassicPencast.prototype = new LiveScribe.PencastBase();


// ---------------------------- methods -----------------------------------------
LiveScribe.RemoteClassicPencast.prototype.Start = function () {
    if (this.OnLoadStart != null && this.OnLoadStart != undefined) {
        this.OnLoadStart();
    }

    if (this.StartPageId != undefined) {
        this.LoadPageInstance(this.StartPageId);
    }
    else if (this.StartSessionId != undefined) {
        this.LoadSession(this.StartSessionId);
    }
};

LiveScribe.RemoteClassicPencast.prototype.GenerateUrlParts = function () {
    var envURL = this.EnvironmentManager.GetEnvironment();
    this.BaseURL = envURL + 'document/' + this.DocumentId;
    this.URLSuffix = "?cak=" + this.CAK;
};

LiveScribe.RemoteClassicPencast.prototype.LoadPageInstance = function (pageID) {
    this.CurrentLoadingPageID = pageID;

    var requestURL = this.BaseURL + "/page/" + pageID + ".json" + this.URLSuffix;

    this.RequestManager.Requests.Add(requestURL, new LiveScribe.Net.JSONRequest(requestURL, this.PageInstanceLoadedDelegate, true, '', ''));
    this.RequestManager.Requests.Item(requestURL).SendRequest();
};

LiveScribe.RemoteClassicPencast.prototype.LoadPageTemplate = function (pageID) {
    var requestURL = this.BaseURL + "/template/" + pageID + ".json" + this.URLSuffix;

    this.RequestManager.Requests.Add(requestURL, new LiveScribe.Net.JSONRequest(requestURL, this.PageTemplateLoadedDelegate, true, '', ''));
    this.RequestManager.Requests.Item(requestURL).SendRequest();
};

LiveScribe.RemoteClassicPencast.prototype.LoadPageStrokes = function (pageID, strokeID) {
    var requestURL = this.BaseURL + "/page/" + pageID + "/stroke/" + strokeID + this.URLSuffix;

    this.RequestManager.Requests.Add(requestURL, new LiveScribe.Net.XMLRequest(requestURL, this.StrokesLoadedDelegate, true, '', ''));
    this.RequestManager.Requests.Item(requestURL).SendRequest();
};

LiveScribe.RemoteClassicPencast.prototype.LoadSessionAudio = function (audioData) {
    this.CurrentLoadingAudioID = audioData.AudioID

    var requestURL = this.BaseURL + "/session/" + audioData.SessionID + "/audio/" + audioData.AudioID + this.URLSuffix;

    this.RequestManager.Requests.Add(requestURL, new LiveScribe.Net.AssetRequest(requestURL, this.SessionAudioLoadedDelegate, true, '', ''));
    this.RequestManager.Requests.Item(requestURL).SendRequest();
};

LiveScribe.RemoteClassicPencast.prototype.LoadSession = function (sessionID) {
    var requestURL = this.BaseURL + "/session/" + sessionID + this.URLSuffix;

    this.RequestManager.Requests.Add(requestURL, new LiveScribe.Net.JSONRequest(requestURL, this.SessionLoadedDelegate, true, '', ''));
    this.RequestManager.Requests.Item(requestURL).SendRequest();
};

LiveScribe.RemoteClassicPencast.prototype.CompleteDataLoading = function () {
    if (this.HasAudio) {
        this.LoadSessionAudio(this.AudioLoadActivities[0]);
    }

    this.Sessions = this.GetSessions();
    this.AudioStrokes = this.GetAllAudioStrokes();
    this.Annotations = this.GetAllAnnotations();
    this.AudioFileDataList = this.GetAllAudioFiles();
    this.Pages = this.GetPages();

    for (var index = 0; index < this.Sessions.Count() ; index++) {
        this.Duration += this.Sessions.ItemAt(index).SessionDuration;
    }

    for (var index = 0; index < this.Pages.Count() ; index++) {
        this.Pages.ItemAt(index).IdentifyStrokes();
    }

    if (this.OnDataLoadComplete != null && this.OnDataLoadComplete != undefined) {
        setTimeout(LiveScribe.Events.CreateDelegate(this, this.OnDataLoadComplete), 25);
    }

    if (!this.HasAudio) {
        if (this.OnLoadComplete != null && this.OnLoadComplete != undefined) {
            setTimeout(LiveScribe.Events.CreateDelegate(this, this.OnLoadComplete), 25);
        }
    }
}


//----------------------------------------- Page Data ------------------------------------------
LiveScribe.RemoteClassicPencast.prototype.GetPages = function () {
    var pages = new LiveScribe.Collections.NamedList();

    for (var index = 0; index < this.PageInstances.Count() ; index++) {
        var newPage = this.GetPage(this.PageInstances.ItemAt(index).id)
        pages.Add(newPage.ID, newPage);
    }

    return pages;
}

LiveScribe.RemoteClassicPencast.prototype.GetPage = function (pageAddress) {
    var page = new LiveScribe.PDFPlus.PDFPlusPage()
    page.ID = pageAddress;
    page.BackgroundImage = this.GetPageBackgroundImage(pageAddress);
    page.TraceGroup = this.GetTraceGroup(pageAddress);
    page.AudioStrokes = this.GetAllAudioStrokes();
    page.Annotations = this.GetAllAnnotations();

    return page;
};

LiveScribe.RemoteClassicPencast.prototype.GetPageCount = function () {
    return this.PageInstances.Count();
};

LiveScribe.RemoteClassicPencast.prototype.GetPageIndex = function (pageAddress) {
    return this.PageInstances.FindItemIndex(pageAddress);
};

LiveScribe.RemoteClassicPencast.prototype.GetPageList = function () {
    return this.PageInstances;
};

LiveScribe.RemoteClassicPencast.prototype.GetFirstPage = function () {
    var page = this.GetPageByIndex(0);
    return page;
};

LiveScribe.RemoteClassicPencast.prototype.GetPageByIndex = function (index) {
    var pageAddress = this.PageInstances.ItemAt(index).id
    var page = this.GetPage(pageAddress);

    return page;
};

LiveScribe.RemoteClassicPencast.prototype.GetPageAddresses = function (sessionIndex) {
    var pageAddresses = new Array();

    if (this.HasAudio) {
        var allSessionItems = this.PageInstances.ItemAt(0).sessions[sessionIndex].audioSessionList;
        for (var index = 0; index < allSessionItems.length; index++) {
            var pageID = allSessionItems[index].pageid
            if (pageAddresses.indexOf(pageID) < 0) {
                pageAddresses.push(pageID);
            }
        }
    }
    else {
        pageAddresses.push(this.PageInstances.ItemAt(0).id);
    }

    return pageAddresses;
};





//----------------------------------------- Session Data ------------------------------------------
LiveScribe.RemoteClassicPencast.prototype.GetSessions = function () {
    var sessions = new LiveScribe.Collections.NamedList();

    for (var index = 0; index < this.PageInstances.ItemAt(0).sessions.length; index++) {
        var session = this.GetSession(index);
        sessions.Add(session.ID, session);
    }

    return sessions;
}

LiveScribe.RemoteClassicPencast.prototype.GetSession = function (sessionIndex) {
    var session = new LiveScribe.PDFPlus.PDFPlusSession();
    session.ID = this.PageInstances.ItemAt(0).sessions[sessionIndex].id
    session.AudioSession = this.GetAudioSession(sessionIndex);
    session.Start = this.HasAudio ? this.SessionCorrectedStartTimes[sessionIndex] : 0;
    session.SessionDuration = this.HasAudio ? session.GetDuration() : 0;
    session.PageCount = this.HasAudio ? this.PageInstances.ItemAt(0).sessions[sessionIndex].audioSessionList.length : 1;
    session.PageAddresses = this.GetPageAddresses(sessionIndex);
    session.IsPaperless = this.PageStrokes.Count() <= 0 ? true : false;
    session.HasAudio = this.HasAudio;

    return session;
};



//----------------------------------------- Audio Session Data ------------------------------------------
LiveScribe.RemoteClassicPencast.prototype.GetAudioSession = function (sessionIndex) {
    var pageInstance = this.PageInstances.ItemAt(0);

    if (this.HasAudio) {
        var audioSession = new LiveScribe.InkML.InkMLAudioSession();
        audioSession.Name = pageInstance.sessions[sessionIndex].name;
        audioSession.Start = parseInt(pageInstance.sessions[sessionIndex].startTime);
        audioSession.End = parseInt(pageInstance.sessions[sessionIndex].endTime);
        audioSession.CorrectedStart = parseInt(pageInstance.sessions[sessionIndex].startTime) - this.SessionStartTimes[0] - this.SessionStartTimeCorrectionDeltas[sessionIndex];
        audioSession.CorrectedEnd = parseInt(pageInstance.sessions[sessionIndex].endTime) - this.SessionStartTimes[0] - this.SessionStartTimeCorrectionDeltas[sessionIndex];

        for (var index = 0; index < pageInstance.sessions[sessionIndex].audioList.length; index++) {
            var audioListItem = pageInstance.sessions[sessionIndex].audioList[index];

            var audioFile = new LiveScribe.InkML.InkMLAudioSessionAudioFile();
            audioFile.Key = audioListItem.audioId;
            audioFile.Start = audioListItem.startTime;
            audioFile.End = audioListItem.endTime;

            audioSession.AudioFiles.push(audioFile);
        }

        for (var index = 0; index < pageInstance.sessions[sessionIndex].audioSessionList.length; index++) {
            var audioSessionListItem = pageInstance.sessions[sessionIndex].audioSessionList[index];

            var audioStroke = new LiveScribe.InkML.InkMLAudioSessionAudioStroke();
            audioStroke.PageAddress = audioSessionListItem.pageid;
            audioStroke.Start = audioSessionListItem.startTime;
            audioStroke.End = audioSessionListItem.endTime;
            audioStroke.Offset = audioSessionListItem.startTime;
            audioStroke.CorrectedStart = audioSessionListItem.startTime - this.SessionStartTimes[0] - this.SessionStartTimeCorrectionDeltas[sessionIndex];
            audioStroke.CorrectedEnd = audioSessionListItem.endTime - this.SessionStartTimes[0] - this.SessionStartTimeCorrectionDeltas[sessionIndex];
            audioStroke.CorrectedOffset = audioSessionListItem.startTime - this.SessionStartTimes[0] - this.SessionStartTimeCorrectionDeltas[sessionIndex];

            audioSession.AudioStrokes.push(audioStroke);
        }

        for (var index = 0; index < pageInstance.sessions[sessionIndex].annotSessionList.length; index++) {
            var annotationSessionListItem = pageInstance.sessions[sessionIndex].annotSessionList[index];

            var annotation = new LiveScribe.InkML.InkMLAudioSessionAnnotation();
            annotation.PageAddress = annotationSessionListItem.pageId;
            annotation.AudioStartTime = annotationSessionListItem.audioStartTime;
            annotation.Start = annotationSessionListItem.startTime;
            annotation.End = annotationSessionListItem.endTime;
            annotation.CorrectedStart = annotationSessionListItem.audioStartTime;
            annotation.CorrectedEnd = (annotationSessionListItem.audioStartTime + (annotationSessionListItem.endTime - annotationSessionListItem.startTime));
            annotation.Offset = 0;

            audioSession.Annotations.push(annotation);
        }
    }

    return audioSession;
}


//----------------------------------------- Audio File Data ------------------------------------------
LiveScribe.RemoteClassicPencast.prototype.GetAllAudioFiles = function () {
    var audioFiles = new Array();

    if (this.HasAudio) {
        for (var sessionIndex = 0; sessionIndex < this.Sessions.Count() ; sessionIndex++) {
            var session = this.Sessions.ItemAt(sessionIndex);
            for (var index = 0; index < session.AudioSession.AudioFiles.length; index++) {
                var audioFilesItem = session.AudioSession.AudioFiles[index]

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


LiveScribe.RemoteClassicPencast.prototype.GetAdjustedAudioFiles = function () {
    var audioFiles = new Array();

    if (this.HasAudio) {
        var start = 0;

        for (var index = 0; index < this.AudioFileDataList.length; index++) {
            var audioFile = this.AudioFileDataList[index];

            var adjustedAudioFile = new LiveScribe.InkML.InkMLAudioSessionAudioFile();
            adjustedAudioFile.Key = audioFile.Key;
            adjustedAudioFile.Start = start;
            adjustedAudioFile.End = adjustedAudioFile.Start + (audioFile.End - audioFile.Start);

            start = adjustedAudioFile.End;

            audioFiles.push(adjustedAudioFile);
        }
    }

    return audioFiles;
}

LiveScribe.RemoteClassicPencast.prototype.GetAudioFileIndexByPosition = function (position) {
    var audioFiles = this.GetAdjustedAudioFiles();

    for (var index = 0; index < audioFiles.length; index++) {
        var audioFile = audioFiles[index];
        if (position >= audioFile.Start && position <= audioFile.End) {
            return index;
        }
    }
};

LiveScribe.RemoteClassicPencast.prototype.GetAudioFileDataByPosition = function (position) {
    var audioFiles = this.GetAdjustedAudioFiles();

    for (var index = 0; index < audioFiles.length; index++) {
        var audioFile = audioFiles[index];
        if (position >= audioFile.Start && position <= audioFile.End) {
            return audioFile;
        }
    }
};

LiveScribe.RemoteClassicPencast.prototype.GetAudioFileIndexByAudioStroke = function (audioStroke) {
    for (var index = 0; index < this.AudioFileDataList.length; index++) {
        var audioFile = this.AudioFileDataList[index];
        if (audioStroke.Start >= audioFile.Start && audioStroke.Start <= audioFile.End) {
            return index;
        }
    }
}

LiveScribe.RemoteClassicPencast.prototype.GetAudioFileIndexByAnnotation = function (annotation) {
    for (var index = 0; index < this.AudioFileDataList.length; index++) {
        var audioFile = this.AudioFileDataList[index];
        if (annotation.CorrectedStart >= audioFile.Start && annotation.CorrectedStart <= audioFile.End) {
            return index;
        }
    }
}



//----------------------------------------- Audio Stroke Data ------------------------------------------
LiveScribe.RemoteClassicPencast.prototype.GetAllAudioStrokes = function () {
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

LiveScribe.RemoteClassicPencast.prototype.GetAdjustedAudioStrokeTimes = function () {
    var audioStrokes = new Array();

    if (this.HasAudio) {
        var adjustedAudioFiles = this.GetAdjustedAudioFiles();

        for (var index = 0; index < this.AudioStrokes.length; index++) {
            var audioStroke = this.AudioStrokes[index];
            var audioFileIndex = this.GetAudioFileIndexByAudioStroke(audioStroke);

            var newAudioStroke = new LiveScribe.InkML.InkMLAudioSessionAudioStroke();
            newAudioStroke.PageAddress = audioStroke.PageAddress;

            if (audioFileIndex == 0) {
                newAudioStroke.Start = audioStroke.Start - this.AudioFileDataList[audioFileIndex].Start;
                newAudioStroke.End = audioStroke.End - this.AudioFileDataList[audioFileIndex].Start;
            }
            else {
                var audioFileStartDelta = this.AudioFileDataList[audioFileIndex].Start - adjustedAudioFiles[audioFileIndex].Start;
                newAudioStroke.Start = audioStroke.Start - audioFileStartDelta;
                newAudioStroke.End = audioStroke.End - audioFileStartDelta;
            }

            audioStrokes.push(newAudioStroke);
        }
    }

    return audioStrokes;
};




//----------------------------------------- Annotation Data ------------------------------------------
LiveScribe.RemoteClassicPencast.prototype.GetAllAnnotations = function () {
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

LiveScribe.RemoteClassicPencast.prototype.GetAdjustedAnnotationTimes = function () {
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

LiveScribe.RemoteClassicPencast.prototype.GetAdjustedSessionStrokes = function (pageIndex) {
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

            if (audioFileIndex == 0) {
                adjustedStroke.TimeOffset = (stroke.TimeOffset - this.AudioFileDataList[audioFileIndex].Start);
            }
            else {
                var audioFileStartDelta = this.AudioFileDataList[audioFileIndex].Start - adjustedAudioFiles[audioFileIndex].Start;
                adjustedStroke.TimeOffset = (stroke.TimeOffset - audioFileStartDelta);
            }

            strokes.push(adjustedStroke);
        }
    }

    return strokes;
};



//----------------------------------------- Trace Data ------------------------------------------
LiveScribe.RemoteClassicPencast.prototype.GetTraceGroup = function (pageAddress) {
    var traceGroup = this.PageStrokes.Item(pageAddress).Strokes.Item(pageAddress);

    for (var index = 0; index < traceGroup.Traces.length; index++) {
        var trace = traceGroup.Traces[index];

        for (var sessionIndex = 0; sessionIndex < this.SessionStartTimes.length; sessionIndex++) {
            if (sessionIndex == 0) {
                if (trace.TimeOffset < this.SessionStartTimes[sessionIndex]) {
                    trace.CorrectedTimeOffset = this.HasAudio ? (trace.TimeOffset - this.SessionStartTimes[0] - this.SessionStartTimeCorrectionDeltas[sessionIndex]) : 0;
                    break;
                }
                if (trace.TimeOffset > this.SessionStartTimes[sessionIndex] && trace.TimeOffset < this.SessionStartTimes[sessionIndex + 1]) {
                    trace.CorrectedTimeOffset = this.HasAudio ? (trace.TimeOffset - this.SessionStartTimes[0] - this.SessionStartTimeCorrectionDeltas[sessionIndex]) : 0;
                    break;
                }
            }
            else if (sessionIndex == this.SessionStartTimes.length - 1) {
                if (trace.TimeOffset > this.SessionStartTimes[sessionIndex]) {
                    trace.CorrectedTimeOffset = this.HasAudio ? (trace.TimeOffset - this.SessionStartTimes[0] - this.SessionStartTimeCorrectionDeltas[sessionIndex]) : 0;
                    break;
                }
            }
            else {
                if (trace.TimeOffset > this.SessionStartTimes[sessionIndex] && trace.TimeOffset < this.SessionStartTimes[sessionIndex + 1]) {
                    trace.CorrectedTimeOffset = this.HasAudio ? (trace.TimeOffset - this.SessionStartTimes[0] - this.SessionStartTimeCorrectionDeltas[sessionIndex]) : 0;
                    break;
                }
            }
        }
        
    }

    var size = new LiveScribe.InkML.InkMLTraceGroupActiveAreaDimension();
    size.X = MM2AU(this.PageTemplates.Item(this.PageInstances.Item(pageAddress).templateId).width);
    size.Y = MM2AU(this.PageTemplates.Item(this.PageInstances.Item(pageAddress).templateId).height);

    traceGroup.ActiveArea.Size = size;

    var cropBoundPair1 = new LiveScribe.InkML.InkMLTraceGroupActiveAreaDimension();
    cropBoundPair1.X = MM2AU(this.PageTemplates.Item(this.PageInstances.Item(pageAddress).templateId).x);
    cropBoundPair1.Y = MM2AU(this.PageTemplates.Item(this.PageInstances.Item(pageAddress).templateId).y);

    var cropBoundPair2 = new LiveScribe.InkML.InkMLTraceGroupActiveAreaDimension();
    cropBoundPair2.X = size.X - (cropBoundPair1.X * 2);
    cropBoundPair2.Y = size.Y - (cropBoundPair1.Y * 2);

    var cropBounds = new Array();
    cropBounds.push(cropBoundPair1);
    cropBounds.push(cropBoundPair2);

    traceGroup.ActiveArea.CropBounds = cropBounds;

    return traceGroup;
};



//----------------------------------------- Assets ------------------------------------------
LiveScribe.RemoteClassicPencast.prototype.GetSessionAudioFile = function (id) {
    return this.AudioFiles.Item(id);
};

LiveScribe.RemoteClassicPencast.prototype.GetPageBackgroundImage = function (pageAddress) {
    var templateID = this.PageInstances.Item(pageAddress).templateId;
    var backgroundImageList = this.PageTemplates.Item(templateID).imageList;

    if (backgroundImageList.length > 0) {
        try {
            var imageURI = "data:image/png;base64," + backgroundImageList[0].file.data;

            var image = new Image();
            image.src = imageURI;

            return image;
        }
        catch (exception) {
            return null;
        }
    }
    else {
        return null;
    }
};



// ---------------------------- load event handlers -----------------------------------------
LiveScribe.RemoteClassicPencast.prototype.DocumentLoadedHandler = function () {

};

LiveScribe.RemoteClassicPencast.prototype.PageInstanceLoadedHandler = function (response) {
    if (response == null || response == undefined) { return; }

    if (this.PageLoadActivities.length <= 0) {
        if (response.sessions.length > 0) {
            for (var sessionIndex = 0; sessionIndex < response.sessions.length; sessionIndex++) {
                var session = response.sessions[sessionIndex];

                for (var index = 0; index < session.audioSessionList.length; index++) {
                    var pageID = session.audioSessionList[index].pageid;

                    if (this.PageLoadActivities.indexOf(pageID) < 0) {
                        this.PageLoadActivities.push(pageID);
                    }
                }

                for (var index = 0; index < response.sessions[sessionIndex].audioList.length; index++) {
                    var audioID = session.audioList[index].audioId;

                    if (this.AudioLoadActivities.indexOf({ "AudioID": audioID, "SessionID": session.id }) < 0) {
                        this.AudioLoadActivities.push({ "AudioID": audioID, "SessionID": session.id });
                    }
                }

                if (sessionIndex == 0) {
                    this.SessionStartTimes[sessionIndex] = session.audioList[0].startTime;
                    this.SessionCorrectedStartTimes[sessionIndex] = session.audioList[0].startTime;
                    this.SessionStartTimeCorrectionDeltas[sessionIndex] = 0
                }
                else {
                    this.SessionStartTimes[sessionIndex] = response.sessions[sessionIndex].audioList[0].startTime;
                    this.SessionCorrectedStartTimes[sessionIndex] = response.sessions[(sessionIndex - 1)].audioList[0].endTime - this.SessionStartTimeCorrectionDeltas[sessionIndex - 1];
                    this.SessionStartTimeCorrectionDeltas[sessionIndex] = this.SessionStartTimeCorrectionDeltas[sessionIndex - 1] + (response.sessions[sessionIndex].audioList[0].startTime - this.SessionCorrectedStartTimes[sessionIndex]);
                }
            }

            if (this.PageLoadActivities.length > 0) {
                this.LoadPageInstance(this.PageLoadActivities[0]);
            }
            else {
                this.IsPaperless = true;
            }
        }
        else {
            this.HasAudio = false;

            this.PageInstances.Add(this.CurrentLoadingPageID, response);
            this.LoadPageTemplate(response.templateId);
        }   
    }
    else {
        this.PageInstances.Add(this.CurrentLoadingPageID, response);
        this.LoadPageTemplate(response.templateId);
    }

    if (this.PageLoadActivities.length == 1) {
        if (this.OnPageInstanceLoadComplete != null && this.OnPageInstanceLoadComplete != undefined) {
            this.OnPageInstanceLoadComplete();
        }
    }
};

LiveScribe.RemoteClassicPencast.prototype.PageTemplateLoadedHandler = function (response) {
    if (response != null && response != undefined) {
        this.PageTemplates.Add(response.id, response);
    }

    if (this.PageLoadActivities.length == 1) {
        if (this.OnPageTemplateLoadComplete != null && this.OnPageTemplateLoadComplete != undefined) {
            this.OnPageTemplateLoadComplete();
        }
    }

    this.LoadPageStrokes(this.CurrentLoadingPageID, this.PageInstances.Item(this.CurrentLoadingPageID).strokeId)
};

LiveScribe.RemoteClassicPencast.prototype.PageStrokesLoadedHandler = function (response) {
    if (response != null && response != undefined) {
        response = '<?xml version="1.0" encoding="utf-8" ?>' + response;
        this.StrokeMLParser.RawData = response;
        this.StrokeMLParser.PageID = this.CurrentLoadingPageID;
        this.StrokeMLParser.Parse();
    }
};

LiveScribe.RemoteClassicPencast.prototype.SessionLoadedHandler = function (response) {
    if (response != null && response != undefined) {
        this.Sessions.Add(response);
    }
};

LiveScribe.RemoteClassicPencast.prototype.SessionAudioLoadedHandler = function (response) {
    if (response != null && response != undefined) {
        var audioMLParser = new LiveScribe.AudioML.AudioMLParser();
        audioMLParser.RawData = response;
        audioMLParser.Load();

        var audioData = audioMLParser.GetAudioData().replace(/\s/g, '');
        var audioBinary = atob(audioData);

        var audioFile = new LiveScribe.PDFPlus.AudioStream(null);
        audioFile.Base64 = audioData;
        audioFile.URI = "data:audio/mp4;base64," + audioData;
        audioFile.Blob = new Blob([audioBinary]);
        audioFile.GenerateBlobURL();

        this.AudioFiles.Add(this.CurrentLoadingAudioID, audioFile);

        this.AudioLoadActivities.shift();
        if (this.AudioLoadActivities.length > 0) {
            this.LoadSessionAudio(this.AudioLoadActivities[0]);
        }

        if (this.AudioLoadActivities.length <= 0) {
            if (this.OnSessionAudioLoadComplete != null && this.OnSessionAudioLoadComplete != undefined) {
                this.OnSessionAudioLoadComplete();
            }

            if (this.OnLoadComplete != null && this.OnLoadComplete != undefined) {
                this.OnLoadComplete();
            }
        }
    }
};


// ---------------------------- stroke parsing event handlers -----------------------------------------
LiveScribe.RemoteClassicPencast.prototype.StrokeMLParseCompleteHandler = function (strokeMLDocument) {
    this.PageStrokes.Add(this.CurrentLoadingPageID, strokeMLDocument);

    this.PageLoadActivities.shift();
    if (this.PageLoadActivities.length > 0) {
        this.LoadPageInstance(this.PageLoadActivities[0]);
    }

    if (this.PageLoadActivities.length <= 0) {
        if (this.OnPageStrokesLoadComplete != null && this.OnPageStrokesLoadComplete != undefined) {
            this.OnPageStrokesLoadComplete();
        }

        this.CompleteDataLoading();
    }
};
