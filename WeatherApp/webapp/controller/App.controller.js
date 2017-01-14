sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/wt/model/formatter",
	"sap/ui/commons/Image"
], function (Controller, JSONModel, formatter, Image) {
	"use strict";

	return Controller.extend("sap.ui.demo.wt.controller.App", {

		formatter: formatter,
		
		oFormatYyyymmdd: null,
		
		setTime: function(){
    		var date = new Date();
    		
    		var oModelLocalWeather = this.getView().getModel();
    		oModelLocalWeather.setProperty("time", date.toLocaleTimeString());
		},

		onInit: function(){
			
			var oModelLocalWeather = new JSONModel({
		  			temperatureIndoor: "--",
		  			temperatureIndoorId: "temperatureIndoorId",
		  			temperatureOutdoor: "--",
		  			temperatureOutdoorId: "temperatureOutdoorId",
		  			humidityIndoor: "--",
		  			humidityOutdoor: "--",
					minDate: new Date(2000, 0, 1),
					maxDate: new Date(2050, 11, 31),
					currentDate: new Date(),
					currentTime: new Date()
		  });
		  		  
		  var oModelSensorData = new JSONModel();
			  
		  oModelSensorData.attachRequestCompleted(function(oEvent){
			//Transfer sensor data to local weather model
			var aSensorData = oModelSensorData.getData();
			aSensorData.forEach(function(item){
				var value = 0;
				if(item.ID === "196862" && item.TYPE === "1"){
					oModelLocalWeather.setProperty("/temperatureIndoor", Number(item.VALUE).toFixed(1));
				}  
				if(item.ID === "196862" && item.TYPE === "3"){
					oModelLocalWeather.setProperty("/humidityIndoor", Number(item.VALUE).toFixed(1));	  		
				} 
				if(item.ID === "196970" && item.TYPE === "1"){
					oModelLocalWeather.setProperty("/temperatureOutdoor", Number(item.VALUE).toFixed(1));
				}
				if(item.ID === "196970" && item.TYPE === "3"){
					oModelLocalWeather.setProperty("/humidityOutdoor", Number(item.VALUE).toFixed(1));
				}
			});
		  });

		  oModelSensorData.loadData("https://localhost/Arexx/messung.json");
		  
		  var oView = this.getView();
		  oView.setModel(oModelLocalWeather);
		  
		  var that = this;
		  
		  //Set images
		  //TODO read image files from a selected directory
		  var images = [];
		  images.push("./images/focus-750-performance_613564.jpg",
					  "./images/focus-750-performance_613565.jpg",
					  "./images/DSC_0862.JPG",
					  "./images/-20160221_Focus_338.jpg"
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
		  var carousel = setInterval(function(){ 
		  	var car = that.getView().byId("carousel");
		  	car.next();
		  }, 10000);
		  
		  //Clock
		  var currentTime = setInterval(function(){ 
	    		var date = new Date();
	    		if(date.getSeconds() === 0){
    				var oModel = that.getView().getModel();
    				oModel.setProperty("/currentTime", date);	  	    			
	    			if(date.getHours() === 0 && date.getMinutes() === 0){  				
	        			oModel.setProperty("/currentDate", date);				
	    			}	
	    		}
		  }, 1000);
		  
		  
		  //Sensor data
		  var sensorData = setInterval(function(){
			oModelSensorData.loadData("https://localhost/Arexx/messung.json");  
		  }, 1000);
		  
		}
		
	});

});