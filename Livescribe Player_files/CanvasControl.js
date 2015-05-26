// ***********************************************************************************************************
// Name: Canvas UI Control
// Type:User Control
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.UI = LiveScribe.UI || {};

//dependencies
//Framework.EventHandling.js


LiveScribe.UI.CanvasControlMoveCoordinate = function () {
    this.PositionX = null;
    this.PositionY = null;
};



LiveScribe.UI.CanvasControl = function (canvasElement, backgroundCanvasElement, canvasContainerElement) {
    this.ForegroundCanvasElement = canvasElement;
    this.ForegroundCanvasContext = this.ForegroundCanvasElement.getContext("2d");
    this.BackgroundCanvasElement = backgroundCanvasElement;
    this.BackgroundCanvasContext = this.BackgroundCanvasElement.getContext("2d");
    this.CanvasContainerElement = canvasContainerElement;

    this.AspectRatio = 1;
    this.ZoomFactor = 1;
    this.Thickness = 6;
    this.mCoords = null;
    this.TVector = null;
    this.TVector2 = null;
    this.moLineSegments = null;
    this.moCircles = null;
    this.mLastNumberCoordinates = -1;
    this.Adjust = true;

    this.IsEnabled = false;
    this.PositionX = null;
    this.PositiomY = null;

    this.LastMousePositionX = null;
    this.LastMousePositionY = null;

    this.SupportsMSPointerEvents = !!(window.navigator.msPointerEnabled);
    this.SupportsTouchEvents = ('ontouchstart' in this.ForegroundCanvasElement);
    this.SupportsMouseEvents = ('onmousedown' in this.ForegroundCanvasElement);

    this.OnCanvasClick = null;
    this.OnCanvasMouseDown = null;
    this.OnCanvasMouseUp = null;
    this.OnCanvasMouseOver = null;
    this.OnCanvasMouseOut = null;
    this.OnCanvasMouseMove = null;
    this.OnCanvasEnable = null;
    this.OnCanvasDisable = null;

    this.CanvasClickDelegate = LiveScribe.Events.CreateDelegate(this, this.ClickHandler);
    this.CanvasMouseDownDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseDownHandler);
    this.CanvasMouseOverDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseOverHandler);
    this.CanvasMouseUpDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseUpHandler);
    this.CanvasMouseOutDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseOutHandler);
    this.CanvasMouseMoveDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseMoveHandler);
    //this.CanvasMouseWheelDelegate = LiveScribe.Events.CreateDelegate(this, this.MouseWheelHandler);

    this.BackgroundCanvasContext.webkitImageSmoothingEnabled = false;
    this.BackgroundCanvasContext.mozImageSmoothingEnabled = false;
    this.BackgroundCanvasContext.imageSmoothingEnabled = false; /// future
};

LiveScribe.UI.CanvasControl.prototype.InitDrawing = function (pageWidth, pageHeight) {


    this.BackgroundCanvasContext.fillStyle = "#FFFFFF";
    this.BackgroundCanvasContext.fillRect(0, 0, pageWidth, pageHeight);
    this.BackgroundCanvasContext.save();

    var scaleFactor = this.BackgroundCanvasElement.clientWidth / pageWidth;
    this.BackgroundCanvasContext.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
    this.ForegroundCanvasContext.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);

};

LiveScribe.UI.CanvasControl.prototype.DrawImage = function () {
    this.BackgroundCanvasContext.drawImage.apply(this.BackgroundCanvasContext, arguments);
};

LiveScribe.UI.CanvasControl.prototype.DrawBackgroundStrokes = function (strokes, offsetX, offsetY, color) {
    for (var index = 0; index < strokes.length; index++) {
        this.DrawBackgroundStroke(strokes[index], offsetX, offsetY, color);
    }
};

LiveScribe.UI.CanvasControl.prototype.DrawBackgroundStroke = function (stroke, offsetX, offsetY, color) {
    this.DrawStroke(this.BackgroundCanvasContext, stroke, stroke.Points.length, offsetX, offsetY, color);
};

LiveScribe.UI.CanvasControl.prototype.DrawForegroundStroke = function (stroke, pointCount, offsetX, offsetY, color) {
    this.DrawStroke(this.ForegroundCanvasContext, stroke, pointCount, offsetX, offsetY, color);
};

