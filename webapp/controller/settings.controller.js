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
		}

	});

});
