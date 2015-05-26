// ***********************************************************************************************************
// Name:HTML5 Audio Player
// Type:User Control Library
// Author: Cliff Gower
//************************************************************************************************************


//Dependencies
//LiveScribe.EventHandling.js
//LiveScribe.Collections.NamedList.js
//LiveScribe.CustomEventHandling.js
//LiveScribe.Audio.js


var LiveScribe = LiveScribe || {};
LiveScribe.Audio = LiveScribe.Audio || {};


//*********************** Audio Player Control Base Class  ***************************
LiveScribe.Audio.HTML5AudioPlayer = function () {
    this.AudioElement = new Audio();
    this.IsMediaSourceLoaded = false;
    this.StartTime = null;
    this.Playing = false;

    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.LOAD_START, LiveScribe.Events.CreateDelegate(this, this.LoadStartHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.PROGRESS, LiveScribe.Events.CreateDelegate(this, this.ProgressHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.SUSPEND, LiveScribe.Events.CreateDelegate(this, this.SuspendHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.ABORT, LiveScribe.Events.CreateDelegate(this, this.AbortHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.ERROR, LiveScribe.Events.CreateDelegate(this, this.ErrorHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.EMPTIED, LiveScribe.Events.CreateDelegate(this, this.EmptiedHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.STALLED, LiveScribe.Events.CreateDelegate(this, this.StalledHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.LOADED_METADATA, LiveScribe.Events.CreateDelegate(this, this.LoadedMetadataHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.LOADED_DATA, LiveScribe.Events.CreateDelegate(this, this.LoadedDataHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.CAN_PLAY, LiveScribe.Events.CreateDelegate(this, this.CanPlayHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.CAN_PLAY_THROUGH, LiveScribe.Events.CreateDelegate(this, this.CanPlayThroughHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.PLAYING, LiveScribe.Events.CreateDelegate(this, this.PlayingHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.WAITING, LiveScribe.Events.CreateDelegate(this, this.WaitingHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.SEEKING, LiveScribe.Events.CreateDelegate(this, this.SeekingHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.SEEKED, LiveScribe.Events.CreateDelegate(this, this.SeekedHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.ENDED, LiveScribe.Events.CreateDelegate(this, this.EndedHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.DURATION_CHANGE, LiveScribe.Events.CreateDelegate(this, this.DurationChangeHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.TIME_UPDATE, LiveScribe.Events.CreateDelegate(this, this.TimeUpdateHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.PLAY, LiveScribe.Events.CreateDelegate(this, this.PlayHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.PAUSE, LiveScribe.Events.CreateDelegate(this, this.PauseHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.VOLUME_CHANGE, LiveScribe.Events.CreateDelegate(this, this.VolumeChangeHandler));
    LiveScribe.Events.AddHandler(this.AudioElement, LiveScribe.Audio.HTML5AudioEvent.RATE_CHANGE, LiveScribe.Events.CreateDelegate(this, this.RateChangeHandler));

    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.LOAD_START);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.PROGRESS);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.SUSPEND);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.ABORT);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.ERROR);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.EMPTIED);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.STALLED);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.LOADED_METADATA);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.LOADED_DATA);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.CAN_PLAY);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.CAN_PLAY_THROUGH);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.PLAYING);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.WAITING);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.SEEKING);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.SEEKED);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.ENDED);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.DURATION_CHANGE);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.TIME_UPDATE);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.PLAY);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.PAUSE);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.VOLUME_CHANGE);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.RATE_CHANGE);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype = new LiveScribe.Events.CustomEventHandlingBase();


