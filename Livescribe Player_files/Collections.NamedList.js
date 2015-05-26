// ***********************************************************************************************************
// Name: Named List
// Type: Object
// Author: Cliff Gower
//************************************************************************************************************

var LiveScribe = LiveScribe || {};
LiveScribe.Collections = LiveScribe.Collections || {};

LiveScribe.Collections.NamedList = function () {
    this.KeyValuePairs = new Object();
    this.KeyValuePairIterator = new Array();
}

LiveScribe.Collections.NamedList.prototype.Add = function (key, value) {
    this.KeyValuePairs[key] = value;
    this.KeyValuePairIterator.push(key);
};

LiveScribe.Collections.NamedList.prototype.Update = function (key, value) {
    this.KeyValuePairs[key] = value;
};

LiveScribe.Collections.NamedList.prototype.UpdateItemAt = function (index, value) {
    if (this.KeyValuePairIterator[index] != null
    && this.KeyValuePairIterator[index] != undefined) {
        var key = this.KeyValuePairIterator[index];
        this.KeyValuePairs[key] = value;
    }
};

LiveScribe.Collections.NamedList.prototype.Remove = function (key) {
    var index = this.FindItemIndex(key);
    this.RemoveItemAt(index);
};

LiveScribe.Collections.NamedList.prototype.RemoveItemAt = function (index) {
    if (this.KeyValuePairIterator[index] != null
    && this.KeyValuePairIterator[index] != undefined) {
        var key = this.KeyValuePairIterator[index];
        delete this.KeyValuePairs[key];
        this.KeyValuePairIterator.splice(index, 1);
    }
};

LiveScribe.Collections.NamedList.prototype.Clear = function () {
    var listSize = this.KeyValuePairIterator.length;
    this.KeyValuePairs.splice(0, listSize);
    this.KeyValuePairIterator.splice(0, listSize);
};

LiveScribe.Collections.NamedList.prototype.Item = function (key) {
    if (this.KeyValuePairs[key] != null
    && this.KeyValuePairs[key] != undefined) {
        return this.KeyValuePairs[key];
    }
};

LiveScribe.Collections.NamedList.prototype.ItemAt = function (index) {
    if (this.KeyValuePairIterator[index] != null
    && this.KeyValuePairIterator[index] != undefined) {
        var key = this.KeyValuePairIterator[index];
        return this.KeyValuePairs[key];
    }
};

LiveScribe.Collections.NamedList.prototype.KeyAt = function (index) {
    if (this.KeyValuePairIterator[index] != null
    && this.KeyValuePairIterator[index] != undefined) {
        return this.KeyValuePairIterator[index];
    }
};

LiveScribe.Collections.NamedList.prototype.Count = function () {
    return this.KeyValuePairIterator.length;
};

LiveScribe.Collections.NamedList.prototype.FindItemIndex = function (key) {
    for (index = 0; index < this.KeyValuePairIterator.length; index++) {
        if (this.KeyValuePairIterator[index] == key) {
            return index;
        }
    }

    return -1;
};

