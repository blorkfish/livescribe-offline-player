// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.PDFPlus = LiveScribe.PDFPlus || {};


// PDF Plus Document Catalog Object
LiveScribe.PDFPlus.Catalog = function (data) {

    
    this.CatalogString = data;
    this.CatalogEntries = new LiveScribe.Collections.NamedList();

    this.ExtractEntries();
};


LiveScribe.PDFPlus.Catalog.prototype.ExtractEntries = function () {
    var catalogEntries = this.CatalogString.split('/');

    for (var index = 0; index < catalogEntries.length; index++) {
        var entry = catalogEntries[index];

    	if (/Names/.test(entry) && /([a-zA-Z0-9_.]+.(m4a|mp4))/.test(entry)) {
    		// this is a converted PDF..
			console.log("Adding Catalog Entry: [ Names, " + entry.substring(7) + "]");
    		this.CatalogEntries.Add("Names", entry.substring(7));
    	} else {

        var matches = new RegExp("^\s*([a-zA-Z0-9_.]+)").exec(entry);
        
        if (!matches) continue;
        
			  var catalogEntryName = matches[0];

			  var objIdR = new RegExp("( [0-9]* 0 R)+").exec(entry);
        
			  if (objIdR != null) {
				  var catalogEntryObjId = objIdR[0].split(" ")[1];
			  }
        
			  console.log("Adding Catalog Entry: [" + catalogEntryName + ", " + catalogEntryObjId + "]");
			  this.CatalogEntries.Add(catalogEntryName, catalogEntryObjId);
		}
    }
    
};