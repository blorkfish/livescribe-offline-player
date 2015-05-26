// ***********************************************************************************************************
// Name:Pencast Base
// Type:Pencast Document Object Base Class
// Author: Cliff Gower
//************************************************************************************************************

// Namespace
var LiveScribe = LiveScribe || {};


LiveScribe.PencastType = {
    REMOTE_CLASSIC: 0,
    REMOTE_PDF: 1,
    LOCAL_PDF: 2
};


// Livescribe Pencast Base Class
LiveScribe.PencastBase = function () {
    this.DocumentId = null;
    this.StartPageId = null;
    this.StartSessionId = null;
    this.Duration = 0;
    this.HasAudio = true;
    this.IsPaperless = false;

    this.Sessions = null;
    this.Pages = null;
    this.AudioStrokes = null;
    this.Annotations = null;
    this.AudioFileDataList = null;
    this.AudioFiles = null;

    this.PageTemplates = null;
    this.PageInstances = null;
};

LiveScribe.PencastBase.prototype.InitBase = function (pencastData, cak) {
    this.DocumentId = pencastData.DocumentId;
    this.StartPageId = pencastData.PageId;
    this.StartSessionId = pencastData.SessionId;
    this.CAK = cak;
};

LiveScribe.PencastBase.prototype.Start = function () { };

LiveScribe.PencastBase.prototype.CompleteDataLoading = function () { };

LiveScribe.PencastBase.prototype.GetPageCount = function () { };

LiveScribe.PencastBase.prototype.GetPageIndex = function (pageAddress) { };

LiveScribe.PencastBase.prototype.GetPageList = function () { };

LiveScribe.PencastBase.prototype.GetFirstPage = function () { };

LiveScribe.PencastBase.prototype.GetPageByIndex = function (index) { };

LiveScribe.PencastBase.prototype.GetPage = function (pageAddress) { };

LiveScribe.PencastBase.prototype.GetPages = function () { };

LiveScribe.PencastBase.prototype.GetSession = function (index) { };

LiveScribe.PencastBase.prototype.GetSessions = function () { };

LiveScribe.PencastBase.prototype.GetAudioStrokes = function (pageAddress) { };

LiveScribe.PencastBase.prototype.GetTraceGroup = function (pageAddress) { };

LiveScribe.PencastBase.prototype.GetSessionAudioFile = function (id) { };

LiveScribe.PencastBase.prototype.GetPageBackgroundImage = function (pageAddress) { };






