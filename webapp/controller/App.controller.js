sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/wt/model/formatter",
	"sap/ui/commons/Image",
   "sap/ui/model/resource/ResourceModel"
], function (Controller, JSONModel, formatter, Image, ResourceModel) {
	"use strict";

	return Controller.extend("sap.ui.demo.wt.controller.App", {

		formatter: formatter,
		
		carousel: null,
		
		_getCurrentDate: function(){			
			var newDate = new Date();	
			var year = newDate.getFullYear();
			var month = newDate.getMonth() + 1;
			var date = newDate.getDate();
		    var dateString = year + "/" + month + "/" + date; 
            return dateString;			
		},
		
		onInit: function(){
			
			var temperatureOutdoorHistory = [];
			
			var that = this;		
		
            //Set initial values for the default model		
		    var oModelLocalWeather = this.getOwnerComponent().getModel();
		    oModelLocalWeather.setData({
					temperatureIndoor: "--",
					temperatureIndoorId: "temperatureIndoorId",
					temperatureOutdoor: "--",
					temperatureOutdoorId: "temperatureOutdoorId",
					temperatureOutdoorAverage: "--",
					temperatureOutdoorDelta: "0",
					temperatureOutdoorLastDelta: "0",
					humidityIndoor: "--",
					humidityOutdoor: "--",
					minDate: new Date(2000, 0, 1),
					maxDate: new Date(2050, 11, 31),
					currentTime: new Date(),
					dateTimeDasWetterDe: new Date()
			});
		    //set current date in yyyy/mm/dd format for automatic conversion on UI
		    oModelLocalWeather.setProperty("/currentDate", this._getCurrentDate()); 
		
		    //Set initial values for the settings model 
			var oModelInternalSettings = this.getOwnerComponent().getModel("internalSettings");
			oModelInternalSettings.setData({
			  showImageForNSeconds: "10",
			  temperatureThresholdIndoor: "22",
			  temperatureThresholdOutdoor: "20",
			  pathSensorData: "/Arexx/messung.json",
			  updateSensorDataAllNSeconds: "60",
			  updateForecastDataAllNHours: "2"
			});
			
            //Transfer settings data to relevant controls			
			oModelInternalSettings.attachRequestCompleted(function(oEvent){               			      
			   			   
			  //Update carousel interval
			  clearInterval(this.carousel);
			  this.carousel = setInterval(function(){ 
				var car = that.getView().byId("carousel");
				car.next();
			  }, (oEvent.getSource().getData().showImageForNSeconds * 1000));
			}, this);
			
			//Read settings data from file system
			oModelInternalSettings.loadData("../webapp/settings/internalSettings.json");			
		
            //Define callback functions to transfer sensor data to default model  		
			var oModelSensorData = this.getOwnerComponent().getModel("sensorData");
			oModelSensorData.attachRequestCompleted(function(oEvent){
				//Transfer sensor data to local weather model
				var aSensorData = oModelSensorData.getData();
				aSensorData.forEach(function(item){
					var average   = 0;
					var delta     = 0;
					var temperatureOutdoorAverage = 0;
					
					if(item.ID === this.getOwnerComponent().getModel("internalSettings").getData().sensorIdIndoor && item.TYPE === "1"){
						oModelLocalWeather.setProperty("/temperatureIndoor", Number(item.VALUE).toFixed(1));
					}  
					if(item.ID === this.getOwnerComponent().getModel("internalSettings").getData().sensorIdIndoor && item.TYPE === "3"){
						oModelLocalWeather.setProperty("/humidityIndoor", Number(item.VALUE).toFixed(1));	  		
					} 
					if(item.ID === this.getOwnerComponent().getModel("internalSettings").getData().sensorIdOutdoor && item.TYPE === "1"){
						
						if(oModelLocalWeather.getProperty("/temperatureOutdoor") != "--"){ 
							temperatureOutdoorHistory.push(oModelLocalWeather.getProperty("/temperatureOutdoor"));
						}
						if(temperatureOutdoorHistory.length > 10){
							temperatureOutdoorHistory.shift();
						}
						if(temperatureOutdoorHistory.length > 0){
							for (var i = 0; i < temperatureOutdoorHistory.length; i++) { 
								average += Number(temperatureOutdoorHistory[i]);
							}
							average = average / temperatureOutdoorHistory.length;
							oModelLocalWeather.setProperty("/temperatureOutdoorAverage", Number(average).toFixed(1));
							
							delta = oModelLocalWeather.getData().temperatureOutdoorDelta;
							oModelLocalWeather.setProperty("/temperatureOutdoorLastDelta", delta);
							
							delta = Number(item.VALUE).toFixed(1) - average;
							delta = Math.abs(delta);
							
							oModelLocalWeather.setProperty("/temperatureOutdoorDelta", delta.toFixed(1));	
							
						}						
						oModelLocalWeather.setProperty("/temperatureOutdoor", Number(item.VALUE).toFixed(1));
					}
					if(item.ID === this.getOwnerComponent().getModel("internalSettings").getData().sensorIdOutdoor && item.TYPE === "3"){
						oModelLocalWeather.setProperty("/humidityOutdoor", Number(item.VALUE).toFixed(1));
					}
				}, this);
			  }, this);

			  oModelSensorData.loadData(oModelInternalSettings.getData().pathSensorData);			  
			  			  
			  //Set images
			  //TODO read image files from a selected directory
			  var images = [];
			  images.push("./images/focus-750-performance_613564.jpg",
						  "./images/focus-750-performance_613565.jpg"
			  );

			  //Assign images to carousel
			  var carousel = this.getView().byId("carousel");
			  if(carousel){
				carousel.removeAllPages();
				images.forEach(function(item, index){
				  var imageId = "image" + index;
				  var image = new Image(imageId);
				  image.setSrc(item);
				  //set dimensions according to dasWetter.com widget
				  image.setWidth("777px");
				  image.setHeight("437px");
				  that.getView().byId("carousel").addPage(image);
				 });
			  }

			  //Carousel
			  this.carousel = setInterval(function(){ 
				var car = that.getView().byId("carousel");
				car.next();
			  }, (oModelInternalSettings.getData().showImageForNSeconds * 1000));
			  
			  //Clock - update every second
			  var currentTime = setInterval(function(){ 
				var date = new Date();					
                var oModel = that.getView().getModel();
						
				//Update binding every 10 seconds for relative time of weather forecast
				if(date.getSeconds()%10 === 0){
					oModel.updateBindings(true);
				}
				
				//Set clock time every minute
				if(date.getSeconds() === 0){					
					oModel.setProperty("/currentTime", date);	  	    
					//Set date only at midnight
					if(date.getHours() === 0 && date.getMinutes() === 0){  	
						//set current date in yyyy/mm/dd format for automatic conversion on UI
						oModel.setProperty("/currentDate", this._getCurrentDate()); 											
					}	
				}
			  }, 1000);
			  			  
			  //Sensor data - update every n minutes
			  var sensorData = setInterval(function(){
				oModelSensorData.loadData(oModelInternalSettings.getData().pathSensorData);  
			  }, (oModelInternalSettings.getData().updateSensorDataAllNSeconds * 1000));
	
	          //Forecast data dasWetter.com
			  var oWidgetHBox = this.getView().byId("widget");
			  var content = '<div id="cont_abbd5cfc591d9b105ca08f4286926eb5"><script type="text/javascript" async src="https://www.daswetter.com/wid_loader/abbd5cfc59	1d9b105ca08f4286926eb5"></script></div>';
			  var oHtml = this.getView().byId("dasWetterCom");			  
			  oHtml.setContent(content);
			  var content = oHtml.getContent();
			  var forecastData = setInterval(function(){			
				oHtml.getModel().setProperty("/dateTimeDasWetterCom", new Date());
			    var oWidget = oHtml.getParent();
				
				//oWidget.removeItem(1);
				var oNewHtml = new sap.ui.core.HTML();
				oNewHtml.setContent(content);
				oWidget.addItem(oNewHtml);								

			  //}, 2000);					
			  }, (oModelInternalSettings.getData().updateForecastDataAllNHours * 3600000));	
		}
		
	});

});