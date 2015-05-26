/***************************************************************
 * @license Copyright © 2007-2013 Livescribe, Inc. All rights reserved.
 **************************************************************/

// This is an external flag to tell closure compiler to remove debug
/** @define {boolean} */
var ENABLE_DEBUG = true;


 var BrowserSupport = { };
	BrowserSupport["Safari"] = 5;
	BrowserSupport["Firefox"] = 11;
	BrowserSupport["Chrome"] = 18;
    BrowserSupport["Android"] = 1.6;
    BrowserSupport["IE"] = 8;
	
 
 /*
 * Global Utility functions
 *
 * Initialize all with InitializeUtility()
 */

function InitializeUtility() {
	var tInitOk = true;
	// FIXME: Make a better initialized test later
	DebugInitialize();

	tInitOk = EnvManagerInitialize();

	InitializeErrorHandling();
	BandwidthCounterInitialize();
	return tInitOk;
}

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

window.cancelAnimFrame = (function(){
  return  window.cancelAnimationFrame || 
          window.webkitCancelAnimationFrame || 
          window.mozCancelAnimationFrame || 
          window.oCancelAnimationFrame || 
          window.msCancelAnimationFrame 
})();


//-------------------------------
// String convenience
//-------------------------------

function GetHorisontalLine( aiLength, aiCharacter ) {
    if( aiCharacter == ""  )
        return "";

    aiCharacter = aiCharacter != undefined ? aiCharacter : "-";

    return Array(aiLength+1).join(aiCharacter) + "\n"
}

function String2Array( sString ) {
	sString = sString.replace(/\s\s/g, ",");
	sString = sString.replace(/\s/g, ",");
	sString = sString.replace(/-/g, ",-");
	sString = sString.replace(/\+/g, ",");
	sString = sString.replace(/\;/g, ",");
	sString = sString.replace(/\,\,\,/g, ",");
	sString = sString.replace(/\,\,/g, ",");
	return  sString.split(',');
}

function largeArrayBufferToString(buffer)
{
    console.log("largeArrayBufferToString called..");
    var bufView = new Uint16Array(buffer);
    var length = bufView.length;
    var result = '';
    for(var i = 0; i<length; i+=65535)
    {
        var addition = 65535;
        if(i + 65535 > length)
        {
            addition = length - i;
        }
        result += String.fromCharCode.apply(null, bufView.subarray(i,i+addition));
    }

    return result;
}

// Adjusts  a string to a width
// asString - string to justify
// asMaxWidth - container width
// asJustificiation - "left", "right", "center". undefined = right
// return - centered string

function AdjustString( asString, asMaxWidth, asJustification, asFillChar ) {

    //console.log("Adjust: String '" + asString + "' asMaxWidth=" + asMaxWidth + " asJustification=" + asJustification);

    if( asFillChar == undefined ) {
        asFillChar = " ";
    }
    if( asString == undefined ) {
        return Array(asMaxWidth).join(asFillChar);
    }
    var tiPadding = asMaxWidth - asString.length + 1;

    if( tiPadding <= 0 ) {
        return asString.substring(0,asMaxWidth);
    }

    if( asJustification == "left" ) {
        return asString + Array(tiPadding).join(asFillChar);
    }

    if( asJustification == "center" ) {
        return Array(Math.floor((tiPadding + 1)/2)).join(asFillChar) + asString + Array(Math.floor(tiPadding/2)).join(asFillChar);
    }


    return Array(tiPadding).join(asFillChar) + asString;
}


// Converts a UTC time to string stripping am/pm

function UTC2String ( aTimeMilliseconds) {
    var d = new Date( aTimeMilliseconds );
    return d.toLocaleTimeString().replace(" PM","").replace(" AM","");
}

// Converts 2 UTC times to a string "(start-stop)"

function TimeSpan2String( aStartTimeMilliseconds, aStopTimeMilliseconds ) {
    return UTC2String(aStartTimeMilliseconds) + " - " + UTC2String(aStopTimeMilliseconds);
}

// Converts a time in milliseconds to format 'MM:SS' or 'H:MM:SS'

function TimeDuration2String( aTimeMilliseconds ) {

    if( isNaN( aTimeMilliseconds ) ) {
        aTimeMilliseconds = 0;
    }

    if( aTimeMilliseconds < 0 ) {
        aTimeMilliseconds = 0;
    }

    var seconds = Math.floor(aTimeMilliseconds / 1000);

    var minutes = Math.floor(seconds/60);
    seconds = seconds%60;

    var hours = Math.floor(minutes/60);
    minutes = minutes%60;

    var secondsString = ':' + seconds;
    if( seconds<10 ) {
        secondsString = ':0' + seconds;
    }

    var minutesString = '' + minutes;
    if( minutes<10 ) {
        minutesString = '0' + minutes;
    }

    if( hours != 0 ) {
        return hours + ':' + minutesString + secondsString;
    }

    return minutesString + secondsString;
}

function Milliseconds2String( aTimeMilliseconds) {
    if( isNaN( aTimeMilliseconds ) ) {
        aTimeMilliseconds = 0;
    }

    if( aTimeMilliseconds < 0 ) {
        aTimeMilliseconds = 0;
    }

    var minutes = Math.floor(aTimeMilliseconds/(60*1000));
    if( minutes >= 60 ) {
        return TimeDuration2String(aTimeMilliseconds);
    }

    var seconds = (aTimeMilliseconds % (60*1000) ) / 1000;




    if( minutes > 0 ) {
	    var secstring = seconds.toString().substring(0,4);
	    if( seconds < 10 ) {
		    return minutes + ":0" + secstring;
	    }

        return minutes + ":" + secstring;
    }

    return seconds.toString().substring(0,5);
}


function ByteSizeToString( aBytes ) {
    var tSuffixes = [ " bytes", " KB", " MB", " GB", " TB" ];

    var tCurrentValue = aBytes;
    for( var i = 0 ; i < tSuffixes.length ; i++ ) {
        if( tCurrentValue < 1024 ) {
            if( tCurrentValue > 99 ) {
                return (tCurrentValue+"").substring(0, 3) + tSuffixes[i];
            }
            return (tCurrentValue+"").substring(0, 5) + tSuffixes[i];
        }
        tCurrentValue = tCurrentValue / 1024;
    }

    return "You are really using way too much bandwidth";
}

// Converts array to string

function ArrayToString(oList, sName, sIndent, bNumberItems ) {
	if( sName == undefined || oList == undefined ) {
		HandleWarning("ArrayToString() needs a list and a name");
		return "";
	}

	sIndent = sIndent == undefined ? "" : sIndent;
	var tRet = "";

	var i = 0 ;
	for( var tItem in oList ) {
		var sNumber =bNumberItems == true  ? " [" + tItem + "]" : "  ";
		tRet +=  sIndent +  sNumber + oList[tItem].toString() + "\n";
		i++;
	}
	if( i == 0) {
		return sIndent + "Object has no " + sName +"\n";
	}

	return sIndent + sName + ":\n" + tRet;
}

