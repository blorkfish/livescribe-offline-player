/***************************************************************
 * @license Copyright © 2007-2013 Livescribe, Inc. All rights reserved.
 **************************************************************/

function PageInstance(aPageJSON, aoRESTLoader, aiIndex, aoPencast ) {
    if( aPageJSON == undefined ) {
        this.mPageId = aiIndex;
        this.mPageLabel = "Unknown page";
        this.mStrokeId = 0;
	    this.mSessions = new Array();
	    this.miPageTemplate = 0;
        this.msStrokesPattern = "";
    } else {
        this.mPageId = parseFloat(aPageJSON.id); //TODO: change name and update references
        this.mPageLabel = aPageJSON.label;
        this.mStrokeId = aPageJSON.strokeId;
        this.mSessions = aPageJSON.sessions;
        this.miPageTemplate = parseFloat(aPageJSON.templateId);
        this.msStrokesPattern = aoPencast.msBaseURL + "/page/" + this.mPageId + "/stroke/@.xml" ;
    }

	this.mAnnotTimeSpans = new Array();
    this.mNormalStrokeColor = "#000000";
    this.mPreviewStrokeColor = "#AAAAAA";
    this.mSessionStrokeColor = "#008000";
    this.mLineWidth = "7";
	this.mLastClick = {x:0,y:0,r:0,s:{first:{mX:0,mY:0},second:{mX:0,mY:0}}, clicked:false};
    this.mMainStrokeSessions = new Array();
    this.mNonStrokeSessions = new StrokeSession();
    this.mAnnotationStrokeSessions = new Array();

    this.moPageTemplate = undefined;

    this.moStrokes = undefined;

    this.moPencast = undefined;
    this.miCurrentStrokeSession = 0;

    this.PageInstanceLoaded = function(aoPencast) {
        this.moPencast = aoPencast;
        Debug("Loading strokes Id=" + this.mStrokeId + " for PageInstance Id=" + this.mPageId, "DOCLOAD");
        this.moStrokes = new RESTDictionaryLoader( this.msStrokesPattern, 'xml', StrokeCollection, this, new StrokeCollection(undefined, undefined, 0, undefined));
        this.moStrokes.Then( this.mStrokeId, new Callback(this.ReceiveStrokes, this, tPencast));
        this.moPencast.moPageTemplates.Then( this.miPageTemplate, new Callback(this.ReceiveTemplate, this, aoPencast));
    };

    this.ReceiveTemplate = function( aoTemplate, aoPencast) {
        if( this.moPageTemplate == undefined ) {
            this.moPageTemplate = aoTemplate;
	        Debug("Got template for instance=" + this.mPageId);

            var tTemplate = this.moPageTemplate;
            //console.log("Translating any strokes now that we got template strokes for template dx=" + -tTemplate.mX + " dy=" + -tTemplate.mY );

            for( var i = 0; i < this.mMainStrokeSessions.length ; i++ ) {
                this.mMainStrokeSessions[i].Translate( -tTemplate.mX, -tTemplate.mY );
            }
            for( var i = 0; i < this.mAnnotationStrokeSessions.length ; i++ ) {
                this.mAnnotationStrokeSessions[i].Translate(  -tTemplate.mX, -tTemplate.mY  );
            }
            this.mNonStrokeSessions.Translate( -tTemplate.mX, -tTemplate.mY  );

            this.moPencast.PageInstanceDataLoaded(this);
        }

    }

    this.ReceiveStrokes = function( aoStrokes, aoPencast ) {
        if( this.moPageTemplate != undefined ) {
            aoStrokes.Translate( -this.moPageTemplate.mX, -this.moPageTemplate.mY);
        }

        //.log("RecStrokes " + aoStrokes );
        for( var i = 0; i < this.mMainStrokeSessions.length ; i++ ) {
            this.mMainStrokeSessions[i].ReceiveStrokes( aoStrokes );
        }

        //console.log("RecStrokes " + aoStrokes);

        for( var i = 0; i < this.mAnnotationStrokeSessions.length ; i++ ) {
            this.mAnnotationStrokeSessions[i].ReceiveStrokes( aoStrokes );
        }
        //console.log("RecStrokes " + aoStrokes);
        this.mNonStrokeSessions.ReceiveStrokes( aoStrokes );
        //console.log("RecStrokes " + aoStrokes);

        this.moPencast.PageInstanceDataLoaded(this);
    };
    /*
    // Inserts a StrokeSession into an array in time order
    // Note that this function is called from a callback
    this.InsertStrokeSessionIntoList = function( aoObject, abIsAnnotation ) {

        var tInsertionArray = abIsAnnotation ? this.mAnnotationStrokeSessions : this.mMainStrokeSessions;

        for (var i = 0; i < tInsertionArray.length; i++) {
            if (aoObject.mSessionStart < tInsertionArray[i].mSessionStart) {
                tInsertionArray.splice(i, 0, aoObject);
                break;
            }
        }

        if (i == tInsertionArray.length) {
            tInsertionArray.push(aoObject);
        }
    };
    */
    // Populates page instance StrokeSession data from a Session
    this.ReceiveStrokeSession = function ( aoPageInstance, aoStrokeSession, abIsAnnotation  ) {
        //console.log("=== Receiving " + aoStrokeSession + " to page " + this.mPageId + " isAnnot=" + abIsAnnotation );

        var tInsertionArray = abIsAnnotation ? this.mAnnotationStrokeSessions : this.mMainStrokeSessions;
		var i = 0;
        for ( i = 0; i < tInsertionArray.length; i++) {
            if (aoStrokeSession.mSessionStart <= tInsertionArray[i].mSessionStart) {
                tInsertionArray.splice(i, 0, aoStrokeSession);
	            break;
            }
        }

        if (i == tInsertionArray.length) {
	        tInsertionArray.push(aoStrokeSession);
        }

	    //console.log(tInsertionArray);

        // Now check if there are any strokes that intersect the newly inserted stroke session
        if( aoStrokeSession.ReceiveStrokes( this.mNonStrokeSessions.mStrokes ) ) {
            this.moPencast.PageInstanceDataLoaded(this);
        }

    };

	this.GetScaleForCanvas = function( aoCanvas ) {
		return aoCanvas.mZoomedWidth / this.moPageTemplate.mWidth;
	}

	this.GetScaledAndSavedContext = function( oCanvas ) {
		var toRet = oCanvas.getContext("2d");
		var tfScale = this.GetScaleForCanvas(oCanvas);
		toRet.save();
		toRet.setTransform(tfScale, 0, 0, tfScale, -oCanvas.mOffsetX,  -oCanvas.mOffsetY);
		return toRet;
	}

	this.DrawBackground = function( aoCanvas, abRunning, abPreview  ) {

        if( this.moPageTemplate == undefined ) {
            return;
        }

		var tBackgroundContext = this.GetScaledAndSavedContext( aoCanvas );
        tBackgroundContext.fillStyle="#FFFFFF";
        tBackgroundContext.fillRect(0, 0, this.moPageTemplate.mWidth, this.moPageTemplate.mHeight);

        tBackgroundContext.lineWidth = this.mLineWidth;

        this.moPageTemplate.DrawImages(tBackgroundContext, aoCanvas.width, aoCanvas.height);

        this.DrawNonSessionStrokes(tBackgroundContext, aoPencast.mNormalStrokeColor);

		if( abRunning && abPreview ) {
            this.DrawSessionStrokes(tBackgroundContext, aoPencast.mPreviewStrokeColor);
        }

        tBackgroundContext.restore();
    };

    this.DrawForeground = function( aoCanvas, aiTime, iSessionId ) {
        if( this.moPageTemplate == undefined ) {
            return;
        }
	    var tMainContext = this.GetScaledAndSavedContext( aoCanvas );
	    tMainContext.clearRect(0, 0, this.moPageTemplate.mWidth, this.moPageTemplate.mHeight);
	    tMainContext.fillStyle = this.mSessionStrokeColor;
	    tMainContext.strokeStyle = this.mSessionStrokeColor;
        tMainContext.lineWidth = this.mLineWidth;

        // Are we stopped?

	    for (var i = 0; i < this.mMainStrokeSessions.length; i++) {
            this.mMainStrokeSessions[i].UpdateSession(tMainContext, aiTime, iSessionId, aoPencast.mSessionStrokeColor);
        }

        for (var i = 0; i < this.mAnnotationStrokeSessions.length; i++) {
            this.mAnnotationStrokeSessions[i].UpdateSession(tMainContext, aiTime, iSessionId, aoPencast.mAnnotationStrokeColor  );
        }

        tMainContext.restore();
    };

    this.DrawNonSessionStrokes = function(aBackgroundContext, aColor) {
        aBackgroundContext.fillStyle = aColor;
	    aBackgroundContext.strokeStyle = aColor;
	    this.mNonStrokeSessions.DrawStrokes(aBackgroundContext,aColor);
    };

    this.DrawSessionStrokes = function(aBackgroundContext, aColor) {
        aBackgroundContext.fillStyle = aColor;
	    aBackgroundContext.strokeStyle = aColor;
	    for (var i = 0; i < this.mMainStrokeSessions.length; i++) {
	        //aBackgroundContext.strokeStyle = DrawGetColorByLevel(i);
            this.mMainStrokeSessions[i].DrawStrokes(aBackgroundContext);
        }

        for (var i = 0; i < this.mAnnotationStrokeSessions.length; i++) {
	        //aBackgroundContext.strokeStyle = DrawGetColorByLevel(i);
	        this.mAnnotationStrokeSessions[i].DrawStrokes(aBackgroundContext);
        }
    };

    this.ResetSession = function(aMainContext) {
    	Debug("ResetSession");

    	this.miCurrentStrokeSession = 0;

    	aMainContext.clearRect(0, 0, aMainContext.canvas.width, aMainContext.canvas.height);
		//tMainContext.canvas.width = tMainContext.canvas.width;

    	for (var i = 0; i < this.mMainStrokeSessions.length; i++)
            this.mMainStrokeSessions[i].Reset();

        for (var i = 0; i < this.mAnnotationStrokeSessions.length; i++)
            this.mAnnotationStrokeSessions[i].Reset();
    };

    this.FindFirstSessionToPlay = function() {
        for (var i = 0; i < this.mMainStrokeSessions.length; i++)
            this.mMainStrokeSessions[i].Reset();

        for (var i = 0; i < this.mAnnotationStrokeSessions.length; i++)
            this.mAnnotationStrokeSessions[i].Reset();
    };

    this.HasStrokes = function() {
        if (isNaN(this.mStrokeId) )
            return false;

        return true;
    };

	this.DrawGraphicalDebug = function( oCanvas ) {

		var tTemplate = this.moPageTemplate;
		if( tTemplate == undefined ) {
			return;
		}

		var tWidth = tTemplate.mWidth;
		var tHeight = tTemplate.mHeight;

		var tStride = MM2AU(25.4);
		var tiNDiv = 8 ;
		var tSD = tStride/ tiNDiv;
		var tL = tStride / 10;

		if( DebugIsMaskOn("GRIDOVERLAY") ) {
			var tCtx = this.GetScaledAndSavedContext( oCanvas );

			// Draw some lines surrounding canvas
			tCtx.strokeStyle = '#AAAAAA';
			tCtx.lineWidth = "1px";
			for( var tY = 0 ; tY < tHeight ; tY+=tStride ) {
				DrawHorLine( tCtx, 0, tY, tWidth);
				for( var tDY = 1 ; tDY < tiNDiv; tDY++ ) {
					var l = tL * ( (tDY == tiNDiv/2) ? 2  : 1 );
					DrawHorLine( tCtx, 0, tY  + tDY * tSD, l );
					DrawHorLine( tCtx, tWidth - l, tY + tDY * tSD , tWidth);
				}
			}

			for( var tX = 0 ; tX < tWidth ; tX+=tStride ) {
				DrawVertLine( tCtx, tX, 0, tHeight);
				for( var tDX = 1 ; tDX < tiNDiv; tDX++ ) {
					var l = tL * ((tDX == tiNDiv/2) ? 2  : 1);
					DrawVertLine( tCtx, tX + tDX * tSD, 0, l);
					DrawVertLine( tCtx, tX + tDX * tSD, tHeight  - l , tHeight);
				}
			}

			tCtx.fillStyle = "gray";
			DrawText( tCtx, "1 In", tL + 10 , tStride - 10,"Arial", 80, false );
			tCtx.restore();
		}

		if( DebugIsMaskOn("CLICKOVERLAY") ) {

			if( typeof this.mLastClick === 'undefined' || !this.mLastClick.clicked ){

			}else{
				var tCtx = this.GetScaledAndSavedContext( oCanvas );

				DrawCircle( tCtx,  this.mLastClick.x,  this.mLastClick.y, this.mLastClick.r );
				if( this.mLastClick.fStroke != undefined ){
					DrawCircle( tCtx,  this.mLastClick.fStroke.mX,  this.mLastClick.fStroke.mY,  this.mLastClick.r );
					DrawCircle( tCtx,  this.mLastClick.sStroke.mX,  this.mLastClick.sStroke.mY,  this.mLastClick.r );
				}
				tCtx.restore();
			}

		}


		if( DebugIsMaskOn("TEMPLATEOVERLAY") ) {
			var tCtx = this.GetScaledAndSavedContext( oCanvas );


			var tiFontSize = 12 / this.GetScaleForCanvas(oCanvas);
			var tiOffset = 40;

			tCtx.fillStyle = "maroon";
			DrawText( tCtx, this.toString(), tStride + tiOffset, tL*2 + tiOffset ,"Courier", tiFontSize, true );
			var y = tHeight - (tHeight % tStride ) - 2*tStride - tiOffset;

			DrawText( tCtx, this.moPageTemplate.toString(), tStride + tiOffset, y, "Courier", tiFontSize, false );

			/*
			 var tTestString = "1111\n2222\n3333";
			 DrawText( tCtx, tTestString, 10, 10,"Arial", 16, true );
			 DrawText( tCtx, tTestString, 10, tHeight-10,"Arial", 16, false );
			 */
			tCtx.restore();
		}
	};

	this.IntersectWithClick = function( oCanvas, iPixelX, iPixelY, iCirclePixelRadius ) {
		var tScale = this.GetScaleForCanvas(oCanvas);
		var tX = iPixelX / tScale;
		var tY = iPixelY / tScale;
		var tRadius = iCirclePixelRadius / tScale;

		this.mLastClick = new Object();
		this.mLastClick.x = tX;
		this.mLastClick.y = tY;
		this.mLastClick.r = tRadius;
		this.mLastClick.clicked = true;
		var tTime = -1;

		for( var i = 0; i < this.mMainStrokeSessions.length && tTime == -1; i++ ) {
			var returnTime = this.mMainStrokeSessions[i].IntersectWithCircle( tX, tY, tRadius );
			if( returnTime != -1){
				tTime = returnTime;
				tTime.sessionId = this.mMainStrokeSessions[i].mSession.mId;
			}
		}

		//dont check annotations if session stroke was found
		if( tTime == -1){
			for( var i = 0; i < this.mAnnotationStrokeSessions.length && tTime == -1; i++ ) {
				var returnTime = this.mAnnotationStrokeSessions[i].IntersectWithCircle( tX, tY, tRadius );
				if( returnTime != -1){
					tTime = returnTime;
					tTime.sessionId = this.mAnnotationStrokeSessions[i].mSession.mId;
				}
			}
		}

		if( tTime != -1 ) {
			this.mLastClick = tTime;
			this.mLastClick.x = tX;
			this.mLastClick.y = tY;
			this.mLastClick.r = tRadius;
			return tTime;
		}

		// FIXME: Remove later. Not required for normal interaction
		return -1;
		//return this.mNonStrokeSessions.IntersectWithCircle( tX, tY, tRadius );
	}


	//Mitchell: Todo, make this method not terrible, but instead good
	this.FindBestStartSessionFromPage = function() {

		return (this.mSessions[0] != undefined ) ? this.mSessions[0].id : 0;
		/*
        var tBestSession = undefined;
        for( var i = 0 ; i < this.mSessions.length ; i++ ) {
            var tVal = this.mSessions[i].FindFirstStrokeSessionOnPage( this.mPageId );

            if( tVal != undefined ) {
                // If old session was undefined or new session is not annotation and old was then overwrite.
                if( tBestSession == undefined || (!tBestSession.mAnnot && tVal.mAnnot ) ) {
                    tBestSession = this.mSessions[i];
                // If both have same annotation status compare timestamps
                } else if ( tBestSession.mAnnot == tVal.mAnnot && tVal.mSessionStart < tBestSession.mSessionStart) {
                    tBestSession = this.mSessions[i];
                }
            }
        }
        return tBestSession;
		*/
    };



	this.toString = function() {
        var tsRet = "PageInstance: Id: " +  + this.mPageId + " Template Id: " + this.miPageTemplate + " Label: '" + this.mPageLabel + "'\n";
		tsRet += " Page has " + this.mNonStrokeSessions.GetNumberOfStrokes() + " non session strokes\n";
		tsRet += ArrayToString( this.mMainStrokeSessions, "Main Stroke Sessions", " ");
		tsRet += ArrayToString( this.mAnnotationStrokeSessions, "Annotation Stroke Sessions", " ");
		return tsRet;
    };
}
