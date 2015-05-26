/***************************************************************
 * @license Copyright © 2007-2013 Livescribe, Inc. All rights reserved.
 **************************************************************/

function StrokeSession(aAnnot,sessionJSON, aoSession, asColor ) {
    this.mAnnot = aAnnot;
	this.mColor = '#008000';
    this.mSession = aoSession;
	this.mStrokes = new StrokeCollection();

	if (sessionJSON != null) {
        if( this.mAnnot ){
            this.mPageId = parseFloat(sessionJSON.pageId);
            this.mSessionAudioStart = parseFloat(sessionJSON.audioStartTime);
        }else{
            this.mPageId = parseFloat(sessionJSON.pageid);
            this.mSessionAudioStart = parseFloat(sessionJSON.startTime);
        }
        
        this.mSessionStart = parseFloat(sessionJSON.startTime);
        this.mSessionEnd = parseFloat(sessionJSON.endTime);
    }
    else {
        this.mPageId = 0;
        this.mSessionAudioStart = 0;
        this.mSessionStart = 0;
        this.mSessionEnd = Math.pow(2, 53);
    }
	
	if( asColor != undefined ){
		this.mColor = asColor;
	}

    this.mUpdateStrokeIndex = 0;
    this.mUpdateTime = 0;

    //Debug( "Session: " + this.toString());

	this.GetNumberOfStrokes = function() {
		return this.mStrokes.GetNumberOfStrokes();
	}

    this.ReceiveStrokes = function(  aoStrokes ) {
        if( !aoStrokes.HasStrokesWithinTimeSpan( this.mSessionStart, this.mSessionEnd) ) {
            return false;
        }

        //console.log("From Array length= " + aoStrokes.mStrokes.length );
        //console.log("To Array length= " + this.mStrokes.mStrokes.length );
        var toStrokesToBeInserted = aoStrokes.RemoveStrokesWithinTimeSpan(this.mSessionStart, this.mSessionEnd);
        //.log("Moving " + toStrokesToBeInserted.mStrokes.length + " strokes" );
        //console.log("From Array length= " + aoStrokes.mStrokes.length);

        this.mStrokes.Merge( toStrokesToBeInserted );
        //console.log("To Array length= " + this.mStrokes.mStrokes.length);

	    return true;
    }

    this.Translate = function( aiOffsetX, aiOffsetY ) {
        this.mStrokes.Translate( aiOffsetX, aiOffsetY );
    }

    this.Reset = function() {
        this.mUpdateStrokeIndex = 0;

        if (this.mAnnot)
            this.mUpdateTime = this.mSessionAudioStart;
        else
            this.mUpdateTime = this.mSessionStart;
    };
    
    this.Reset();

    this.DrawStrokes = function( aContext, aColor ) {
        //Debug("Drawing " + this.mStrokes.length + " strokes");
        this.mStrokes.DrawStrokes( aContext, aColor );
    };

	this.DrawBoundingBoxes = function(aContext) {
		this.mStrokes.DrawBoundingBoxes( aContext );
	};

	this.UpdateSession = function(aContext,aiTime, iCurrentSessionId, asColor  ) {
		if( asColor !== undefined ){
			this.mColor = asColor;
		}
	
        if (aiTime == 0 || iCurrentSessionId != this.mSession.mId ) {
            this.DrawStrokes(aContext, this.mColor);
            return false;
        }

        if (this.mAnnot)
            aiTime += this.mSessionStart - this.mSessionAudioStart;

		//Debug("Update Session time=" + aCurrentTime);

        if (aiTime < this.mSessionStart) {
            return false;
        }

        if( aiTime > this.mSessionEnd ) {
            this.DrawStrokes(aContext, this.mColor);
            return true;
        }

        this.mStrokes.Animate(aContext, aiTime , this.mColor);
        return true;
    };

	this.IntersectWithCircle = function( iX, iY, iRadius ) {
		var tTime = this.mStrokes.IntersectWithCircle( iX, iY, iRadius );
		if( tTime == -1 )  {
			return -1;
		}

		//return this.mSessionAudioStart - this.mSessionStart + tTime;
		//previous code produces impossible times, this line isnt perfect, seems a fraction of a second late, but works. 
		//return tTime.time - this.mSessionStart
		tTime.sessionStart = this.mSessionStart;
		if( this.mAnnot ){
			tTime.time = this.mSessionAudioStart + (tTime.time - tTime.sessionStart);
		}
		
		return (tTime);

	}


    /*
    this.UpdateSession = function(aCurrentTime, aContext) {
        if (this.mAnnot)
            aCurrentTime += this.mSessionStart - this.mSessionAudioStart;

        if (aCurrentTime < this.mUpdateTime)
            return false;

        for (; this.mUpdateStrokeIndex < this.mStrokes.length; this.mUpdateStrokeIndex++) {
            this.mStrokes[this.mUpdateStrokeIndex].AnimateStroke(this.mUpdateTime, aCurrentTime, aContext);
            if (this.mStrokes[this.mUpdateStrokeIndex].mEndTime > aCurrentTime)
                break;
        }

        this.mUpdateTime = aCurrentTime;

        if (this.mUpdateStrokeIndex == this.mStrokes.length)
            return true;

        return false;
    };
    */


    this.toString = function() {
        var ret = TimeSpan2String(this.mSessionStart, this.mSessionEnd);
        if( this.mAnnot ) {
           return ret + " Audio Start: " + UTC2String(this.mSessionAudioStart);
        }
		return ret;
    };
}
