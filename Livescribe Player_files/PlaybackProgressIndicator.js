// ***********************************************************************************************************
// Name: Playback Progress Indicator UI Control
// Type:User Control
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.UI = LiveScribe.UI || {};



LiveScribe.UI.PlaybackProgressDisplayState = {
    DISPLAY: 'inline-block',
    HIDE: 'none'
};



LiveScribe.UI.PlaybackProgressIndicatorControl = function (currentTimeElement, remainingTimeElement) {
    this.CurrentTimeElement = currentTimeElement;
    this.RemainingTimeElement = remainingTimeElement;
    this.DurationInSeconds = 0;
    this.ElapsedTimeInSeconds = 0;
    this.Disable();
}

LiveScribe.UI.PlaybackProgressIndicatorControl.prototype.Enable = function () {
    this.CurrentTimeElement.style.display = LiveScribe.UI.PlaybackProgressDisplayState.DISPLAY;
    this.RemainingTimeElement.style.display = LiveScribe.UI.PlaybackProgressDisplayState.DISPLAY;
};

LiveScribe.UI.PlaybackProgressIndicatorControl.prototype.Disable = function () {
    this.CurrentTimeElement.style.display = LiveScribe.UI.PlaybackProgressDisplayState.HIDE;
    this.RemainingTimeElement.style.display = LiveScribe.UI.PlaybackProgressDisplayState.HIDE;
};

LiveScribe.UI.PlaybackProgressIndicatorControl.prototype.SetDuration = function (duration) {
    this.DurationInSeconds = duration / 1000;
    this.RenderTime();
};

LiveScribe.UI.PlaybackProgressIndicatorControl.prototype.SetCurrentTime = function (elapsedTime) {
    this.ElapsedTimeInSeconds = elapsedTime / 1000;
    this.RenderTime();
};

LiveScribe.UI.PlaybackProgressIndicatorControl.prototype.RenderTime = function() {
  var formattedTime = this.FormatTime(this.ElapsedTimeInSeconds)
  var remainingTime = this.FormatTime(this.DurationInSeconds - this.ElapsedTimeInSeconds);

  this.CurrentTimeElement.innerHTML = (formattedTime);
  this.RemainingTimeElement.innerHTML = '- ' + remainingTime;
}

LiveScribe.UI.PlaybackProgressIndicatorControl.prototype.Reset = function () {
  this.SetCurrentTime(0);
};

LiveScribe.UI.PlaybackProgressIndicatorControl.prototype.ResetCurrentTime = function () {
  this.SetCurrentTime(0);

};

LiveScribe.UI.PlaybackProgressIndicatorControl.prototype.FormatTime = function (timeInSeconds) {
    var timeString = "";

    var hours = Math.floor(((timeInSeconds % 31536000) % 86400) / 3600);
    if (hours > 0) {
        if (hours >= 10) { timeString = timeString + hours + ":" }
        else { timeString = timeString + "0" + hours + ":" }
    }

    var minutes = Math.floor((((timeInSeconds % 31536000) % 86400) % 3600) / 60);
    if (minutes > -1) {
        if (minutes >= 10) { timeString = timeString + minutes + ":" }
        else { timeString = timeString + "0" + minutes + ":" }
        
    }

    var seconds = Math.floor((((timeInSeconds % 31536000) % 86400) % 3600) % 60);
    if (seconds > -1) {
        if (seconds >= 10) { timeString = timeString + seconds }
        else { timeString = timeString + "0" + seconds }
    }

    return timeString
}

LiveScribe.UI.PlaybackProgressIndicatorControl.prototype.PlaybackCompleteHandler = function () {
    this.ResetCurrentTime();
};