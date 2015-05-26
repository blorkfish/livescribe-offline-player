// Namespace
var LiveScribe = LiveScribe || {};
LiveScribe.PDFPlus = LiveScribe.PDFPlus || {};


// PDF Plus Document Parser
LiveScribe.PDFPlus.PDFPlusDocumentParser = function () {
    this.PdfArrayBuffer = null;
    this.PdfBlob = null;
    this.Reader = null;
    this.PdfDocument = null;
    this.InkMLDocument = null;
    this.ExtractionTasks = new Array();
    this.isConvertedPDF = false;
    this.ImagesAreLoaded = false;
    this.InkMLIsLoaded = false;
    this.AudioIsLoaded = false;
    this.AudioStreamMaxLength = 1024 * 1024;

    this.InkMLParser = new LiveScribe.InkML.InkMLParser();
    this.InkMLParser.OnDocumentParseComplete = LiveScribe.Events.CreateDelegate(this, this.InkMLParserDocumentParseCompleteHandler);

    this.OnDocumentParseStart = null;
    this.OnDocumentParseComplete = null;
    this.OnImagesParseComplete = null;
    this.OnInkMLParseComplete = null;
    this.OnAudioParseComplete = null;

    this.xrefTableEntries = new LiveScribe.Collections.NamedList();
};

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.Init = function () {

    this.PdfDocument = new LiveScribe.PDFPlus.PDFPlusDocument();

    var buffer = new Uint8Array(this.PdfArrayBuffer);
    this.Reader = new BinaryReader(buffer);
    this.Reader.readUint8();

    // Extract offset positions for each object from the X-Reference Table of the pdf..
    this.ExtractXrefTableEntries();

    // Extract Catalogs..
    this.GetCatalogs();
};

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.ExtractXrefTableEntries = function () {
    var startxrefOffset = this.FindOffsetFromEnd("startxref");
    var end = this.FindOffsetFromEnd("\n"); // offset just about the EOF indicator - '%%EOF'

    var xrefOffset = this.GetObjectString(startxrefOffset + 10, end);
    var trailerOffset = this.FindOffsetFromEnd("trailer");

    var xrefTableString = this.GetObjectString(parseInt(xrefOffset, 10), trailerOffset);
    //console.log("xrefTableString ==> " + xrefTableString);

    var tableEntries = xrefTableString.split('\n');

    // Ignoring first 3 entries because:
    // 0th entry is 'xref' - not required
    // 1st entry indicates the length of table - not required
    // 2nd entry indicates the '0th' object, which is not used.
    var objectId = 1;
    for (var index = 3; index < tableEntries.length-1; index++) {
        var currentEntry = tableEntries[index];
        var currentEntryValues = currentEntry.split(' ');
        var startOffset = parseInt(currentEntryValues[0], 10);
        console.log("Adding ObjectID offset Entry: [" + objectId + ", " + startOffset + "]");
        this.xrefTableEntries.Add(objectId++, startOffset);
    }
};


LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.ParseInkMLAndImages = function () {
  
    if (this.OnDocumentParseStart != null && this.OnDocumentParseStart != undefined) {
        this.OnDocumentParseStart();
    }

    this.ExtractionTasks.push(LiveScribe.Events.CreateDelegate(this, this.GetImages));
    this.ExtractionTasks.push(LiveScribe.Events.CreateDelegate(this, this.GetInkML));

    this.ScheduleAssetsExtraction();
}

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.ParseInkML = function () {
    
    if (this.OnDocumentParseStart != null && this.OnDocumentParseStart != undefined) {
        this.OnDocumentParseStart();
    }

    this.ExtractionTasks.push(LiveScribe.Events.CreateDelegate(this, this.GetInkML));

    this.ScheduleAssetsExtraction();
}

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.ParseImages = function () {
    if (this.OnDocumentParseStart != null && this.OnDocumentParseStart != undefined) {
        this.OnDocumentParseStart();
    }

    this.ExtractionTasks.push(LiveScribe.Events.CreateDelegate(this, this.GetImages));

    this.ScheduleAssetsExtraction();
}

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.ParseAudio = function () {
    if (this.OnDocumentParseStart != null && this.OnDocumentParseStart != undefined) {
        this.OnDocumentParseStart();
    }

    this.ExtractionTasks.push(LiveScribe.Events.CreateDelegate(this, this.GetAudio));

    this.ScheduleAssetsExtraction();
}

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.ScheduleAssetsExtraction = function () {
  setTimeout(LiveScribe.Events.CreateDelegate(this, this.ExtractAssets), 25);
}

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.ExtractAssets = function () {
    if (this.ExtractionTasks.length > 0) {
        this.ExtractionTasks.shift()();
    }
    else {
        if (this.OnDocumentParseComplete != null && this.OnDocumentParseComplete != undefined) {
            this.OnDocumentParseComplete(this.PdfDocument);
        }
    }
}

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.GetCatalogs = function () {
    this.GetMainCatalog();
    this.GetLivescribeCatalog();
    this.GetEmbeddedFilesCatalog();
    setTimeout(LiveScribe.Events.CreateDelegate(this, this.ExtractAssets), 25);
}

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.GetMainCatalog = function () {

    var rootOffset = this.FindOffsetFromEnd("/Root");
    var rootObject = this.GetObjectString(rootOffset, rootOffset+13);

    var catalogObjectId = rootObject.split(' ')[1];
    var catalogString = this.GetObjectStringByObjectId(catalogObjectId);

    catalogString = catalogString.replace('Catalog\n/', '');
    catalogString = catalogString.replace('\n>>\nendobj', '');

    this.PdfDocument.MainCatalog = new LiveScribe.PDFPlus.Catalog(catalogString);
};

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.GetLivescribeCatalog = function () {
    var catalogObjectID = this.PdfDocument.MainCatalog.CatalogEntries.Item('Livescribe_Metadata');
    
    if (!catalogObjectID) {
      throw new Error(_i18n("This player can only load PDFs created by Livescribe. Please select a Livescribe PDF."));
    }
    
    this.PdfDocument.LivescribeCatalog = this.GetCatalog(catalogObjectID);
};

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.GetEmbeddedFilesCatalog = function () {
    var catalogObjectID = this.PdfDocument.MainCatalog.CatalogEntries.Item('Names');
    //Changed by MNaqvi
    if (catalogObjectID != null && catalogObjectID != undefined) {
        this.PdfDocument.NamesCatalog = this.GetCatalog(catalogObjectID);

        catalogObjectID = this.PdfDocument.NamesCatalog.CatalogEntries.Item('EmbeddedFiles');
        this.PdfDocument.EmbeddedFileNamesCatalog = this.GetCatalog(catalogObjectID);
        
        catalogObjectID = this.PdfDocument.EmbeddedFileNamesCatalog.CatalogEntries.Item('Names');
        this.PdfDocument.EmbeddedFilesCatalog = this.GetAudioCatalog(catalogObjectID);
    }
};

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.GetCatalog = function (id) {

    var catalogString = this.GetObjectStringByObjectId(id);

    catalogString = catalogString.replace(id + ' 0 obj\n<<\n/', '');
    catalogString = catalogString.replace(id + ' 0 obj\n[ ', '');
    catalogString = catalogString.replace('\n>>\nendobj', '');
    catalogString = catalogString.replace(' ]\nendobj', '');

    return new LiveScribe.PDFPlus.Catalog(catalogString);
};

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.GetAudioCatalog = function (id) {

    console.log(" ID for audio catalog = " + id);
    if (/([a-zA-Z0-9_.]+.(m4a|mp4))/.test(id)) {
        return new LiveScribe.PDFPlus.AudioCatalog(id);
    }

    var catalogString = this.GetObjectStringByObjectId(id);
    catalogString = catalogString.replace(id + ' 0 obj\n<<\n/', '');
    catalogString = catalogString.replace(id + ' 0 obj\n[ (', '');
    catalogString = catalogString.replace('\n>>\nendobj', '');
    catalogString = catalogString.replace(' ]\nendobj', '');

    return new LiveScribe.PDFPlus.AudioCatalog(catalogString);
};

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.GetImages = function () {
    var start = new Date().getTime();
    for (var index = 0; index < this.PdfDocument.LivescribeCatalog.CatalogEntries.Count() ; index++) {
        var key = this.PdfDocument.LivescribeCatalog.CatalogEntries.KeyAt(index);
        if (key.lastIndexOf(".png") > -1) {

            var imageObjectID = this.PdfDocument.LivescribeCatalog.CatalogEntries.Item(key);
            
            var imageStartOffset = this.xrefTableEntries.Item(imageObjectID);
            var imageEndOffset = this.FindOffsetFromAnOffset(imageStartOffset, 'stream');
            var imageString = this.GetObjectString(imageStartOffset, imageEndOffset);

            var imageStreamLength = null;
            var imageStreamArray = null;
            
            var lengthReferenceString = new RegExp("(Length [0-9]* 0 R)").exec(imageString);
            if (lengthReferenceString != null && lengthReferenceString.length > 0) {
                var imageStreamLengthObjectId = lengthReferenceString[0].split(' ')[1];
                var lengthObjectString = this.GetObjectStringByObjectId(imageStreamLengthObjectId);
                imageStreamLength = parseInt(lengthObjectString.split('\n')[1]);
                imageStreamArray = new Uint8Array(this.PdfArrayBuffer, imageEndOffset + 2, imageStreamLength);

            } else {
                imageString = imageString.replace(imageObjectID + ' 0 obj\n<<\n/', '');
                imageString = imageString.replace('\n>>\nstream', '');
                imageStreamLength = parseInt(imageString.split(' ')[1]);
                imageStreamArray = new Uint8Array(this.PdfArrayBuffer, imageEndOffset + 1, imageStreamLength);
            }

            var imageStream = new LiveScribe.PDFPlus.Image(imageStreamArray);

            this.PdfDocument.ImageCollection.Add(key, imageStream);
        }
    }

    this.ImagesAreLoaded = true;

    if (this.OnImagesParseComplete != null && this.OnImagesParseComplete != undefined) {
        this.OnImagesParseComplete(this.PdfDocument.ImageCollection);
    }

    this.ScheduleAssetsExtraction();
};

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.GetInkML = function () {
    for (var index = 0; index < this.PdfDocument.LivescribeCatalog.CatalogEntries.Count() ; index++) {
        var key = this.PdfDocument.LivescribeCatalog.CatalogEntries.KeyAt(index);
        if (key.lastIndexOf("_InkML") > -1) {

            var inkObjectID = this.PdfDocument.LivescribeCatalog.CatalogEntries.Item(key);

            var inkStartOffset = this.xrefTableEntries.Item(inkObjectID);
            var inkEndOffset = this.FindOffsetFromAnOffset(inkStartOffset, 'stream');
            var inkString = this.GetObjectString(inkStartOffset, inkEndOffset);    

            var inkStreamArray = null;
            var compressedInkStreamArray = null;
            var inkStreamLength = null;
            
            var lengthReferenceString = new RegExp("(/Length [0-9]* 0 R)").exec(inkString);
            if (lengthReferenceString != null) {
                // length of stream is passed as reference..
                console.info("This is a converted PDF from the community.");

                var inkMLStreamLengthObjectId = lengthReferenceString[0].split(' ')[1];
                var lengthObjectString = this.GetObjectStringByObjectId(inkMLStreamLengthObjectId);
                inkStreamLength = parseInt(lengthObjectString.split('\n')[1]);
                this.isConvertedPDF = true;
            } else {
                console.info("This is a NOT a converted PDF from the community.");

                inkString = inkString.replace(inkObjectID + ' 0 obj\n<<\n/', '');
                inkString = inkString.replace('\n>>\nstream', '');
                inkStreamLength = parseInt(inkString.split(' ')[1]);
            }
            

            if (inkString.lastIndexOf("FlateDecode") > -1) {
                // This PDF contains compressed InkML..
                console.log("This inkml is Compressed!");

                if (this.isConvertedPDF) {
                    // The first byte of 'converted PDFs', is always 'LF'; skipping it - hence " + 2"..
                    compressedInkStreamArray = new Uint8Array(this.PdfArrayBuffer, inkEndOffset + 2, inkStreamLength);
                } else {
                    compressedInkStreamArray = new Uint8Array(this.PdfArrayBuffer, inkEndOffset + 1, inkStreamLength);
                }
                
                var inflate = new Zlib.Inflate(compressedInkStreamArray);
                inkStreamArray = new Uint8Array(inflate.decompress());
                console.log("This inkml is de-Compressed successfully!");

            } else {
                inkStreamArray = new Uint8Array(this.PdfArrayBuffer, inkEndOffset + 1, inkStreamLength);
            }

            var inkStream = new LiveScribe.PDFPlus.InkML(inkStreamArray);
            this.PdfDocument.InkMLCollection.Add(key, inkStream);
        }
    }

    this.ParseInkMLDocument();
};


LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.ParseInkMLDocument = function () {
    this.InkMLParser.RawData = this.PdfDocument.InkMLCollection.ItemAt(0).XMLString;
    this.InkMLParser.Parse();
};


LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.GetAudio = function () {
    if (this.PdfDocument.EmbeddedFilesCatalog != null && this.PdfDocument.EmbeddedFilesCatalog != undefined) {
        for (var index = 0; index < this.PdfDocument.EmbeddedFilesCatalog.CatalogEntries.Count() ; index++) {
            var key = this.PdfDocument.EmbeddedFilesCatalog.CatalogEntries.KeyAt(index);

            if (key.lastIndexOf(".mp4") > -1 || key.lastIndexOf(".m4a") > -1) {
                // get audio file pointer
                var audioObjectID = null;
                var audioStreamLength = null;
                var audioStreamArray = null;

                if (this.isConvertedPDF) {

                    audioObjectID = this.PdfDocument.EmbeddedFilesCatalog.CatalogEntries.Item(key);

                } else {

                    var audioPointerID = this.PdfDocument.EmbeddedFilesCatalog.CatalogEntries.Item(key);
                    var audioPointerString = this.GetObjectStringByObjectId(audioPointerID);

                    audioPointerString = audioPointerString.replace(audioPointerID + ' 0 obj\n<<\n/', '');
                    audioPointerString = audioPointerString.replace('\n>>\nendobj', '');
                    audioPointerString = audioPointerString.replace('\n>>', '');
                    audioPointerString = audioPointerString.replace(' <<', '');
                    audioPointerString = audioPointerString.replace('<<', '');

                    var audioPointerEntries = audioPointerString.split('/');
                    var audioPointerObjectEntry = audioPointerEntries[1];
                    var audioObjectIDString = audioPointerObjectEntry.split(' ')[1];
                    audioObjectID = parseInt(audioObjectIDString); 
                }

                // Get audio file stream
                var audioStartOffset = this.xrefTableEntries.Item(audioObjectID);
                var audioEndOffset = this.FindOffsetFromAnOffset(audioStartOffset, 'stream');

                var audioString = this.GetObjectString(audioStartOffset, audioEndOffset);
                audioString = audioString.replace(audioObjectID + ' 0 obj\n<<\n/', '');
                audioString = audioString.replace('\n>>\nstream', '');

                // Find the stream length and populate streamArray
                var lengthReferenceString = new RegExp("(Length [0-9]* 0 R)").exec(audioString);
                if (lengthReferenceString != null && lengthReferenceString.length > 0) {
                    var audioStreamLengthObjectId = lengthReferenceString[0].split(' ')[1];
                    var lengthObjectString = this.GetObjectStringByObjectId(audioStreamLengthObjectId);
                    audioStreamLength = parseInt(lengthObjectString.split('\n')[1]);
                    audioStreamArray = new Uint8Array(this.PdfArrayBuffer, audioEndOffset + 2, audioStreamLength);
                } else {
                    audioStreamLength = parseInt(audioString.split('/')[0].split(' ')[1]);
                    audioStreamArray = new Uint8Array(this.PdfArrayBuffer, audioEndOffset + 1, audioStreamLength);
                }

                // Create a new AudioStream object using the streamArray populated above
                var audioStream = new LiveScribe.PDFPlus.AudioStream(audioStreamArray, LiveScribe.PDFPlus.MimeType.AUDIO);
                audioStream.GenerateBlob();
                audioStream.GenerateBlobURL();

                // Add it in the collection of audios
                this.PdfDocument.AudioStreamCollection.Add(key, audioStream);
            }
        }

        this.AudioIsLoaded = true;

        if (this.OnAudioParseComplete != null && this.OnAudioParseComplete != undefined) {
            this.OnAudioParseComplete(this.PdfDocument.AudioStreamCollection);
        }        
    }

    this.ScheduleAssetsExtraction();
};

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.FindOffsetFromEnd = function (token) {

    var tokenLength = token.length;
    this.Reader.seek(-(tokenLength + 1), seekOrigin.end);

    while (this.Reader.streamPosition >= tokenLength) {
        var result = this.Reader.readString(tokenLength);

        if (result.indexOf(token) > -1) {
            this.Reader.seek(-(tokenLength), seekOrigin.current);
            return this.Reader.streamPosition;
        }
        else {
            this.Reader.seek(-(tokenLength + 1), seekOrigin.current);
        }
    }

    return -1;
};


LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.FindOffsetFromAnOffset = function (offset, token) {
    this.Reader.seek(offset, seekOrigin.begin);
    var tokenLength = token.length;

    while (this.Reader.streamPosition < this.Reader.dataView.byteLength) {
        var result = this.Reader.readString(tokenLength);

        if (result.indexOf(token) > -1) {
            return this.Reader.streamPosition;
        }
        else {
            this.Reader.seek(-(tokenLength - 1), seekOrigin.current);
        }
    }

    return -1;
};

// Added by MNaqvi
LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.GetObjectStringByObjectId = function (objectId) {

    var startOffset = this.xrefTableEntries.Item(objectId);
    var endOffset = this.FindOffsetFromAnOffset(startOffset, 'endobj');
    return this.GetObjectString(startOffset, endOffset);
};

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.GetObjectStringByObjectIdAndEndToken = function (objectId, endToken) {

    console.log("mehdi - GetObjectStringByObjectIdAndEndToken called for id " + objectId + " and token " + endToken);

    var startOffset = this.xrefTableEntries.Item(objectId);
    var endOffset = this.FindOffsetFromAnOffset(startOffset, endToken);
    return this.GetObjectString(startOffset, endOffset);
};

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.GetObjectString = function (startOffset, endOffset) {

    this.Reader.seek(startOffset, seekOrigin.begin);
    return this.Reader.readString(endOffset - startOffset);
};

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.SendMessage = function (message) {
    if (this.OnMessage != null && this.OnMessage != undefined) {
        this.OnMessage(message);
    }
};