function DictionaryIndicesToString( adDictionary ) {
    var tsRet = "";
    var tsLastPrefix = "[ ";
    for( var x in adDictionary) {
        tsRet += tsLastPrefix + x;
        tsLastPrefix = ", ";
    }
    return tsRet + "]";
}

function SortBy(field, reverse, primer) {

    var key = primer ?
        function (x) { return primer(x[field]) } :
        function (x) { return x[field] };

    reverse = [-1, 1][+!!reverse];

    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }

}


function PrintPrettyBox( aTitle, aValue, aMask ) {
    var l = 10;
    var c = '-';
    Debug( Array(l).join(c) + " " + aTitle + " " + Array(l).join(c), aMask );
    Debug( aValue, aMask );
    Debug( Array((l+1)*2 + aTitle.length).join(c), aMask);
}

function RoughSizeOfObject( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}

/***************************************************************************************
 * TableWriter enables pretty output of columns of values with a vertical header
 * @param aiDefaultMinimumColumnWidth
 * @param aiDefaultMaxColumnWidth
 * @param asTitle
 * @param abRowNumbers
 * @param asColumnSeparator
 * @param asLineSeparator
 * @param asTitleBoxFill
 * @param aiFreqOfRowSeparators
 * @param aiMaxCols
 * @constructor
 */

function TableWriter( aiDefaultMinimumColumnWidth, aiDefaultMaxColumnWidth, asTitle, abRowNumbers, asColumnSeparator, asLineSeparator, asTitleBoxFill, aiFreqOfRowSeparators,aiMaxCols  ) {
    this.MAX_COLS = aiMaxCols != undefined ? aiMaxCols : 20;
    this.mbRowNumbers = abRowNumbers != undefined ? abRowNumbers : true;
    this.msColumnSeparator = asColumnSeparator != undefined ? asColumnSeparator : "|";
    this.msTitle = asTitle
    this.msLineSeparator = asLineSeparator != undefined ? asLineSeparator : "-";
    this.msTitleBoxFill = asTitleBoxFill != undefined ? asTitleBoxFill : "#";
    this.miDefaultMinColumnWidth = aiDefaultMinimumColumnWidth != undefined ? aiDefaultMinimumColumnWidth : 4;
    this.miDefaultMaxColumnWidth = aiDefaultMaxColumnWidth != undefined ? aiDefaultMaxColumnWidth : 8;
    this.mTitleRow = ["DEFAULT", "TITLE"];
    this.mRows = new Array();
    this.msColumnTextAdjustments = CreateAndFillArray("left", this.MAX_COLS);
    this.miMinColumnWidths = CreateAndFillArray(this.miDefaultMinColumnWidth, this.MAX_COLS);
    this.miMaxColumnWidths = CreateAndFillArray(this.miDefaultMaxColumnWidth, this.MAX_COLS);
    this.mFreqOfRowSeparators = aiFreqOfRowSeparators != undefined ? aiFreqOfRowSeparators : 999999;

    this.CenterColumn = function (aiColumn){
        this.msColumnTextAdjustments[aiColumn] = "center";
    };

    this.LeftJustifyColumn = function (aiColumn){
        this.msColumnTextAdjustments[aiColumn] = "left";
    };

    this.RightJustifyColumn = function (aiColumn){
        this.msColumnTextAdjustments[aiColumn] = "right";
    };

    this.SetMinMaxWidthColumnWidth = function (aiColumn, aiMinWidth, aiMaxWidth){
        this.miMinColumnWidths[aiColumn] = aiMinWidth != undefined ? aiMinWidth : this.miMinColumnWidths[aiColumn];
        this.miMaxColumnWidths[aiColumn] = aiMaxWidth != undefined ? aiMaxWidth : this.miMaxColumnWidths[aiColumn];
    };


    this.AddHeaderRow = function (aiNewLine){
        if( aiNewLine != undefined && aiNewLine instanceof Array ) {
            mTitleRow = aiNewLine;
        }
    };

    this.Add = function ( newLine ){
        if( newLine != undefined && newLine instanceof Array ) {
	        if( this.mRows.length > 0 && this.mRows[0].length != newLine.length ) {
		        HandleWarning("Warning the row added to table '" + msTitle +"' should be " + this.mRows[0].length + " long");
	        }
            this.mRows.push(newLine);
        }
    };

    this.Sort = function( aiColumn, abLowestFirst ) {
        this.mSortCol = aiColumn != undefined ? aiColumn : 0;
        this.bLowestFirst = abLowestFirst != undefined ? abLowestFirst : true;
		this.cats = "cats";
        this.mRows.sort( function(aoFirst, aoSecond) {
            if( aoFirst != undefined && aoSecond != undefined && aoFirst[this.mSortCol] != undefined && aoSecond[this.mSortCol] != undefined &&
                typeof (aoFirst[this.mSortCol].valueOf) == 'function' && typeof (aoFirst[this.mSortCol].valueOf) == 'function' ) {

                if( aoFirst[this.mSortCol] == aoSecond[this.mSortCol]) {
                    return 0;
                }

                if( aoFirst[this.mSortCol] > aoSecond[this.mSortCol] ) {
                    return this.bLowestFirst ? 1 : -1;
                }

            }

	        if( aoFirst[this.mSortCol] == undefined ) {
	            return this.bLowestFirst;
	        }

	        if( aoSecond[this.mSortCol] == undefined ) {
	            return !this.bLowestFirst;
            }

	        return 0;
       });

    };

    this.toString = function ( bShortPrint ){

	    if( bShortPrint == true ) {
			return "Table of " + this.msTitle;
	    }
        // Calculate max row size for each column and create a square matrix of entries as string
        var tStringRows = new Array();
        var tColumnWidths = ShallowCopyArray(this.miMinColumnWidths);

        for( var tiRowIndex = 0 ; tiRowIndex < this.mRows.length ; tiRowIndex++ ) {

            var tsRowStringArray = new Array();
            var toCurrentRow = this.mRows[tiRowIndex];
            for( var tiColumnIndex = 0 ; tiColumnIndex < toCurrentRow.length ; tiColumnIndex++ ) {

                var tsString = toCurrentRow[tiColumnIndex].toString();
	            tsString = tsString.replace(/\n/g, "");    // Remove newlines
                //console.log( "tsValue =" + tsString + " str.length=" + tsString.length + " colwidth=" + tColumnWidths[tiColumnIndex] );

                if( tsString.length > tColumnWidths[tiColumnIndex] ) {
                    tColumnWidths[tiColumnIndex] = Math.min( tsString.length, this.miMaxColumnWidths[tiColumnIndex] );
                    //console.log("Changing value to " + tColumnWidths[tiColumnIndex]);
                }
                tsRowStringArray.push(tsString);
            }
            tStringRows.push(tsRowStringArray);
        }


	    // make sure we conform to maximum width of console
	    var tConsoleWidth = DebugGetMaskValue("CONSOLEWIDTH");
	    //console.log("Running with console width = " + tConsoleWidth);
	    var tSizeReduction = 1;

	    while( tSizeReduction > 0 ) {

		    var tTotalWidth = 0;
		    var tWidestColumnWidth = 0;
		    var tWidestColumn = 0;

		    for( var tiColumnIndex = 0 ; tiColumnIndex < toCurrentRow.length ; tiColumnIndex++ ) {
			    tTotalWidth += tColumnWidths[tiColumnIndex];
			    if( tColumnWidths[tiColumnIndex] > tWidestColumnWidth ) {
				    tWidestColumnWidth = tColumnWidths[tiColumnIndex];
				    tWidestColumn = tiColumnIndex;
			    }
		    }

		    tSizeReduction = Math.floor( Math.min( tWidestColumnWidth / 4 + 1, tTotalWidth - tConsoleWidth ) );
		    tColumnWidths[tWidestColumn] -= tSizeReduction ;

		    //console.log("TotalWidth = " + tTotalWidth + " WidestCol= " + tWidestColumn + " WidestColumnW = " + tWidestColumnWidth + " tSizeRed = " + tSizeReduction );
	    }


		    var tsRet = "";
        var tsHorisontalLine = "";

        for( var tiRowIndex = 0 ; tiRowIndex < tStringRows.length ; tiRowIndex++  ) {

            var tsCurrentLine = this.msColumnSeparator;
            var tCurrentStringRow = tStringRows[tiRowIndex];

            // Gather line and adhere to min/max width for column
            for( var tiColumnIndex = 0; tiColumnIndex < tCurrentStringRow.length ; tiColumnIndex++ ) {
                tsCurrentLine += " " + AdjustString(tCurrentStringRow[tiColumnIndex], tColumnWidths[tiColumnIndex], this.msColumnTextAdjustments[tiColumnIndex], " ") + " " + this.msColumnSeparator;
            }

            // add top line && title bar
            if( tiRowIndex == 0 ) {
                if( this.msTitle != undefined ) {
                    var tsBar = GetHorisontalLine(tsCurrentLine.length, this.msTitleBoxFill);
                    var tsCenteredTitle = AdjustString( " " + this.msTitle + " " , tsCurrentLine.length + 1, "center", this.msTitleBoxFill);
                    //console.log ("Centered title '" + tsCenteredTitle + "'");
                    tsRet += tsBar + tsCenteredTitle + "\n" + tsBar;
                }

                tsHorisontalLine = GetHorisontalLine(tsCurrentLine.length, this.msLineSeparator);
                tsRet += tsHorisontalLine;
            }

            tsRet+= tsCurrentLine + "\n";

            if( tiRowIndex % this.mFreqOfRowSeparators == 0 ) {
                tsRet +=  tsHorisontalLine;
            }
        }

        return tsRet + tsHorisontalLine;
    };

}

