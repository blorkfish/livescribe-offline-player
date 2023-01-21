// ***********************************************************************************************************
// Name:Pencast Player
// Type:Application
// Author: Cliff Gower
//************************************************************************************************************

// Namespace
var LiveScribe = LiveScribe || {};


LiveScribe.PlayerParameters = {
    USER_ID: "userId",
    CAK: "cak",
    DOCUMENT_ID: "docId",
    PAGE_ID: "pageId",
    SESSION_ID: "sessionId",
    LOCAL: "local"
};


LiveScribe.PlayerEvents = {
    INITIALLIZE: 0,
    INITIALLIZE_COMPLETE: 1,
    LOAD: 2,
    LOAD_COMPLETE: 3,
    PLAY: 4,
    PROGRESS: 5,
    DONE: 6,
    PAUSE: 7,
    STOP: 8,
    UNLOAD: 9,
    ERROR: 10
}


// ******************** Livescribe Player Object *************************************************
LiveScribe.Player = function () {
    this.MobileSafari;
    this.UserId = "undef";
    this.CAK = null;
    this.IsPlaying = false;
    this.IsPaused = true;
    this.IsFlipping = false;
    this.IsPaperless = false;
    this.StartPlayingOnOpen = false;
    this.LocalFile = null;
    this.ManualPaginationEngaged = false;
    this.UseWebAudioAPI = false;
    this.FirstWebAudioFileLoaded = false;
    this.WebAudioFilesToConvert = null;

    this.NonSessionStrokeColor = "#000000";
    this.SessionStrokeColor = "#008000";
    this.SessionStrokePreviewColor = "#AAAAAA";
    this.BackGroundColor = "#FFFFFF";
    this.LineWidth = "6";

    this.PreviewStroke = true;
    this.AutoPageTurn = true;
    this.AnimateStrokes = true;
    this.PagePersisted = -1;

    this.SkipDuration = 10000;  //in milliseconds

    this.UrlManager = null;
    this.WebContext = null;

    this.BusyModal = null;
    this.MessageModule = null;
    this.SmartBannerModule = null;
    this.FileLoadModule = null;
    this.FileLoadDropZoneModule = null;
    this.PageInfoModule = null;
    this.PlaybackControlsModule = null;
    this.PaperlessIconModule = null;

    this.PageForwardButton = null;
    this.PageBackButton = null;

    this.ZoomInButton = null;
    this.ZoomOutButton = null;

    this.SettingsButton = null;
    this.PreviewStrokeToggle = null;
    this.AutoPageTurnToggle = null;

    this.ThumbnailPaneOpenButton = null;
    this.ThumbnailPaneCloseButton = null;
    this.ThumbnailPane = null;

    this.SettingsButton = null;
    this.PlayButton = null;
    this.PauseButton = null;
    this.ForwardButton = null;
    this.BackButton = null;
    this.ProgressSlider = null;
    this.ProgressScrubber = null;
    this.KeyControls = null;
    this.PageIndicator = null;
    this.PlaybackProgressIndicator = null;

    this.AnimationController = null;
    this.CanvasController = null;
    this.AudioPlayer = null;
    this.LocalFileLoader = null;

    this.Pencast = null;
    this.PencastType = null;
    this.CurrentSession = null;
    this.CurrentPage = null;
    this.CurrentPageIndex = 0;
    this.CurrentManualPageIndex = 0;
    this.StartTime = null;

    this.isPlayedEventTracked = false;

    LiveScribe.Events.AddHandler(window, 'resize', LiveScribe.Events.CreateDelegate(this, this.WindowResizeHandler));

    this.AddEvent(LiveScribe.PlayerEvents.INITIALLIZE);
    this.AddEvent(LiveScribe.PlayerEvents.LOAD);
    this.AddEvent(LiveScribe.PlayerEvents.LOAD_COMPLETE);
    this.AddEvent(LiveScribe.PlayerEvents.PLAY);
    this.AddEvent(LiveScribe.PlayerEvents.PROGRESS);
    this.AddEvent(LiveScribe.PlayerEvents.DONE);
    this.AddEvent(LiveScribe.PlayerEvents.PAUSE);
    this.AddEvent(LiveScribe.PlayerEvents.STOP);
    this.AddEvent(LiveScribe.PlayerEvents.ERROR);
    this.WebContext = new LiveScribe.Web.Context();
};

LiveScribe.Player.prototype = new LiveScribe.Events.CustomEventHandlingBase();

LiveScribe.Player.prototype.Init = function () {
    console.log("Player Init...");


    //alert(this.WebContext.UserAgent);
    //if (this.WebContext.GetPlatformType() == LiveScribe.Web.ContextPlatformType.IOS ||
    //    (this.WebContext.GetPlatformType() == LiveScribe.Web.ContextPlatformType.ANDROID && this.WebContext.IsChrome()) ||
    //    (this.WebContext.GetBrowserType() == LiveScribe.Web.ContextBrowserType.SAFARI && this.WebContext.IsSafari7())) {

      this.PencastType = this.WebContext.GetPencastType();

    if (this.PencastType == LiveScribe.PencastType.LOCAL_PDF) {
        this.DisplayLaunchInstructions();
    } else if (this.PencastType == LiveScribe.PencastType.REMOTE_CLASSIC) {
        setTimeout(LiveScribe.Events.CreateDelegate(this, this.LoadPencast), 25);
    }

    if (this.PencastType == LiveScribe.PencastType.REMOTE_CLASSIC
        && (window.AudioContext || window.webkitAudioContext)) {
        this.UseWebAudioAPI = true;
        this.AudioPlayer = new LiveScribe.Audio.WebAudioPlayer();
    }
    else {
        this.AudioPlayer = new LiveScribe.Audio.HTML5AudioPlayer();
    }
};


