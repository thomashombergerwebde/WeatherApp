sap.ui.define(
	[
		'sap/ui/core/mvc/Controller'
	],
	function (Controller) {
	"use strict";

	return Controller.extend("homberger.weatherapp.controller.app", {

		onInit: function(){
			this.getOwnerComponent().getRouter().initialize();
			this.getOwnerComponent().getRouter().navTo("weather");
		}

	});

});
