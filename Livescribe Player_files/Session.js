/***************************************************************
 * @license Copyright © 2007-2013 Livescribe, Inc. All rights reserved.
 **************************************************************/

function Session( sessionJSON, aoRESTLoader, aiIndex, aoPencast ) {

    this.miCurrentlyPlayingAudioSession = 0;

    this.mBaseTimeSpans = new Array();
    this.mAnnotTimeSpans = new Array();
    this.mAudioSessions = new Array();
	this.mUniquePages = new Array();


    if( sessionJSON == undefined ) {
        this.mName = "None or unknown number of sessions";
	    this.mId = aiIndex;
        this.mStartTime = 0;
        this.mStopTime = 1;
    } else {
        this.mName = sessionJSON.name;
        this.mId = sessionJSON.id;
        this.mStartTime = sessionJSON.startTime;
        this.mStopTime = sessionJSON.endTime;
        //create StrokeSessions for all sessions and annotation sessions
        for (var i = 0; i < sessionJSON.audioSessionList.length; i++) {
            var tSession = new StrokeSession(false, sessionJSON.audioSessionList[i], this);
            this.mBaseTimeSpans[i] = tSession;
            aoPencast.moPageInstances.Then( tSession.mPageId, new Callback( aoPencast.PageInstanceLoaded, aoPencast ));
            this.mUniquePages.push(this.mBaseTimeSpans[i].mPageId);
        }

        for (i = 0; i < sessionJSON.annotSessionList.length; i++) {
            var tAnnot = new StrokeSession(true, sessionJSON.annotSessionList[i], this);
            this.mAnnotTimeSpans[i] = tAnnot;
            aoPencast.moPageInstances.Then( tAnnot.mPageId, new Callback( aoPencast.PageInstanceLoaded, aoPencast ));
            this.mUniquePages.push(this.mAnnotTimeSpans[i].mPageId);
        }

        for (var i = 0; i < sessionJSON.audioList.length; i++) {
            var tsAudioUrl = aoPencast.msBaseURL + '/session/' +  this.mId;
            var tAudioInfo = new AudioSession(sessionJSON.audioList[i], sessionJSON.audioSessionList, tsAudioUrl);
            this.mAudioSessions[i] = tAudioInfo;
        }
        this.mUniquePages = SortUnique(this.mUniquePages);
        this.moLastStrokeSessionReturned = undefined; // this is a lookup cache. Sessions can never overlap
    }

    this.InsertStrokeSessionsIntoDocument = function ( aoPencast, aoStrokeSessionArray, abIsAnnotation ) {
        for( var i = 0; i < aoStrokeSessionArray.length; i++  ) {
                aoPencast.moPageInstances.Then( aoStrokeSessionArray[i].mPageId, new Callback((new PageInstance()).ReceiveStrokeSession, undefined, aoStrokeSessionArray[i], abIsAnnotation) );
        }
    };

    this.InsertSessionIntoDocument = function( aoPencast ) {
        this.InsertStrokeSessionsIntoDocument( aoPencast, this.mBaseTimeSpans, false);
        this.InsertStrokeSessionsIntoDocument( aoPencast, this.mAnnotTimeSpans, true);
    };

    // Gets currently playing audio session
    this.GetCurrAudioSession = function() {		
		return this.mAudioSessions[this.miCurrentlyPlayingAudioSession];		
    };

    // Finds first normal session on page
    // Will only return Annotations if there is nothing else
    // Returns: [ StrokeSession, LowestTime, IsAnnotation ]

    this.FindFirstStrokeSessionOnPage = function( aPageId ) {

        for( var i = 0 ; i < this.mBaseTimeSpans.length ; i ++ ) {
            var tCurrStrokeSession = this.mBaseTimeSpans[i];
            if( tCurrStrokeSession.mPageId == aPageId  ) {
                return tCurrStrokeSession;
            }
        }

        // Check annotations as a worst case fallback{
        for( var i = 0 ; i < this.mAnnotTimeSpans.length ; i ++ ) {
            var tCurrStrokeSession = this.mAnnotTimeSpans[i];
            if( tCurrStrokeSession.mPageId == aPageId  ) {
                return tCurrStrokeSession;
            }
        }

        return undefined;
    };

    this.GetAudioTime = function() {
        var tAudioTime = 0;
        if( this != undefined && this.GetCurrAudioSession() !=  undefined ) {
            for (var i = 0; i < this.miCurrentlyPlayingAudioSession; i++)
                tAudioTime += this.mAudioSessions[i].GetAudioDuration();
            tAudioTime += this.GetCurrAudioSession().GetAudioTime();
        }
        return tAudioTime;
    };

    this.GetAudioDuration = function() {
        var tAudioTime = 0;
        if( this != undefined ) {
            for (var i = 0; i < this.mAudioSessions.length; i++)
            tAudioTime += this.mAudioSessions[i].GetAudioDuration();
        }
        return tAudioTime;
    };

	//Takes time in milliseconds of audio and return the utc of current position
    this.AudioToSessionTime = function(aTime) {
        if (this == undefined || this.mAudioSessions.length == 0)
            return 0;

        for (var i = 0; i < (this.mAudioSessions.length - 1); i++) {
            if (aTime < this.mAudioSessions[i].GetAudioDuration())
                break;

            aTime -= this.mAudioSessions[i].GetAudioDuration();
        }

        return (this.mAudioSessions[i].mAudioStart + aTime);
    };

	//Takes time in utc and return the time of current audio in milliseconds
    this.SessionToAudioTime = function(aTime) {
        if ( this == undefined || this.mAudioSessions.length == 0)
            return 0;

        for (var i = 0; i < (this.mAudioSessions.length - 1); i++) {
            if (aTime < this.mAudioSessions[i].mAudioEnd)
                break;
        }

        var tAudioTime = aTime - this.mAudioSessions[i].mAudioStart;
        for (var j = i - 1; j >= 0; j--)
            tAudioTime += this.mAudioSessions[j].GetAudioDuration();

        return tAudioTime;
    };

	//Takes time in utc and returns the current session page
    this.AudioToSessionPage = function(aTime) {
	    Debug("Atime=" + aTime);
        if ( this == undefined || this.mAudioSessions.length == 0)
            return 0;

        for (var i = 0; i < (this.mAudioSessions.length ); i++) {
            if (aTime < this.mAudioSessions[i].GetAudioDuration())
                break;

            aTime -= this.mAudioSessions[i].GetAudioDuration();
        }

        return this.GetSessionPage(aTime);
    };
	
	//Returns current time in utc
    this.GetSessionTime = function() {
        if( this == undefined ) {
            return 0;
        }

        var tCurrSess = this.GetCurrAudioSession();
        if( tCurrSess == undefined) {
            return 0;
        }
        return tCurrSess.GetSessionTime();
    };

	//Returns current Session Page
    this.GetSessionPage = function(aTime) {
        var tSessionTime = /*this.GetCurrAudioSession().mAudioStart + */aTime ;

        for (var i = 0; i < this.mBaseTimeSpans.length; i++) {
            if (tSessionTime > this.mBaseTimeSpans[i].mSessionStart && tSessionTime < this.mBaseTimeSpans[i].mSessionEnd)
                return this.mBaseTimeSpans[i].mPageId;
        }

        for (var i = 0; i < this.mAnnotTimeSpans.length; i++) {
            if (tSessionTime > this.mAnnotTimeSpans[i].mSessionStart && tSessionTime < this.mAnnotTimeSpans[i].mSessionEnd)
                return this.mAnnotTimeSpans[i].mPageId;
        }

        return -1;
    };
	
	
	//Return unix time stamp of current pages' start time
	this.getCurrentSessionPageStartTime = function(aiCurrentSessionTime) {
        for (var i = 0; i < this.mBaseTimeSpans.length; i++) {
            if (this.mBaseTimeSpans[i].mSessionStart < aiCurrentSessionTime && this.mBaseTimeSpans[i].mSessionEnd > aiCurrentSessionTime ){
				return this.mBaseTimeSpans[i].mSessionStart;
			}	
        }
	};
	
	//Return unix time stamp of first instance of pageId
	this.getSessionPageStartTime = function(aiPageId) {
        for (var i = 0; i < this.mBaseTimeSpans.length; i++) {
            if (this.mBaseTimeSpans[i].mPageId == aiPageId ){
				return this.mBaseTimeSpans[i].mSessionStart;
			}	
        }
	};
	
	this.getCurrentSessionAudioStartTime = function(aiCurrentSessionTime) {
        for (var i = 0; i < this.mAudioSessions.length; i++) {
            if (this.mAudioSessions[i].mAudioStart < aiCurrentSessionTime && this.mAudioSessions[i].mAudioEnd > aiCurrentSessionTime ){
				return this.mAudioSessions[i].mAudioStart;
			}	
        }
		
		if( aiCurrentSessionTime > this.mAudioSessions[this.mAudioSessions.length-1].mSessionStart ){
			return this.mAudioSessions[this.mAudioSessions.length-1].mAudioStart;
		}else{
			return this.mAudioSessions[0].mAudioStart;
		}
	};
	
	//Return the index of current page from array
	this.getRelativePageFromSessionTime = function(aiCurrentSessionTime){
        for (var i = 0; i < this.mBaseTimeSpans.length; i++) {
            if (this.mBaseTimeSpans[i].mSessionStart < aiCurrentSessionTime && this.mBaseTimeSpans[i].mSessionEnd > aiCurrentSessionTime ){
				return i;
			}	
        }
		
		if( aiCurrentSessionTime > this.mBaseTimeSpans[this.mBaseTimeSpans.length-1].mSessionStart ){
			return this.mBaseTimeSpans.length-1;
		}else{
			return 0;
		}	
	}
	
	this.getRelativePageFromPageId = function(aiPageId){
        for (var i = 0; i < this.mBaseTimeSpans.length; i++) {
            if (this.mBaseTimeSpans[i].mPageId == aiPageId ){
				return i;
			}	
        }
		
		return 0;
	}
	
	this.getRelativeAudioFromSessionTime = function(aiCurrentSessionTime){
			for (var i = 0; i < this.mAudioSessions.length; i++) {
				if (this.mAudioSessions[i].mAudioStart < aiCurrentSessionTime && this.mAudioSessions[i].mAudioEnd > aiCurrentSessionTime ){
					return i;
				}	
			}
		return 0;
	}
	
	this.getNextSessionStartTime = function(aiPageId, aDelta) {
		var iIndex = this.getRelativePageFromPageId(aiPageId);

		if( (iIndex+aDelta) >= this.mBaseTimeSpans.length || iIndex+aDelta < 0){
			return this.mBaseTimeSpans[iIndex].mSessionStart;
		}else{
			return this.mBaseTimeSpans[iIndex+aDelta].mSessionStart;
		}
    
	};
	
	this.getNextSessionPageId = function(aiPageId, aDelta) {
		var iIndex = this.getRelativePageFromPageId(aiPageId);

		if( (iIndex+aDelta) >= this.mBaseTimeSpans.length || iIndex+aDelta < 0){
			return this.mBaseTimeSpans[iIndex].mPageId;
		}else{
			return this.mBaseTimeSpans[iIndex+aDelta].mPageId;
		}
    
	};
	
	this.PlayAtTime = function(aTime){
		var iSessionTime = this.AudioToSessionTime(aTime);
		if( (iSessionTime != undefined ) && iSessionTime < this.mStopTime){
			var iAudioIndex = this.getRelativeAudioFromSessionTime(iSessionTime);
            if( iAudioIndex != this.miCurrentlyPlayingAudioSession ){
                console.log("Switching sessions");
            }
			this.miCurrentlyPlayingAudioSession = iAudioIndex;
            console.log("Play At Time: " + (iSessionTime - this.mAudioSessions[iAudioIndex].mAudioStart));

			this.mAudioSessions[iAudioIndex].PlayAtTime(iSessionTime - this.mAudioSessions[iAudioIndex].mAudioStart);
		}
	};
	
    this.UpdateCurrentlyPlayingSessionPlayStatus = function() {
        if( this != undefined ) {
           if( this.mAudioSessions[this.miCurrentlyPlayingAudioSession].GetAudioDuration() <= this.mAudioSessions[this.miCurrentlyPlayingAudioSession].GetAudioTime()+100 ){
                this.miCurrentlyPlayingAudioSession++;
                if( this.mAudioSessions == null || this.miCurrentlyPlayingAudioSession >= this.mAudioSessions.length ) {
                    this.miCurrentlyPlayingAudioSession=0;
                    return false;
                }else{
                    this.mAudioSessions[this.miCurrentlyPlayingAudioSession-1].Pause();
                    if( IsMobile.any() ){
                        if( this.mAudioSessions[this.miCurrentlyPlayingAudioSession].mAudioPlayer.mAudioPlayer.loaded ){
                            this.mAudioSessions[this.miCurrentlyPlayingAudioSession].PlayAtTime(.1);
                        }else{
                            tPencast.Pause();
                        }
                    }else{
                        this.mAudioSessions[this.miCurrentlyPlayingAudioSession].PlayAtTime(.1);
                    }
                }
            }
        }
        return true;
    };

    this.Play = function() {
		if (this.miCurrentlyPlayingAudioSession == this.mAudioSessions.length) {
			this.Stop();
			this.miCurrentlyPlayingAudioSession = 0;
        }
		
        this.mAudioSessions[this.miCurrentlyPlayingAudioSession].Play();
    };

    this.Stop = function() {
        /*for (var i = 0; i < this.mAudioSessions.length; i++)
            this.mAudioSessions[i].Stop();
        */
		if( this.mAudioSessions[this.miCurrentlyPlayingAudioSession] == undefined ){
			this.miCurrentlyPlayingAudioSession = 0;
		}
		this.mAudioSessions[this.miCurrentlyPlayingAudioSession].Stop();
		this.miCurrentlyPlayingAudioSession = 0;
    };

    this.Pause = function() {
		if( this.mAudioSessions[this.miCurrentlyPlayingAudioSession] == undefined ){
			this.miCurrentlyPlayingAudioSession = 0;
		}
        this.mAudioSessions[this.miCurrentlyPlayingAudioSession].Pause();
    };

    this.GetCurrentStrokeSessionFromTime = function( aTime  ) {

        // Sessions cannot intersect so we are trying last one before searching...
        if( this.moLastStrokeSessionReturned != undefined && aTime > this.moLastStrokeSessionReturned.mSessionStart && aTime < this.moLastStrokeSessionReturned.mSessionEnd) {
            //console.log("cache hit");
            return this.moLastStrokeSessionReturned;
        }

        for (var i = 0; i < this.mBaseTimeSpans.length; i++) {
            //console.log("diffStart=" + (aTime - this.mBaseTimeSpans[i].mSessionStart) + " diffend=" + ( this.mBaseTimeSpans[i].mSessionEnd - aTime) );
            if (aTime > this.mBaseTimeSpans[i].mSessionStart && aTime < this.mBaseTimeSpans[i].mSessionEnd) {
                this.moLastStrokeSessionReturned = this.mBaseTimeSpans[i];
                return this.mBaseTimeSpans[i];
            }
        }

        for (var i = 0; i < this.mAnnotTimeSpans.length; i++) {
            //console.log("Annot: diffStart=" + (aTime - this.mAnnotTimeSpans[i].mSessionStart) + " diffend=" + ( this.mAnnotTimeSpans[i].mSessionEnd - aTime) );
            if (aTime > this.mAnnotTimeSpans[i].mSessionStart && aTime < this.mAnnotTimeSpans[i].mSessionEnd) {
                this.moLastStrokeSessionReturned = this.mAnnotTimeSpans[i];
                return this.mAnnotTimeSpans[i];
            }
        }

        if( this.mBaseTimeSpans.length > 0) {
            return this.mBaseTimeSpans[0];
        }

        if( this.mAnnotTimeSpans.length > 0) {
            return this.mAnnotTimeSpans[0];
        }

        return undefined;
    };

    /*
    this.GetCurrentSessionPage = function( aiCurrentPage ) {
        //console.log("num sess=" + this.mAudioSessions.length );
        //console.log("Session id:" + this.miCurrentlyPlayingAudioSession + " \nAudio Sess:" + this.mAudioSessions[this.miCurrentlyPlayingAudioSession].toString() );
        var tCurrSession = this.mAudioSessions[this.miCurrentlyPlayingAudioSession];
        var tCurrSessTime = -1;
        if( tCurrSession != undefined ) {
            tCurrSessTime = tCurrSession.GetSessionTime();    // FIXME: Potentially not correct
        }

        var tStrokeSession = this.GetCurrentStrokeSessionFromTime( tCurrSessTime );
        if( tStrokeSession == undefined ) {
            console.log("Unable to find stroke session from time=" + UTC2String(tCurrSessTime));
            return aiCurrentPage; // return current page if not found
        }
        return tStrokeSession.mPageId;
    };
     */
	 
    // Returns the first PageId of a session (where to start playing)
    this.GetFirstPageId = function() {

        if( this.mBaseTimeSpans.length > 0 ) {
            return this.mBaseTimeSpans[0].mPageId;
        }

        if( this.mAnnotTimeSpans.length > 0 ) {
            return this.mAnnotTimeSpans[0].mPageId;
        }
        return -1;
    };

	/// ok these declare some ugly local variables....
	this.gDBG_MARGIN = 100;
	this.gDBG_SPAN_WIDTH = 50;

	this.DrawSpan = function( ctx, x, iStart, iStop, sCaption ) {
		iStart -= this.mStartTime;
		iStop -= this.mStartTime;
		var start = iStart * this.mDebugVertScale;
		var stop = iStop * this.mDebugVertScale;
		start += this.gDBG_MARGIN;
		stop += this.gDBG_MARGIN;
		x += this.gDBG_MARGIN;
		ctx.fillRect(x, start, this.gDBG_SPAN_WIDTH*2/3,  2);
		ctx.fillRect(x, stop, this.gDBG_SPAN_WIDTH*2/3,  2);
		ctx.fillRect(x, start, 2, stop-start+2);
		DrawText( ctx, sCaption, x + 2, start-2 ,"Courier", 10, false );
		DrawText( ctx, Milliseconds2String(iStart) + "s", x+2, start-2 ,"Courier", 10, true );
		DrawText( ctx, Milliseconds2String(iStop) + "s", x+2, stop-2 ,"Courier", 10, false );
		DrawText( ctx, Milliseconds2String(iStop-iStart) + "s", x+2, (start+stop)/2 ,"Courier", 10, true );
	};

	this.DrawCaption = function( ctx, x, sCaption ) {
		DrawText( ctx, sCaption, x+this.gDBG_MARGIN+5, 2 ,"Courier", 10, true );
	};

	this.DrawGraphicalDebugBackground = function( oCanvas ) {

		if( this.mStartTime != 0 && DebugIsMaskOn("SESSIONOVERLAY")) {
			var tCtx = oCanvas.getContext("2d");

			this.mDebugVertScale = (oCanvas.height - this.gDBG_MARGIN*2 ) / (this.mStopTime-this.mStartTime);

			//Debug("Scale=" + this.mDebugVertScale);

			var x = 0;
			{
				tCtx.save();
				tCtx.fillStyle="";
				this.DrawCaption( tCtx, x, "Session\nDebug" );
				this.DrawSpan( tCtx, x, this.mStartTime, this.mStopTime, this.mId);
				x+=this.gDBG_SPAN_WIDTH;

				//Debug("Dur=" + this.mStopTime + " stop = " + this.mStartTime);
				tCtx.fillStyle="navy";
				this.DrawCaption( tCtx, x, "Audio\nId" );
				for( var i = 0 ; i < this.mAudioSessions.length ; i++ ) {
					this.DrawSpan( tCtx, x, this.mAudioSessions[i].mAudioStart, this.mAudioSessions[i].mAudioEnd, this.mAudioSessions[i].mAudioId.toString());
				}
				x+=this.gDBG_SPAN_WIDTH;

				tCtx.fillStyle="forestgreen";
				this.DrawCaption( tCtx, x, "Base\nPageId" );
				for( var i = 0 ; i < this.mBaseTimeSpans.length ; i++ ) {
					this.DrawSpan( tCtx, x, this.mBaseTimeSpans[i].mSessionStart, this.mBaseTimeSpans[i].mSessionEnd, this.mBaseTimeSpans[i].mPageId.toString());
				}
				x+=this.gDBG_SPAN_WIDTH;

				tCtx.fillStyle="darkmagenta";
				this.DrawCaption( tCtx, x, "Annot\nPageId" );
				for( var i = 0 ; i < this.mAnnotTimeSpans.length ; i++ ) {
					this.DrawSpan( tCtx, x+(i*this.gDBG_SPAN_WIDTH), this.mAnnotTimeSpans[i].mSessionAudioStart, this.mAnnotTimeSpans[i].mSessionAudioStart + (this.mAnnotTimeSpans[i].mSessionEnd-this.mAnnotTimeSpans[i].mSessionStart), this.mAnnotTimeSpans[i].mPageId.toString());
				}
				x+=this.gDBG_SPAN_WIDTH;

				tCtx.restore();
			}
		}
	}

	this.DrawGraphicalDebugForeground = function( oCanvas, aiTime ) {
 
		if( this.mStartTime != 0 ) {
			
			var tCtx = oCanvas.getContext("2d");
			tCtx.save();

			if( DebugIsMaskOn("FPS") ){
				DrawText( tCtx, (1000/aoPencast.miFrameTime).toFixed(1) + " FPS", 20, oCanvas.height-20 ,"Courier", 10, true );
			}
		
			if( DebugIsMaskOn("SESSIONOVERLAY")){
				this.mDebugVertScale = (oCanvas.height - this.gDBG_MARGIN*2 ) / (this.mStopTime-this.mStartTime);
				//Debug( "Loc = " + tTime + this.mDebugVertScale );
				if( aiTime == undefined ){
					var tTime = this.GetAudioTime();
				}else{
					var tTime = this.SessionToAudioTime( aiTime );
				}
				
				var x = this.gDBG_SPAN_WIDTH - 120;
				{
					tCtx.fillStyle="#000000";
					var y = ((this.mStopTime-this.mStartTime) - (this.mStopTime-this.AudioToSessionTime(tTime)))*this.mDebugVertScale+this.gDBG_MARGIN;
					tCtx.fillRect(0, y , 5*this.gDBG_SPAN_WIDTH, 1);
					DrawText( tCtx, Milliseconds2String(tTime), 5*this.gDBG_SPAN_WIDTH + 4 , y+5 ,"Courier", 16, false );
					
					//Debug("Dur=" + this.mStopTime + " stop = " + this.mStartTime);
					
					tCtx.fillStyle="grey";
					this.DrawCaption( tCtx, x, "Audio \nBuffered" );
					for( var i = 0 ; i < this.mAudioSessions.length ; i++ ) {
						var buffered = this.mAudioSessions[i].mAudioPlayer.getBufferedRange();
						for( var j = 0 ; j < buffered.length; j++ ) {
							this.DrawSpan( tCtx, (0-(this.gDBG_MARGIN/2)), this.mAudioSessions[i].mAudioStart+(buffered[j][0]*1000), this.mAudioSessions[i].mAudioStart+(buffered[j][1]*1000), '');
						}
					}
					
					x+=this.gDBG_SPAN_WIDTH;
					
					
				}
			}
			tCtx.restore();

		}
	}

	this.toString = function() {
        return "Session: Id: " + this.mId + " '" + this.mName + "' (" + UTC2String(this.mStartTime) + "-" + UTC2String(this.mStopTime) + ")"
            + ArrayToString(this.mAudioSessions, "AudioFiles", "   ")
            + ArrayToString(this.mBaseTimeSpans, "BasePageSpans", "   ")
            + ArrayToString(this.mAnnotTimeSpans, "AnnotationPageSpans", "  ");
    };

}