LiveScribe.UI.CanvasControl.prototype.DrawStroke = function (canvasContext, stroke, pointCount, offsetX, offsetY, color) {
    canvasContext.fillStyle = color;
    canvasContext.strokeStyle = color;
    canvasContext.lineWidth = 6;

    this.mLastNumberCoordinates = -1;

    this.mCoords = this.AdjustStrokePoints(stroke, pointCount, offsetX, offsetY);
    /*console.log("mCoords=%O", this.mCoords);*/
    this.RunThroughLowPassFilter();
    this.GenerateVector();
    this.GenerateStroke();

    canvasContext.beginPath();

    for (var i = 0 ; i < this.moLineSegments.length ; i++) {
        canvasContext.lineCap = 'round';
        canvasContext.lineTo(this.moLineSegments[i].X, this.moLineSegments[i].Y);
        /*console.log('canvasContext.lineTo(%f, %f)', this.moLineSegments[i].X, this.moLineSegments[i].Y);*/
    }

    canvasContext.closePath();

    for (var i = 0 ; i < this.moCircles.length ; i++) {
        canvasContext.arc(this.moCircles[i].X, this.moCircles[i].Y, this.moCircles[i].mTime, 0, 2 * Math.PI, false);
        canvasContext.closePath();
    }

    canvasContext.fill();
};

LiveScribe.UI.CanvasControl.prototype.AdjustStrokePoints = function (stroke, pointCount, offsetX, offsetY) {
    var adjustedPoints = [];

    if (stroke.Points.length > 0) {
        var point = new Point((stroke.PositionOffset.X + stroke.Points[0].X - offsetX), (stroke.PositionOffset.Y + stroke.Points[0].Y - offsetY), stroke.Points[0].Time);
        adjustedPoints.push(point);

        for (var index = 1; index < pointCount; index++) {
            if (this.Adjust) {
                var point = new Point((adjustedPoints[index - 1].X + stroke.Points[index].X), (adjustedPoints[index - 1].Y + stroke.Points[index].Y), stroke.Points[index].Time);
                adjustedPoints.push(point);
            }
            else {
                var point = new Point((stroke.Points[index].X - offsetX), (stroke.Points[index].Y - offsetY), stroke.Points[index].Time);
                if (point.X != adjustedPoints[adjustedPoints.length - 1].X || point.Y != adjustedPoints[adjustedPoints.length - 1].Y) {
                    adjustedPoints.push(point);
                }
            }
        }
    }

    //console.log('stroke.Points=%O adjustedPoints=%O', stroke.Points, adjustedPoints);
    return adjustedPoints;
};


LiveScribe.UI.CanvasControl.prototype.RunThroughLowPassFilter = function () {
    var ncoords = this.mCoords.length;
    var strokePoints = new Array(ncoords);

    strokePoints[0] = this.mCoords[0];
    strokePoints[ncoords - 1] = this.mCoords[ncoords - 1];

    for (var i = 1; i < ncoords - 1; i++) {
        strokePoints[i] = new Point((this.mCoords[i - 1].X + 2 * this.mCoords[i].X + this.mCoords[i + 1].X) / 4, (this.mCoords[i - 1].Y + 2 * this.mCoords[i].Y + this.mCoords[i + 1].Y) / 4, this.mCoords[i].Time);
    }

    this.mCoords = strokePoints;
};

LiveScribe.UI.CanvasControl.prototype.GenerateVector = function () {
    var ncoords = this.mCoords.length;

    this.TVector = new Array(ncoords);
    this.TVector2 = new Array(ncoords);

    // calc base thickness vector
    for (var i = 0; i < ncoords - 1; i++) {
        this.TVector2[i] = this.CalculateThickness(this.mCoords[i + 1], this.mCoords[i]) * this.Thickness;
    }

    // make tail thinner
    this.TVector2[i] = this.TVector2[i - 1] * 0.3;
    this.TVector2[i - 1] = this.TVector2[i - 1] * 0.55;
    this.TVector2[i - 2] = this.TVector2[i - 2] * 0.8;

    // low pass filter thickness vector
    for (var i = 1; i < ncoords - 1; i++) {
        this.TVector[i] = (this.TVector2[i - 1] + this.TVector2[i] + this.TVector2[i + 1]) / 3;
    }

    // low pass filter first / last coords thickness
    this.TVector[0] = (this.TVector2[0] + this.TVector2[1]) / 2;
    this.TVector[ncoords - 1] = (this.TVector2[ncoords - 1] + this.TVector2[ncoords - 2]) / 2;

    this.mTVector = this.TVector;
};