// **********************************  Pencast Loading Methods ****************************************************
LiveScribe.Player.prototype.LoadPencast = function () {
    if (this.PencastType == LiveScribe.PencastType.REMOTE_CLASSIC || this.PencastType == LiveScribe.PencastType.REMOTE_PDF) {
        this.CAK = this.WebContext.GetParameter(LiveScribe.PlayerParameters.CAK);
    }

    this.CanvasController.ResetZoom();

    try {
      var pencastData = this.GetPencastData(this.PencastType);
      this.CreatePencast(this.PencastType, pencastData, this.CAK, false);
      this.Pencast.Start();
    } catch (err) {
      console.log(err.message);
      this.OnLoadError && this.OnLoadError(err);

    }
};

LiveScribe.Player.prototype.CreatePencast = function (pencastType, pencastData, cak) {
    if (pencastType == LiveScribe.PencastType.REMOTE_CLASSIC) {
        this.Pencast = new LiveScribe.RemoteClassicPencast(pencastData, cak);
        this.Pencast.OnLoadStart = LiveScribe.Events.CreateDelegate(this, this.RemoteClassicPencastLoadStartHandler);
        this.Pencast.OnPageInstanceLoadComplete = LiveScribe.Events.CreateDelegate(this, this.RemoteClassicPencastPageInstanceLoadCompleteHandler);
        this.Pencast.OnPageTemplateLoadComplete = LiveScribe.Events.CreateDelegate(this, this.RemoteClassicPencastPageTemplateLoadCompleteHandler);
        this.Pencast.OnPageStrokesLoadComplete = LiveScribe.Events.CreateDelegate(this, this.RemoteClassicPencastStrokesLoadCompleteHandler);
        this.Pencast.OnDataLoadComplete = LiveScribe.Events.CreateDelegate(this, this.RemoteClassicPencastDataLoadCompleteHandler);
        this.Pencast.OnSessionAudioLoadComplete = LiveScribe.Events.CreateDelegate(this, this.RemoteClassicPencastSessionAudioLoadCompleteHandler);
        this.Pencast.OnLoadComplete = LiveScribe.Events.CreateDelegate(this, this.RemoteClassicPencastLoadCompleteHandler);
        this.CanvasController.Adjust = false;
    } else if (pencastType == LiveScribe.PencastType.LOCAL_PDF || pencastType == LiveScribe.PencastType.REMOTE_PDF) {
        this.Pencast = new LiveScribe.LocalPdfPencast(pencastData, cak);
        this.Pencast.OnLoadStart = LiveScribe.Events.CreateDelegate(this, this.LocalPdfPencastLoadStartHandler);
        this.Pencast.OnImageLoadComplete = LiveScribe.Events.CreateDelegate(this, this.LocalPdfPencastImageLoadCompleteHandler);
        this.Pencast.OnInkMlLoadComplete = LiveScribe.Events.CreateDelegate(this, this.LocalPdfPencastInkMlLoadCompleteHandler);
        this.Pencast.OnDataLoadComplete = LiveScribe.Events.CreateDelegate(this, this.LocalPdfPencastDataLoadCompleteHandler);
        this.Pencast.OnAudioLoadComplete = LiveScribe.Events.CreateDelegate(this, this.LocalPdfPencastAudioLoadCompleteHandler);
        this.Pencast.OnLoadComplete = LiveScribe.Events.CreateDelegate(this, this.LocalPdfPencastLoadCompleteHandler);
    }
};

LiveScribe.Player.prototype.GetPencastData = function (pencastType) {
    var pencastData = new LiveScribe.PencastData();

    if (pencastType == LiveScribe.PencastType.REMOTE_CLASSIC) {
      pencastData.DocumentId = GetParameterByName(LiveScribe.PlayerParameters.DOCUMENT_ID);
      pencastData.PageId = GetParameterByName(LiveScribe.PlayerParameters.PAGE_ID);
      pencastData.SessionId = GetParameterByName(LiveScribe.PlayerParameters.SESSION_ID);
    } else if (pencastType == LiveScribe.PencastType.LOCAL_PDF || pencastType == LiveScribe.PencastType.REMOTE_PDF){
      pencastData.LocalFile = this.LocalFile;
    }

    return pencastData;
};

LiveScribe.Player.prototype.DisplayLaunchInstructions = function () {
    if (this.PencastType == LiveScribe.PencastType.LOCAL_PDF) {
        var browser = this.WebContext.GetBrowserType();

        var platform = this.WebContext.GetPlatformType();
        platform = this.WebContext.IsiOS() ? this.WebContext.GetiOSPlatformVersion() : platform;

        var messageCopy = LiveScribe.LaunchInstructions[browser][platform].Instructions;
        this.MessageModule.SetMessage(messageCopy);

        this.MessageModule.Show();

        if (this.WebContext.IsiOS()) {
            this.SmartBannerModule.Show();
        }

        if (!this.WebContext.IsiOS() && !this.WebContext.IsFireFox() && window.FileReader) {
            this.FileLoadModule.Show();
        }

        if (this.WebContext.IsiOS() || this.WebContext.IsAndroid() || this.WebContext.IsWindowsPhone()) {
            this.FileLoadDropZoneModule.Hide();
        }
    }
};

