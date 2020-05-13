sap.ui.define(
	[
		'sap/ui/core/mvc/Controller'
	],
	function (Controller) {
	"use strict";

	return Controller.extend("homberger.weatherapp.controller.settings", {

		oRouter: null,

		onInit: function(){
			this.oRouter = this.getOwnerComponent().getRouter();
		},

		onNavToWeather : function() {
			if(this.oRouter){
				this.oRouter.navTo("weather");
			}
		},

		/*
		onSliderMovePictureCarousel: function (oEvent) {

			var that = this;

			//Move picture carousel forward every n seconds
			clearInterval(this.movePictureCarousel);
			this.movePictureCarousel = setInterval(function(){
				var car = that.getView().byId("carousel");
				car.next();
			}, this.getView().getModel("settings").getProperty("/show/picture/value") * 1000);

		},

		onSliderMoveChartCarousel: function (oEvent) {

			var that = this;

			//Move chart carousel forward every n seconds
			clearInterval(this.moveChartCarousel);
			this.moveChartCarousel = setInterval(function(){
				var car = that.getView().byId("carouselHistory");
				car.next();
			}, this.getView().getModel("settings").getProperty("/show/chart/value") * 1000);

		}
		*/
	});

});