LiveScribe.UI.CanvasControl.prototype.GenerateStroke = function () {
    var ncoords = this.mCoords.length;

    // is the correct stroke already precalculated
    if (ncoords == this.mLastNumberCoordinates) {
        return;
    }

    this.mLastNumberCoordinates = ncoords;

    this.moLineSegments = [];
    this.moCircles = [];

    //if (ncoords > 2)
    //    ncoords = 2;

    switch (ncoords) {
        case 0:
            break;
        case 1:
            if (this.mCoords[0] != null && this.mCoords[0] != undefined) {
                this.moCircles.push(new Point(this.mCoords[0].X, this.mCoords[0].Y, this.Thickness));
            }
            break;
        case 2:
            var thickness1 = this.CalculateThickness(this.mCoords[1], this.mCoords[0]) * this.Thickness;
            var thickness2 = thickness1 * 0.6;
            var oDelta = new Point(this.mCoords[1].X - this.mCoords[0].X, this.mCoords[1].Y - this.mCoords[0].Y);
            oDelta.Normalize();
            this.moLineSegments.push(new Point(this.mCoords[0].X + oDelta.Y * thickness1, this.mCoords[0].Y - oDelta.X * thickness1));
            this.moLineSegments.push(new Point(this.mCoords[1].X + oDelta.Y * thickness2, this.mCoords[1].Y - oDelta.X * thickness2));
            this.moLineSegments.push(new Point(this.mCoords[1].X - oDelta.Y * thickness2, this.mCoords[1].Y + oDelta.X * thickness2));
            this.moLineSegments.push(new Point(this.mCoords[0].X - oDelta.Y * thickness1, this.mCoords[0].Y + oDelta.X * thickness1));
            this.moCircles.push(new Point(this.mCoords[0].X, this.mCoords[0].Y, thickness1));
            this.moCircles.push(new Point(this.mCoords[1].X, this.mCoords[1].Y, thickness2));
            break;
        default:
            // Calculate left side of stroke
            for (var i = 0; i < ncoords; i++) {
                this.CalculateSegment(this.mCoords, i, ncoords, 1.0, this.mTVector[i]);
            }

            for (var i = ncoords - 1; i >= 0; i--) {
                this.CalculateSegment(this.mCoords, i, ncoords, -1.0, this.mTVector[i]);
            }

            this.moCircles.push(new Point(this.mCoords[0].X, this.mCoords[0].Y, this.TVector[0]));
            this.moCircles.push(new Point(this.mCoords[ncoords - 1].X, this.mCoords[ncoords - 1].Y, this.TVector[ncoords - 1]));
            break;
    }
};

LiveScribe.UI.CanvasControl.prototype.CalculateSegment = function (p, i, ncoords, dir, thickness, circlepath) {
    var d1 = new Point(0, 0);
    var d2 = new Point(0, 0);
    if (i > 0) {
        d1 = new Point(p[i].X - p[i - 1].X, p[i].Y - p[i - 1].Y);
    }

    if (i < ncoords - 1) {
        d2 = new Point(p[i + 1].X - p[i].X, p[i + 1].Y - p[i].Y);
    }

    if (dir < 0) {
        var temp;
        temp = d1;
        d1 = d2;
        d2 = temp;
    }

    // Case less than 90 degrees turn
    if (d1.Dot(d2) >= 0) {
        d1.Sum(d2);
        if (d1.Normalize() > 0.01) {
            this.moLineSegments.push(new Point(p[i].X + dir * d1.Y * thickness, p[i].Y - dir * d1.X * thickness));
        }
    }
    else {
        if (d1.X != 0 || d1.Y != 0) {
            d1.Normalize();
            this.moLineSegments.push(new Point(p[i].X + dir * d1.Y * thickness, p[i].Y - dir * d1.X * thickness));
        }

        if (d2.X != 0 || d2.Y != 0) {
            d2.Normalize();
            this.moLineSegments.push(new Point(p[i].X + dir * d2.Y * thickness, p[i].Y - dir * d2.X * thickness));
        }

        this.moCircles.push(new Point(p[i].X, p[i].Y, thickness));
    }
};