//-------------------------------
// Debug messages
//-------------------------------

var gLS_DEFAULT_DEBUG_MASKS = ["DEBUG", "ERROR","WARNING","PANIC", "DEFAULTDEFAULT"];

function DebugOn() {
	return DebugEnableMasks("DEBUGON");
}

function DebugOff() {
	return DebugDisableMasks("DEBUGON");
}

function DebugEnableMasks( tMasks ) {
	return DebugSetMaskValue(tMasks, true);
}

function DebugDisableMasks( tMasks ) {
	return DebugSetMaskValue(tMasks, false);
}

// Cant move this code into ModifyMasks since ModifyMasks calls itself...
function DebugSetMaskValue( masks, value ) {
	var tsRet = ModifyMasks( masks, value );
	if( tsRet.length > 0 ) {
		DebugMasksTouched( masks, 0 );
	}
	return tsRet;
}

function DebugGetMaskValue( asDebugMask, defaultValue ) {
	var tRet = window.LS_debug_enabled_masks[asDebugMask];
	if( tRet == undefined )
	{
		tRet = window.LS_debug_mask_default_value[asDebugMask];
	}
	return tRet;
}

function ModifyMasks( masks, value ) {

	var tsRet = "";

	if( masks instanceof Array ) {
		var tsSeparator = "";
		for( var i = 0 ; i < masks.length ; i++ ) {
			var tsModifiedMasks = ModifyMasks(masks[i],value);
			//console.log("What? " + tsRet);
			if( tsModifiedMasks.length > 0 ) {
				if( tsRet == "-ALL") {
					tsRet = tsModifiedMasks;
				} else {
					tsRet += tsSeparator +  tsModifiedMasks;
					tsSeparator = ", ";
				}
			}
		}
	} else {

		if( masks == true ) {
			masks = "TRUE";
		}
		else if( masks == false ) {
			masks = "FALSE";
		}
		else if( masks.indexOf("=") != -1 ) {
			var tKeyValue = masks.split("=");
			masks = tKeyValue[0];
			value = tKeyValue[1];
		}

		var tsCurrMask = masks.toString().toUpperCase();

		if( tsCurrMask.charAt(0) == "-" ) {
			tsCurrMask = tsCurrMask.substr(1);
			if( value instanceof Boolean ) {
				value = !value;
			}
		}

		switch(tsCurrMask) {
			case "OFF":
			case "0":
			case "FALSE":
			case "DEBUGOFF":
				value = !value;     // Fallthrough intentional
			case "ON":
			case "1":
			case "TRUE":
			case "DEBUGON":
				tsCurrMask = "DEBUGON";
				if( value ) {
					tsRet = ModifyMasks(gLS_DEFAULT_DEBUG_MASKS, value);
				}
				break;
			case "DEFAULTDEFAULT":
				tsCurrMask = "DEFAULT";
				break;
			case "DEFAULT":
				return ModifyMasks(gLS_DEFAULT_DEBUG_MASKS, value);
			case "CLEAR":
				DebugClearMasks();
				return "CLEAR";
		}


		var tbCurrentValue = window.LS_debug_enabled_masks[ tsCurrMask ];
		tbCurrentValue = tbCurrentValue != undefined ? tbCurrentValue : false;
		if( tbCurrentValue != value ) {
			window.LS_debug_enabled_masks[ tsCurrMask ] = value;
			var tsCurrMask = (value == false ? "-" : "") + tsCurrMask;

			if( tsRet.length > 0 ) {
				tsRet = tsCurrMask + ", " + tsRet;
			} else {
				tsRet = tsCurrMask;
			}
		}

	}

	return tsRet;
}
// Enables or disables debugmasks from string Format: +NET +WARNING -ACTION

