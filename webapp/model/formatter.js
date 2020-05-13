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

		temperatureValueColor: function (sValue, iThreshold){
			if(sValue<iThreshold){
				return sap.m.ValueColor.Neutral;  //blue color
			} else if(sValue>=iThreshold){
				return sap.m.ValueColor.Error; 	  //red color
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

		humidityValueColor: function (sValue, iThresholdLow, iThresholdHigh){

			if(sValue<=0){
				return sap.m.ValueColor.Neutral;
			} else if(sValue < iThresholdLow-5) {   //red color
				return sap.m.ValueColor.Error;
			} else if(sValue < iThresholdLow) {     //yellow color
				return sap.m.ValueColor.Critical;
			} else if(sValue < iThresholdHigh) {    //green color
				return sap.m.ValueColor.Good;
			} else if(sValue < iThresholdHigh+5) {  //yellow color
				return sap.m.ValueColor.Critical;
			} else if(sValue >= iThresholdHigh+5) { //red color
				return sap.m.ValueColor.Error
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