LiveScribe.PDFPlus.PDFPlusDocumentParser.prototype.InkMLParserDocumentParseCompleteHandler = function (inkMLDocument) {
    this.InkMLDocument = inkMLDocument;
    this.PdfDocument.PageCount = this.InkMLDocument.TraceGroups.Count(); // This may have duplicates..

    var traceGroupStartTimes = new Array();
    for (var index = 0; index < this.PdfDocument.PageCount; index++) {
        var traceGroup = this.InkMLDocument.TraceGroups.ItemAt(index);
        traceGroupStartTimes.push(traceGroup.TimeStamps[0].Time);
    }
    traceGroupStartTimes.sort();

    var uniqueTraceGroupStartTimes = traceGroupStartTimes.unique();
    for (var index = 0; index < this.PdfDocument.PageCount; index++) {
        var startTime = uniqueTraceGroupStartTimes[index];
        for (var traceGroupIndex = 0; traceGroupIndex < this.PdfDocument.PageCount; traceGroupIndex++) {
            var traceGroup = this.InkMLDocument.TraceGroups.ItemAt(traceGroupIndex);
            if (traceGroup.TimeStamps[0].Time == startTime) {
                this.PdfDocument.PageAddresses.push(this.InkMLDocument.TraceGroups.KeyAt(traceGroupIndex));
            }
        }
    }

    this.PdfDocument.PageAddresses = this.PdfDocument.PageAddresses.unique();
    this.PdfDocument.PageCount = this.PdfDocument.PageAddresses.length; // update the count value with size of 'unique' pageaddresses

    this.InkMLIsLoaded = true;

    if (this.OnInkMLParseComplete != null && this.OnInkMLParseComplete != undefined) {
        this.OnInkMLParseComplete(this.InkMLDocument);
    }

    this.ScheduleAssetsExtraction();
};