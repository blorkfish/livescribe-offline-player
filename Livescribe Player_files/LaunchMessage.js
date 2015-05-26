// ***********************************************************************************************************
// Name: Launch Message
// Type: User Control
// Author: Cliff Gower
//************************************************************************************************************


var LiveScribe = LiveScribe || {};
LiveScribe.UI = LiveScribe.UI || {};


//*********************** launch message object  ***************************
LiveScribe.UI.LaunchMessage = function (messageElement, messageElement2, modal) {
    this.MessageTextElement = messageElement;
    this.MessageTextElement2 = messageElement2;
    this.InitBase(modal);
};

LiveScribe.UI.LaunchMessage.prototype = new LiveScribe.UI.ModalBase();

LiveScribe.UI.LaunchMessage.prototype.SetMessage = function (message) {
    this.MessageTextElement.innerHTML = "";
    this.MessageTextElement2.innerHTML = "";

    for (var index = 0; index < message.length; index++) {
        if (index == 0) {
            this.MessageTextElement.innerHTML = this.MessageTextElement.innerHTML + message[index] + '<br/><br/>';
        }
        else {
            this.MessageTextElement2.innerHTML = this.MessageTextElement2.innerHTML + message[index] + '<br/><br/>';
        }
    }
};