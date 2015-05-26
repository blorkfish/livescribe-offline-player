/***************************************************************
 * @license Copyright © 2007-2013 Livescribe, Inc. All rights reserved.
 **************************************************************/

function PageTemplate(ajResponse, aoRESTLoader, aiIndex, aoPencast) {

    this.moPageImages = new Array();

    if( ajResponse == undefined ) {
        this.mId = 0;
        this.mX = 0;
        this.mY = aiIndex;
        this.mWidth = 8000;
        this.mHeight = 10000;
    }  else {
        this.mId = parseFloat(ajResponse.id);

        if( aiIndex != this.mId ) {
            HandleError("PageTemplate: We were expecting id = " + aiIndex + " but got " + this.mId + "back");
        }

        this.mX = ParseToAU(ajResponse.x);
        this.mY = ParseToAU(ajResponse.y);
        this.mWidth = ParseToAU(ajResponse.width);
        this.mHeight = ParseToAU(ajResponse.height);
        this.moPencast = aoPencast;
	    //console.log(this);


        var tsBaseURL = aoRESTLoader.GetURLFromIndex(this.mId);

        for( var i in ajResponse.imageList) {
            this.moPageImages[i] = new PageImage(ajResponse.imageList[i], tsBaseURL, this );
        }
    }

    this.PageTemplateDataLoaded = function() {
        aoPencast.PageTemplateDataLoaded(this);
    }

    this.GetAspectRatio = function() {
        return this.mWidth/this.mHeight;
    }



    this.DrawImages = function( aContext, aiZoomedCanvasWidth ) {
        for( var i = 0 ; i < this.moPageImages.length ; i++ ) {
            this.moPageImages[i].DrawImage( aContext, aiZoomedCanvasWidth, this.mX, this.mY, this.mWidth, this.mHeight);
        }
    }


    this.toString = function( indent ) {
	    indent = indent != undefined ? indent : "";
        return indent + "Template: Id: " + this.mId + "\n" +
	     indent + "Dimensions: X: " + this.mX + " Y: " + this.mY + " Size: " + this.mWidth + " x " + this.mHeight + "\n" + ArrayToString( this.moPageImages, "Images", indent );

    };
}
