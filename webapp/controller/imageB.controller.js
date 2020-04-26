sap.ui.define(
	[
		'sap/ui/core/mvc/Controller',
		'sap/m/Image'
	],
	function (Controller, Image) {
	"use strict";

	return Controller.extend("homberger.weatherapp.controller.imageB", {

		oRouter: null,
		movePicture: null,

		onInit: function(){

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("imageB").attachPatternMatched(function(oEvent){

				var image = this.getView().byId("Image");

				var currentImage = this.getView().getModel("images").getProperty("/currentImage");
				var selectedImages = this.getView().getModel("images").getProperty("/selectedImages");

				var index = selectedImages.findIndex(function(img){
					return img == this.getView().getModel("images").getProperty("/currentImage");
				}, this);

				index < selectedImages.length-1 ? index++ : index = 0;

				this.getView().getModel("images").setProperty("/currentImage", selectedImages[index])
				image.setSrc(this.getView().getModel("images").getProperty("/currentImage"));

				//Move picture forward in n seconds
				this.movePicture = setTimeout(function(){
					this.oRouter.navTo("imageA", {
						source: "imageB"
					});
				}.bind(this), this.getView().getModel("settings").getProperty("/show/picture/value") * 1000);

			}, this);
		},

		onImageLoaded: function(oEvent) {
			//Do nothing here except for checking the original image size
			var oImage = oEvent.getSource();
			var oDomRef = oImage.getDomRef()
			var width = oDomRef .width;
			var height = oDomRef .height;
			var	naturalWidth  = oDomRef .naturalWidth;
			var naturalHeight = oDomRef .naturalHeight;
		},

		onNavToWeather : function() {
			if(this.oRouter){
				clearTimeout(this.movePicture);
				this.oRouter.navTo("weather");
			}
		}

	});

});
