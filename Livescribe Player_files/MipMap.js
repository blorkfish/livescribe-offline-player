/***************************************************************
 * @license Copyright Â© 2007-2013 Livescribe, Inc. All rights reserved.
 **************************************************************/

function MipMap( aImageDataSource, oTemplate) {

	this.mMipMaps = new Array();

    this.mTemplate = oTemplate;

    this.mSourceImage = new Image();
    this.mSourceImage.src = aImageDataSource;

    var tThat = this;
	this.mSourceImage.onload = function() {
        tThat.GenerateMipMaps();
        tThat.mTemplate.moPencast.PageTemplateDataLoaded( tThat.mTemplate );
    };

	this.IsGenerated = function() {
		return this.mMipMaps.length > 1;
	};

    this.GenerateMipMaps = function () {
        if( this.IsGenerated() ) {
            return;
        }

        this.mMipMaps.push(this.mSourceImage);

        var currentWidth = this.mSourceImage.width;
        var currentHeight = this.mSourceImage.height;

       // Debug("Generating mip maps from " +  this.mSourceImage.src + "width=" + currentWidth + "px, height=" + currentHeight + "px","RENDERING");

        var tOldCanvas = document.createElement('canvas');
        tOldCanvas.width = currentWidth;
        tOldCanvas.height = currentHeight;
        var tCtx = tOldCanvas.getContext('2d');

        tCtx.drawImage( this.mSourceImage, 0, 0, currentWidth, currentHeight);

        var imageData, data;
        var oldImageData = tCtx.getImageData(0,0,currentWidth,currentHeight);
        var oldData = oldImageData.data;

        // If you want to know what this code does.. GOOGLE MIP MAPPING

        while( currentWidth > 4 && currentHeight > 4 ) {
            var oldStride = currentWidth * 4;
            currentWidth = Math.floor(currentWidth/2);
            currentHeight = Math.floor(currentHeight/2);

           // Debug("Generating mip map width=" + currentWidth + "px, height=" + currentHeight + "px","RENDERING");

            var tCanvas = document.createElement('canvas');
            tCanvas.width = currentWidth;
            tCanvas.height = currentHeight;
            var tCtx = tCanvas.getContext('2d');

            imageData = tCtx.getImageData( 0, 0, currentWidth, currentHeight );
            data = imageData.data;

            var i = 0;
            for( var y = 0 ; y < currentHeight ; y++ ) {
                var oldPtr1 = 2 * y * oldStride;
                var oldPtr2 = oldPtr1 + oldStride;

                for( var x = 0 ; x < currentWidth ; x++ ) {
                    data[i++] = Math.floor( (oldData[oldPtr1+0] + oldData[oldPtr1+4] + oldData[oldPtr2+0] + oldData[oldPtr2+4] ) / 4);
                    data[i++] = Math.floor( (oldData[oldPtr1+1] + oldData[oldPtr1+5] + oldData[oldPtr2+1] + oldData[oldPtr2+5] ) / 4);
                    data[i++] = Math.floor( (oldData[oldPtr1+2] + oldData[oldPtr1+6] + oldData[oldPtr2+2] + oldData[oldPtr2+6] ) / 4);
                    data[i++] = Math.floor( (oldData[oldPtr1+3] + oldData[oldPtr1+7] + oldData[oldPtr2+3] + oldData[oldPtr2+7] ) / 4);
                    oldPtr1 += 8;
                    oldPtr2 += 8;
                }
            }

            tCtx.putImageData(imageData, 0,0);
            var img = new Image(currentWidth, currentHeight);
            img.src = tCanvas.toDataURL();

            this.mMipMaps.push(img);

            oldData = data;
        }

        Debug("Done Generating " + this.mMipMaps.length + " mip maps","RENDERING");
    }

    this.GetMipMapLevel = function( aiTargetPixelWidth ) {

       if( DebugIsMaskOn("NOMIPMAP") ) {
           return 0;
       }

       aiTargetPixelWidth*=1.2;    // Pretty arbitrary constant. Higher = switch to higher lower res later. Cause more flickering

        for( var i = 0; i < this.mMipMaps.length-1; i++ ) {
            if( this.mMipMaps[i].width <= aiTargetPixelWidth ) {
                break;
            }
        }

        return i;
    }

    this.GetImage = function( aiTargetPixelWidth ) {
		if ( this.mMipMaps.length == 0) {
			return new Image();
		}

		return this.mMipMaps[this.GetMipMapLevel(aiTargetPixelWidth)];
	}

	this.toString = function() {
		return this.mMipMaps.length + " MIP maps";
	};
}