LiveScribe.UI.CanvasControl.prototype.CalculateThickness = function (oPointA, oPointB) {
    var dx = oPointB.X - oPointA.X;
    var dy = oPointB.Y - oPointA.Y;
    var length = Math.sqrt(dx * dx + dy * dy);
    var t = 1 - length / 250;

    if (t < 0.4)
        t = 0.4;

    return t;
};


LiveScribe.UI.CanvasControl.prototype.Resize = function () {
    var maxHeight = this.CanvasContainerElement.clientHeight - 21;
    var maxWidth = window.innerWidth;
    var screenAspectRatio = maxWidth / maxHeight;

    var canvasWidth = 0;
    var canvasHeight = 0;

    if (screenAspectRatio < this.AspectRatio) { /* If screen width is wider than PDF page, then we use the page width to calculate the height */
        canvasWidth = this.ZoomFactor * maxWidth;
        canvasHeight = this.ZoomFactor * maxWidth / this.AspectRatio;
    } else { /* Else if screen width is narrower than PDF page, then we use the page height to calculate the width */
        canvasWidth = this.ZoomFactor * maxHeight * this.AspectRatio;
        canvasHeight = this.ZoomFactor * maxHeight;
    }

    var ratioX = 1;
    var ratioY = 1;
    if (this.ForegroundCanvasElement.getAttribute('width') != null) {
        ratioX = parseFloat(this.ForegroundCanvasElement.getAttribute('width')) / canvasWidth;
        ratioY = parseFloat(this.ForegroundCanvasElement.getAttribute('height')) / canvasHeight;
    }

    this.ForegroundCanvasElement.setAttribute('width', canvasWidth);
    this.ForegroundCanvasElement.setAttribute('height', canvasHeight);
    this.ForegroundCanvasContext.scale(ratioX, ratioY);

    this.BackgroundCanvasElement.setAttribute('width', canvasWidth);
    this.BackgroundCanvasElement.setAttribute('height', canvasHeight);
    this.BackgroundCanvasContext.scale(ratioX, ratioY);


    this.ForegroundCanvasElement.style.left = ((maxWidth - canvasWidth) / 2) + 'px';
    this.BackgroundCanvasElement.style.left = ((maxWidth - canvasWidth) / 2) + 'px';

};

LiveScribe.UI.CanvasControl.prototype.ResetPosition = function () {
    this.ForegroundCanvasElement.offsetX = 0;
    this.ForegroundCanvasElement.offsetY = 0;
    this.BackgroundCanvasElement.offsetX = 0;
    this.BackgroundCanvasElement.offsetY = 0;
};

LiveScribe.UI.CanvasControl.prototype.ResetZoom = function () {
    this.ZoomFactor = 1.0;
    this.ResetPosition();
};