LiveScribe.Player.prototype.EnablePlayer = function () {
    this.SettingsButton.Enable();

    this.PageForwardButton.Enable();
    this.PageBackButton.Enable();
    this.PageInfoModule.Show();

    this.ZoomInButton.Enable();
    this.ZoomOutButton.Enable();
    this.PlaySpeedButton.Enable();

    this.PreviewStrokeToggle.Enable();
    this.AutoPageTurnToggle.Enable();

    if (this.Pencast.HasAudio) {
        this.PlayButton.Enable();
        this.PauseButton.Enable();
        this.PauseButton.Hide();
        this.ForwardButton.Enable();
        this.BackButton.Enable();
        this.PlaybackProgressIndicator.Enable();
        this.ProgressSlider.Enable();
        this.ProgressScrubber.Enable();

        this.Resize();

        this.CurrentAudioIndex = 0;
        this.LoadAudioFile();

        this.AudioPlayer.RegisterEventHandler(
                    new LiveScribe.Events.CustomEventHandler(
                                'AudioComplete',
                                LiveScribe.Audio.HTML5AudioEvent.ENDED,
                                LiveScribe.Events.CreateDelegate(
                                        this,
                                        this.AudioPlayerCompleteHandler)));

        this.AudioPlayer.RegisterEventHandler(
                    new LiveScribe.Events.CustomEventHandler(
                                'AudioProgress',
                                LiveScribe.Audio.HTML5AudioEvent.TIME_UPDATE,
                                LiveScribe.Events.CreateDelegate(
                                        this,
                                        this.AudioPlayerProgressHandler)));

        var duration = this.Pencast.Duration;
        this.PlaybackProgressIndicator.SetDuration(duration);
    }
};



// **********************************  Playback Methods ****************************************************
LiveScribe.Player.prototype.Play = function (aTime) {
    this.IsPlaying = true;

    if (!this.IsPaused) return;

    this.FireEvent(LiveScribe.PlayerEvents.PLAY, null);

    if (!this.FirstWebAudioFileLoaded && this.Pencast.HasAudio && this.UseWebAudioAPI) {
        this.FirstWebAudioFileLoaded = true;
        this.LoadAudioFile();
    }

    this.RenderPage(this.CurrentPageIndex);

    this.IsPaused = false;
    this.AudioPlayer.Play();
    this.AnimationController.Play();


    // if (!this.isPlayedEventTracked) {
    //     this.trackPlayedEvent();
    // }
};

LiveScribe.Player.prototype.Pause = function () {
    if (this.IsPaused) return;

    this.IsPaused = true;

    this.FireEvent(LiveScribe.PlayerEvents.PAUSE, null);

    this.AudioPlayer.Pause();
    this.AnimationController.Pause();
};

LiveScribe.Player.prototype.Stop = function () {
    this.AudioPlayer.Pause();
    this.AnimationController.Stop();
    this.IsPlaying = false;
    this.IsPaused = false;
};

LiveScribe.Player.prototype.Seek = function (delta) {

    var newPosition = Math.max(Math.min(this.AnimationController.ElapsedTime() + delta, this.Pencast.Duration - 20), 0);

    this.MoveToPosition(newPosition);
    this.AnimationController.FlipFrame(newPosition);
};

LiveScribe.Player.prototype.MoveToPosition = function (position) {

    this.CurrentAudioIndex = this.Pencast.GetAudioFileIndexByPosition(position);

    var audioFile = this.Pencast.GetAdjustedAudioFiles()[this.CurrentAudioIndex];
    var newAudioPosition = (position - audioFile.Start) / 1000;

    this.LoadAudioFile();
    this.AudioPlayer.CurrentTime(newAudioPosition);
    this.AnimationController.m_AnimationElapsedTime = position;

    this.RenderPage();

    this.PlaybackProgressIndicator.SetCurrentTime(newAudioPosition);
    this.ProgressSlider.UpdateProgress(position / this.Pencast.Duration);

    if (!this.IsFlipping) {
        this.ProgressScrubber.UpdateProgress(position / this.Pencast.Duration);
    }
};

LiveScribe.Player.prototype.PageForward = function () {
    this.PageSwitch(+1);
};

LiveScribe.Player.prototype.PageBack = function () {
    this.PageSwitch(-1);
};

LiveScribe.Player.prototype.PageSwitch = function (step) {
    if (this.CurrentPageIndex + step < 0 || this.CurrentPageIndex + step >= this.Pencast.Pages.Count()) {
        return;
    }

    this.ManualPaginationEngaged = true;

    this.CurrentPageIndex = this.CurrentPageIndex + step;
    this.RenderPage(this.CurrentPageIndex);
};

LiveScribe.Player.prototype.ToggleFullScreen = function () { };

LiveScribe.Player.prototype.SetCurrentVolume = function (aiVolume) {
    this.miGlobalVolume = aiVolume;
    this.SetCurrentVolume();
};

LiveScribe.Player.prototype.SetGlobalVolume = function () { };

LiveScribe.Player.prototype.Resize = function () {
    this.CanvasController.Resize();
    this.ProgressSlider.Resize();

    if (!this.IsFlipping) {
        this.ProgressScrubber.Resize();
    }

    this.RefreshPage();
};

LiveScribe.Player.prototype.RenderPage = function (index) {
    if (this.Pencast.IsPaperless) {
        this.PaperlessIconModule.Show();
        return;
    }

    if (index == null || index == undefined) { index = this.CurrentPageIndex;}

    this.CurrentPage = this.Pencast.Pages.ItemAt(index);

    this.PageIndicator.SetTotalPages(this.Pencast.Pages.Count());
    this.PageIndicator.SetCurrentPage(index + 1);

    var aspectRatio = 8 / 11;

    var activeArea = this.CurrentPage.TraceGroup.ActiveArea;
    if (activeArea.Size != null && activeArea.Size != undefined) {
        aspectRatio = activeArea.Size.X / activeArea.Size.Y
    }

    this.CanvasController.AspectRatio = aspectRatio;

    this.Resize();

    this.DrawBackground();
};

LiveScribe.Player.prototype.RefreshPage = function (index) {
    if (this.CurrentPage == null) { return; }
    this.DrawBackground();
};