function DebugModMasksFromString( aString ) {
    var tsRet = DebugEnableMasks(String2Array(aString));
	Debug("Modified the following masks: " + tsRet, "DEBUG");
	return tsRet;
}

function DebugIsMaskOn( asDebugMask ) {
    if( window.LS_debug_enabled_masks["ALL"] == true  ) {
        return true;
    }

    if( asDebugMask instanceof Array ) {
        for( var i = 0; i <  asDebugMask.length; i++ ) {
            if( window.LS_debug_enabled_masks[asDebugMask[i]] ) {
                return true;
            }
        }

    } else if( window.LS_debug_enabled_masks[asDebugMask] ) {
        return true;
    }
    return false;
}

function DebugMasksTouched( aoMasks,delta ) {

	var tArray = aoMasks;
    if( !(tArray instanceof Array) ) {
	    tArray = new Array();
        tArray.push(aoMasks);
    }

    for( var i = 0; i < tArray.length; i++ ) {
	    //console.log("aoMasks=" + tArray[i] );
	    var maskName = tArray[i].split("=");
	    if( window.LS_debug_mask_counters[maskName[0]] == undefined ) {
	        window.LS_debug_mask_counters[maskName[0]] = 0;
        }

        window.LS_debug_mask_counters[maskName[0]]+=delta;
	    //console.log( delta + " tot=" + window.LS_debug_mask_counters[tArray[i]]);
    }
}

function Debug( aValue, asdMasks ) {

    if( ENABLE_DEBUG && IsDebugOn() ) {
	    asdMasks = asdMasks != undefined ? asdMasks : "DEFAULT";

	    if( aValue == undefined ) {
            HandleError( "Debug Error: undefined object passed");
	        return;
        } else if( typeof (aValue.toString) == 'function' ) {
            if( DebugIsMaskOn(asdMasks) ) {
                var tsPrefix = "";
                if( DebugIsMaskOn("TIME") ) {
                    tsPrefix += "("+ window.LS_program_StopWatch.GetLongRunningTimeString() +") ";
                }
                if( DebugIsMaskOn("MASK") ) {
                    tsPrefix += "[" + (asdMasks instanceof Array ? asdMasks[0] : asdMasks)  + "] ";
                }
				if( !DebugIsMaskOn("SILENT") ) {
					log( tsPrefix + aValue );
                }


	            /*tsLines = aValue.split("\n");
			for( tsLine in tsLines ) {
				console.log( tsPrefix + aValue );      // The user printed string
			}
			*/
            }
        } else {
            HandleError( "Debug Error: Passed object without toString() function");
	        return;
        }

	    DebugMasksTouched(asdMasks,1);
    }
}

function IsDebugOn() {
    if( window.LS_debug_enabled_masks == undefined ) {
        return false;
    }
	//console.log("length=" + window.LS_debug_enabled_masks.length + " on=" + window.LS_debug_enabled_masks["DEBUGON"]);
    return  window.LS_debug_enabled_masks["DEBUGON"] == true;
}


function DebugGetStatusString() {

	var toTableWriter = new TableWriter( 2, 100, "--- Debug Masks --- ", true, "|", "-", " ", 10);
    toTableWriter.CenterColumn(1);
    toTableWriter.SetMinMaxWidthColumnWidth(1,4,4);
    toTableWriter.RightJustifyColumn(2);
    toTableWriter.RightJustifyColumn(3);
	toTableWriter.Add([" #","Val","Mask", "Count", "Description"]);
	var i = 0;
    for( var tSeenMask in window.LS_debug_mask_counters ) {
	    var tSetting = DebugGetMaskValue(tSeenMask);
	    tSetting = (tSetting == false || tSetting == undefined) ? "" : (tSetting == true ) ? "On" : tSetting;
        toTableWriter.Add([i, tSetting, tSeenMask, window.LS_debug_mask_counters[tSeenMask], DebugGetMaskDescription(tSeenMask)]);
	    i++;
     }

	//toTableWriter.Sort(0,false);
	//toTableWriter.Sort(3,false);
	//toTableWriter.Sort(4,false);

	return toTableWriter.toString();
}

function DebugStatus( iValueIndex, value ) {
	if( IsDebugOn() ) {
		if( iValueIndex != undefined ) {
			var i = 0;
			for( var tSeenMask in window.LS_debug_mask_counters ) {
				if( i == iValueIndex ) {

					var tCurrValue = DebugGetMaskValue( tSeenMask  );

					if( value == undefined ) {
						if( tCurrValue == true) {
							value = false;
						} else if( tCurrValue == false || tCurrValue == undefined ) {
							value = true;
						} else {
							HandleWarning("To modify a non boolean setting please enter a value or ommit to toggle it");
							return;
						}
					}

					DebugSetMaskValue( tSeenMask,  value );
					DebugStoreEnabledMasks();
					i = -1;
					break;
				}
				i++;
			}

			if( i != -1 ) {
				HandleWarning("Set the mask to an index that exists in the table\n\n");
			}
		}

		log(DebugGetStatusString());
	}
}

var gLS_STORAGE_DEBUG_MASKS_KEY = "ENABLEDDEBUGMASKS";

function DebugStoreEnabledMasks() {
	if( IsLocalStorageSupported() ) {
		var tToStore = DictionaryKeysToString(window.LS_debug_enabled_masks);
		Debug("Storing enabled enabled masks: " + tToStore, "DEBUG");
		localStorage[gLS_STORAGE_DEBUG_MASKS_KEY] = tToStore;
	}
}

function DebugLoadEnabledMasks() {
	if( IsLocalStorageSupported() ) {
		var tsMasks = localStorage[gLS_STORAGE_DEBUG_MASKS_KEY];
		if( tsMasks != undefined && tsMasks.length> 0) {
			Debug("Masks loaded from local storage: " + tsMasks, "DEBUG");
			tsModifiedMasks = DebugModMasksFromString( tsMasks );
		}
	} else {
		HandleWarning("Local storage not supported by browser");
	}
}

function DebugClearMasks() {

	var tbDebugOn = IsDebugOn();

	window.LS_debug_enabled_masks = new Array();

	if( IsLocalStorageSupported() ) {
		delete localStorage[gLS_STORAGE_DEBUG_MASKS_KEY];
	}

	// Restore old state
	if( tbDebugOn ) {
		DebugOn();
	}

}

function DebugRegisterMask( sMask, sDescription, defaultValue ) {
	defaultValue = defaultValue != undefined ? defaultValue : false;

	window.LS_debug_registered_masks[sMask] = sDescription;
	window.LS_debug_mask_default_value[sMask] = defaultValue;

		window.LS_debug_registered_masks[sMask] = sDescription;
	HelpAdd2Topic('Debugmask "' + sMask +'"', sDescription);

	DebugMasksTouched( sMask, 0 );         // this is just to guarantee that it is seen in registered list
}