LiveScribe.UI.CanvasControl.prototype.Zoom = function (zoomFactor, ratioX, ratioY) {
    var minZoom = 1;
    var maxZoom = 5;
    ratioX = ratioX ? ratioX : 0.5;
    ratioY = ratioY ? ratioY : 0.5;

    var oldZoom = this.ZoomFactor;

    this.ZoomFactor *= zoomFactor;

    if (this.ZoomFactor >= maxZoom) {
        this.ZoomFactor = maxZoom;
    }

    if (this.ZoomFactor <= minZoom) {
        this.ZoomFactor = minZoom;
    }

    if (zoomFactor > 1) {
        this.ForegroundCanvasElement.left = this.ForegroundCanvasElement.clientX - (this.ForegroundCanvasElement.clientWidth * oldZoom / this.ZoomFactor - this.ForegroundCanvasElement.clientWidth) * ratioX;
        this.ForegroundCanvasElement.top = this.ForegroundCanvasElement.clientY - (this.ForegroundCanvasElement.clientHeight * oldZoom / this.ZoomFactor - this.ForegroundCanvasElement.clientHeight) * ratioY;
        this.BackgroundCanvasElement.left = this.BackgroundCanvasElement.clientX - (this.BackgroundCanvasElement.clientWidth * oldZoom / this.ZoomFactor - this.BackgroundCanvasElement.clientWidth) * ratioX;
        this.BackgroundCanvasElement.top = this.BackgroundCanvasElement.clientY - (this.BackgroundCanvasElement.clientHeight * oldZoom / this.ZoomFactor - this.BackgroundCanvasElement.clientHeight) * ratioY;
    } else {
        this.ForegroundCanvasElement.left = this.ForegroundCanvasElement.clientX - (this.ForegroundCanvasElement.clientWidth * oldZoom / this.ZoomFactor - this.ForegroundCanvasElement.clientWidth) * 0.3;
        this.ForegroundCanvasElement.top = this.ForegroundCanvasElement.clientY - (this.ForegroundCanvasElement.clientHeight * oldZoom / this.ZoomFactor - this.ForegroundCanvasElement.clientHeight) * 0.3;
        this.BackgroundCanvasElement.left = this.BackgroundCanvasElement.clientX - (this.BackgroundCanvasElement.clientWidth * oldZoom / this.ZoomFactor - this.BackgroundCanvasElement.clientWidth) * 0.3;
        this.BackgroundCanvasElement.top = this.BackgroundCanvasElement.clientY - (this.BackgroundCanvasElement.clientHeight * oldZoom / this.ZoomFactor - this.BackgroundCanvasElement.clientHeight) * 0.3;
    }

    this.Resize();
};


LiveScribe.UI.CanvasControl.prototype.Move = function (canvasCoordinate) {
    var yMin = -this.ForegroundCanvasElement.clientHeight + this.CanvasContainerElement.clientHeight;
    var yMax = 0;

    if (this.ForegroundCanvasElement.clientWidth > this.CanvasContainerElement.clientWidth) {
        var xMin = this.CanvasContainerElement.clientWidth - this.ForegroundCanvasElement.clientWidth;
        var xMax = 0;
    }
    else {
        var xMin = this.ForegroundCanvasElement.offsetLeft;
        var xMax = this.ForegroundCanvasElement.offsetLeft;
    }

    if (canvasCoordinate.PositionX <= xMin) { canvasCoordinate.PositionX = xMin; }
    if (canvasCoordinate.PositionX >= xMax) { canvasCoordinate.PositionX = xMax; }

    if (canvasCoordinate.PositionY <= yMin) { canvasCoordinate.PositionY = yMin; }
    if (canvasCoordinate.PositionY >= yMax) { canvasCoordinate.PositionY = yMax; }

    this.ForegroundCanvasElement.style.left = canvasCoordinate.PositionX + 'px';
    this.ForegroundCanvasElement.style.top = canvasCoordinate.PositionY + 'px';

    this.BackgroundCanvasElement.style.left = canvasCoordinate.PositionX + 'px';
    this.BackgroundCanvasElement.style.top = canvasCoordinate.PositionY + 'px';
}



LiveScribe.UI.CanvasControl.prototype.Enable = function () {
    this.BackgroundCanvasElement.style.display = 'block';

    LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'click', this.CanvasClickDelegate);

    if (this.SupportsMSPointerEvents) {
        LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'MSPointerDown', this.CanvasMouseDownDelegate);
        LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'MSPointerOver', this.CanvasMouseOverDelegate);
    }
    else if (this.SupportsMouseEvents) {
        LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'mousedown', this.CanvasMouseDownDelegate);
        LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'mouseover', this.CanvasMouseOverDelegate);
    }
    else if (this.SupportsTouchEvents) {
        LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'touchstart', this.CanvasMouseDownDelegate);
    }

    this.IsEnabled = true;

    if (this.OnCanvasEnable != null) {
        this.OnCanvasEnable(this);
    }
};

