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
		
		trend: function(sTemperature, sAverage){
			
		   /* if(!sTemperature || !sAverage){
			  return;
           }

           if(sTemperature === "--"){
			   return;
		   }		 */   
			
		   var oIcon = this.getView().byId("iconTemperatureOutdoorTrend");
		   
		   var delta     = this.getView().getModel().getData().temperatureOutdoorDelta;
		   var lastDelta = this.getView().getModel().getData().temperatureOutdoorLastDelta;
		   var difference = Number(lastDelta) - Number(delta);
		   
		   if(delta === undefined || delta === "--"){
			   oIcon.setSrc("sap-icon://arrow-right");	
			   return;
		   }
		   
		   if(difference < -1.2){
		   oIcon.setSrc("sap-icon://arrow-bottom");	
              return;			  
		   } 
		   if(difference < -0.15){
			  oIcon.setSrc("sap-icon://trend-down");	
			  return;
		   } 		   
		   if(difference < 0.15){
			  oIcon.setSrc("sap-icon://arrow-right");	
			  return;
		   } 		   
		   if(difference < 1.2){	
			  oIcon.setSrc("sap-icon://trend-up");				  
			  return;
		   } 		   
		   oIcon.setSrc("sap-icon://arrow-top");	
		}
	
	};
});