/***************************************************************
 * @license Copyright Â© 2007-2013 Livescribe, Inc. All rights reserved.
 **************************************************************/

function PageImage(aImageJSON, asImageUrl, asTemplate) {
    this.mId = aImageJSON.imageId;
    this.mX = ParseToAU(aImageJSON.x);
    this.mY = ParseToAU(aImageJSON.y);
    this.mWidth = ParseToAU(aImageJSON.width);
    this.mHeight = ParseToAU(aImageJSON.height);
    this.mUrl = asImageUrl + "/image/" + this.mId + ".png.txt";
    this.msCache = "true";
	if( !DebugIsMaskOn("SERVICESELECTOR") ) {
	    this.mUrl = asImageUrl + "/image/" + this.mId + ".txt";
	}else{
	    this.mUrl = asImageUrl + "/image/" + this.mId + ".png.txt";
	}
	//this.texture = new Image();
	//this.texture.src = '../../WebContent/images/player/texture.png';

    if( DebugIsMaskOn("NOCACHE")) {
        this.msCache = "false";
    }

	var tThis = this;
    this.mTemplate = asTemplate;

	this.mMipMap = undefined;

    // Starts loading image too.. see bottom of file for more constructor code

    this.DrawImage = function(aContext,  aiZoomedCanvasWidth, aiTemplateX, aiTemplateY, aiTemplateWidth, aiTemplateHeight) {
        if( this.mMipMap != undefined ) {
            var imagePixelSizeFactor = this.mWidth / aiTemplateWidth;
				var tImage = this.mMipMap.GetImage( aiZoomedCanvasWidth * imagePixelSizeFactor);
				try{
					aContext.drawImage(tImage, this.mX - aiTemplateX , this.mY - aiTemplateY, this.mWidth, this.mHeight );
				}catch(err){
				
				}
        }
    };

    this.DecodeImageData = function(aData) {
	    tThis.mMipMap = new MipMap( 'data:image/png;base64,' + aData, tThis.mTemplate );
    };
    
    this.HandleError = function(xhr, aStatus, aError) {
        HandleError('Error: Unable to Load Image: ' + this.url + " error is:" + aError);
	};

    this.DecodeImageData(aImageJSON.file.data);

	this.toString = function( indent ) {
		var tsImageStatus = "Not loaded";
		if( this.mMipMap != undefined ) {
			tsImageStatus = this.mMipMap.toString();
		}
		return  "Id: " + this.mId + " X: " + this.mX + " Y:" + this.mY + " Size: " + this.mWidth + " x " + this.mHeight + " (" + tsImageStatus + ")";
	}
}