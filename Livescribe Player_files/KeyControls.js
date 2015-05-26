// ***********************************************************************************************************
// Name: Key UI Controls
// Type:User Control
// Author: Cliff Gower
//************************************************************************************************************

//dependencies
//Framework.EventHandling.js


var LiveScribe = LiveScribe || {};
LiveScribe.UI = LiveScribe.UI || {};


LiveScribe.UI.KeyControls = function () {
    this.OnPlay = null;
    this.OnPause = null;
    this.OnStop = null;
    this.OnForward = null;
    this.OnBack = null;
    this.OnPageForward = null;
    this.OnPageBack = null;
    this.OnToggleFullScreen = null;
    this.OnPageReload = null;
    this.OnMuteToggle = null;


    this.KeyDownDelegate = LiveScribe.Events.CreateDelegate(this, this.KeyDownHandler);
};

LiveScribe.UI.KeyControls.prototype.Enable = function () {
    LiveScribe.Events.AddHandler(window, 'keydown', this.KeyDownDelegate);
};

LiveScribe.UI.KeyControls.prototype.Disable = function () {
    LiveScribe.Events.RemoveHandler(window, 'keydown', this.KeyDownDelegate);
}

LiveScribe.UI.KeyControls.prototype.KeyDownHandler = function (e) {
    var code = (e.keyCode ? e.keyCode : e.which);

    Debug("Key Pressed " + code, "ACTION");
    switch (code) {
        case 13:    //Enter
            break;
        case 32:    //Spacebar
            if (this.OnPlay != null && this.OnPlay != undefined) {
                this.OnPlay();
            }
            break;
        case 33:    //PageUp
            if (this.OnPageBack != null && this.OnPageBack != undefined) {
                this.OnPageBack();
            }
            break;
        case 34:    //PageDown
            if (this.OnPageForward != null && this.OnPageForward != undefined) {
                this.OnPageForward();
            }
            break;
        case 35:    //End = goto time=100%
            if (this.OnStop != null && this.OnStop != undefined) {
                this.OnStop();
            }
            break;
        case 36:    //home = goto time= 0%
            if (this.OnPlay != null && this.OnPlay != undefined) {
                this.OnPlay(0);
            }
            break;
        case 37:    //Left arrow = Jump 1 page back
            if (this.OnPageBack != null && this.OnPageBack != undefined) {
                this.OnPageBack();
            }
            break;
        case 38:    //Up Arrow = Jump ahead 10s
            if (this.OnForward != null && this.OnForward != undefined) {
                this.OnForward();
            }
            break;
        case 39:    //Right arrow = Jump 1 page foreward
            if (this.OnPageForward != null && this.OnPageForward != undefined) {
                this.OnPageForward();
            }
            break;
        case 40:    //Down Arrow = Jump Back 10s
            if (this.OnBack != null && this.OnBack != undefined) {
                this.OnBack();
            }
            break;
        case 48:    // 0 
        case 49:    // 1
        case 50:    // 2
        case 51:    // 3
        case 52:    // 4
        case 53:    // 5
        case 54:    // 6 
        case 55:    // 7 
        case 56:    // 8
        case 57:    // 9
            if (this.OnPlay != null && this.OnPlay != undefined) {
                this.OnPlay((code - 48) / 10);
            }
            break;
        case 70:    //f
            if (this.OnToggleFullScreen != null && this.OnToggleFullScreen != undefined) {
                this.OnToggleFullScreen();
            }
            break;
        case 116:   //f5
            if (this.OnPageReload != null && this.OnPageReload != undefined) {
                this.OnPageReload();
            }
            break;
        case 173:  //Mute button on media
            if (this.OnMuteToggle != null && this.OnMuteToggle != undefined) {
                this.OnMuteToggle();
            }
            break;
        case 178:  //Stop button on media
            if (this.OnStop != null && this.OnStop != undefined) {
                this.OnStop();
            }
            break;
        case 179:  //pause button on media
            if (this.OnPlay != null && this.OnPlay != undefined) {
                this.OnPlay();
            }
            break;
        default:
            break;
    }
    e.preventDefault();
}

