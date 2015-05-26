// ***********************************************************************************************************
// Name: Modal Panel
// Type: User Control
// Author: Cliff Gower
//************************************************************************************************************


var LiveScribe = LiveScribe || {};
LiveScribe.UI = LiveScribe.UI || {};

LiveScribe.UI.ModalDisplayType = {
    SHOW: "block",
    HIDE: "none"
};


//*********************** modal base class object  ***************************
LiveScribe.UI.ModalBase = function () {
    this.ModalElement = null;
 
    this.OnShowModal = null;
    this.OnHideModal = null;
};

LiveScribe.UI.ModalBase.prototype.InitBase = function (modal) {
    this.ModalElement = modal;
};

LiveScribe.UI.ModalBase.prototype.Show = function (message) {
    this.ModalElement.style.display = LiveScribe.UI.ModalDisplayType.SHOW;
    
    if (message) {
      var selector = this.ModalElement.getAttribute('data-message-holder');
      
      this.ModalElement.querySelector(selector).innerHTML = message;
    }
    
    if (this.OnShowModal != null) {
        this.OnShowModal();
    }
};

LiveScribe.UI.ModalBase.prototype.Hide = function () {
  
    this.ModalElement.style.display = LiveScribe.UI.ModalDisplayType.HIDE;

    if (this.OnHideModal != null) {
        this.OnHideModal();
    }
};


//*********************** modal panel object  ***************************
LiveScribe.UI.Modal = function (modal) {
    this.InitBase(modal);    
};

LiveScribe.UI.Modal.prototype = new LiveScribe.UI.ModalBase();


//*********************** event handling  ***************************
LiveScribe.UI.Modal.prototype.AddTrigger = function (trigger) {
    trigger.OnTriggerEvent = LiveScribe.Events.CreateDelegate(this, this.TriggerEventHandler);
}

LiveScribe.UI.Modal.prototype.TriggerEventHandler = function (triggerType) {
  console.log('Triggered event handler for ' + triggerType);
  if (!$(this.ModalElement).is(':visible')) {
    this.Show();
  } else {
    this.Hide();
  }
}

/*
LiveScribe.Animation.OpacityAnimation = function (element, endOpacity, duration, interval, acceleration) {
    this.m_StartOpacity = null;
    this.m_EndOpacity = endOpacity;
    this.m_ChangeOpacity = null;

    this.InitBase(element, duration, interval, acceleration);
}
*/