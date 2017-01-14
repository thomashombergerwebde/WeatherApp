sap.ui.define([], function () {
	"use strict";
	return {
		temperature: function (sTemperature, sId, sThreshold) {
			
			if(sTemperature && sTemperature != "--"){
				//hasStyleClass, addStyleClass, removeStyleClass
				if(sId){
				  var field = this.byId(sId);
				  if(field && sTemperature >= sThreshold){
					field.removeStyleClass("temperatureCold");  
				    field.addStyleClass("temperatureWarm");
				  } else {
					field.removeStyleClass("temperatureWarm");  
				  	field.addStyleClass("temperatureCold");
				  }
				}
				return sTemperature + "°";
			} else {
				return "--";
			}			
		},

		humidity: function (sHumidity) {
			
			if(sHumidity && sHumidity != "--"){
				return sHumidity + "%";
			} else {
				return "--";
			}
		},

		date: function (sDate) {
	
			//get name of month
			var month= "";
			switch (sDate.getMonth()) {
			    case 0:
			        month = "Januar";
			        break;
			    case 1:
			        month = "Februar";
			        break;
			    case 2:
			        month = "März";
			        break;
			    case 3:
			        month = "April";
			        break;
			    case 4:
			        month = "Mai";
			        break;
			    case 5:
			        month = "Juni";
			        break;
			    case 6:
			        month = "Juli";
			        break;
			    case 7:
			        month = "August";
			        break;
			    case 8:
			        month = "September";
			        break;
			    case 9:
			        month = "Oktober";
			        break;
			    case 10:
			        month = "November";
			        break;
			    case 11:
			        month = "Dezember";
			} 	
			
			//get day of week
			var day = "";
			switch (sDate.getDay()) {
			    case 0:
			        day = "Sonntag";
			        break;
			    case 1:
			        day = "Montag";
			        break;
			    case 2:
			        day = "Dienstag";
			        break;
			    case 3:
			        day = "Mittwoch";
			        break;
			    case 4:
			        day = "Donnerstag";
			        break;
			    case 5:
			        day = "Freitag";
			        break;
			    case 6:
			        day = "Samstag";
			} 
			
			return day + ", " + sDate.getDate() + ". " + month + " " + sDate.getFullYear();
		},		
		
		time: function (sDate) {

			//make hours always having two digits
			var hours = "0" + sDate.getHours();
			hours = hours.slice(-2);

			//make minutes always having two digits
			var minutes = "0" + sDate.getMinutes();
			minutes = minutes.slice(-2);
			
			return hours + ":" + minutes;
		}		
	};
});