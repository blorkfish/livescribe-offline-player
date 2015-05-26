// ***********************************************************************************************************
// Name:HTML5 Audio Player Types
// Type:User Control Library
// Author: Cliff Gower
//************************************************************************************************************


var LiveScribe = LiveScribe || {};
LiveScribe.Audio = LiveScribe.Audio || {};


LiveScribe.Audio.HTML5AudioMuteState = {
    AUDIBLE: false,
    MUTED: true
};

LiveScribe.Audio.HTML5AudioLoop = {
    YES: false,
    NO: true
};

LiveScribe.Audio.HTML5AudioPlaybackRate = {
    FORWARD: 1,
    FAST_FORWARD: 3,
    REVERSE: -1,
    FAST_REVERSE: -3
};

LiveScribe.Audio.HTML5AudioEvent = {
    LOAD_START: 'loadstart',
    PROGRESS: 'progress',
    SUSPEND: 'suspend',
    ABORT: 'abort',
    ERROR: 'error',
    EMPTIED: 'emptied',
    STALLED: 'stalled',
    LOADED_METADATA: 'loadedmetadata',
    LOADED_DATA: 'loadeddata',
    CAN_PLAY: 'canplay',
    CAN_PLAY_THROUGH: 'canplaythrough',
    PLAYING: 'playing',
    WAITING: 'waiting',
    SEEKING: 'seeking',
    SEEKED: 'seeked',
    ENDED: 'ended',
    DURATION_CHANGE: 'durationchange',
    TIME_UPDATE: 'timeupdate',
    PLAY: 'play',
    PAUSE: 'pause',
    RATE_CHANGE: 'ratechange',
    VOLUME_CHANGE: 'volumechange'
};

LiveScribe.Audio.HTML5AudioControllerEvent = {
    EMPTIED: 'emptied',
    LOADED_METADATA: 'loadedmetadata',
    LOADED_DATA: 'loadeddata',
    CAN_PLAY: 'canplay',
    CAN_PLAY_THROUGH: 'canplaythrough',
    PLAYING: 'playing',
    WAITING: 'waiting',
    ENDED: 'ended',
    DURATION_CHANGE: 'durationchange',
    TIME_UPDATE: 'timeupdate',
    PLAY: 'play',
    PAUSE: 'pause',
    RATE_CHANGE: 'ratechange',
    VOLUME_CHANGE: 'volumechange'
};

LiveScribe.Audio.HTML5AudioReadyState = {
    HAVE_NOTHING: 0,
    HAVE_METADATA: 1,
    HAVE_CURRENT_DATA: 2,
    HAVE_FUTURE_DATA: 3,
    HAVE_ENOUGH_DATA: 4
};

LiveScribe.Audio.HTML5AudioNetworkState = {
    NETWORK_EMPTY: 0,
    NETWORK_IDLE: 1,
    NETWORK_LOADING: 2,
    NETWORK_NO_SOURCE: 3
};

LiveScribe.Audio.HTML5AudioError = {
    MEDIA_ERR_ABORTED: 1,
    MEDIA_ERR_NETWORK: 2,
    MEDIA_ERR_DECODE: 3,
    MEDIA_ERR_SRC_NOT_SUPPORTED: 4
};
