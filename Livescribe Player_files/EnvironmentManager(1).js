var LiveScribe = LiveScribe || {};
LiveScribe.Web = LiveScribe.Web || {};


LiveScribe.Web.Environments = new Array(); 
LiveScribe.Web.Environments['www-test.livescribe.com'] = 'https://services-test.livescribe.com/services/lsplaybackservice/';
LiveScribe.Web.Environments['www-qa.livescribe.com'] = 'https://services-qa.livescribe.com/services/lsplaybackservice/';
LiveScribe.Web.Environments['www-stage.livescribe.com'] = 'https://services-stage.livescribe.com/services/lsplaybackservice/';
LiveScribe.Web.Environments['www.livescribe.com'] = 'https://services.livescribe.com/services/lsplaybackservice/';
LiveScribe.Web.Environments['dev.livescribe.com'] = 'https://services.livescribe.com/services/lsplaybackservice/';
LiveScribe.Web.Environments['54.241.7.169'] = 'https://services-qa.livescribe.com/services/lsplaybackservice/';
LiveScribe.Web.Environments['localhost'] = 'https://services.livescribe.com/services/lsplaybackservice/';


LiveScribe.Web.EnvironmentManager = function () {
    this.Host = window.location.hostname;
}

LiveScribe.Web.EnvironmentManager.prototype.GetEnvironment = function () {
    return LiveScribe.Web.Environments[this.Host];
}