LiveScribe.Player.prototype.DrawBackground = function () {
    var size = this.CurrentPage.TraceGroup.ActiveArea.Size;
    if (size == null || size == undefined) {
        console.warn("Unable to determine the media size. Check if the input PDF is missing the TraceGroup.ActiveArea!!??");
        return;
    }

    var cropBounds = this.CurrentPage.TraceGroup.ActiveArea.CropBounds;
    var img = this.CurrentPage.BackgroundImage;

    this.CanvasController.InitDrawing(parseInt(cropBounds[1].X), parseInt(cropBounds[1].Y));

    if (img && img.height) {
        var pageWidth = parseInt(size.X),
            pageHeight = parseInt(size.Y),
            pageRatio = pageWidth / pageHeight;

        var iWidth = img.width,
            iHeight = img.height,
            iRatio = iWidth / iHeight;

        var iPageHeight = iHeight,
            iPageWidth = iWidth,
            leftOrigin = 0,
            topOrigin = 0;

        if (pageRatio < iRatio) {
            iPageHeight = iHeight;
            iPageWidth = pageRatio * iPageHeight;
            leftOrigin = (iWidth - iPageWidth) / 2;
        }
        else if (pageRatio > iRatio) {
            iPageWidth = iWidth;
            iPageHeight =  iPageWidth / pageRatio;
            topOrigin = (iHeight - iPageHeight) / 2;
        }

        var resolution = pageHeight / iPageHeight;

        var cropPageX = parseInt(cropBounds[0].X),
            cropPageY = parseInt(cropBounds[0].Y),
            cropPageWidth = parseInt(cropBounds[1].X),
            cropPageHeight = parseInt(cropBounds[1].Y),
            cropX = leftOrigin + cropPageX / resolution,
            cropY = topOrigin + cropPageY / resolution,
            cropWidth = cropPageWidth / resolution,
            cropHeight = cropPageHeight / resolution;

        this.CanvasController.DrawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropPageWidth, cropPageHeight);
    }

    this.CanvasController.DrawBackgroundStrokes(this.CurrentPage.NonSessionStrokes, cropBounds[0].X, cropBounds[0].Y, this.NonSessionStrokeColor);

    if (this.IsPlaying || this.IsFlipping) {
        var sessionStrokes = this.CurrentPage.AdjustedSessionStrokes;
        for (var index = 0; index < sessionStrokes.length; index++) {
            var sessionStroke = sessionStrokes[index];
            if (sessionStroke.TimeOffset < this.AnimationController.m_AnimationElapsedTime) {
                this.CanvasController.DrawForegroundStroke(sessionStroke, sessionStroke.Points.length, cropBounds[0].X, cropBounds[0].Y, this.SessionStrokeColor);
            }
            else if(this.PreviewStroke) {
                this.CanvasController.DrawBackgroundStroke(sessionStroke, cropBounds[0].X, cropBounds[0].Y, this.SessionStrokePreviewColor);
            }
        }
    }
    else if (!this.IsPlaying) {
        this.CanvasController.DrawBackgroundStrokes(this.CurrentPage.SessionStrokes, cropBounds[0].X, cropBounds[0].Y, this.SessionStrokeColor);
    }
};


LiveScribe.Player.prototype.LoadAudioFile = function () {
    var audioKey = this.Pencast.AudioFileDataList[this.CurrentAudioIndex].Key;
    var audioFile = this.Pencast.GetSessionAudioFile(audioKey);

    var wasPaused = this.IsPaused;

    if (!this.IsPaused) { this.Pause(); }

    try{
        if (this.UseWebAudioAPI) {
            this.AudioPlayer.Source(audioFile.WebAudioBuffer);
        }
        else {
            if (this.PencastType == LiveScribe.PencastType.LOCAL_PDF || this.PencastType == LiveScribe.PencastType.REMOTE_PDF) {
                this.AudioPlayer.Source(audioFile.BlobURL);
            }
            else {
                this.AudioPlayer.Source(audioFile.URI);
                this.AudioPlayer.Load();
            }
        }
        this.AudioPlayer.PlaybackRate(this.AnimationController.AnimationRate());
    }
    catch (e) {
        //console.log("Error: " + e.message);
    }

    if (!wasPaused) {
      this.Play();
    }


    console.log("audio loaded for BlobURL " + audioFile.BlobURL);
}

// **************************** Local File Loader

LiveScribe.Player.prototype.AttachNewFileLoader = function() {
  if (!window.FileReader) return;

  this.LocalFileLoader = new LiveScribe.IO.LocalFileLoader();

  this.LocalFileLoader.RegisterFileInputElement(document.getElementById('file-load-input-element'));
  this.LocalFileLoader.RegisterDropZoneElement(document.getElementById('file-load-dropzone'));
  this.LocalFileLoader.FileLoadContainer = document.getElementById('file-load-dropzone-section');
  this.LocalFileLoader.OnFileLoadStart = LiveScribe.Events.CreateDelegate(this, this.LocalFileLoaderLoadStartHandler);
  this.LocalFileLoader.OnFileLoadComplete = LiveScribe.Events.CreateDelegate(this, this.LocalFileLoaderLoadCompleteHandler);
  this.LocalFileLoader.OnFileLoadEnd = LiveScribe.Events.CreateDelegate(this, this.LocalFileLoaderLoadEndHandler);
  this.LocalFileLoader.OnFileLoadProgress = LiveScribe.Events.CreateDelegate(this, this.LocalFileLoaderLoadProgressHandler);
  this.LocalFileLoader.OnFileLoadError = LiveScribe.Events.CreateDelegate(this, this.LocalFileLoaderLoadErrorHandler);
  this.LocalFileLoader.OnFileLoadAbort = LiveScribe.Events.CreateDelegate(this, this.LocalFileLoaderLoadAbortHandler);

}

// **************************** Local File Loader Event Handlers ***************************************************
LiveScribe.Player.prototype.LocalFileLoaderLoadStartHandler = function (loadEvent) {
    this.MessageModule.Hide();
    this.FileLoadModule.Hide();
    this.BusyModal.Show();
};