function DebugGetMaskDescription( sMask ) {
	return window.LS_debug_registered_masks[sMask] != undefined ? window.LS_debug_registered_masks[sMask] : "";
}

function DebugInitialize() {

	HelpAddCommand(["DebugOn()", "M('ON')", "none", "Turns on default debugmasks"]);
	HelpAddCommand(["DebugOff()", "M('OFF')", "none", "Turns on default debugmasks"]);
	HelpAddCommand(["DebugEnableMasks()", "M()", "string or array of debugmasks", "Turns on debugmasks"]);
	HelpAddCommand(["DebugDisableMasks()", "", "string or array of debugmasks", "Turns off debugmasks"]);
	HelpAddCommand(["DebugStatus()", "D()", "mask number, value(optional)", "Prints debug masks status, description and statistics. If mask is specified that mask will be toggled unless value is set in that case the value is used"]);
	HelpAddCommand(["DebugGetMaskToValue()", "M()", "masks", "Gets the a setting value or default if it is not set"]);
	HelpAddCommand(["DebugSetMaskToValue()", "M()", "masks, value", "Sets debug setting to the value Example: DebugSetMasksToValue('CONSOLEWIDTH',80)"]);
	HelpAddCommand(["DebugModMasksFromString()", "M()", "string with masks", "Enables or disables masks Example: debugon, -DOCLOAD NETPERF"]);


	window.LS_debug_registered_masks = new Array();
	window.LS_debug_mask_counters = new Array();
	window.LS_debug_enabled_masks = new Array();
	window.LS_debug_mask_default_value = new Array();

	DebugOn();
	DebugLoadEnabledMasks();

	var tDebug = GetParameterByName("debug");

	if( tDebug != undefined ) {
		var tsRet = DebugModMasksFromString( tDebug );
	}

	DebugRegisterMask("DEBUGON" ,"Setting: Turns on debugging. Alternatives: -DEBUGOFF ON -OFF TRUE -FALSE  DebugOn(), DebugOff()");
	DebugRegisterMask("MASK" ,"Setting: Prints the debugmasks passed to Debug() output.");
	DebugRegisterMask("TIME", "Setting: Prints the time stamp in front of Debug() output. Also used by timing code");

	DebugRegisterMask("DEFAULT" ,"Default mask for Debug() statements. Enabling/Disabling this mask also modifies ERROR,WARNING & Panic");
	DebugRegisterMask("ALL","Turns on all debug statements. Warning very spammy. Turn off with -ALL to go back to previous set");
	DebugRegisterMask("CLEAR" ,"Action: Clears all debugmasks currently active. Also wipes the persisted masks.");
	DebugRegisterMask("DEBUG", "Show debug messages from the debug subsystem");
	DebugRegisterMask("CONSOLEWIDTH", "Setting: Sets the debug console width to this number of characters. Use this to control table widths like this one", 140);
}

//-------------------------------
// Error handling
//-------------------------------

function InitializeErrorHandling() {
    window.LS_panics = 0;
    window.LS_errors = 0;
    window.LS_warnings = 0;

	HelpAddCommand(["PrintErrorStatistics()", "E()", "none", "Prints number of errors and warnings"]);

	DebugRegisterMask("ERROR","An error happened that the program is trying to recover from. Used by HandleError()");
	DebugRegisterMask("WARNING" ,"Something strange but not serious happened. Used by HandleWarning()");
	DebugRegisterMask("PANIC" ,"Catastrophic execution error. Program will terminate. Used by HandlePanic()");
}

function HandleError( aErrorString ) {
    window.LS_errors++;
    console.error( "Error: " + aErrorString );
    PrintErrorStatistics();
    //alert( aErrorString );
}

function HandlePanic( aErrorString ) {
    window.LS_panics++;
    console.error( "PANIC:" + aErrorString );
    alert( ":PANIC: Did not expect this to happen :PANIC:\n\n " + aErrorString );
    PrintErrorStatistics();
}

function HandleWarning( aErrorString ) {
    window.LS_warnings++;
    console.warn( "WARNING: "+ aErrorString );
}

function PrintErrorStatistics() {
    PrintPrettyBox("ERROR COUNTS", "Warnings: " + window.LS_warnings + "\nErrors: " + window.LS_errors + "\nPanics: " + window.LS_panics);
}


//-------------------------------
// Bandwidth Counters
//-------------------------------

function BandwidthCounterInitialize() {
    window.LS_bandwidthcounter = 0;
    window.LS_bandwidthnumberofitems = 0;
	HelpAddCommand(["BandwidthCounterPrint()", "B()", "none", "Prints info about consumed bandwidth"]);
}

function BandwidthCounterAdd( aValue ) {
    if( isNaN(aValue)) {
        HandleError("BandwidthCounterAdd needs to be called with a number");
    }
    window.LS_bandwidthcounter += aValue;
    window.LS_bandwidthnumberofitems++;
}

function BandwidthCounterGetTotal() {
    return window.LS_bandwidthcounter;
}

function BandwidthCounterGetNumberOfItems() {
    return window.LS_bandwidthnumberofitems;
}

function BandwidthCounterToString() {
    if( window.LS_bandwidthnumberofitems == 0 ) {
        return "No bandwidth consumed";
    }
    return "Consumed bandwidth is " + ByteSizeToString(window.LS_bandwidthcounter) + " on " + window.LS_bandwidthnumberofitems + " items. Average is " + ByteSizeToString( window.LS_bandwidthcounter/window.LS_bandwidthnumberofitems);
}

function BandwidthCounterReset() {
    BandwidthCounterInitialize();
}

//-------------------------------
// Units and such
//-------------------------------

var gMAX_INT = 9007199254740992;


function AU2MM( afInputValue ) {
    return afInputValue / 8 * 0.3;
}

function MM2AU( afInputValue ) {
    return Math.floor(afInputValue / 0.3 * 8);
}


function ParseToAU( afInputValue ) {
    if( afInputValue == undefined )
    {
        HandleWarning("ParseToAU(). Got undefined");
        return 0;
    }

    return MM2AU(parseFloat(afInputValue));
}


//-------------------------------
// Misc
//-------------------------------


gLS_ProductName = "";
gLS_Version = "";

function ProductSetInfo( sProductName, sVersionString  ){
	gLS_ProductName = sProductName;
	gLS_Version = sVersionString;
	HelpAdd2Topic( "Product", gLS_ProductName );
	HelpAdd2Topic( "Version", gLS_Version );
	HelpAddCommand(["ProductPrintInfo()", "V()", "none", "Prints application name and info"]);
}

function ProductGetVersion(){
	return gLS_Version;
}

function ProductGetName(){
	return gLS_ProductName;
}

function ProductNameToString() {
	return "Application: " + ProductGetName();
}

function ProductVersionToString() {
	return "Version:" + ProductGetVersion();
}

function ProductToString() {
	return  ProductNameToString() + " " + ProductVersionToString();
}

