sap.ui.define(
	[
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/format/NumberFormat',
		'homberger/weatherapp/model/formatter',
		'sap/m/Image'
	],
	function (Controller, NumberFormat, formatter, Image) {
	"use strict";

	return Controller.extend("homberger.weatherapp.controller.weather", {

		formatter: formatter,
		NumberFormat: NumberFormat,
		resourceBundle: null,
		movePictureCarousel: 0,
		moveChartCarousel: 0,
		oRauter: null,
		sOdataServer: "",
		sPictureServer: "",
		sPictureRootFolder: "",

		onInit: function(){

			var that = this;

			//Get servers and root folder settings from index.html
			this.sOdataServer = sOdataServer;
			this.sPictureServer = sPictureServer;
			this.sPictureRootFolder = sPictureRootFolder;

			//Create the views based on the url/hash
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.initialize();

			this.oRouter.getRoute("weather").attachPatternMatched(function(oEvent){

				var that = this;
				var car = this.getView().byId("carousel");

				if(car.getPages().length > 0){
					var currentImage = this.getView().getModel("images").getProperty("/currentImage") ;
					var index = car.getPages().findIndex(function(page){
							return page.getSrc() == this.getView().getModel("images").getProperty("/currentImage");
					}, this);
					index = index < 0 ? 0 : index;
					car.setActivePage(car.getPages()[index].sId);

					//Move picture carousel forward every n seconds
					clearInterval(this.movePictureCarousel);
					this.movePictureCarousel = setInterval(function(){
						var car = that.getView().byId("carousel");
						car.next();
					}, this.getView().getModel("settings").getProperty("/show/picture/value") * 1000);

					//Move chart carousel forward every n seconds
					clearInterval(this.moveChartCarousel);
					this.moveChartCarousel = setInterval(function(){
						var car = that.getView().byId("carouselHistory");
						car.next();
					}, this.getView().getModel("settings").getProperty("/show/chart/value") * 1000);

				}

			}, this);

			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			//overwrite default settings with locally stored values
			var defaultSettings = this.getOwnerComponent().getModel("settings").getData();
			var settings = null;
			settings = localStorage.getItem("settings");
			if(settings!=null){

				//keep those settings that could be changed by settings dialog
				settings = JSON.parse(settings);
				defaultSettings.show.chart.value = settings.show.chart.value;
				defaultSettings.show.picture.value = settings.show.picture.value;
				defaultSettings.threshold.temperature.indoor.value = settings.threshold.temperature.indoor.value;
				defaultSettings.threshold.temperature.outdoor.value = settings.threshold.temperature.outdoor.value;
				defaultSettings.threshold.humidity.indoor.min = settings.threshold.humidity.indoor.min;
				defaultSettings.threshold.humidity.indoor.max = settings.threshold.humidity.indoor.max;
				defaultSettings.threshold.humidity.outdoor.min = settings.threshold.humidity.outdoor.min;
				defaultSettings.threshold.humidity.outdoor.max = settings.threshold.humidity.outdoor.max;

			}

			var oModelImages = this.getOwnerComponent().getModel("images");
			var defaultImageSettings = oModelImages.getData();
			var imageSettings = null;
			imageSettings = localStorage.getItem("images");
			if(imageSettings!=null){
				imageSettings = JSON.parse(imageSettings);
				var aSelectedPictureFolders = imageSettings.selectedPictureFolders || [];
				var aSelectedPictureFolderKeys = imageSettings.selectedPictureFolderKeys || [];
				var aSelectedImages = imageSettings.selectedImages || [];
				var currentImage = aSelectedImages ? aSelectedImages[0] : null;

				oModelImages.setProperty("/selectedPictureFolders", aSelectedPictureFolders);
				oModelImages.setProperty("/selectedPictureFolderKeys", aSelectedPictureFolderKeys);
				oModelImages.setProperty("/selectedImages", aSelectedImages);
				oModelImages.setProperty("/currentImage", currentImage);
			}

			//restore settings to get new format of settings file
			settings = defaultSettings;
			localStorage.setItem("settings", JSON.stringify(settings));

			//set themes for day & night
			var themes = this.getOwnerComponent().getModel("settings").getProperty("/themes");
			var autoApplyThemeSetting = this.getOwnerComponent().getModel("settings").getProperty("/themes/autoApplyThemeSetting");
        	if(themes && autoApplyThemeSetting){

				var _24HinMS = 86400000;
				var now = new Date();
				var msTillStartDayTheme = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
													this.getOwnerComponent().getModel("settings").getProperty("/themes/day/startTimeHour"),
													this.getOwnerComponent().getModel("settings").getProperty("/themes/day/startTimeMinute"), 0, 0) - now;
				if (msTillStartDayTheme < 0) {
				  msTillStartDayTheme += _24HinMS;
				}

				setTimeout(function(){
					sap.ui.getCore().applyTheme(this.getOwnerComponent().getModel("settings").getProperty("/themes/day/theme"));
					this.sliderSetValueForTheme(this.getOwnerComponent().getModel("settings").getProperty("/themes/day/theme"));
					setInterval(function(){
						sap.ui.getCore().applyTheme(this.getOwnerComponent().getModel("settings").getProperty("/themes/day/theme"));
						this.sliderSetValueForTheme(this.getOwnerComponent().getModel("settings").getProperty("/themes/day/theme"));
					}.bind(this), _24HinMS);
				}.bind(this), msTillStartDayTheme);

				var msTillStartNightTheme = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
														this.getOwnerComponent().getModel("settings").getProperty("/themes/night/startTimeHour"),
														this.getOwnerComponent().getModel("settings").getProperty("/themes/night/startTimeMinute"), 0, 0) - now;
				if (msTillStartNightTheme < 0) {
				  msTillStartNightTheme += _24HinMS;
				}

				setTimeout(function(){
					sap.ui.getCore().applyTheme(this.getOwnerComponent().getModel("settings").getProperty("/themes/night/theme"));
					this.sliderSetValueForTheme(this.getOwnerComponent().getModel("settings").getProperty("/themes/night/theme"));
					var msTillNextThemeChange = _24HinMS;
					setInterval(function(){
						sap.ui.getCore().applyTheme(this.getOwnerComponent().getModel("settings").getProperty("/themes/night/theme"));
						this.sliderSetValueForTheme(this.getOwnerComponent().getModel("settings").getProperty("/themes/night/theme"));
				   }.bind(this), msTillNextThemeChange);
				 }.bind(this), msTillStartNightTheme);

		 	}

			//start all periodic functions now, that all interval settings are known
			this.setIntervalCalls(settings);

			//get readings on startup
			this.fillJSONModelCurrentValues(that.getOwnerComponent().getModel("settings"));
			this.fillJSONModelHistory(that.getOwnerComponent().getModel("settings"));


			//----------------------------------------------------------------------------------------//
			//Clock
			//----------------------------------------------------------------------------------------//

			//Clock - update every second
			var currentTime = setInterval(function(){
				var oModel = that.getOwnerComponent().getModel();
				if(oModel){
					oModel.setProperty("/currentTime", new Date());
				}
			}, 1000);


			//----------------------------------------------------------------------------------------//
			//Picture carousel
			//----------------------------------------------------------------------------------------//

			var carousel = that.getView().byId("carousel");
			if(carousel){

				var aSelectedPictureFolders = [];
				var imageData = JSON.parse(localStorage.getItem("images"));
				if(imageData && imageData.selectedPictureFolders){
					aSelectedPictureFolders = imageData.selectedPictureFolders;
				}

				carousel.removeAllPages();

				//Set selected pictures
				if(aSelectedPictureFolders && aSelectedPictureFolders.length>0){

					for( var i = 0; i < aSelectedPictureFolders.length; i++){
						this._loadPicturesFromFolder(aSelectedPictureFolders[i].id);
					}

				//Set default pictures
				} else {
					this._loadDefaultPictures();
				}

			}

			//----------------------------------------------------------------------------------------//
			//Forecast
			//----------------------------------------------------------------------------------------//

			//Initial setting of forecast data dasWetter.com
			var oWidgetHBox = that.getView().byId("widget");
					//Old content
					//var content = '<div id="cont_abbd5cfc591d9b105ca08f4286926eb5"><script type="text/javascript" async src="https://www.daswetter.com/wid_loader/abbd5cfc59	1d9b105ca08f4286926eb5"></script></div>';
					//New content as of 23.02.2018
					//var content = '<div id="cont_01609c029c4c6cb9fd90139d1247d366"><script type="text/javascript" async src="https://www.daswetter.com/wid_loader/01609c029c4c6cb9fd90139d1247d366"></script></div>';
					//New content as of 04.03.2018 - only 5 days due to size of tablet screen
					var content = '<div id="cont_b6714826f7f26c67c12f6a19298ad5b1"><script type="text/javascript" async src="https://www.daswetter.com/wid_loader/b6714826f7f26c67c12f6a19298ad5b1"></script></div>';
			var oHtml = that.getView().byId("dasWetterCom");
			if(oHtml){
				oHtml.setContent(content);
				oHtml.attachAfterRendering(function(){
					var oHtmlDocObject = document.getElementById(that.getView().createId("widget"));
					//suppress click on HTML, so no new browser window/tab is opened
					oHtmlDocObject.classList.add("noPointerEvents");
					//Adjust the size of the above displayed carousel
					if(oHtmlDocObject.offsetWidth){
						that.getView().byId("carousel").setWidth(oHtmlDocObject.offsetWidth+"px");
						that.getView().byId("carousel").setHeight(Math.round(oHtmlDocObject.offsetWidth/16*9)+"px");
					}
				});
			}

			//Let update run at 04am every night
			var now = new Date();
			var milliSecondsUntil04am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 0, 0, 0) - now;
			if (milliSecondsUntil04am < 0) {
				milliSecondsUntil04am += 86400000; // it's after 04am, try 04am tomorrow.
			}
			//set timeout function that runs at 04am
			setTimeout(function(){
				var oWidget = null;
				var htmlId = oHtml.getId();

				if(oHtml&&oHtml.getParent()){
					oWidget = oHtml.getParent();
					oHtml.destroy();
					oHtml = new sap.ui.core.HTML(htmlId);
					oHtml.setContent(content);
					oWidget.addItem(oHtml);
				}

				//then start an interval for 24h
				setInterval(function(){

					var oWidget = null;
					var htmlId = oHtml.getId();

					if(oHtml&&oHtml.getParent()){
						oWidget = oHtml.getParent();
						oHtml.destroy();
						oHtml = new sap.ui.core.HTML(htmlId);
						oHtml.setContent(content);
						oWidget.addItem(oHtml);
					}

				}, 86400000);

			}, milliSecondsUntil04am);

		}, //end of init

		//----------------------------------------------------------------------------------------//
		//Select folders for pictures to be displayed
		//----------------------------------------------------------------------------------------//

		onOpenSelectPicturesDialog: function (oEvent) {
			if (!this._oSelectPicturesDialog) {
				this._oSelectPicturesDialog = sap.ui.xmlfragment("homberger.weatherapp.view.SelectPicturesDialog", this);
				this.getView().addDependent(this._oSelectPicturesDialog);
			}

			//Load items for MultiComboBox to also show new folders
			this.loadItemsPictureFolders();

			//toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oSelectPicturesDialog);
			this._oSelectPicturesDialog.open();

		},

		onCloseSelectPictureFolderDialog: function (oEvent) {

			this._oSelectPicturesDialog.close();

			var oModel = this.getView().getModel("images");
			var aSelectedPictureFolders = oModel.getProperty("/selectedPictureFolders");

			var carousel = this.getView().byId("carousel");
			if(carousel && aSelectedPictureFolders){

				carousel.removeAllPages();
				this._loadDefaultPictures(); //will be deleted if pictures were loaded from folders

				//Create carousel pages for all pictures in all selected folders
				for( var i = 0; i < aSelectedPictureFolders.length; i++){
					this._loadPicturesFromFolder(aSelectedPictureFolders[i].id);
				}
			}
		},

		loadItemsPictureFolders: function(oEvent){

			var sUrl = this.sPictureServer + this.sPictureRootFolder;
			var oHeader = {
                  "content-type": "text/html"
            };

      $.ajax({
          type: "GET",
          url: sUrl,
          headers: oHeader,
          success: function(sHtml){

											var oModel = this.getView().getModel("images");
											var aPictureFolder = [];

											var aHtml = sHtml.split('href="');
											aHtml = aHtml.splice(1);

											var aFolder;
											var sFolderId;
											var sFolderShortText;
											var oFolderItem;

											for( var i = 0; i < aHtml.length; i++){

												aFolder = aHtml[i].split('"><tt>');
												sFolderId = aFolder[0];
												aFolder = aFolder[1].split('/</tt>');
												sFolderShortText = aFolder[0];

												oFolderItem = {};
												oFolderItem.id = sFolderId;
												oFolderItem.shortText = sFolderShortText;
												aPictureFolder.push(oFolderItem);
											}

											oModel.setProperty("/pictureFolder", aPictureFolder);
									}.bind(this),
          	error: function(error){
										console.log("Picture Folders not found");
									}.bind(this)
        });
		},

		onPictureFolderFinish: function(oEvent){

			var aSelectedItems = oEvent.getSource().getSelectedItems();
			var oModel = this.getView().getModel("images");
			var aSelectedPictureFolders = [];
			var aSelectedPictureFolderKeys = [];

			for( var i = 0; i < aSelectedItems.length; i++){
				var oSelectedPictureFolder = {};
				oSelectedPictureFolder.id = aSelectedItems[i].getKey();
				oSelectedPictureFolder.shortText = aSelectedItems[i].getText();
				aSelectedPictureFolders.push(oSelectedPictureFolder);
				aSelectedPictureFolderKeys.push(oSelectedPictureFolder.id);
			}

			oModel.setProperty("/selectedPictureFolders", aSelectedPictureFolders);
			oModel.setProperty("/selectedPictureFolderKeys", aSelectedPictureFolderKeys);
			localStorage.setItem("images", this.getView().getModel("images").getJSON());
		},

		_loadDefaultPictures: function(){

			//var selectedImages = this.getOwnerComponent().getModel("images").getProperty("/selectedImages");
			var selectedImages = this.getOwnerComponent().getModel("images").getProperty("/defaultImages") || [];
			this.getOwnerComponent().getModel("images").setProperty("/selectedImages", selectedImages);
			selectedImages.forEach(function(item, index){
				var image = new Image(Math.round(Math.random()*10000));
				image.setSrc(item);
				image.attachPress(function(){
					this.onNavToImage()
				}.bind(this));
				image.setHeight("100%");
				this.getView().byId("carousel").addPage(image);
			}.bind(this));
		},

		_loadPicturesFromFolder: function (sPictureFolder) {

			//Load pictures from external server
			var sUrl = this.sPictureServer + sPictureFolder;
			var oHeader = {
                  "content-type": "text/html"
            };

            $.ajax({
                type: "GET",
                url: sUrl,
                headers: oHeader,
                success: function(sHtml){

									//sHtml is a listing of the pictures folder in HTML	format
									var aPictures = [];

									aPictures = sHtml.split('<a href=');
									aPictures.splice(0, 2);

									//No pictures found: keep default pictures
									if(aPictures.length === 0){
										return;
									}

									var aPictureIds = [];
									for( var i = 0; i < aPictures.length; i++){
										var sPictureId = aPictures[i].split('><tt>')[0].slice(1);
										aPictureIds.push(this.sPictureServer + sPictureId.slice(0, sPictureId.length-1));
									}

									if(aPictureIds.length === 0){
										return;
									}

									this.getView().getModel("images").setProperty("/selectedImages", aPictureIds);
									localStorage.setItem("images", this.getView().getModel("images").getJSON());

									//Replace default pictures by those found in the pictures folder
									var carousel = this.getView().byId("carousel");
									if(carousel){
										for(var i=0; i < aPictureIds.length; i++){

											//Only transfer picture files
											var aParts = aPictureIds[i].split(".");
											var fileExtension = aParts[aParts.length-1];
											if(fileExtension.toLowerCase() != "jpg"
													&& fileExtension.toLowerCase() != "jpeg"
													&& fileExtension.toLowerCase() != "png"){
												continue;
											}

											var image = new Image(Math.round(Math.random()*10000));
											image.setSrc(aPictureIds[i]);
											image.attachPress(function(){
												this.onNavToImage()
											}.bind(this));
											image.setHeight("100%");
											carousel.addPage(image);
										}
									}

									this.removeDefaultPictures();
							}.bind(this),
		                error: function(error){
								console.log("Picture Folder '" + sPictureFolder + "' not found");
							}.bind(this)
      });

		},

		removeDefaultPictures: function() {

			var aDefaultPictures = this.getOwnerComponent().getModel("images").getProperty("/defaultImages") || [];
			aDefaultPictures.forEach(function(oDefaultPicture){

				var carousel = this.getView().byId("carousel");
				if(!carousel){ return };

				var aCarouselPages = carousel.getPages();
				//Default pictures are always the first carousel elements
				for( var i = 0; i < aDefaultPictures.length; i++){
					if(aCarouselPages[i].getSrc() === oDefaultPicture){
						carousel.removePage(aCarouselPages[i]);
					}
				}

			}.bind(this));

		},

		fillJSONModelCurrentValues: function(oModel){
			this.readTemperature(oModel.getProperty("/sensorId/temperatureIndoor"), '/readingIndoorTemperature');
			this.readTemperature(oModel.getProperty("/sensorId/temperatureOutdoor"), '/readingOutdoorTemperature');
			this.readHumidity(oModel.getProperty("/sensorId/humidityIndoor"), '/readingIndoorHumidity');
			this.readHumidity(oModel.getProperty("/sensorId/humidityOutdoor"), '/readingOutdoorHumidity');
		},

		fillJSONModelHistory: function(oModel){
			this.readPoints(oModel.getProperty("/sensorId/temperatureIndoor"), '/indoorTemp');
			this.readPoints(oModel.getProperty("/sensorId/temperatureOutdoor"), '/outdoorTemp');
			this.readPoints(oModel.getProperty("/sensorId/humidityIndoor"), '/indoorHum');
			this.readPoints(oModel.getProperty("/sensorId/humidityOutdoor"), '/outdoorHum');
		},

		setIntervalCalls: function(settings){

			var that = this;

			//Move picture carousel forward every n seconds
			clearInterval(this.movePictureCarousel);
			this.movePictureCarousel = setInterval(function(){
					var car = that.getView().byId("carousel");
					car.next();
				}, settings.show.picture.value*1000);

			//Move char carousel forward every n seconds
			clearInterval(this.moveChartCarousel);
			this.moveChartCarousel = setInterval(function(){
				var car = that.getView().byId("carouselHistory");
				car.next();
			}, settings.show.chart.value*1000);

			//update current values regularly
			var currentReadings = setInterval(function(){
				that.fillJSONModelCurrentValues(that.getOwnerComponent().getModel("settings"));
			}, settings.readingUpdateCurrentValuesInSeconds*1000);

			//update history values regularly
			var currentReadings = setInterval(function(){
				that.fillJSONModelHistory(that.getOwnerComponent().getModel("settings"));
			}, settings.readingUpdateHistoryInSeconds*1000);

		},

		//----------------------------------------------------------------------------------------//
		//Sensor update
		//----------------------------------------------------------------------------------------//

		readCurrentData : function(id, skip, top, success) {
			var sUrl = sOdataServer + "/odata/readings?$orderby=timestamp desc&$filter=sensorid eq " + id + "&$skip=" + skip + "&$top=" + top;
			odatajs.oData.read(sUrl, function(odata){
				for (var i = 0; i < odata.value.length; i++) {
					odata.value[i].timestamp = new Date(odata.value[i].timestamp);
				}
				success(odata);
			},
			function(error){
					var a = 1;
			});
		},

		readTemperature : function(id, path) {

			var that = this;
			this.readCurrentData(id, 0, 1, function(odata){
				//save old reading
				if(that.getView().getModel().getProperty(path+"/id")!=""){
					that.getView().getModel().setProperty(path+"Old", that.getView().getModel().getProperty(path));
				}

				//reduce temperature values to 1 fractional digit
				odata.value[0].value = Math.round(odata.value[0].value*10)/10;

				//write new reading
				that.getView().getModel().setProperty(path, odata.value[0]);

				//set info field
				var infoId = path.split("/reading")[1] + "Info";
				infoId = infoId[0].toLowerCase() + infoId.slice(1);
				var info = that.getView().byId(infoId);

				var iconId = path.split("/reading")[1] + "Icon";
				iconId = iconId[0].toLowerCase() + iconId.slice(1);
				var icon = that.getView().byId(iconId);

				if(icon){
					icon.setColor(sap.ui.core.IconColor.Critical); //Negative //sap.ui.core.IconColor.Critical
					icon.setVisible(true);
				}
				if(info){
					var errorText = that.getView().getModel("i18n").getResourceBundle().getText("weakSignal");
					//var errorText = that.getView().getModel("i18n").getResourceBundle().getText("valueOutdated");
					info.setText(errorText);
				}

			});
		},

		readHumidity : function(id, path) {

			var that = this;
			this.readCurrentData(id, 0, 1, function(odata){
				if(that.getView().getModel().getProperty(path+"/id")!=""){
					that.getView().getModel().setProperty(path+"Old", that.getView().getModel().getProperty(path));
				}

				//reduce humidity values to integer
				odata.value[0].value = Math.round(odata.value[0].value);

				//write new reading
				that.getView().getModel().setProperty(path, odata.value[0]);
			});
		},

		readPoints24h : function(id, success) {

					var yesterday = new Date();
					yesterday.setDate(yesterday.getDate()-1);

					var url = sOdataServer + "/odata/readings?$orderby=timestamp desc&$filter=sensorid eq " + id + " and timestamp gt " + yesterday.toISOString();
					odatajs.oData.read(url, function(odata){
						for (var i = 0; i < odata.value.length; i++) {
							odata.value[i].timestamp = new Date(odata.value[i].timestamp);
						}
						success(odata);
				});
		},

		readPoints : function(id, path) {

			var that = this;
			this.readPoints24h(id, function(odata,reponse){

				if(odata.value.length>0){

					var oLastOdataValue = odata.value[0];
					odata.value.shift();

					odata.value=odata.value.reverse();

					var j=0;
					var yAvg=0;
					var yMax=-999;
					var yMin=999;
					var iMax=0;
					var iMin=0;
					var step = 1;
					var count = 1000;
					if(odata.value.length<count){
						count = odata.value.length;
					}
					if(odata.value.length>100){
						step = 60;
					}

					var points = new Array();
					for(var i = 0; i < count; i+=step){
						var xValue = j;
						var yValue = Math.round(odata.value[i].value * 10) / 10;
						var showValue = false;

						//calculate statistics
						yAvg+=yValue;
						if(yValue>yMax){
							yMax=yValue
							iMax = i;
						}
						if(yValue<yMin){
							yMin=yValue
							iMin = i;
						}

						points.push({x: xValue, y: yValue, show: showValue});
						j++;
					}

					//last value
					odata.value.push(oLastOdataValue);

					xValue = j;
					yValue = Math.round(oLastOdataValue.value * 10) / 10;
					var showValue = true;

					yAvg+=yValue;
					if(yValue>yMax){
						yMax=yValue
						iMax = odata.value.length-1;
					}
					if(yValue<yMin){
						yMin=yValue
						iMin = odata.value.length-1;
					}

					points.push({x: xValue, y: yValue, show: showValue});
					j++;

					//calculate average for threshold
					yAvg/=j;

					//set min and max readings
					var maxReading = odata.value[iMax];
					var minReading = odata.value[iMin];

					//show first and last value
					points[0].show = true;
					points[points.length-1].show = true;

					//set 1 digit for temperatures, 0 digits for humidity, and measure
					var measure="";
					if(path.indexOf("Temp")>0){
						measure=that.getView().getModel("i18n").getResourceBundle().getText("temperatureDegree");
						that.getView().getModel().setProperty(path+"/0/leftTopLabel", points[0].y.toFixed(1)+measure);
						that.getView().getModel().setProperty(path+"/0/rightTopLabel", points[points.length-1].y.toFixed(1)+measure);
					} else {
						measure=that.getView().getModel("i18n").getResourceBundle().getText("humidityPercent");
						that.getView().getModel().setProperty(path+"/0/leftTopLabel", Math.round(points[0].y)+measure);
						that.getView().getModel().setProperty(path+"/0/rightTopLabel", Math.round(points[points.length-1].y)+measure);
					}

					//set left bottom label: date/time of oldest value
					var fromTS = moment(odata.value[0].timestamp).locale(navigator.language).format('LT');
					if(odata.value[odata.value.length-1].timestamp.getDate()!=odata.value[0].timestamp.getDate()||
						odata.value[odata.value.length-1].timestamp.getMonth()!=odata.value[0].timestamp.getMonth()||
						odata.value[odata.value.length-1].timestamp.getYear()!=odata.value[0].timestamp.getYear()){
						//different date -> date plus time
						var fromTSDate = moment(odata.value[0].timestamp).locale(navigator.language).format('l');
						fromTSDate = fromTSDate.split(new Date().getFullYear())[0];
						fromTSDate = fromTSDate.replace(/(^\/)|(\/$)/g, "");
						fromTS = fromTSDate + " " + fromTS;
					}
					that.getView().getModel().setProperty(path+"/0/leftBottomLabel", fromTS);

					//set right bottom label: time of newest value
					//var toTS = moment(odata.value[odata.value.length-1].timestamp).locale(navigator.language).format('LT');
					var toTS = moment(oLastOdataValue.timestamp).locale(navigator.language).format('LT');
					that.getView().getModel().setProperty(path+"/0/rightBottomLabel", toTS);

					var thresholdValue = 0;
					switch (id) {
						case that.getView().getModel("settings").getProperty("/sensorId/temperatureIndoor"):
							yAvg = Math.round(yAvg*10)/10;
							minReading.value = parseFloat(minReading.value.toFixed(1));
							maxReading.value = parseFloat(maxReading.value.toFixed(1));
							thresholdValue = that.getView().getModel("settings").getProperty("/threshold/temperature/indoor/value");
							that.getView().getModel().setProperty("/readingIndoorTemperatureMax", maxReading);
							that.getView().getModel().setProperty("/readingIndoorTemperatureMin", minReading);
							that.getView().getModel().setProperty("/readingIndoorTemperatureAvg/value", yAvg);
							break;
						case that.getView().getModel("settings").getProperty("/sensorId/temperatureOutdoor"):
							yAvg = Math.round(yAvg*10)/10;
							minReading.value = parseFloat(minReading.value.toFixed(1));
							maxReading.value = parseFloat(maxReading.value.toFixed(1));
							thresholdValue = that.getView().getModel("settings").getProperty("/threshold/temperature/outdoor/value");
							that.getView().getModel().setProperty("/readingOutdoorTemperatureMax", maxReading);
							that.getView().getModel().setProperty("/readingOutdoorTemperatureMin", minReading);
							that.getView().getModel().setProperty("/readingOutdoorTemperatureAvg/value", yAvg);
							break;
						case that.getView().getModel("settings").getProperty("/sensorId/humidityIndoor"):
							yAvg = Math.round(yAvg);
							minReading.value = Math.round(minReading.value);
							maxReading.value = Math.round(maxReading.value);
							thresholdValue = Math.round((that.getView().getModel("settings").getProperty("/threshold/humidity/indoor/range/0")+that.getView().getModel("settings").getProperty("/threshold/humidity/indoor/range/1"))/2);
							that.getView().getModel().setProperty("/readingIndoorHumidityMax", maxReading);
							that.getView().getModel().setProperty("/readingIndoorHumidityMin", minReading);
							that.getView().getModel().setProperty("/readingIndoorHumidityAvg/value", yAvg);
							break;
						case that.getView().getModel("settings").getProperty("/sensorId/humidityOutdoor"):
							yAvg = Math.round(yAvg);
							minReading.value = Math.round(minReading.value);
							maxReading.value = Math.round(maxReading.value);
							thresholdValue = Math.round((that.getView().getModel("settings").getProperty("/threshold/humidity/outdoor/range/0")+that.getView().getModel("settings").getProperty("/threshold/humidity/outdoor/range/1"))/2)
							that.getView().getModel().setProperty("/readingOutdoorHumidityMax", maxReading);
							that.getView().getModel().setProperty("/readingOutdoorHumidityMin", minReading);
							that.getView().getModel().setProperty("/readingOutdoorHumidityAvg/value", yAvg);
							break;
					}

					that.getView().getModel().setProperty(path+"/0/threshold", thresholdValue);

					//set points
					that.getView().getModel().setProperty(path+"Points", points);

				}

			});

		},

		//----------------------------------------------------------------------------------------//
		//QuickView Popup
		//----------------------------------------------------------------------------------------//
		onAfterRendering: function () {
			var oButton = this.byId('indoorTemperature');
			oButton.$().attr('aria-haspopup', true);

			oButton = this.byId('outdoorTemperature');
			oButton.$().attr('aria-haspopup', true);
		},

		openQuickView: function (oEvent, oModel) {
			this.createPopover();

			this._oQuickView.setModel(oModel);

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._oQuickView.openBy(oButton);
			});
		},

		setQuickViewProperties: function (oModel, path, valueUom, icon, title, label1) {

			var timestamp = new Date(oModel.getProperty(path+"/timestamp"));
			var timestampOld = new Date(oModel.getProperty(path+"Old/timestamp"));

			oModel.setProperty("/pages/0/header", "");
			oModel.setProperty("/pages/0/icon", icon);
			oModel.setProperty("/pages/0/title", title);

			oModel.setProperty("/pages/0/groups/0/heading", this.resourceBundle.getText("currentValue"));

			oModel.setProperty("/pages/0/groups/0/elements/0/label", label1);
			oModel.setProperty("/pages/0/groups/0/elements/0/value", oModel.getProperty(path+"/value")+valueUom);

			oModel.setProperty("/pages/0/groups/0/elements/1/label", this.resourceBundle.getText("recordedOn"));
			oModel.setProperty("/pages/0/groups/0/elements/1/value", timestamp.toLocaleString());

			oModel.setProperty("/pages/0/groups/0/elements/2/label", this.resourceBundle.getText("sensorId"));
			oModel.setProperty("/pages/0/groups/0/elements/2/value", oModel.getProperty(path+"/sensorid"));

			oModel.setProperty("/pages/0/groups/0/elements/3/label", this.resourceBundle.getText("signalquality"));
			oModel.setProperty("/pages/0/groups/0/elements/3/value", oModel.getProperty(path+"/signalquality"));

			oModel.setProperty("/pages/0/groups/1/heading", this.resourceBundle.getText("lastValue"));

			oModel.setProperty("/pages/0/groups/1/elements/0/label", label1);
			oModel.setProperty("/pages/0/groups/1/elements/0/value", oModel.getProperty(path+"Old/value")+valueUom);

			oModel.setProperty("/pages/0/groups/1/elements/1/label", this.resourceBundle.getText("recordedOn"));
			oModel.setProperty("/pages/0/groups/1/elements/1/value", timestampOld.toLocaleString());
		},

		pressIndoorTemperature: function (oEvent) {
		    this.setQuickViewProperties(this.getView().getModel(), "/readingIndoorTemperature", this.resourceBundle.getText("temperatureDegree"), "sap-icon://temperature", this.resourceBundle.getText("temperatureIndoor"), this.resourceBundle.getText("temperature"));
			this.openQuickView(oEvent, this.getView().getModel());
		},

		pressOutdoorTemperature: function (oEvent) {
			this.setQuickViewProperties(this.getView().getModel(), "/readingOutdoorTemperature", this.resourceBundle.getText("temperatureDegree"), "sap-icon://temperature", this.resourceBundle.getText("temperatureOutdoor"), this.resourceBundle.getText("temperature"));
			this.openQuickView(oEvent, this.getView().getModel());
		},

		pressIndoorHumidity: function (oEvent) {
			this.setQuickViewProperties(this.getView().getModel(), "/readingIndoorHumidity", this.resourceBundle.getText("humidityPercent"), "sap-icon://blur", this.resourceBundle.getText("humidityIndoor"), this.resourceBundle.getText("humidity"));
			this.openQuickView(oEvent, this.getView().getModel());
		},

		pressOutdoorHumidity: function (oEvent) {
			this.setQuickViewProperties(this.getView().getModel(), "/readingOutdoorHumidity", this.resourceBundle.getText("humidityPercent"), "sap-icon://blur", this.resourceBundle.getText("humidityOutdoor"), this.resourceBundle.getText("humidity"));
			this.openQuickView(oEvent, this.getView().getModel());
		},

		createPopover: function() {
			if (this._oQuickView) {
				this._oQuickView.destroy();
			}

			this._oQuickView = sap.ui.xmlfragment("homberger.weatherapp.view.QuickView", this);
			this.getView().addDependent(this._oQuickView);
		},

		onExit: function () {
			if (this._oQuickView) {
				this._oQuickView.destroy();
			}
		},


		//----------------------------------------------------------------------------------------//
		//Settings Dialog
		//----------------------------------------------------------------------------------------//
		onOpenSettingsDialog: function (oEvent) {
			if (!this._oSettingsDialog) {
				this._oSettingsDialog = sap.ui.xmlfragment("homberger.weatherapp.view.SettingsDialog", this);
				this.getView().addDependent(this._oSettingsDialog);
			}

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oSettingsDialog);
			this._oSettingsDialog.open();
		},

		onCloseSettingsDialog: function (oEvent) {

			//Update settings
			localStorage.setItem("settings", this.getView().getModel("settings").getJSON());

			this._oSettingsDialog.close();
		},

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

		},

		onSliderChangeTemperatureIndoorColor: function (oEvent) {
			this.getView().byId("indoorTemperature").setValueColor(this.formatter.temperatureValueColor(parseFloat(this.getView().byId("indoorTemperature").getValue()), "Indoor", this.getView().getModel("settings")));
		},

		onSliderChangeTemperatureOutdoorColor: function (oEvent) {
			this.getView().byId("outdoorTemperature").setValueColor(this.formatter.temperatureValueColor(parseFloat(this.getView().byId("outdoorTemperature").getValue()), "Outdoor", this.getView().getModel("settings")));
		},


		onSliderChangeHumidityIndoorColor: function (oEvent) {
			this.getView().byId("indoorHumidity").setValueColor(this.formatter.humidityValueColor(parseFloat(this.getView().byId("indoorHumidity").getPercentage()), "Indoor", this.getView().getModel("settings")));
		},

		onSliderChangeHumidityOutdoorColor: function (oEvent) {
			this.getView().byId("outdoorHumidity").setValueColor(this.formatter.humidityValueColor(parseFloat(this.getView().byId("outdoorHumidity").getPercentage()), "Outdoor", this.getView().getModel("settings")));
		},


		//----------------------------------------------------------------------------------------//
		//Theme selector
		//----------------------------------------------------------------------------------------//
		onSelectTheme: function(oEvent) {

			if(oEvent.getSource().getValue()==0){
				sap.ui.getCore().applyTheme("sap_bluecrystal");
			} else if(oEvent.getSource().getValue()==1){
				sap.ui.getCore().applyTheme("sap_belize_plus");
			} else if(oEvent.getSource().getValue()==2){
				sap.ui.getCore().applyTheme("sap_hcb");
			}

		},

		sliderSetValueForTheme: function(theme){
			if(theme==="sap_bluecrystal"){
				this.getView().byId("sliderThemeChange").setValue(0);
			} else if(theme==="sap_belize"){
				this.getView().byId("sliderThemeChange").setValue(1);
			} else if(theme==="sap_hcb"){
				this.getView().byId("sliderThemeChange").setValue(2);
			}
		},


		//----------------------------------------------------------------------------------------//
		//Navigation to image page
		//----------------------------------------------------------------------------------------//
		onNavToImage: function(){
			if(this.oRouter){
				//Update JSON model
				var car = this.getView().byId("carousel");
				var index = car.getPages().findIndex(
															function(page){
																return page.sId==this.getView().byId("carousel").getActivePage();
														}, this);
				this.getView().getModel("images").setProperty("/currentImage", car.getPages()[index].getSrc());
				clearInterval(this.movePictureCarousel);
				clearInterval(this.moveChartCarousel);
				this.oRouter.navTo("imageA",  {
					source: "weather"
				});
			}
		}

	});

});