LiveScribe.Player.prototype.LocalFileLoaderLoadCompleteHandler = function (fileData) {
    this.LocalFile = fileData;

    this.LocalFileLoader.FileLoadMethod = LiveScribe.IO.LoadMethod.TEXT;
    this.LocalFileLoader.OnFileLoadComplete = LiveScribe.Events.CreateDelegate(this, this.LocalFileLoaderStringLoadCompleteHandler);
    this.LocalFileLoader.LoadFile()
};

LiveScribe.Player.prototype.LocalFileLoaderStringLoadCompleteHandler = function (fileData) {
    setTimeout(LiveScribe.Events.CreateDelegate(this, this.LoadPencast), 25);
};

LiveScribe.Player.prototype.LocalFileLoaderLoadEndHandler = function (fileData) {
};

LiveScribe.Player.prototype.LocalFileLoaderLoadProgressHandler = function (percentLoaded) {
};

LiveScribe.Player.prototype.LocalFileLoaderLoadErrorHandler = function (error) {
};

LiveScribe.Player.prototype.LocalFileLoaderLoadAbortHandler = function (loadEvent) {
};

// **************************** Local PDF Pencast Events ***************************************************
LiveScribe.Player.prototype.LocalPdfPencastLoadStartHandler = function (loadEvent) {

};

LiveScribe.Player.prototype.LocalPdfPencastImageLoadCompleteHandler = function (loadEvent) {

};

LiveScribe.Player.prototype.LocalPdfPencastInkMlLoadCompleteHandler = function (inkML) {

};

LiveScribe.Player.prototype.LocalPdfPencastDataLoadCompleteHandler = function (loadEvent) {
    this.CanvasController.Enable();
    this.RenderPage(this.CurrentPageIndex);
    this.PlaybackControlsModule.Show();

    this.AnimationController = new LiveScribe.Animation.KeyFrameAnimationController(this.Pencast.Duration, 20);
    this.AnimationController.RegisterForEvent(LiveScribe.Animation.KeyFrameAnimationEvent.INTERVAL, LiveScribe.Events.CreateDelegate(this, this.KeyFrameAnimationIntervalHandler));
    this.AnimationController.RegisterForEvent(LiveScribe.Animation.KeyFrameAnimationEvent.FLIP, LiveScribe.Events.CreateDelegate(this, this.KeyFrameAnimationFlipHandler));

    if (!this.Pencast.IsPaperless && this.Pencast.HasAudio) {
        var audioStrokes = this.Pencast.GetAdjustedAudioStrokeTimes();
        for (var index = 0; index < audioStrokes.length; index++) {
            var audiostroke = audioStrokes[index];

            var pageAnimation = new LiveScribe.Animation.KeyFramePageChangeAnimation('PageChange' + index, this.Pencast.GetPageIndex(audiostroke.PageAddress), audiostroke.Start, audiostroke.End, LiveScribe.Animation.AccelerationType.ZERO);
            pageAnimation.OnAnimate = LiveScribe.Events.CreateDelegate(this, this.PageAnimationHandler);

            this.AnimationController.AddAnimation(pageAnimation);
        }

        for (var index = 0; index < this.Pencast.Pages.Count() ; index++) {
            var page = this.Pencast.Pages.ItemAt(index);
            page.AdjustedSessionStrokes = this.Pencast.GetAdjustedSessionStrokes(index);

            this.Pencast.Pages.UpdateItemAt(index, page);

            var cropBounds = page.TraceGroup.ActiveArea.CropBounds;

            for (var strokeIndex = 0; strokeIndex < page.AdjustedSessionStrokes.length; strokeIndex++) {
                var stroke = page.AdjustedSessionStrokes[strokeIndex];

                var strokeAnimation = new LiveScribe.Animation.KeyFrameStrokeAnimation('SessionStroke' + strokeIndex, stroke, cropBounds[0].X, cropBounds[0].Y, stroke.TimeOffset, (stroke.TimeOffset + (stroke.Points.length * 20)), LiveScribe.Animation.AccelerationType.ZERO);
                strokeAnimation.OnAnimate = LiveScribe.Events.CreateDelegate(this, this.StrokeAnimationHandler);
                strokeAnimation.OnPersist = LiveScribe.Events.CreateDelegate(this, this.StrokePersistHandler);

                this.AnimationController.AddAnimation(strokeAnimation);
            }
        }
    }

    //Changed by MNaqvi
    if (!this.Pencast.HasAudio) {
        this.BusyModal.Hide();
        this.EnablePlayer();
    }
};

LiveScribe.Player.prototype.LocalPdfPencastAudioLoadCompleteHandler = function (loadEvent) {
    if (this.UseWebAudioAPI) {
        this.WebAudioFilesToConvert = new Array();

        for (var index = 0; index < this.Pencast.PdfPlusDocument.AudioStreamCollection.Count() ; index++) {
            this.WebAudioFilesToConvert.push(index);
        }

        this.LocalPdfPencastSessionAudioConvertToWebAudio();
    }
    else {
        this.BusyModal.Hide();
        this.EnablePlayer();
    }
};

LiveScribe.Player.prototype.LocalPdfPencastLoadCompleteHandler = function (loadEvent) { };

LiveScribe.Player.prototype.LocalPdfPencastSessionAudioConvertToWebAudio = function () {
    //alert(this.WebAudioFilesToConvert.length);
    if (this.WebAudioFilesToConvert.length > 0) {
        var audioFile = this.Pencast.PdfPlusDocument.AudioStreamCollection.ItemAt(this.WebAudioFilesToConvert[0]);
        this.AudioPlayer.AudioContext.decodeAudioData(audioFile.ByteArrayData.buffer, LiveScribe.Events.CreateDelegate(this, this.LocalPdfPencastSessionAudioConvertToWebAudioHandler));
    }
    else {
        this.BusyModal.Hide();
        this.EnablePlayer();
    }
};

