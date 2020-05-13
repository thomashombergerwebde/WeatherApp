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

		onSliderMovePictureCarousel: function (oEvent) {
			/*
			var that = this;

			//Move picture carousel forward every n seconds
			clearInterval(this.movePictureCarousel);
			this.movePictureCarousel = setInterval(function(){
				var car = that.getView().byId("carousel");
				car.next();
			}, this.getView().getModel("settings").getProperty("/show/picture/value") * 1000);
            */
			var settings = localStorage.getItem("settings");
			var oSettings = JSON.parse(settings);
			oSettings.show.picture.value = oEvent.getParameter("value");
			settings = JSON.stringify(oSettings);
			localStorage.setItem("settings", settings);
		},

		onSliderMoveChartCarousel: function (oEvent) {
			/*
		 	var that = this;

			//Move chart carousel forward every n seconds
			clearInterval(this.moveChartCarousel);
			this.moveChartCarousel = setInterval(function(){
				var car = that.getView().byId("carouselHistory");
				car.next();
			}, this.getView().getModel("settings").getProperty("/show/chart/value") * 1000);
		 	*/
			var settings = localStorage.getItem("settings");
			var oSettings = JSON.parse(settings);
			oSettings.show.chart.value = oEvent.getParameter("value");
			settings = JSON.stringify(oSettings);
			localStorage.setItem("settings", settings);
		},

		onSliderChangeTemperatureIndoorColor: function (oEvent) {
			var settings = localStorage.getItem("settings");
			var oSettings = JSON.parse(settings);
			oSettings.threshold.temperature.indoor.value = oEvent.getParameter("value");
			settings = JSON.stringify(oSettings);
			localStorage.setItem("settings", settings);
		},

		onSliderChangeTemperatureOutdoorColor: function (oEvent) {
			var settings = localStorage.getItem("settings");
			var oSettings = JSON.parse(settings);
			oSettings.threshold.temperature.outdoor.value = oEvent.getParameter("value");
			settings = JSON.stringify(oSettings);
			localStorage.setItem("settings", settings);
		},

		onSliderChangeHumidityIndoorColor: function(oEvent) {
			var settings = localStorage.getItem("settings");
			var oSettings = JSON.parse(settings);
			oSettings.threshold.humidity.indoor.range[0] = oEvent.getParameter("range")[0];
			oSettings.threshold.humidity.indoor.range[1] = oEvent.getParameter("range")[1];
			settings = JSON.stringify(oSettings);
			localStorage.setItem("settings", settings);
		},

		onSliderChangeHumidityOutdoorColor: function(oEvent) {
			var settings = localStorage.getItem("settings");
			var oSettings = JSON.parse(settings);
			oSettings.threshold.humidity.outdoor.range[0] = oEvent.getParameter("range")[0];
			oSettings.threshold.humidity.outdoor.range[1] = oEvent.getParameter("range")[1];
			settings = JSON.stringify(oSettings);
			localStorage.setItem("settings", settings);
		}
	});
});