// Readonly Properties
LiveScribe.Audio.HTML5AudioPlayer.prototype.Error = function () { return this.AudioElement.error; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.CurrentSource = function () { return this.AudioElement.currentSrc; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.NetworkState = function () { return this.AudioElement.networkState; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.Buffered = function () { return this.AudioElement.Buffered; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.ReadyState = function () { return this.AudioElement.readyState; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.Seeking = function () { return this.AudioElement.seeking; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.InitialTime = function () { return this.AudioElement.intialTime; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.Duration = function () { return this.AudioElement.duration; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.StartOffsetTime = function () { return this.AudioElement.startOffsetTime; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.Paused = function () { return this.AudioElement.paused; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.Played = function () { return this.AudioElement.played; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.Seekable = function () { return this.AudioElement.seekable; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.Ended = function () { return this.AudioElement.ended; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.AudioTracks = function () { return this.AudioElement.audioTracks; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.ExclusiveTrackList = function () { return this.AudioElement.AudioTracks; };
LiveScribe.Audio.HTML5AudioPlayer.prototype.TextTracks = function () { return this.AudioElement.textTracks; };



// Read/Write Properties
LiveScribe.Audio.HTML5AudioPlayer.prototype.Source = function (source) {
    if (source != null || source != undefined) {
        this.IsMediaSourceLoaded = false;
        this.AudioElement.src = source;
    }

    return this.AudioElement.src;
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.CurrentTime = function (time) {
    if (this.IsMediaSourceLoaded) {
        if (time != null || time != undefined) {
            this.AudioElement.currentTime = time;
        }
    }
    else {
        this.StartTime = time;

        if (!this.Paused) {
            this.Autoplay(true);
        }
    }

    return this.AudioElement.currentTime;
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.PlaybackRate = function (rate) {


    if (rate != null || rate != undefined) {
        this.AudioElement.playbackRate = rate;
    }

    return this.AudioElement.playbackRate;
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.Autoplay = function (setting) {
    if (setting != null || setting != undefined) {
        this.AudioElement.autoplay = setting;
    }

    return this.AudioElement.autoplay;
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.Loop = function (setting) {
    if (setting != null || setting != undefined) {
        this.AudioElement.loop = setting;
    }

    return this.AudioElement.loop;
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.MediaGroup = function (group) {
    if (group != null || group != undefined) {
        this.AudioElement.mediaGroup = group;
    }

    return this.AudioElement.mediaGroup;
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.MediaController = function (controller) {
    if (controller != null || controller != undefined) {
        this.AudioElement.controller = controller;
    }

    return this.AudioElement.controller;
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.Volume = function (volume) {
    if (volume != null || volume != undefined) {
        this.AudioElement.volume = volume;
    }

    return this.AudioElement.volume;
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.Muted = function (muteState) {
    if (muteState != null || muteState != undefined) {
        this.AudioElement.muted = muteState;
    }

    return this.AudioElement.muted;
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.DefaultMuted = function (muteState) {
    if (muteState != null || muteState != undefined) {
        this.AudioElement.defaultMuted = muteState;
    }

    return this.AudioElement.defaultMuted;
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.Preload = function (preloadState) {
    if (preloadState != null || preloadState != undefined) {
        this.AudioElement.preload = preloadState;
    }

    return this.AudioElement.preload;
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.AutoBuffer = function (autobufferState) {
    if (autobufferState != null || autobufferState != undefined) {
        this.AudioElement.autobuffer = autobufferState;
    }

    return this.AudioElement.autobuffer;
};



// Methods
LiveScribe.Audio.HTML5AudioPlayer.prototype.Pause = function () {
    this.AudioElement.pause();
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.Play = function () {
    if (this.Playing && !this.Paused) { return; }

    this.Playing = true;
    this.AudioElement.play();
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.Replay = function () {
    this.ResetMedia();
    this.Play();
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.ResetMedia = function () {
    if (this.CurrentTime() > 0) {
        this.CurrentTime(0);
    }
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.ChangeMediaSource = function (media) {
    this.IsMediaSourceLoaded = false;
    this.AudioElement.src = media;
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.Load = function (media) {
    this.AudioElement.load();
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.ChangeMediaSources = function (mediaList) {
    var sources = this.AudioElement.getElementsByTagName('source');
    sources[0].src = mediaList[0];
    sources[1].src = mediaList[1];

    this.AudioElement.load();
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.CanPlayType = function (type) {
    return this.AudioElement.canPlayType(type);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.AddTextTrack = function (kind, label, language) {
    if (label != undefined && language != undefined) {
        return this.AudioElement.addTextTrack(kind, label, language);
    }
    else if (label != undefined && language == undefined) {
        return this.AudioElement.addTextTrack(kind, label);
    }
    else {
        return this.AudioElement.addTextTrack(kind);
    }
};



// Event Handlers
LiveScribe.Audio.HTML5AudioPlayer.prototype.LoadStartHandler = function () {
    this.IsMediaSourceLoaded = false;
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.LOAD_START);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.ProgressHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.PROGRESS);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.SuspendHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.SUSPEND);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.AbortHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.ABORT);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.ErrorHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.ERROR);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.EmptiedHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.EMPTIED);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.StalledHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.STALLED);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.LoadedMetadataHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.LOADED_METADATA);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.LoadedDataHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.LOADED_DATA);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.CanPlayHandler = function () {
    this.IsMediaSourceLoaded = true;
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.CAN_PLAY);

    if (this.StartTime != null && this.StartTime != undefined) {
        this.CurrentTime(this.StartTime);
        this.StartTime = null;
    }
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.CanPlayThroughHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.CAN_PLAY_THROUGH);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.PlayingHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.PLAYING);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.WaitingHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.WAITING);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.SeekingHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.SEEKING);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.SeekedHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.SEEKED);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.EndedHandler = function () {
    this.Pause();
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.ENDED);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.DurationChangeHandler = function (duration) {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.DURATION_CHANGE, duration);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.TimeUpdateHandler = function (time) {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.TIME_UPDATE, time);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.PlayHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.PLAY);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.PauseHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.PAUSE);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.VolumeChangeHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.VOLUME_CHANGE);
};

LiveScribe.Audio.HTML5AudioPlayer.prototype.RateChangeHandler = function () {
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.RATE_CHANGE);
};