function ProductPrintInfo() {
	log(ProductToString());
}

function IsLocalStorageSupported() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		HandleWarning("Local storage is not supported. Your setting will not be persisted")
		return false;
	}
}

function LocalStorageGet( key, defaultValue) {
	try {
		if( 'localStorage' in window && window['localStorage'] !== null ) {
			var tRet = localStorage.getItem(key);
			if(  tRet != undefined ) {
				return tRet;
			}
		}
	} catch (e) {
		HandleWarning("Local storage is not supported. Your setting will not be persisted")
	}
	return defaultValue;
}


function LocalStorageSet( key, value ) {
	try {
		log("Storing: " + key + "=" + value);
		if( IsLocalStorageSupported() ) {
			localStorage.removeItem(key)
			localStorage.setItem(key, value);
		}
	} catch (e) {
		HandleWarning("Local storage is not supported. Your setting will not be persisted")
	}
}


//-------------------------------
// Browser Support
//-------------------------------

function getIOSWindowHeight() {
    // Get zoom level of mobile Safari
    // Note, that such zoom detection might not work correctly in other browsers
    // We use width, instead of height, because there are no vertical toolbars :)
    var zoomLevel = document.documentElement.clientWidth / window.innerWidth;

    // window.innerHeight returns height of the visible area. 
    // We multiply it by zoom and get out real height.
    return window.innerHeight * zoomLevel;
};

// You can also get height of the toolbars that are currently displayed
function getHeightOfIOSToolbars() {
    var tH = (window.orientation === 0 ? screen.height : screen.width) -  getIOSWindowHeight();
    return tH > 1 ? tH : 0;
};

function IsSafari() {
	return /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
}

function IsIE(){
	var UA = navigator.userAgent.toLowerCase();
    if (UA.indexOf('msie') > -1) {
		return true;
	}else{
		return false;
	}
}

function IsFirefox(){
	var UA = navigator.userAgent.toLowerCase();
    if (UA.indexOf('firefox') > -1) {
		return true;
	}else{
		return false;
	}
}

function IsOpera(){
	var UA = navigator.userAgent.toLowerCase();
    if (UA.indexOf('opera') > -1) {
		return true;
	}else{
		return false;
	}
}

function IsChrome(){
	return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
}

function iOSversion() {
  if (/iP(hone|od|ad)/.test(navigator.platform)) {
    // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
    return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
  }
}

function DetectBrowserVersion(){
	var UA = navigator.userAgent.toLowerCase();
     
    var index;
	var browserVersion = 0;
    if (UA.indexOf('msie') > -1) {
	    index = UA.indexOf('msie');
		browserVersion = "" + parseFloat('' + UA.substring(index + 5));
    }
    else if (UA.indexOf('chrome') > -1) {
	    index = UA.indexOf('chrome');
        browserVersion = "" + parseFloat('' + UA.substring(index + 7));
    }
    else if (UA.indexOf('firefox') > -1) {
        index = UA.indexOf('firefox');
        browserVersion = "" + parseFloat('' + UA.substring(index + 8));
    }
    else if (UA.indexOf('safari') > -1) {
        index = UA.indexOf('safari');
        browserVersion = "" + parseFloat('' + UA.substring(index + 7));
    }
	
	return parseInt(browserVersion,10);
}

var IsMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod|Safari/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (IsMobile.Android() || IsMobile.BlackBerry() || IsMobile.iOS() || IsMobile.Opera() || IsMobile.Windows());
    }
};

function IsTouch() {
    return 'ontouchstart' in document.documentElement;
}

function GetBrowser(){

	// Is this a version of IE?
	if(IsIE()){
		return "IE";
	}

	// Is this a version of Chrome?
	if(IsChrome()){
		return "Chrome";
	}

	// Is this a version of Safari?
	if(IsSafari()){
		return "Safari";
	}

	// Is this a version of Mozilla?
	if(IsFirefox()){
		//Is it Firefox?
		if(navigator.userAgent.toLowerCase().indexOf('firefox') != -1){
			return "Firefox";
		}
		// If not then it must be another Mozilla
		else{
		}
	}

	// Is this a version of Opera?
	if(IsOpera()){
		return "Opera";
	}

}

function IsSupported(){
	if( IsSafari() ){
		if( IsMobile.iOS() ){
			return true;
		}else{
			if( DetectBrowserVersion() >= BrowserSupport["Safari"] ){
				return true;
			}else{
				return false;
			}
		}
	}else if( IsIE() ){
		if( DetectBrowserVersion() >= BrowserSupport["IE"] ){
				return true;
			}else{
				return false;
		}
	}else if( IsFirefox() ){
		if( DetectBrowserVersion() >= BrowserSupport["Firefox"] ){
				return true;
			}else{
				return false;
		}
	}else if( IsOpera() ){
		if( DetectBrowserVersion() >= BrowserSupport["Opera"] ){
				return true;
			}else{
				return false;
		}
	}else if( IsChrome() ){
		if( DetectBrowserVersion() >= BrowserSupport["Chrome"] ){
				return true;
			}else{
				return false;
		}
	}else{
	}
	return true;
}


//-------------------------------
// Error Message
//-------------------------------