LiveScribe.UI.CanvasControl.prototype.Disable = function () {
    LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'click', this.CanvasClickDelegate);

    if (this.SupportsMSPointerEvents) {
        LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'MSPointerDown', this.CanvasMouseDownDelegate);
        LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'MSPointerOver', this.CanvasMouseOverDelegate);
    }
    else if (this.SupportsMouseEvents) {
        LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'mousedown', this.CanvasMouseDownDelegate);
        LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'mouseover', this.CanvasMouseOverDelegate);
    }
    else if (this.SupportsTouchEvents) {
        LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'touchstart', this.CanvasMouseDownDelegate);
    }

    this.IsEnabled = false;

    if (this.OnCanvasDisable != null) {
        this.OnCanvasDisable(this);
    }
};

LiveScribe.UI.CanvasControl.prototype.GetPosition = function (e) {
    var canvasCoordinate = new LiveScribe.UI.CanvasControlMoveCoordinate();

    if (this.SupportsMSPointerEvents) {
        canvasCoordinate.PositionX = e.clientX;
        canvasCoordinate.PositionY = e.clientY;
    }
    else if (this.SupportsTouchEvents) {
        if (e.touches) {
            canvasCoordinate.PositionX = e.touches[0].pageX;
            canvasCoordinate.PositionY = e.touches[0].pageY;
        }
        else {
            canvasCoordinate.PositionX = e.pageX;
            canvasCoordinate.PositionY = e.pageY;
        }
    }
    else {
        canvasCoordinate.PositionX = e.clientX;
        canvasCoordinate.PositionY = e.clientY;
    }

    canvasCoordinate.PositionX -= (this.ForegroundCanvasElement.offsetLeft + this.ForegroundCanvasElement.parentNode.offsetLeft);
    canvasCoordinate.PositionY -= (this.ForegroundCanvasElement.offsetTop + this.ForegroundCanvasElement.parentNode.offsetTop);

    return canvasCoordinate;
};


LiveScribe.UI.CanvasControl.prototype.ClickHandler = function (e) {
    e = e || window.event;

    if (e.stopPropagation) { e.stopPropagation(); }
    else { e.cancelBubble = true; }

    e.preventDefault();

    var canvasCoordinate = this.GetPosition(e);

    if (this.OnCanvasClick != null) {
        this.OnCanvasClick(canvasCoordinate);
    }
};

LiveScribe.UI.CanvasControl.prototype.MouseDownHandler = function (e) {
    e = e || window.event;

    if (e.stopPropagation) { e.stopPropagation(); }
    else { e.cancelBubble = true; }

    e.preventDefault();

    if (this.ZoomFactor > 1) {
        this.LastMousePositionX = e.clientX ? e.clientX : e.changedTouches[0].pageX;
        this.LastMousePositionY = e.clientY ? e.clientY : e.changedTouches[0].pageY;

        if (this.SupportsMSPointerEvents) {
            LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'MSPointerUp', this.CanvasMouseUpDelegate);
            LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'MSPointerOut', this.CanvasMouseOutDelegate);
            LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'MSPointerMove', this.CanvasMouseMoveDelegate);
        }
        else if (this.SupportsTouchEvents) {
            LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'touchmove', this.CanvasMouseMoveDelegate);
            LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'touchend', this.CanvasMouseUpDelegate);
        }
        else {
            LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'mouseup', this.CanvasMouseUpDelegate);
            LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'mouseout', this.CanvasMouseOutDelegate);
            LiveScribe.Events.AddHandler(this.ForegroundCanvasElement, 'mousemove', this.CanvasMouseMoveDelegate);
        }

        this.ForegroundCanvasElement.style.cursor = 'move';
    }

    if (this.OnCanvasMouseDown != null) {
        this.OnCanvasMouseDown(this);
    }
};

LiveScribe.UI.CanvasControl.prototype.MouseUpHandler = function (e) {
    e = e || window.event;

    if (e.stopPropagation) { e.stopPropagation(); }
    else { e.cancelBubble = true; }

    e.preventDefault();

    if (this.ZoomFactor > 1) {
        if (this.SupportsMSPointerEvents) {
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'MSPointerUp', this.CanvasMouseUpDelegate);
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'MSPointerOut', this.CanvasMouseOutDelegate);
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'MSPointerMove', this.CanvasMouseMoveDelegate);
        }
        else if (this.SupportsTouchEvents) {
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'touchmove', this.CanvasMouseMoveDelegate);
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'touchend', this.CanvasMouseUpDelegate);
        }
        else {
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'mouseup', this.CanvasMouseUpDelegate);
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'mouseout', this.CanvasMouseOutDelegate);
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'mousemove', this.CanvasMouseMoveDelegate);
        }

        this.ForegroundCanvasElement.style.cursor = 'default';
    }

    if (this.OnCanvasMouseUp != null) {
        this.OnCanvasMouseUp(this);
    }
};

