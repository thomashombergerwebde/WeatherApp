sap.ui.define([], function () {
	"use strict";
	return {

		getNewFormattedDateString: function(sDummy){
			//Current date, e.g."Tuesday, April 14, 2020 4:19 PM"
			var date = moment().locale(navigator.language).format('LLLL');
			var aDate = date.split(new Date().getFullYear());
			//Only keep day of week and date/month
			var formattedDate = aDate[0].trim().replace(/(^,)|(,$)/g, "");
			return formattedDate;
		},

		getNewFormattedTimeString: function(sDummy){
			//Current time, e.g. "4:22 PM"
			var formattedTime = moment().locale(navigator.language).format('LT');
			return formattedTime;
		},

		getFormattedTimeString: function(sTimestamp){
			//Current time, e.g. "4:22 PM"
			var formattedTime = moment(sTimestamp).locale(navigator.language).format('LT');
			return formattedTime;
		},

		temperatureValue: function (value){
			var sampleNumber = 1.1;
			var decimalSign = sampleNumber.toLocaleString()[1];

			var returnValue = 0;
			if(value){
				returnValue = (Math.round(value*10)/10).toFixed(1);
			}
			returnValue = returnValue.replace(".", decimalSign);
			return returnValue;
		},

		temperatureValueColor: function (sValue, sPosition, oModel){

			//oModel is provided when formatter is called by controller in case the
			//threshold was changed
			if(!oModel){
					 oModel = this.getView().getModel("settings");
			}

 			if(!sValue||!sPosition){
				return sap.m.ValueColor.Neutral;
			}

			//Indoor
			if(sPosition=="Indoor"){

				if(sValue<oModel.getProperty("/threshold/temperature/indoor/value")){
					return sap.m.ValueColor.Neutral;
				} else if(sValue>=oModel.getProperty("/threshold/temperature/indoor/value")){
					return sap.m.ValueColor.Error;
				}

			//Outdoor
			} else if(sPosition=="Outdoor"){

				if(sValue<oModel.getProperty("/threshold/temperature/outdoor/value")){
					return sap.m.ValueColor.Neutral;
				} else if(sValue>=oModel.getProperty("/threshold/temperature/outdoor/value")){
					return sap.m.ValueColor.Error;
				}
			}

		},

		humidityValue: function (sValue){
			if(sValue){
				var returnValue = parseFloat(sValue);
				return Math.round(returnValue);
			} else {
				return 0;
			}
		},

		humidityValueColor: function (sValue, sPosition, oModel){

			//oModel is provided when formatter is called by controller in case the
			//threshold was changed
			if(!oModel){
				 oModel = this.getView().getModel("settings");
			}

 			if(!sValue||!sPosition){
				return sap.m.ValueColor.Neutral;
			}

			//Indoor
			if(sPosition=="Indoor"){

				if(sValue<=0){
					return sap.m.ValueColor.Neutral;
				} else if(sValue < (oModel.getProperty("/threshold/humidity/indoor/range/0")-5)){
					return sap.m.ValueColor.Error
				} else if(sValue < oModel.getProperty("/threshold/humidity/indoor/range/0")){
					return sap.m.ValueColor.Critical;
				} else if(sValue < oModel.getProperty("/threshold/humidity/indoor/range/1")){
					return sap.m.ValueColor.Good;
				} else if(sValue < (oModel.getProperty("/threshold/humidity/indoor/range/1")+5)){
					return sap.m.ValueColor.Critical;
				} else if(sValue >= (oModel.getProperty("/threshold/humidity/indoor/range/1")+5)){
					return sap.m.ValueColor.Error
				}

			//Outdoor
			} else if(sPosition=="Outdoor"){

				if(sValue<=0){
					return sap.m.ValueColor.Neutral;
				} else if(sValue < (oModel.getProperty("/threshold/humidity/outdoor/range/0")-5)){
					return sap.m.ValueColor.Error
				} else if(sValue < oModel.getProperty("/threshold/humidity/outdoor/range/0")){
					return sap.m.ValueColor.Critical;
				} else if(sValue < oModel.getProperty("/threshold/humidity/outdoor/range/1")){
					return sap.m.ValueColor.Good;
				} else if(sValue < (oModel.getProperty("/threshold/humidity/outdoor/range/1")+5)){
					return sap.m.ValueColor.Critical;
				} else if(sValue >= (oModel.getProperty("/threshold/humidity/outdoor/range/1")+5)){
					return sap.m.ValueColor.Error
				}
			}

		},

		temperatureIndicator: function (sOldValue, sNewValue){

			if(!sOldValue||!sNewValue){
				return sap.m.DeviationIndicator.None;
			}

			if(sOldValue<sNewValue){
				return sap.m.DeviationIndicator.Up;
			} else if(sOldValue>sNewValue){
				return sap.m.DeviationIndicator.Down;
			} else if(sOldValue===sNewValue){
				return sap.m.DeviationIndicator.None;
			}

		}

	};
});
