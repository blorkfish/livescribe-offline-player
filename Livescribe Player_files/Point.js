/***************************************************************
 * @license Copyright © 2007-2013 Livescribe, Inc. All rights reserved.
 **************************************************************/

var Point = function( x, y, time ) {
	this.X = x;
	this.Y = y;
	if( time != undefined ) {
		this.mTime = time;
	}
}

Point.prototype.Normalize = function() {
		var length = Math.sqrt(this.X * this.X + this.Y * this.Y);
		if (length < 0.01)
		{
			length = 0.01;
		}
		this.X /= length;
		this.Y /= length;
		return length;
	}
	/*
	this.Length = function() {
		var length = Math.sqrt(this.mX * this.mX + this.mY * this.mY);
		return length;
	}
    */
Point.prototype.Sum = function ( oOther ) {
		this.X +=oOther.X;
		this.Y +=oOther.Y;
	}

Point.prototype.Dot = function ( oOther ) {
		return this.X * oOther.X + this.Y * oOther.Y ;
	}
