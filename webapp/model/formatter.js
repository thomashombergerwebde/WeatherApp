sap.ui.define([], function () {
	"use strict";
	return {
		temperature: function (sTemperature, sId, sThreshold) {
			
			var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(sTemperature && sTemperature != oBundle.getText("nullValue")){
				//hasStyleClass, addStyleClass, removeStyleClass
				if(sId){
				  var field = this.byId(sId);
				  if(field && Number(sTemperature) >= Number(sThreshold)){
					field.removeStyleClass("text");    
					field.removeStyleClass("temperatureCold");  
				    field.addStyleClass("temperatureWarm");
				  } else {
					field.removeStyleClass("text");  
					field.removeStyleClass("temperatureWarm");  
				  	field.addStyleClass("temperatureCold");
				  }
				}
				return sTemperature.toLocaleString() + oBundle.getText("temperatureDegree");
			} else {
				return oBundle.getText("nullValue");
			}			
		},

		humidity: function (sHumidity) {

			var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		
			
			if(sHumidity && sHumidity != oBundle.getText("nullValue")){
				return sHumidity.toLocaleString() + oBundle.getText("humidityPercent");
			} else {
				return oBundle.getText("nullValue");
			}
		},

		date: function (sDate) {
	
	        if(!sDate){
				return;
			}
	
			var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			//get name of month
			var month= "";
			switch (sDate.getMonth()) {
			    case 0:
			        month = oBundle.getText("january");
			        break;
			    case 1:
			        month = oBundle.getText("february");
			        break;
			    case 2:
			        month = oBundle.getText("march");
			        break;
			    case 3:
			        month = oBundle.getText("april");
			        break;
			    case 4:
			        month = oBundle.getText("may");
			        break;
			    case 5:
			        month = oBundle.getText("june");
			        break;
			    case 6:
			        month = oBundle.getText("july");
			        break;
			    case 7:
			        month = oBundle.getText("august");
			        break;
			    case 8:
			        month = oBundle.getText("september");
			        break;
			    case 9:
			        month = oBundle.getText("october");
			        break;
			    case 10:
			        month = oBundle.getText("november");
			        break;
			    case 11:
			        month = oBundle.getText("december");
			} 	
			
			//get day of week
			var day = "";
			switch (sDate.getDay()) {
			    case 0:
			        day = oBundle.getText("sunday");
			        break;
			    case 1:
			        day = oBundle.getText("monday");
			        break;
			    case 2:
			        day = oBundle.getText("tuesday");
			        break;
			    case 3:
			        day = oBundle.getText("wednesday");
			        break;
			    case 4:
			        day = oBundle.getText("thursday");
			        break;
			    case 5:
			        day = oBundle.getText("friday");
			        break;
			    case 6:
			        day = oBundle.getText("saturday");
			} 
			
			var date = day + ", " + sDate.getDate() + ". " + month + " " + sDate.getFullYear();
			return date;
		},		
		
		time: function (sDate) {

		    if(!sDate){
				return;
			}
		
			//make hours always having two digits
			var hours = "0" + sDate.getHours();
			hours = hours.slice(-2);

			//make minutes always having two digits
			var minutes = "0" + sDate.getMinutes();
			minutes = minutes.slice(-2);
			
			var time = hours + ":" + minutes;
			return time;
		}		
	};
});