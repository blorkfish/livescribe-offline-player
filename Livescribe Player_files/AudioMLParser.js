// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.AudioML = LiveScribe.AudioML || {};


/*************************** AudioML Parser ********************************/
LiveScribe.AudioML.AudioMLParser = function () {
    this.RawData = null;
    this.XMLDom = null;
    this.AudioMLDocument = null;
};

LiveScribe.AudioML.AudioMLParser.prototype.Load = function () {
    var domParser = new DOMParser();
    try {
        this.XMLDom = domParser.parseFromString(this.RawData, 'text/xml');
    }
    catch (err) {
        var error = err;
    }
}

LiveScribe.AudioML.AudioMLParser.prototype.GetAudioData = function () {
    var root = this.XMLDom.getElementsByTagName("json-audio-file")[0];
    var audioNode = root.getElementsByTagName("data")[0];
    var audioData = audioNode.textContent;

    return audioData;
};