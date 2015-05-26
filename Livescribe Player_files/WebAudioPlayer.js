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
LiveScribe.Audio.WebAudioPlayer = function () {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    this.AudioContext = new window.AudioContext();
    if (this.AudioContext.start) {
        this.AudioContext.noteOn = this.AudioContext.start;
        this.AudioContext.noteGrainOn = this.AudioContext.start;
        this.AudioContext.noteOff = this.AudioContext.stop;
    }


    this.AudioBufferSource = null;
    this.Buffer;
    this.MediaEndTimer = null;
    this.IsMediaSourceLoaded = false;
    this.StartTime = null;
    this.Playing = false;
    this.Paused = false;
    this.StartedAt = 0;
    this.PausedAt = 0;
    this.Loop = false;
    this.LoopStart = 0;
    this.LoopEnd = 0;

    this.OnEndedDelegate = LiveScribe.Events.CreateDelegate(this, this.EndedHandler);

    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.PLAYING);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.PROGRESS);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.ENDED);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.PLAY);
    this.AddEvent(LiveScribe.Audio.HTML5AudioEvent.PAUSE);
};

LiveScribe.Audio.WebAudioPlayer.prototype = new LiveScribe.Events.CustomEventHandlingBase();



// Readonly Properties
LiveScribe.Audio.WebAudioPlayer.prototype.SampleRate = function () { return this.AudioBufferSource.buffer.samplerate; };
LiveScribe.Audio.WebAudioPlayer.prototype.Length = function () { return this.AudioBufferSource.buffer.length; };
LiveScribe.Audio.WebAudioPlayer.prototype.Duration = function () { return this.AudioBufferSource.buffer.duration; };
LiveScribe.Audio.WebAudioPlayer.prototype.NumberOfChannels = function () { return this.AudioBufferSource.buffer.numberOfChannels; };
LiveScribe.Audio.WebAudioPlayer.prototype.PlaybackRate = function () { return this.AudioBufferSource.playbackRate; };



// Read/Write Properties
LiveScribe.Audio.WebAudioPlayer.prototype.Source = function (buffer) {
    if (buffer != null || buffer != undefined) {
        this.IsMediaSourceLoaded = false;
        this.ClearMediaEndTimer();

        if (this.Playing && !this.Paused) {
            this.AudioBufferSource.noteOff(0);
        }

        this.StartTime = null;
        this.Playing = false;
        this.Paused = false;
        this.StartedAt = 0;
        this.PausedAt = 0;
        this.Buffer = buffer;
        this.IsMediaSourceLoaded = true;
    }

    return this.Buffer;
};

LiveScribe.Audio.WebAudioPlayer.prototype.CurrentTime = function (time) {
    if (time != null || time != undefined) {
        if (this.Playing && !this.Paused) {
            this.AudioBufferSource.noteOff(0);
        }

        this.StartTime = time;
    }

    if (this.IsMediaSourceLoaded) { return this.StartedAt = Date.now() - this.StartedAt;}
    else { return null; }
    
};

LiveScribe.Audio.WebAudioPlayer.prototype.Loop = function (loopState) {
    if (loopState != null || loopState != undefined) {
        this.AudioBufferSource.loop = loopState;
    }

    return this.AudioBufferSource.loop
};

LiveScribe.Audio.WebAudioPlayer.prototype.LoopStart = function (time) {
    if (time != null || time != undefined) {
        this.AudioBufferSource.loopStart = time;
    }

    return this.AudioBufferSource.loopStart;
};

LiveScribe.Audio.WebAudioPlayer.prototype.LoopEnd = function (time) {
    if (time != null || time != undefined) {
        this.AudioBufferSource.loopEnd = time;
    }

    return this.AudioBufferSource.loopEnd;
};



// Methods
LiveScribe.Audio.WebAudioPlayer.prototype.Pause = function () {
    if (this.Paused) { return; }

    this.ClearMediaEndTimer();

    this.AudioBufferSource.noteOff(0);

    this.PausedAt = Date.now() - this.StartedAt;
    this.Paused = true;
};

LiveScribe.Audio.WebAudioPlayer.prototype.Play = function () {
    if (this.Playing && !this.Paused) { return; }
    
    this.AudioBufferSource = this.AudioContext.createBufferSource();
    this.AudioBufferSource.connect(this.AudioContext.destination);
    this.AudioBufferSource.buffer = this.Buffer;

    try {
        if (this.StartTime != null) {
            this.StartedAt = Date.now() - (this.StartTime * 1000);

            var remainingTime = (this.Duration() - this.StartTime);
            this.AudioBufferSource.noteGrainOn(0, this.StartTime, remainingTime);
            this.MediaEndTimer = setTimeout(this.OnEndedDelegate, remainingTime * 1000);
        }
        else {
            if (this.Paused) {
                this.StartedAt = Date.now() - this.PausedAt;

                var remainingTime = (this.Duration() - (this.PausedAt / 1000));
                this.AudioBufferSource.noteGrainOn(0, this.PausedAt / 1000, remainingTime);
                this.MediaEndTimer = setTimeout(this.OnEndedDelegate, remainingTime * 1000);
            }
            else {
                this.StartedAt = Date.now();

                var remainingTime = this.Duration();
                this.AudioBufferSource.noteGrainOn(0, 0, this.Duration());
                this.MediaEndTimer = setTimeout(this.OnEndedDelegate, remainingTime * 1000);
            }
        }
    }
    catch (e) {
        alert('wa play: ' + e.message);
    }

    this.Playing = true;
    this.Paused = false;
};

LiveScribe.Audio.WebAudioPlayer.prototype.Replay = function () {
    this.ResetMedia();
    this.Play();
};

LiveScribe.Audio.WebAudioPlayer.prototype.ResetMedia = function () {
    this.ChangeMediaSource(this.Buffer);
};

LiveScribe.Audio.WebAudioPlayer.prototype.ChangeMediaSource = function (buffer) {
    this.Source(buffer);
};

LiveScribe.Audio.WebAudioPlayer.prototype.ClearMediaEndTimer = function () {
    if (this.MediaEndTimer != null) {
        clearTimeout(this.MediaEndTimer);
        this.MediaEndTimer = null;
    }
};



// Event Handlers
LiveScribe.Audio.WebAudioPlayer.prototype.EndedHandler = function () {
    this.ClearMediaEndTimer();
    this.AudioBufferSource.noteOff(0);
    
    this.FireEvent(LiveScribe.Audio.HTML5AudioEvent.ENDED);
};

