var LiveScribe = LiveScribe || {};
LiveScribe.IO = LiveScribe.IO || {};


LiveScribe.IO.LoadMethod = {
    TEXT: 0,
    ARRAY_BUFFER: 1,
    DATA_URL: 2
};


LiveScribe.IO.LocalFileLoader = function () {
    this.FilePath = null;
    this.FileLoadMethod = LiveScribe.IO.LoadMethod.ARRAY_BUFFER;
    this.FileInputElement = null;
    this.DropZoneElement = null;
    this.FileLoadContainer = null;

    this.FileReader = new FileReader();

    this.OnFileLoadComplete = null;
    this.OnFileLoadStart = null;
    this.OnFileLoadEnd = null;
    this.OnFileLoadProgress = null;
    this.OnFileLoadError = null;
    this.OnFileLoadAbort = null;

    LiveScribe.Events.AddHandler(this.FileReader, 'load', new LiveScribe.Events.CreateDelegate(this, this.FileReaderLoadHandler));
    LiveScribe.Events.AddHandler(this.FileReader, 'loadstart', new LiveScribe.Events.CreateDelegate(this, this.FileReaderLoadStartHandler));
    LiveScribe.Events.AddHandler(this.FileReader, 'loadend', new LiveScribe.Events.CreateDelegate(this, this.FileReaderLoadEndHandler));
    LiveScribe.Events.AddHandler(this.FileReader, 'progress', new LiveScribe.Events.CreateDelegate(this, this.FileReaderProgressHandler));
    LiveScribe.Events.AddHandler(this.FileReader, 'error', new LiveScribe.Events.CreateDelegate(this, this.FileReaderErrorHandler));
    LiveScribe.Events.AddHandler(this.FileReader, 'abort', new LiveScribe.Events.CreateDelegate(this, this.FileReaderAbortHandler));
};

LiveScribe.IO.LocalFileLoader.prototype.RegisterFileInputElement = function (element) {
    this.FileInputElement = element;
    LiveScribe.Events.AddHandler(this.FileInputElement, 'change', LiveScribe.Events.CreateDelegate(this, this.FileElementFileSelectHandler));
};

LiveScribe.IO.LocalFileLoader.prototype.RegisterDropZoneElement = function (dropzone) {
    this.DropZoneElement = dropzone;

    LiveScribe.Events.AddHandler(this.DropZoneElement, 'dragenter', LiveScribe.Events.CreateDelegate(this, this.DragZoneElementDragEnterHandler));
    LiveScribe.Events.AddHandler(this.DropZoneElement, 'dragover', LiveScribe.Events.CreateDelegate(this, this.DragZoneElementDragOverHandler));
    LiveScribe.Events.AddHandler(this.DropZoneElement, 'dragleave', LiveScribe.Events.CreateDelegate(this, this.DragZoneElementDragLeaveHandler));
    LiveScribe.Events.AddHandler(this.DropZoneElement, 'drop', LiveScribe.Events.CreateDelegate(this, this.DragZoneElementDropHandler));
};

LiveScribe.IO.LocalFileLoader.prototype.LoadFile = function () {
    if (this.FilePath != null) {
        if (this.FileLoadMethod == LiveScribe.IO.LoadMethod.TEXT) { this.LoadFileAsText(this.FilePath); }
        if (this.FileLoadMethod == LiveScribe.IO.LoadMethod.ARRAY_BUFFER) { this.LoadFileAsArrayBuffer(this.FilePath); }
        if (this.FileLoadMethod == LiveScribe.IO.LoadMethod.DATA_URL) { this.LoadFileAsDataURL(this.FilePath); }
    }
};

LiveScribe.IO.LocalFileLoader.prototype.LoadFileAsText = function (file) {
    this.FileReader.readAsText(file, "UTF-8");
};

LiveScribe.IO.LocalFileLoader.prototype.LoadFileAsArrayBuffer = function (file) {
    this.FileReader.readAsArrayBuffer(file);
};

LiveScribe.IO.LocalFileLoader.prototype.LoadFileAsDataURL = function (file) {
    this.FileReader.readAsDataURL(file);
};

LiveScribe.IO.LocalFileLoader.prototype.FileReaderLoadHandler = function (loadEvent) {
    var fileData = loadEvent.target.result;

    if (this.OnFileLoadComplete != null && this.OnFileLoadComplete != undefined) {
        this.OnFileLoadComplete(fileData);
    }
};

LiveScribe.IO.LocalFileLoader.prototype.FileReaderLoadStartHandler = function (loadEvent) {
    if (this.OnFileLoadStart != null && this.OnFileLoadStart != undefined) {
        this.OnFileLoadStart(loadEvent);
    }
};

LiveScribe.IO.LocalFileLoader.prototype.FileReaderLoadEndHandler = function (loadEvent) {
    var fileData = loadEvent.target.result;

    if (this.OnFileLoadEnd != null && this.OnFileLoadEnd != undefined) {
        this.OnFileLoadEnd();
    }
};

LiveScribe.IO.LocalFileLoader.prototype.FileReaderProgressHandler = function (loadEvent) {
    if (loadEvent.lengthComputable) {
        var percentLoaded = (loadEvent.loaded / loadEvent.total);
    }

    if (this.OnFileLoadProgress != null && this.OnFileLoadProgress != undefined) {
        this.OnFileLoadProgress(percentLoaded);
    }
};

LiveScribe.IO.LocalFileLoader.prototype.FileReaderErrorHandler = function (loadEvent) {
    var error = loadEvent.target.error.name;

    if (this.OnFileLoadError != null && this.OnFileLoadError != undefined) {
        this.OnFileLoadError(error);
    }
};

LiveScribe.IO.LocalFileLoader.prototype.FileReaderAbortHandler = function (loadEvent) {
    if (this.OnFileLoadAbort != null && this.OnFileLoadAbort != undefined) {
        this.OnFileLoadAbort(loadEvent);
    }
};

LiveScribe.IO.LocalFileLoader.prototype.FileElementFileSelectHandler = function () {
    var tFile = this.FileInputElement.files[0];
    this.FilePath = tFile;

    this.LoadFile();
};

LiveScribe.IO.LocalFileLoader.prototype.DragZoneElementDragEnterHandler = function (e) {
    e.stopPropagation();
    e.preventDefault();

    this.FileLoadContainer.className = 'hover';
};

LiveScribe.IO.LocalFileLoader.prototype.DragZoneElementDragOverHandler = function (e) {
    e.stopPropagation();
    e.preventDefault();

    this.FileLoadContainer.className = 'hover';
};

LiveScribe.IO.LocalFileLoader.prototype.DragZoneElementDragLeaveHandler = function (e) {
    e.stopPropagation();
    e.preventDefault();

    this.FileLoadContainer.className = 'normal';
};

LiveScribe.IO.LocalFileLoader.prototype.DragZoneElementDropHandler = function (e) {
    e.stopPropagation();
    e.preventDefault();

    this.FileLoadContainer.className = 'normal';

    var tFile = e.dataTransfer.files[0];
    this.FilePath = tFile;

    this.LoadFile();
};