function ToggleOverlay() {
	el = document.getElementById("overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}

function IsOverlayVisable(){
	el = document.getElementById("overlay");
	return (el.style.visibility == "visible") ? true : false;
}

//function ChangeBodyText( asText ){
//	el = $("#overlayContent #overlayBodyText");
//	$(el).html(asText);
//}

//function ChangeHeaderText( asText ){
//	el = $("#overlayContent #header pre");
//	$(el).html(asText);
//}


//function ChangeFooterText( asText ){
//	el = $("#overlayContent #footer pre");
//	$(el).html(asText);
//}

//function ChangeText( asTitle, asBody, asFooter ){

//	var toggle = false;

//	if( asTitle != undefined ){
//		ChangeHeaderText( asTitle );
//		toggle = true;
//	}
//	if( asBody != undefined ){
//		ChangeBodyText( asBody );
//		toggle = true;
//	}
//	if( asFooter != undefined ){
//		ChangeFooterText(asFooter);
//		toggle = true;
//	}

//	if( toggle && IsLogoVisible() ){
//		ToggleLogo();
//	}
//}

//function ClearText() {

//	ChangeHeaderText('');
//	ChangeBodyText('');
//	ChangeFooterText('');
	
//	if( !IsLogoVisible() ){
//		ToggleLogo();
//	}
	
//}

function ToggleLogo( ){
	el = document.getElementById("mBackground");
	el.style.display = (el.style.display == "inline-block") ? "none" : "inline-block";
}

function IsLogoVisible( ){
	el = document.getElementById("mBackground");
	return el.style.display = (el.style.display == "inline-block") ? true : false;
}

//function GetBodyText(){
//	return $("#overlayContent #overlayBodyText").text();
//}

//function GetHeaderText(){
//	return $("#overlayContent #header p").text();
//}

//function GetFooterText(){
//	return $("#overlayContent #footer p").text();
//}
	
function ChangeColor( asColor ){
	changeStyle("color", asColor);
}

function ChangeBackgroundColor( asColor ){
	changeStyle("background-color", asColor);
}

//function ChangeStyle( asStyle, asValue ){
//	el = $("#overlayContent");
//	$(el).css(asStyle, asValue);	
//}

//function AddCloseButton( aoFunction, asText  ){
//	var button = $('\n<a>'+((asText == undefined) ? 'Close' : asText)+'</a>');
//	$(button).prop('title', ((asText == undefined) ? 'Close' : asText)); 
//	button.click(function(){ aoFunction(); RemoveCloseButton(); });
//	button.addClass('button');
//	button.appendTo($('#overlayContent #footer'));
//}

//function RemoveCloseButton( ){
//	el = $("#overlayContent a");
//	$(el).remove();
//}

//$(window).resize(function() {
//	el = $("#overlayContent");
// 	$(el).css("top", window.innerHeight / 4);	
//});

//-------------------------------
// Misc
//-------------------------------

Array.prototype.unique = function() {
    var unique = [];
    for (var i = 0; i < this.length; i++) {
        if (unique.indexOf(this[i]) == -1) {
            unique.push(this[i]);
        }
    }
    return unique;
};

function SortUnique(aoArr) {
    aoArr = aoArr.sort(function (a, b) { return a*1 - b*1; });
    var roReturn = [aoArr[0]];
    for (var i = 1; i < aoArr.length; i++) { // start loop at 1 as element 0 can never be a duplicate
        if (aoArr[i-1] !== aoArr[i]) {
            roReturn.push(aoArr[i]);
        }
    }
    return roReturn;
}

function findInsertionPoint(sortedArr, val, comparator) {   
   var low = 0, high = sortedArr.length;
   var mid = -1, c = 0;
   while(low < high)   {
      mid = parseInt((low + high)/2);
      c = comparator(sortedArr[mid], val);
      if(c < 0)   {
         low = mid + 1;
      }else if(c > 0) {
         high = mid;
      }else {
         return mid;
      }
      //alert("mid=" + mid + ", c=" + c + ", low=" + low + ", high=" + high);
   }
   return low;
}

function log() {
	if (window.console && console.log) {
		// log for FireBug or WebKit console
		console.log(Array.prototype.slice.call(arguments)[0]);
	}
};

function FindDOMObjectLocation(tObject) {
    var tiX = tiY = 0;

    if (tObject.offsetParent) {
        do {
            tiX += tObject.offsetLeft;
            tiY += tObject.offsetTop;

        } while (tObject = tObject.offsetParent);
    }

    return [tiX,tiY];
}

function GetParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&;]" + name + "=([^&#;]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if(results == null)
        return undefined;
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}


function CreateAndFillArray( aoValue, aiLength ) {
    var tRet = new Array(aiLength);
    for( var i = 0 ; i < aiLength ; i++ )
        tRet[i] = aoValue;
    return tRet;
}

function DictionaryKeysToString( dictionary, separator ) {
	var tsRet = "";
	var tsSeparator = "";
	separator = separator != undefined ? separator : ", ";
	for( var key in dictionary ) {
		if( key != undefined )  {
			if( dictionary[key] != undefined ) {
				tsRet += tsSeparator + key;
				if( dictionary[key] != true ) {
					tsRet += "=" + dictionary[key].toString();
				}
				tsSeparator = separator;
			}
		}
	}
	return tsRet;
}

function ShallowCopyArray( aiArray ) {
    var tRet = undefined;
    if( aiArray != undefined && aiArray instanceof Array ) {
        tRet = new Array();
        for( var i = 0 ; i < aiArray.length ; i++ )
            tRet[i] = aiArray[i];

    }
    return tRet;
}

// Returns an array of loaded indices. Used for iteration
function GetIndicesArrayFromDictionary( aDictionary ) {
    var i = 0;
    var tRet = new Array();
    for( var tIndex in aDictionary ) {
        tRet[i++] = tIndex;
    }
    return tRet;
}

//-------------------------------
// Drawing
//-------------------------------

function DrawLine( oCtx, x0, y0, x1, y1 ) {
	oCtx.moveTo(x0, y0);
	oCtx.lineTo(x1, y1);
	oCtx.stroke();
}

function DrawHorLine( oCtx, x0, y, x1) {
	oCtx.moveTo(x0, y);
	oCtx.lineTo(x1, y);
	oCtx.stroke();
}

function DrawVertLine( oCtx, x, y0, y1) {
	oCtx.moveTo(x, y0);
	oCtx.lineTo(x, y1);
	oCtx.stroke();
}

// Return a fixed RGB color depending on level i.e. always same for level 0 etc

function DrawGetColorByLevel( iLevel ) {
	var tNumBaseLevels = 3;
	var tColorCycle = [ 1, 256, (1+256), 65536, (65536+1), (65536+256), (65536 + 256 + 1)]

	var tiRGB = 0;
	var tiCurrentIntensity = 60;{
		var tLSB = (iLevel % tNumBaseLevels) + 1;
		iLevel /= tNumBaseLevels;
		tiRGB += tiCurrentIntensity * tLSB * tColorCycle[iLevel%7];
		iLevel /= 7;
		tiCurrentIntensity /= 2;
	}
	while (iLevel > 0)

	return '#' + tiRGB.toString(16);
}


function DrawText( aCtx, asString, aiX, aiY, asFont, afFontSize, afTopJustified ) {
	if( asString != undefined && asString != "" ) {
	    afTopJustified = afTopJustified != undefined ? afTopJustified : true;
	    asFont = asFont != undefined ? asFont : "Courier";
	    afFontSize = afFontSize != undefined ? afFontSize : "16";

	    aCtx.font = afFontSize + "px " + asFont;

	    var tLines = asString.toString().split("\n");

	    afFontSize+=2;

	    var tY = afFontSize + aiY + (afTopJustified ?  0 : (-tLines.length) * afFontSize);
	    for( var tiLine = 0 ; tiLine < tLines.length ; tiLine++) {
	        //console.log( "X=" + aiX + " Y=" + tY + "Line=" +tLines[tiLine]);
	        aCtx.fillText(tLines[tiLine], aiX, tY);
	        tY+=afFontSize;
	    }
	}
}

function DrawCircle( oCtx, x, y, radius ){
		
		oCtx.save();
		oCtx.beginPath();
        oCtx.arc(x, y, radius, 0, 2 * Math.PI, false);
        oCtx.fillStyle = 'rgba(255, 255, 255, 0)';
        oCtx.fill();
        oCtx.lineWidth = 5;
        oCtx.strokeStyle = '#003300';
        oCtx.stroke();
		oCtx.restore();
}

//-------------------------------
// Help
//-------------------------------

gLS_HelpTopics = undefined;

function HelpInitialize() {
	gLS_HelpTopics = new Array();

	HelpAdd2Topic( "Topic", "Description")
	HelpAdd2Topic( "Copyright", "The Livescribe Pencast Player is Copyright 2012 by Livescribe Inc.")

	var tTableWriter = new TableWriter( 3, 100, "Useful function calls","-", " ")
	tTableWriter.Add(["Command", "Shorthand", "Parameters", "Description"]);
	HelpAdd2Topic( "Commands", tTableWriter );

	HelpAddCommand(["Commands()", "C()", "none", "Displays a list of useful functions"]);
	HelpAddCommand(["Help()", "H()", "search string", "The help database will be searched for topics matching the search string"]);
}

function IsHelpInitialized() {
	return /*ENABLE_DEBUG &&*/ gLS_HelpTopics != undefined;
}

function HelpAddCommand( gLineArray ) {
	if( IsHelpInitialized() ) {
	HelpAdd2Topic("Commands", gLineArray);
	HelpAdd2Topic(gLineArray[0], gLineArray[3] + ". Aliases: " + gLineArray[1] + " Parameters: " + gLineArray[2]);
	var tAliases = gLineArray[1].split(" ");
	for( var i = 0 ; i < tAliases.length ; i++ ) {
		HelpAdd2Topic(tAliases[i], gLineArray[3] + ". Aliases: " + gLineArray[0] + " " + gLineArray[1].replace(tAliases[i],"") + " Parameters: " + gLineArray[2]);
	}
}
}

function HelpAdd2Topic( sTopic, sValue ) {
	if(IsHelpInitialized() ) {
		var tsTopic = gLS_HelpTopics[sTopic];
		if( tsTopic == undefined ) {
			gLS_HelpTopics[sTopic] = sValue;
		} else {
			if( tsTopic instanceof TableWriter ) {
				gLS_HelpTopics[sTopic].Add(sValue);
			} else {
				gLS_HelpTopics[sTopic] += "\n" + sValue;
			}
		}
	}
}
function HelpAdd2ArrayOfTopics( helpArray  ) {
	if( IsHelpInitialized() ) {
	for( var tTopic = 0 ; tTopic < helpArray.length ; tTopic+=2 ) {
		//console.log(helpArray[tTopic] +"="+helpArray[tTopic+1]);
		HelpAdd2Topic(helpArray[tTopic], helpArray[tTopic+1]) ;
	}
}
}

function Help( sWhat ) {
	if( IsHelpInitialized() ) {
		if( sWhat == undefined ) {
			log("Help for " + ProductNameToString()+"\n\n");
			log('Call Help() with a string to find a topic or command. Example: H("Bandwidth")');
			//function TableWriter( aiDefaultMinimumColumnWidth, aiDefaultMaxColumnWidth, asTitle, abRowNumbers, asColumnSeparator, asLineSeparator, asTitleBoxFill, aiFreqOfRowSeparators,aiMaxCols  ) {
			var toTableWriter = new TableWriter(5,100,"----- Help Topics ------", true, " ", " ", " ", 4);
			for( var sTopic in gLS_HelpTopics) {
				if( sTopic.indexOf("(") == -1 && sTopic.indexOf("Debugmask ") == -1) {
					var tsContents = gLS_HelpTopics[sTopic].toString(true);
					tsContents = tsContents.replace(/\W{2,}/g, ". ");
					toTableWriter.Add( [sTopic,tsContents]);
				}
			}
			log(toTableWriter.toString());
		} else {
			// Parameter what is the search term.. Go find it
			var tSearchTerms = String2Array( sWhat.toUpperCase() );
			if( tSearchTerms.length != 0) {

				var tsBestTopic = undefined;
				var tiBestFrequency = 0;
				var tiBestFrequency = 0;

				for( var sCurrentTopic in gLS_HelpTopics) {
					var tTopicWords = String2Array(sCurrentTopic.toUpperCase());
					var sTopicDescr = gLS_HelpTopics[sCurrentTopic].toString().toUpperCase();
					var tiTopicValue = 0;
					var tiNumberOfTopicHits = 0;
					var tiDescriptionValue = 0;

					for( var i = 0 ; i < tSearchTerms.length ; i++) {
				        var tsTerm = tSearchTerms[i];

						var tiTopicWeight = 1000;
						var tiDescriptionWeight = 1;
						if( tsTerm.charAt(0) == "-" ) {
							tsTerm = tsTerm.substring(1);
							tiTopicWeight = -10000;
							tiDescriptionWeight = -10;
						}

						for( var j = 0 ; j < tTopicWords.length ; j++ ) {
							if( tTopicWords[j].indexOf(tsTerm) >= 0 ) {
								tiTopicValue += tiTopicWeight * (tsTerm.length / tTopicWords[j].length);
								tiNumberOfTopicHits++;
							}
						}

						if( sTopicDescr.indexOf(tsTerm) >= 0 ) {
							tiDescriptionValue += tiDescriptionWeight;
						}
					}

					var tiTopicFrequency = tiTopicValue * tiNumberOfTopicHits + tiDescriptionValue;
					if( tiTopicFrequency > tiBestFrequency ) {
						tiBestFrequency = tiTopicFrequency;
						tsBestTopic = sCurrentTopic;
					}
				}

				if( tiBestFrequency > 0 ) {
					log("Topic: " + tsBestTopic + "\n\n" + gLS_HelpTopics[tsBestTopic]);
				} else {
					log("Sorry no topic found matching the search string");
				}

			} else {
				log("Help topics needs to be a separated list of keywords");
			}
		}
	} else {
		HandleWarning("Please call InitializeHelp() before");
	}
}

function Commands() {
	if( IsHelpInitialized() ) {
		log( gLS_HelpTopics["Commands"].toString() );
	}
}

//-------------------------------
// Commmand line shorthands
//-------------------------------

function H( sWhat ) {
	Help( sWhat );
}

function DebugOffTestAndWarn() {
	if( !IsDebugOn() ) {
		log('Debugging is off. Turn it on by calling M("on")');
	}
}


function E() {
	PrintErrorStatistics();
	DebugOffTestAndWarn();
}

function D( iToggleValue, value ) {
	DebugStatus( iToggleValue, value );
	DebugOffTestAndWarn();
}

function M( sMasks ) {
	if( sMasks == undefined ) {
		log("Please specify deubgmasks to enable/disable mask");
		return
	}
	var tsRet = DebugModMasksFromString( sMasks );
	if( tsRet.length >  0  ) {
		DebugStoreEnabledMasks();
	}
}


function B() {
	BandwidthCounterPrint();
	DebugOffTestAndWarn();
}

function V() {
	ProductPrintInfo();
}

function C() {
	Commands();
}


