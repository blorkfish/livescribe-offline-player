/***************************************************************
 * @license Copyright © 2007-2013 Livescribe, Inc. All rights reserved.
 **************************************************************/

function AudioSession(aAudioJSON, aMainSessions, aBaseAudioURL) {

	if( aAudioJSON != undefined ) {
	    this.mAudioId = aAudioJSON.audioId;
        this.mAudioStart = parseFloat(aAudioJSON.startTime);
        this.mAudioEnd = parseFloat(aAudioJSON.endTime);

	    this.mAudioSource = aBaseAudioURL + '/audio/' + this.mAudioId;
		this.mAudioPlayer = new WebAudio(this.mAudioSource);
	} else {
		HandleWarning("AudioJSON should always be != undefined");
	}

    this.Play = function() {
        Debug("play");
        this.mAudioPlayer.play();
    };

    this.PlayAtTime = function(aTime) {
        this.mAudioPlayer.playAtTime(aTime);
    };

    this.Pause = function() {
        this.mAudioPlayer.pause();
    };

    this.Stop = function() {
    	this.mAudioPlayer.stop();
    };

    this.IsPlaying = function() {
        if( this == undefined ) {
            return false;
        }
    	return this.mAudioPlayer.isPlaying();
    };

    this.GetAudioTime = function() {
    	return this.mAudioPlayer.getAudioTime();
    };

    this.GetSessionTime = function() {
        return this.mAudioStart + this.mAudioPlayer.getAudioTime();
    };

    this.GetAudioDuration = function() {
		return this.mAudioEnd - this.mAudioStart;
		//return this.mAudioPlayer.getAudioDuration();
    };


    this.toString = function() {
        return "AudioSession: Id= " + this.mId + " " + TimeSpan2String(this.mAudioStart, this.mAudioEnd) /*+ " Source: '" + this.mAudioSource + "'"*/;
    };

}