LiveScribe.Player.prototype.LocalPdfPencastSessionAudioConvertToWebAudioHandler = function (buffer) {
    alert('!!');
    var audioFile = this.Pencast.PdfPlusDocument.AudioStreamCollection.ItemAt(this.WebAudioFilesToConvert[0]);
    audioFile.WebAudioBuffer = buffer;

    this.Pencast.PdfPlusDocument.AudioStreamCollection.UpdateItemAt(this.WebAudioFilesToConvert[0], audioFile)

    this.WebAudioFilesToConvert.shift();

    this.LocalPdfPencastSessionAudioConvertToWebAudio();
};




// **************************** Remote Classic Pencast Events ***************************************************
LiveScribe.Player.prototype.RemoteClassicPencastLoadStartHandler = function (loadEvent) {
    this.BusyModal.Show();
};

LiveScribe.Player.prototype.RemoteClassicPencastPageInstanceLoadCompleteHandler = function (instance) {
};

LiveScribe.Player.prototype.RemoteClassicPencastPageTemplateLoadCompleteHandler = function (template) {
};

LiveScribe.Player.prototype.RemoteClassicPencastStrokesLoadCompleteHandler = function (strokes) {

};

LiveScribe.Player.prototype.RemoteClassicPencastDataLoadCompleteHandler = function () {
    this.CanvasController.Enable();
    this.RenderPage(this.CurrentPageIndex);
    this.PlaybackControlsModule.Show();

    this.AnimationController = new LiveScribe.Animation.KeyFrameAnimationController(this.Pencast.Duration, 20);
    this.AnimationController.RegisterForEvent(LiveScribe.Animation.KeyFrameAnimationEvent.INTERVAL, LiveScribe.Events.CreateDelegate(this, this.KeyFrameAnimationIntervalHandler));
    this.AnimationController.RegisterForEvent(LiveScribe.Animation.KeyFrameAnimationEvent.FLIP, LiveScribe.Events.CreateDelegate(this, this.KeyFrameAnimationFlipHandler));

    if (!this.Pencast.IsPaperless && this.Pencast.HasAudio) {
        var audioStrokes = this.Pencast.GetAdjustedAudioStrokeTimes();
        for (var index = 0; index < audioStrokes.length; index++) {
            var audiostroke = audioStrokes[index];

            var pageAnimation = new LiveScribe.Animation.KeyFramePageChangeAnimation('PageChange' + index, this.Pencast.GetPageIndex(audiostroke.PageAddress), audiostroke.Start, audiostroke.End, LiveScribe.Animation.AccelerationType.ZERO);
            pageAnimation.OnAnimate = LiveScribe.Events.CreateDelegate(this, this.PageAnimationHandler);

            this.AnimationController.AddAnimation(pageAnimation);
        }

        var annotations = this.Pencast.GetAdjustedAnnotationTimes();
        for (var index = 0; index < annotations.length; index++) {
            var annotation = annotations[index];

            var pageAnimation = new LiveScribe.Animation.KeyFramePageChangeAnimation('AnnotationPageChange' + index, this.Pencast.GetPageIndex(annotation.PageAddress), annotation.CorrectedStart, annotation.CorrectedEnd, LiveScribe.Animation.AccelerationType.ZERO);
            pageAnimation.OnAnimate = LiveScribe.Events.CreateDelegate(this, this.PageAnimationHandler);

            this.AnimationController.AddAnimation(pageAnimation);
        }

        for (var index = 0; index < this.Pencast.Pages.Count() ; index++) {
            var page = this.Pencast.Pages.ItemAt(index);
            page.AdjustedSessionStrokes = this.Pencast.GetAdjustedSessionStrokes(index);

            this.Pencast.Pages.UpdateItemAt(index, page);

            var cropBounds = page.TraceGroup.ActiveArea.CropBounds;

            for (var strokeIndex = 0; strokeIndex < page.AdjustedSessionStrokes.length; strokeIndex++) {
                var stroke = page.AdjustedSessionStrokes[strokeIndex];

                var timeOffset = 0;
                if (stroke.AudioStrokeIndex != null) { timeOffset = stroke.TimeOffset; }
                else { timeOffset = stroke.TimeOffset - (annotations[stroke.AnnotationIndex].Start - annotations[stroke.AnnotationIndex].CorrectedStart); }

                var strokeAnimation = new LiveScribe.Animation.KeyFrameStrokeAnimation('SessionStroke' + strokeIndex, stroke, cropBounds[0].X, cropBounds[0].Y, timeOffset, (timeOffset + (stroke.Points.length * 20)), LiveScribe.Animation.AccelerationType.SINUSOIDAL);
                strokeAnimation.OnAnimate = LiveScribe.Events.CreateDelegate(this, this.StrokeAnimationHandler);
                strokeAnimation.OnPersist = LiveScribe.Events.CreateDelegate(this, this.StrokePersistHandler);

                this.AnimationController.AddAnimation(strokeAnimation);
            }
        }
    }
}

LiveScribe.Player.prototype.RemoteClassicPencastSessionAudioLoadCompleteHandler = function () {
    if (this.PencastType == LiveScribe.PencastType.REMOTE_CLASSIC && this.UseWebAudioAPI) {
        this.WebAudioFilesToConvert = new Array();

        for (var index = 0; index < this.Pencast.AudioFiles.Count() ; index++) {
            var audioFile = this.Pencast.AudioFiles.ItemAt(index);
            audioFile.DecodeFromBase64();

            this.Pencast.AudioFiles.UpdateItemAt(index, audioFile)
            this.WebAudioFilesToConvert.push(index);
        }

        this.RemoteClassicPencastSessionAudioConvertToWebAudio();
    }
};

