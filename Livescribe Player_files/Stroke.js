/***************************************************************
 * @license Copyright © 2007-2013 Livescribe, Inc. All rights reserved.
 **************************************************************/


var Stroke = function(aXML) {

	this.mCoords = new Array();

	if( aXML != undefined ) {
	    this.mStartTime = parseFloat(aXML.attributes.getNamedItem("timestamp").nodeValue);

	    var tCoordElements = aXML.getElementsByTagName("coord");
		var oldx = -1;
		var oldy = -1;
		var k = 0;
		for (var i = 0; i < tCoordElements.length; i++) {
		    var x = ParseToAU(tCoordElements[i].attributes.getNamedItem("x").nodeValue);
		    var y = ParseToAU(tCoordElements[i].attributes.getNamedItem("y").nodeValue);
			// Filter out duplicates
			if( x != oldx || y != oldy ) {
			    var time = this.mStartTime + parseFloat(tCoordElements[i].attributes.getNamedItem("d").nodeValue);
			    this.mCoords[k++] = new Point(x,y,time);
				oldx = x;
				oldy = y;
			}
	    }

		// Low pass filter
		var ncoords = this.mCoords.length;
		var strokePoints = new Array(ncoords);
		strokePoints[0] = this.mCoords[0];
		strokePoints[ncoords - 1] = this.mCoords[ncoords - 1];
		for (var i = 1; i < ncoords - 1; i++) {
			strokePoints[i] = new Point((this.mCoords[i - 1].mX + 2 * this.mCoords[i].mX + this.mCoords[i + 1].mX) / 4, (this.mCoords[i - 1].mY + 2 * this.mCoords[i].mY + this.mCoords[i + 1].mY) / 4, this.mCoords[i].mTime);
		}

		this.mCoords = strokePoints;

	    this.mEndTime = this.mCoords[k-1].mTime;

		this.mStrokeRenderer = new StrokeRenderer( strokePoints );
	}
}

Stroke.prototype.Translate = function( aiOffsetX, aiOffsetY ){
        for (var i = 0; i < this.mCoords.length; i++) {
            this.mCoords[i].mX = parseFloat(this.mCoords[i].mX) + aiOffsetX;
            this.mCoords[i].mY = parseFloat(this.mCoords[i].mY) + aiOffsetY;
        }
    }

Stroke.prototype.IsStrokeWithinTimeSpan = function( aStartTime, aEndTime ) {
        if ( this.mStartTime > aEndTime || this.mEndTime < aStartTime ) {
            return false;
        }

        return true;
    };


	// Stroke rendering routines (SL)
Stroke.prototype.DrawStroke = function (aContext, i ) {
		this.mStrokeRenderer.DrawStroke( aContext, i );
	}


Stroke.prototype.DrawSimpleStroke = function(aContext) {
        aContext.beginPath();

        if (this.mCoords.length > 0)
            aContext.moveTo(this.mCoords[0].mX, this.mCoords[0].mY);

        for (var i = 1; i < this.mCoords.length; i++)
            aContext.lineTo(this.mCoords[i].mX, this.mCoords[i].mY);

        aContext.stroke();
    };

    // New test function
Stroke.prototype.AnimSimpleStroke = function(aTime, aContext, abOverlay) {
		
		if( abOverlay ) {
			DrawLine(aContext, this.mCoords[0].mX, this.mCoords[0].mY, 0, 0);
			DrawLine(aContext, this.mCoords[ this.mCoords.length-1 ].mX, this.mCoords[ this.mCoords.length-1].mY, 0, aContext.canvas.height);
		}
		
        aContext.beginPath();
	
        for (var i = 0; i < this.mCoords.length; i++) {
            if (this.mCoords[i].mTime > aTime) {
                break;
            }

            if( i == 0 )
                aContext.moveTo(this.mCoords[i].mX, this.mCoords[i].mY );
            else
                aContext.lineTo(this.mCoords[i].mX, this.mCoords[i].mY);
        }
		
        aContext.stroke();
    };


