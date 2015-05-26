// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.PDFPlus = LiveScribe.PDFPlus || {};


// Audio Catalog Object
LiveScribe.PDFPlus.AudioCatalog = function (data) {
    this.CatalogString = data;
    this.CatalogEntries = new LiveScribe.Collections.NamedList();

    this.ExtractEntries();
};

LiveScribe.PDFPlus.AudioCatalog.prototype.ExtractEntries = function () {
    var catalogEntries = this.CatalogString.split('(');

    for (var index = 0; index < catalogEntries.length; index++) {
        var entry = catalogEntries[index];
        var fileNameObj = new RegExp("([a-zA-Z0-9_.]+.(m4a|mp4))").exec(entry);
        if (fileNameObj != null && fileNameObj.length > 0) {
        	var audioFileyName = fileNameObj[0];
			if (audioFileyName != null && audioFileyName != undefined && audioFileyName.length > 0) {
				var objRefId = new RegExp("( [0-9]* 0 R)").exec(entry);
				if (objRefId != null) {
					var audioObjRefId = objRefId[0].split(" ")[1];
				}
				this.CatalogEntries.Add(audioFileyName, audioObjRefId);
				console.log("Adding Catalog Entry: [" + audioFileyName + ", " + audioObjRefId + "]");
			}
        }
    }
};