LiveScribe.Player.prototype.RemoteClassicPencastSessionAudioConvertToWebAudio = function () {
    if (this.WebAudioFilesToConvert.length > 0) {
        var audioFile = this.Pencast.AudioFiles.ItemAt(this.WebAudioFilesToConvert[0]);
        this.AudioPlayer.AudioContext.decodeAudioData(audioFile.ArrayBuffer, LiveScribe.Events.CreateDelegate(this, this.RemoteClassicPencastSessionAudioConvertToWebAudioHandler));
    }
    else {
        this.BusyModal.Hide();
        this.EnablePlayer();
    }
};

LiveScribe.Player.prototype.RemoteClassicPencastSessionAudioConvertToWebAudioHandler = function (buffer) {
    var audioFile = this.Pencast.AudioFiles.ItemAt(this.WebAudioFilesToConvert[0]);
    audioFile.WebAudioBuffer = buffer;

    this.Pencast.AudioFiles.UpdateItemAt(this.WebAudioFilesToConvert[0], audioFile)

    this.WebAudioFilesToConvert.shift();

    this.RemoteClassicPencastSessionAudioConvertToWebAudio();
};

LiveScribe.Player.prototype.RemoteClassicPencastLoadCompleteHandler = function () {
    if (!this.UseWebAudioAPI || !this.Pencast.HasAudio) {
        this.BusyModal.Hide();
        this.EnablePlayer();
    }
};




// **************************** Audio Player Event Handlers ***************************************************
LiveScribe.Player.prototype.AudioPlayerCompleteHandler = function () {
    this.CurrentAudioIndex++;

    if (this.CurrentAudioIndex < this.Pencast.AudioFileDataList.length) {
        this.LoadAudioFile();
        this.AudioPlayer.Play();
    }
    else {

        console.log("All audio files playing COMPLETED --  Resetting all variables.. ");
        this.AnimationController.Stop();

        this.IsPlaying = false;
        this.IsPaused = true;
        this.IsFlipping = false;
        this.ManualPaginationEngaged = false;

        this.CurrentAudioIndex = 0;
        this.LoadAudioFile();

        this.FireEvent(LiveScribe.PlayerEvents.DONE, null);

        this.CurrentPageIndex = 0;
        this.RenderPage(this.CurrentPageIndex);
    }
};

LiveScribe.Player.prototype.AudioPlayerProgressHandler = function (event) {};




// **************************** Animation Event Handlers ***************************************************
LiveScribe.Player.prototype.PageAnimationHandler = function (pageIndex) {
    if (pageIndex == this.CurrentPageIndex) { return; }

    if (this.AutoPageTurn && !this.ManualPaginationEngaged) {
        this.CurrentPageIndex = pageIndex;
        this.RenderPage(this.CurrentPageIndex);
    }
};

LiveScribe.Player.prototype.StrokeAnimationHandler = function (stroke, pointCount, offsetX, offsetY) {
    if (stroke.PageIndex != this.CurrentPageIndex) { return; }

    this.CanvasController.DrawForegroundStroke(stroke, pointCount, offsetX, offsetY, this.BackGroundColor);
    this.CanvasController.DrawForegroundStroke(stroke, pointCount, offsetX, offsetY, this.SessionStrokeColor);
};

LiveScribe.Player.prototype.StrokePersistHandler = function (stroke, offsetX, offsetY) {
    if (stroke.PageIndex != this.CurrentPageIndex) { return; }

    this.CanvasController.DrawForegroundStroke(stroke, stroke.Points.length, offsetX, offsetY, this.BackGroundColor);
    this.CanvasController.DrawForegroundStroke(stroke, stroke.Points.length, offsetX, offsetY, this.SessionStrokeColor);
};

LiveScribe.Player.prototype.KeyFrameAnimationIntervalHandler = function (animationIntervalEventArgs) {

  this.PlaybackProgressIndicator.SetCurrentTime(animationIntervalEventArgs.ElapsedTime);
  this.ProgressSlider.UpdateProgress(animationIntervalEventArgs.ElapsedTime / this.Pencast.Duration);
  this.ProgressScrubber.UpdateProgress(animationIntervalEventArgs.ElapsedTime / this.Pencast.Duration);


};

LiveScribe.Player.prototype.KeyFrameAnimationFlipHandler = function (animationIntervalEventArgs) {
    this.PlaybackProgressIndicator.SetCurrentTime(animationIntervalEventArgs.ElapsedTime);
    this.ProgressSlider.UpdateProgress(animationIntervalEventArgs.ElapsedTime / this.Pencast.Duration);
};




// **************************** Window Event Handlers ***************************************************
LiveScribe.Player.prototype.WindowResizeHandler = function () {
    this.Resize();
}




// **************************** Pagination Control Event Handlers ***************************************************
LiveScribe.Player.prototype.PageForwardButtonClickHandler = function (button) {
    this.PageForward();
};

LiveScribe.Player.prototype.PageBackButtonClickHandler = function (button) {
    this.PageBack();
};




// **************************** Playback Control Event Handlers ***************************************************
LiveScribe.Player.prototype.PlayButtonClickHandler = function () {
    this.Play();
};

LiveScribe.Player.prototype.PauseButtonClickHandler = function () {
    this.Pause();
};

LiveScribe.Player.prototype.ForwardButtonClickHandler = function (button) {
    this.Seek(10000);
};

LiveScribe.Player.prototype.BackButtonClickHandler = function (button) {
    this.Seek(-10000);
};




// ---------------------------- zoom control event handlers -----------------------------------------
LiveScribe.Player.prototype.ZoomInButtonClickHandler = function () {
    this.CanvasController.Zoom(1.33334);
    this.RenderPage(this.CurrentPageIndex)


};

LiveScribe.Player.prototype.ZoomOutButtonClickHandler = function () {
    this.CanvasController.Zoom(0.75);
    this.RenderPage(this.CurrentPageIndex)
};




