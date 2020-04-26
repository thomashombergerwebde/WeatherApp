sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";

	var
		_sAppModulePath = "homberger/weatherapp/",
		_sJsonFilesModulePath = _sAppModulePath + "localService/mockdata";

	return {
		init: function () {

			// create
			var oMockServer = new MockServer({
				rootUri: "/odata",
			});

			// simulate against the metadata and mock data
			oMockServer.simulate("../localService/metadata.xml", {
				sMockdataBaseUrl: "../localService/mockdata",
				bGenerateMissingMockData: false
			});

			/*
			"temperatureIndoor": 	"196862",
			"humidityIndoor": 		"196863",
			"temperatureOutdoor": "196970",
			"humidityOutdoor": 		"196971"
			*/

			//Set timestamps to current values
			var readings = oMockServer.getEntitySetData("readings");

			readings.sort(function(a,b){
				return a.id > b.id; //descnding
			});

			var now = new Date();
			for( var i = 0; i < readings.length; i++){
					readings[i].timestamp = now.setMinutes(now.getMinutes()-1);
			}

			oMockServer.setEntitySetData("readings", readings);

			var aRequests = oMockServer.getRequests();
			aRequests.push({
          method: "GET",
          path: "/readings(.*)",
          response: (function(oXhr, sEntitySet) {
							var sUrl = oXhr.url;

							//If data is requested for the micro charts that is based on 'yesterday',
							//skip this clause and request a fixed number of readings instead ...
							if(sUrl.indexOf("and timestamp gt") > -1){
								var aUrl = sUrl.split("and timestamp gt");
								sUrl = aUrl[0].trim() + "&skip=0&$top=500";
							}

							var result = this.getReadings(this, "readings", sUrl);
              oXhr.respond(200, {"Content-Type": "application/json"}, result);
          }).bind(oMockServer)
      });
      oMockServer.setRequests(aRequests);

			// start
			oMockServer.start();

			oMockServer.getReadings = function(oMockServer, sEntitySet, sUrl){
				//Get key of an item according to selected fields to "group by"
				function key(aKeyFields, item){
					var sKey='';
					for(var i=0; i<aKeyFields.length; i++){
						sKey = sKey + JSON.stringify(item[aKeyFields[i]]);
					}
					return sKey;
				};

				//Replace ID in metadata string
				function replaceId(sId, sStringWithId){
					var start = sStringWithId.substring(0, sStringWithId.indexOf("('"));
					var end = sStringWithId.substring(sStringWithId.indexOf("')")+2, sStringWithId.length );
					sStringWithId = start + "('ID" + sId + "')" + end;
					return sStringWithId;
				}

					//Update ID fields in Metadata ID and URI part
				function updateMetadataId(oMetadata){
					var sId = Math.floor(Math.random() * 10000);
					oMetadata.id = replaceId(sId, oMetadata.id );
					oMetadata.uri = replaceId(sId, oMetadata.uri);
				}

				//Apply a clause from URL
				function applyUrlClause(oData, sClause, sUrl, sEntitySet){
					if(sUrl.indexOf(sClause)>-1){
						var sQuery = sUrl;
						sQuery = sQuery.slice(sQuery.indexOf(sClause), sQuery.length);
						if(sQuery.indexOf("&")>-1){
							sQuery = sQuery.slice(0, sQuery.indexOf("&"));
						}
						sQuery = unescape(sQuery);
						oMockServer._applyQueryOnCollection(oData, sQuery, sEntitySet);
						return sQuery;
					}
				}

				//Only use fields that are part of the $select clause
				function deleteUnusedFields(aExistingFields, sUsedFields){
					var aUsedFields = [];
					if(sUsedFields){
						for(var i=0; i<aExistingFields.length; i++){
							if(sUsedFields.indexOf(aExistingFields[i])>-1){
								aUsedFields.push(aExistingFields[i]);
							}
						}
					}
					return aUsedFields;
				}

				//Get all the mock data of the entity set
				var data = {};
				data.results = oMockServer.getEntitySetData(sEntitySet);

				//Apply filter clause
				applyUrlClause(data, '$filter', sUrl, sEntitySet);

				//No data left ...
				if(data.results.length===0){
					//Count requested?
					if(sUrl.indexOf("count")>-1){
						return '{value":[], "__count":0}';
					} else {
						return '{"value":[]}';
					}
				}

				//Apply select clause
				var sFields = applyUrlClause(data, '$select', sUrl, sEntitySet);

				//Calculate resulting entries - sum only
				var results=[];
				results.push(data.results[0]);
				updateMetadataId(results[0].__metadata);

				//Apply orderby clause
				applyUrlClause(data, '$orderby', sUrl, sEntitySet);

				//Apply skip clause
				applyUrlClause(data, '$skip', sUrl, sEntitySet);

				//Apply top clause
				applyUrlClause(data, '$top', sUrl, sEntitySet);

				var sResults = JSON.stringify(data.results);

				//Count requested?
				if(sUrl.indexOf("count")>-1){
					sResults += ',"__count":' + data.results.length;
				}
				sResults = '{"value":' + sResults + '}';
				return sResults;
			};

 			jQuery.sap.log.info("Running the app with mock data");
		},
	};
});
