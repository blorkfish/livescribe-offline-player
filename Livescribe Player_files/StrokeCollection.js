/***************************************************************
 * @license Copyright © 2007-2013 Livescribe, Inc. All rights reserved.
 **************************************************************/

var StrokeCollection = function(ajStrokeData, aoRESTLoader, aiIndex, aoPageInstance ) {
    this.mStrokes = new Array();
	this.mId = aiIndex;

	if( ajStrokeData != undefined ) {

        var aStrokes = ajStrokeData.getElementsByTagName('stroke');

        for( var tiCurrentStroke = 0 ; tiCurrentStroke < aStrokes.length ; tiCurrentStroke ++ ) {
            //var tStrokeStart = parseFloat(aStrokes[tCurrentStroke].attributes.getNamedItem("timestamp").nodeValue);
            var tStroke = new Stroke(aStrokes[tiCurrentStroke]);    // FIXME: Get proper offset from template
            this.mStrokes.push( tStroke );
        }

    } else if( DebugIsMaskOn("LOCALTEST") ) {

	    for( var i = 0 ; i < 10 ; i++ ) {
		    var tStroke = new Stroke();
		    var tTime = 100000 + i * 1000;
		    var tX = 100 + 7000 * Math.random();
		    var tY = 100 + 9000 * Math.random();
		    var tAng = Math.random() * 6.28;
		    var tStrokeSize = 10 + Math.random() * 30;
		    var tStrokeSize = 10 + Math.random() * 30;
		    var tStrokeLength = 1 + Math.random() * 30 ;
		    for( var c = 0 ; c < tStrokeLength ; c++ ) {
			    var tCoord = new Point( tX, tY, tTime );
			    tStroke.mCoords.push( tCoord );
			    tX += tStrokeSize * Math.cos( tAng );
			    tY += tStrokeSize * Math.sin( tAng );
			    tAng += (0.6 - Math.random()) * 1.1;
			    tStrokeSize *= 1 + (Math.random()-0.5) * 0.3
			    tTime += 13;
		    }
		    tStroke.mStartTime = tStroke.mCoords[0].mTime;
		    tStroke.mEndTime = tStroke.mCoords[tStroke.mCoords.length-1].mTime;
		    //console.log( i + " : " + tStroke.toString(true));
		    this.mStrokes.push(tStroke);
	    }
    }
}

StrokeCollection.prototype.Translate = function( aiOffsetX, aiOffsetY ) {
        for( var i = 0 ; i < this.mStrokes.length ; i++ ) {
            this.mStrokes[i].Translate( aiOffsetX, aiOffsetY );
        }
    }

StrokeCollection.prototype.FindArrayLocationOfTime = function( aTime ) {

        if( !this.HasStrokes() || this.mStrokes[0].mStartTime > aTime) {
            return 0;
        }

        if( aTime > this.mStrokes[this.mStrokes.length-1].mStartTime ) {
            return this.mStrokes.length;
        }

        // This is the cheap one
        for( var i = 0; i < this.mStrokes.length ; i++ ) {
            if( aTime <= this.mStrokes[i].mStartTime ) {
                return i;
            }
        }

        HandlePanic( "We should never get here...");

        // TODO: Add this sweet binary search later
        var aMin = 1;
        var aMax = this.mStrokes.length-2;
        while( !( aTime > this.mStrokes[aMin].mStartTime && aTime < this.mStrokes[aMin+1].mStartTime) ) {
            var tMid = (aMax - aMin + 1)/2;
            if( this.mStrokes[tMid].mStartTime > aTime ) {
                aMin = tMid;
            } else {
                aMax = tMid;
            }
        }
        return aMin;
    };

StrokeCollection.prototype.Merge = function( aoStrokes ) {
        if( aoStrokes.HasStrokes() ) {
            var tiInsertionPoint = this.FindArrayLocationOfTime( aoStrokes.mStrokes[0].mStartTime );
            //console.log("Insertion point =", tiInsertionPoint, " endindex= " + (this.mStrokes.length - tiInsertionPoint));
            var tRestOfArray = this.mStrokes.splice(tiInsertionPoint, (this.mStrokes.length - tiInsertionPoint));
            this.mStrokes = this.mStrokes.concat( this.mStrokes, aoStrokes.mStrokes, tRestOfArray);
        }
    };

StrokeCollection.prototype.HasStrokes = function() {
        return this.mStrokes.length > 0;
    };

StrokeCollection.prototype.GetNumberOfStrokes = function() {
		return this.mStrokes.length;
	};

StrokeCollection.prototype.HasStrokesWithinTimeSpan = function( aiStartTime, aiEndTime ) {
        if( this.HasStrokes() )
        {
            if( this.mStrokes[0].mStartTime <= aiEndTime && this.mStrokes[this.mStrokes.length-1].mEndTime >= aiStartTime ) {
                return true;
            }
        }

        return false;
    };

StrokeCollection.prototype.RemoveStrokesWithinTimeSpan = function ( aStartTime, aEndTime ) {
        var tRet = new StrokeCollection();
        if( this.HasStrokesWithinTimeSpan( aStartTime, aEndTime) ) {
            var tStartIndex = this.FindArrayLocationOfTime( aStartTime );
            var tEndIndex = this.FindArrayLocationOfTime( aEndTime );
	        //console.log("Startindex = " + tStartIndex + " tEndIndex = " + tEndIndex);
            tRet.mStrokes = this.mStrokes.splice(tStartIndex, (tEndIndex - tStartIndex));
        }

        return tRet;
    };

StrokeCollection.prototype.DrawStrokes = function ( aContext, aColor ) {
		aContext.save();
		aContext.fillStyle = aColor;
		aContext.strokeStyle = aColor;
        for (var i = 0; i < this.mStrokes.length; i++) {
            this.mStrokes[i].DrawStroke(aContext);
        }
		aContext.restore();

    }

StrokeCollection.prototype.Animate = function ( aContext, aiCurrentTime, aColor ) {
		aContext.save();
		aContext.fillStyle = aColor;
		aContext.strokeStyle = aColor;
        for( var i = 0 ; i < this.mStrokes.length ; i++ ) {
            if( aiCurrentTime > this.mStrokes[i].mEndTime  ) {
                this.mStrokes[i].DrawStroke(aContext);
            } else if( aiCurrentTime > this.mStrokes[i].mStartTime &&  aiCurrentTime < this.mStrokes[i].mEndTime ) {
				if( DebugIsMaskOn("ANIMATEOVERLAY") ){
					this.mStrokes[i].AnimStroke(aiCurrentTime, aContext,true);
				}else{
					this.mStrokes[i].AnimStroke(aiCurrentTime, aContext,false);
				}
            }else{
				break;
			}
        }
		aContext.restore();
    }

StrokeCollection.prototype.IntersectWithCircle = function ( iX, iY, iRadius ) {
		//console.log("Intersecting with " + this.mStrokes.length + " strokes");
		for( var i = 0 ; i < this.mStrokes.length ; i++ ) {
			var tTime = this.mStrokes[i].IntersectWithCircle( iX, iY, iRadius );
			if( tTime != -1 ) {
				return tTime;
			}
		}
		return -1;
	}

StrokeCollection.prototype.toString = function() {
        return "StrokeCollection: Id=" + this.mId + " with " + this.mStrokes.length + " strokes";
    }