LiveScribe.UI.CanvasControl.prototype.MouseOutHandler = function (e) {
    e = e || window.event;

    if (e.stopPropagation) { e.stopPropagation(); }
    else { e.cancelBubble = true; }

    e.preventDefault();

    LiveScribe.Events.RemoveWheelHandler(this.ForegroundCanvasElement, this.CanvasMouseWheelDelegate);

    if (this.ZoomFactor > 1) {
        if (this.SupportsMSPointerEvents) {
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'MSPointerUp', this.CanvasMouseUpDelegate);
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'MSPointerOut', this.CanvasMouseOutDelegate);
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'MSPointerMove', this.CanvasMouseMoveDelegate);
        }
        else if (this.SupportsTouchEvents) {
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'touchmove', this.CanvasMouseMoveDelegate);
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'touchend', this.CanvasMouseUpDelegate);
        }
        else {
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'mouseup', this.CanvasMouseUpDelegate);
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'mouseout', this.CanvasMouseOutDelegate);
            LiveScribe.Events.RemoveHandler(this.ForegroundCanvasElement, 'mousemove', this.CanvasMouseMoveDelegate);
        }

        this.ForegroundCanvasElement.style.cursor = 'default';
    }

    if (this.OnCanvasMouseOut != null) {
        this.OnCanvasMouseOut(this);
    }
};

LiveScribe.UI.CanvasControl.prototype.MouseOverHandler = function (e) {
    e = e || window.event;

    if (e.stopPropagation) { e.stopPropagation(); }
    else { e.cancelBubble = true; }

    e.preventDefault();

    LiveScribe.Events.AddWheelHandler(this.ForegroundCanvasElement, this.CanvasMouseWheelDelegate);

    if (this.OnCanvasMouseOver != null) {
        this.OnCanvasMouseOver(this);
    }
};

LiveScribe.UI.CanvasControl.prototype.MouseMoveHandler = function (e) {
    e = e || window.event;

    if (e.stopPropagation) { e.stopPropagation(); }
    else { e.cancelBubble = true; }

    e.preventDefault();

    if (this.ZoomFactor > 1) {
        var posX = e.clientX ? e.clientX : e.changedTouches[0].pageX;
        var posY = e.clientY ? e.clientY : e.changedTouches[0].pageY;

        var deltaX = posX - this.LastMousePositionX;
        var deltaY = posY - this.LastMousePositionY;

        var canvasCoordinate = new LiveScribe.UI.CanvasControlMoveCoordinate();
        canvasCoordinate.PositionX = this.ForegroundCanvasElement.offsetLeft + deltaX;
        canvasCoordinate.PositionY = this.ForegroundCanvasElement.offsetTop + deltaY;

        this.Move(canvasCoordinate);

        this.LastMousePositionX = posX;
        this.LastMousePositionY = posY;
    }

    if (this.OnCanvasMouseMove != null) {
        this.OnCanvasMouseMove(canvasCoordinate);
    }
};

LiveScribe.UI.CanvasControl.prototype.MainCanvasMouseWheelHandler = function (e) {
    var e = window.event || e; // old IE support

    if (this.ZoomFactor > 1) {
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        //var zoomLocX = (e.offsetX-tPencast.mMainCanvas.mOffsetX)/tPencast.mMainCanvas.ZoomedWidth;
        //var zoomLocY = (e.offsetY-tPencast.mMainCanvas.mOffsetY)/tPencast.mMainCanvas.ZoomedHeight;
        var zoomLocX = e.offsetX / tPencast.mMainCanvas.width;
        var zoomLocY = e.offsetY / tPencast.mMainCanvas.height;
        var zoomFactor = 1.1;
        if (delta > 0) {
            this.Zoom(zoomFactor, zoomLocX, zoomLocY);
        } else {
            this.Zoom(1 / zoomFactor);
        }
    }
};