Stroke.prototype.AnimStroke = function(aTime, aContext, abOverlay) {

		if( abOverlay ) {
			DrawLine(aContext, this.mCoords[0].mX, this.mCoords[0].mY, 0, 0);
			DrawLine(aContext, this.mCoords[ this.mCoords.length-1 ].mX, this.mCoords[ this.mCoords.length-1].mY, 0, aContext.canvas.height);
		}

		var i;
		for (i = 0; i < this.mCoords.length; i++) {
			if (this.mCoords[i].mTime > aTime)
				break;
		}

		this.DrawStroke(aContext, i );

	};

Stroke.prototype.AnimateOldFunction = function(aStartTime, aEndTime, aContext) {
        aContext.beginPath();

        var tFirstDraw = true;
        for (var i = 0; i < this.mCoords.length; i++) {
            if (this.mCoords[i].mTime < aStartTime)
                continue;
            if (this.mCoords[i].mTime > aEndTime)
                break;

            if (tFirstDraw) {
                if (i > 0) {
                    aContext.moveTo(this.mCoords[i - 1].mX, this.mCoords[i - 1].mY );
                    aContext.lineTo(this.mCoords[i].mX, this.mCoords[i].mY );
                }
                else
                    aContext.moveTo(this.mCoords[i].mX, this.mCoords[i].mY);

                tFirstDraw = false;
            }
            else
                aContext.lineTo(this.mCoords[i].mX, this.mCoords[i].mY);
        }

        aContext.stroke();
    };

Stroke.prototype.IntersectWithCircle = function( iX, iY, iRadius ) {

		for( var i = 0 ; i < this.mCoords.length-1 ; i++ ) {

			// Calculate circle vs line intersection point analytically
			var tLDX = this.mCoords[i+1].mX - this.mCoords[i].mX;
			var tLDY = this.mCoords[i+1].mY - this.mCoords[i].mY;
			var tSDX = this.mCoords[i].mX - iX;
			var tSDY = this.mCoords[i].mY - iY;
			var a = tLDX * tLDX + tLDY * tLDY;
			var b = 2 * ( tSDX * tLDX + tSDY * tLDY );
			var c = tSDX * tSDX + tSDY * tSDY - iRadius * iRadius;
			var d = b * b - 4 * a * c;

			// If the discriminant (var d) is negative the ray does not intersect the circle at any point -INF to +INF
			//
			// Left to NOT include zero since that actually automatically rejects coordinate pairs that are
			// zero not to cause ghost intersections.
			// If mX,mY is identical for i and i+1 it will cause a and b to be zero. this causes D to be zero and that
			// would have caused an intersection since t would be equal to zero below. SL 2012-08-21

			if( d > 0 ) {
				// Intersection points are: i1 = (-b - SQRT(d)) / 2a && i2 = (-b + SQRT(d)) / 2a
				// Since we want the midpoint we average (-2b - SQRT(d) + SQRT(d)) / 2a / 2 removing square root

				var t = -b / 2 / a;

				var tMin = 0;
				var tMax = 1;

				// First and last coordinate will trigger outside 0-1 range since the circle can extend into stroke

				if( i == 0 ) {
					tMin -= iRadius / Math.sqrt(a) ;
					//console.log("NewMinT=" + tMin);
				}

				if( i == this.mCoords.length-2 ) {
					tMax += iRadius / Math.sqrt(a) ;
					//console.log("NewMaxT=" + tMax);
				}

				if( t >= tMin && t <= tMax ) {
					// Linear interpolation gives the intersection time
					var tTime = t*this.mCoords[i+1].mTime + (1-t) *this.mCoords[i].mTime;

					this.moLastClick = {fStroke:this.mCoords[i], sStroke: this.mCoords[i+1]}
					var moStrokeTime = {time:tTime, fStroke:this.mCoords[i], sStroke: this.mCoords[i+1], clicked:true};
					return moStrokeTime;
				}
			}
		}

		return -1;
	}

Stroke.prototype.toString = function( aShowCoordinates ) {
        var rsRet = "Stroke: " + TimeSpan2String( this.mStartTime, this.mEndTime ) + " Coords["+  this.mCoords.length +"] ";
        if( aShowCoordinates != undefined && aShowCoordinates == true) {
            rsRet += "{"
            for( var i = 0 ; i < this.mCoords.length ; i++ ) {
                 rsRet += " (" + this.mCoords[i].mX +  ", " + this.mCoords[i].mY + ")";
            }
            rsRet += " ]";
        }

        return rsRet;
    };