// ---------------------------- settings controls event handlers -----------------------------------------
LiveScribe.Player.prototype.PreviewStrokeToggleChangeHandler = function (toggleState) {
    this.PreviewStroke = toggleState
    this.RenderPage(this.CurrentPageIndex);

    if (this.IsPaused) {
        var newPosition = this.AnimationController.m_AnimationElapsedTime;
        this.AnimationController.FlipFrame(newPosition);
    }
};

LiveScribe.Player.prototype.AutoPageTurnToggleChangeHandler = function (toggleState) {
    this.AutoPageTurn = toggleState;
    if (toggleState) {
        this.AnimateStrokes = true;
    }
};

LiveScribe.Player.prototype.ColorPickerChangeHandler = function (colorPair) {
    this.SessionStrokeColor = colorPair.Foreground;
    this.NonSessionStrokeColor = colorPair.Background;

    this.DrawBackground();
};




// ---------------------------- canvas mouse event handlers -----------------------------------------
LiveScribe.Player.prototype.CanvasClickHandler = function (coordinate) {

    var wasPaused = this.IsPaused ? true : false;
    var wasPlaying = this.IsPlaying ? true : false;

    if (this.IsPlaying) { this.Pause(); }
    this.IsPlaying = true;

    coordinate.PositionX = coordinate.PositionX / (this.CanvasController.BackgroundCanvasElement.clientWidth / this.CurrentPage.TraceGroup.ActiveArea.Size.X);
    coordinate.PositionY = coordinate.PositionY / (this.CanvasController.BackgroundCanvasElement.clientWidth / this.CurrentPage.TraceGroup.ActiveArea.Size.X)

    var cropBounds = this.CurrentPage.TraceGroup.ActiveArea.CropBounds;
    var sessionStrokes = this.CurrentPage.AdjustedSessionStrokes;

    for (var index = 0; index < sessionStrokes.length; index++) {
        var stroke = sessionStrokes[index];
        var points = this.CanvasController.AdjustStrokePoints(stroke, stroke.Points.length, cropBounds[0].X, cropBounds[0].Y);
        for (var pointIndex = 0; pointIndex < points.length; pointIndex++) {
            if (coordinate.PositionX >= points[pointIndex].X - 100 && coordinate.PositionX <= points[pointIndex].X + 100) {
                if (coordinate.PositionY >= points[pointIndex].Y - 100 && coordinate.PositionY <= points[pointIndex].Y + 100) {
                    // this.trackInkClickedEvent();
                    var timeOffset = 0;
                    if (stroke.AudioStrokeIndex != null) { timeOffset = stroke.TimeOffset; }
                    else { timeOffset = stroke.TimeOffset - (this.CurrentPage.Annotations[stroke.AnnotationIndex].Start - this.CurrentPage.Annotations[stroke.AnnotationIndex].CorrectedStart); }

                    var newPosition = timeOffset + (pointIndex * 20);

                    this.MoveToPosition(newPosition);
                    this.AnimationController.FlipFrame(newPosition);

                    if (!wasPlaying) { this.Play(); }
                    if (wasPlaying && !wasPaused) { this.Play(); }

                    return;
                }
            }
        }
    }
};

LiveScribe.Player.prototype.CanvasMouseDownHandler = function (e) {};

LiveScribe.Player.prototype.CanvasMouseUpHandler = function (e) {};

LiveScribe.Player.prototype.CanvasMouseOutHandler = function (e) {};

LiveScribe.Player.prototype.CanvasMouseMoveHandler = function (e) {};


// -----------------------------------------  MixPanel Events Tracker  ------------------------------

LiveScribe.Player.prototype.trackPlayedEvent = function() {

    // Pencast is 'played', track the event..
    // mixpanel.track("Pencast_Played", {
    //     "source": "",
    //     "duration": -1337,
    //     "pageCount": -1337,
    //     "numberOfPauses": -1337,
    //     "sessionCount": -999
    // });
    this.isPlayedEventTracked = true;
}

LiveScribe.Player.prototype.trackInkClickedEvent = function() {

    // user clicked on the active ink..
    // mixpanel.track("Ink_Clicked");
}


// ---------------------------- slider event handlers -----------------------------------------
LiveScribe.Player.prototype.SliderPositionChangeHandler = function (percentOfDuration) {
    var wasPaused = this.IsPaused ? true : false;
    var wasPlaying = this.IsPlaying ? true : false;

    if (this.IsPlaying) { this.Pause(); }
    this.IsPlaying = true;

    var newPosition = Math.round(percentOfDuration * this.Pencast.Duration);

    this.MoveToPosition(newPosition);
    this.AnimationController.FlipFrame(newPosition);

    if (!wasPlaying) { this.Play(); }
    if (wasPlaying && !wasPaused) { this.Play(); }
};

LiveScribe.Player.prototype.ScrubberPositionChangeHandler = function (percentChange) {
    var newPosition = Math.round(percentChange * this.Pencast.Duration);

    this.RenderPage();
    setTimeout(LiveScribe.Events.CreateDelegate(this.AnimationController, this.AnimationController.FlipFrame), 25, [newPosition]);
};

LiveScribe.Player.prototype.ScrubberMouseDownHandler = function () {
    if (this.IsPlaying) {
        this.AudioPlayer.Pause();
        this.AnimationController.Pause();
    }

    this.IsPlaying = true;
    this.IsFlipping = true;
};

LiveScribe.Player.prototype.ScrubberMouseUpHandler = function (percentChange) {
    this.IsFlipping = false;

    var newPosition = Math.round(percentChange * this.Pencast.Duration);
    this.MoveToPosition(newPosition);

    if (!this.IsPlaying) { this.Play(); }
    if (this.IsPlaying && !this.IsPaused) { this.Play(); }
};
