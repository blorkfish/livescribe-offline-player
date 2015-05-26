// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.StrokeML = LiveScribe.StrokeML || {};


// Coordinate Data Object
LiveScribe.StrokeML.Coordinate = function () {
    this.PositionX = null;
    this.PositionY = null;
    this.Delta = null;
};

// Stroke Data Object
LiveScribe.StrokeML.Stroke = function () {
    this.Timestamp = null;
    this.Coordinates = new Array();
};

// StrokeMLDocument Data Object
LiveScribe.StrokeML.StrokeMLDocument = function () {
    this.Strokes = new LiveScribe.Collections.NamedList();
};