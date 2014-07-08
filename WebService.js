var SITE_IP = '5.100.248.223';
var SITE_SERVICE = 'MasofonService/MasofonService.asmx';
var SITE_FULLPATH = 'http://' + SITE_IP + '/' + SITE_SERVICE + '/';
var UPDATE_TIMEOUT = 5 * 60 * 1000;	// IF update fails try again in 5 minutes

// Read all Meters from Center
function ws_getAllMeters(callback)
{
	    //var MesofonUrl = 'http://5.100.248.223/MesophonTest/service1.asmx/GetSingleInstanceForTestUsingContext';
		//var MesofonUrl = 'http://5.100.248.223/MasofonService/MasofonService.asmx/GetAllMeters';
		var MesofonUrl = SITE_FULLPATH + '/GetAllMeters';
		$.ajax({
			url: MesofonUrl,
			type: "GET",
			dataType: "json",
			timeout: 15000,
			contentType: "text/xml; charset=\"utf-8\"",
			//complete: ws_updateAllMeters2,
			success: function(html, status, jqXHR) {
				console.log("ws_getAllMeters sucess");	
				$(".cMsgProgress").text("**");	// All Meters were read successfully
				//alert("ws_getAllMeters OK VVV");
				ws_updateAllMeters2(jqXHR, status);
				if(callback)
					callback();		
			},
			error: function(request, status, error) {
				DB_hUPDATE.meters(false);	// Failed to download meters data. Mark meters reading ended with failure
				DB_hUPDATE.readings();
				alert("ws_getAllMeters FAIL");
			}
	
		});

}

function ws_updateAllMeters(xmlHttpRequest, status)
{
 $(xmlHttpRequest.responseJSON).each(function()
	{
//   		var name = $(this).find('Name').text();
   		var meter = $(this)[0];
		db_addMeterBase(meter.ParentUnitId, meter.IOId, meter.ParentUnitName, meter.Description, meter.CustomerName, 
				meter.IronId, meter.Diameter, meter.Digits, meter.Factor, 9999999999,
				meter.GPS_LAT, meter.GPS_LONG, meter.GPS_ALT);

	}).promise().done(function(){	// When all meters read and schedule for DB insert
		/*alert("meters read");*/ 
		DB_hUPDATE.meters();
		ws_getLastReadings();	// read latest readings
	});
					

}

function ws_updateAllMeters2(xmlHttpRequest, status)
{
	db_addAllMeters(xmlHttpRequest.responseJSON, 
		function(){
			$(".cMsgProgress").text("***");		// DB was updated with all meters. Fetching latests readings
			DB_hUPDATE.meters();
			ws_getLastReadings();	// read latest readings
			console.log("ws_updateAllMeters2 OK");
			//alert("ws_updateAllMeters2 OK");
		}, 
		function(){	// failed to read meters
			DB_hUPDATE.meters(false);
			DB_hUPDATE.readings();
			alert("ws_updateAllMeters2 ERROR");
		}
	);	
}

function ws_getLastReadings()
{
		var MesofonUrl = 'http://5.100.248.223/MasofonService/MasofonService.asmx/GetLastReadings';
		$.ajax({
		url: MesofonUrl,
		type: "GET",
		dataType: "json",
		timeout: 15000,
		contentType: "text/xml; charset=\"utf-8\"",
		//complete: ws_updateAllMetersReadings,
		success: function(html,status, jqXHR) {
			$(".cMsgProgress").text("****");	// READINGS received. Updating DB.
			console.log("ws_getLastReadings sucess");
			ws_updateAllMetersReadings(jqXHR, status);
						
			//alert("ws_getLastReadings sucess");			
		},
		error: function(request, status, error) {	// failed to read last readings
			DB_hUPDATE.readings(false);
			alert("ws_getLastReadings FAIL");
		}

	});

}

function ws_updateAllMetersReadings(xmlHttpRequest, status)
{
	/*
	$(xmlHttpRequest.responseJSON).each(function(index)
	{
		var reading = $(this)[0];
		var dateNum = reading.ReadingTime.replace(/\D/g,'');
		var date = new Date(parseInt(dateNum));
		var type = 0; // MISSING
		db_addMeterReading(index%4, reading.IoId, date.toLocaleDateString(),reading.Value, type);
	}).promise().done(function(){/*alert("readings read"); * / DB_hUPDATE.readings();});
	*/	
	db_addMeterReading2(xmlHttpRequest.responseJSON, 
		function(){
			$(".cMsgProgress").text("*****");	// READINGS updated to DB
			DB_hUPDATE.readings();
			var msg = "Meters Reading Update OK.";
			//alert(msg);
			console.log(msg);	
		}, function(){	// fail to update readings
			DB_hUPDATE.readings(false);
			alert("Meters Reading Update ERROR.");				
		});
			

 
}

function ws_getAllUsers(OK_cb, ERR_cb)
{
		var MesofonUrl = 'http://5.100.248.223/MasofonService/MasofonService.asmx/GetAllUsers';
		$.ajax({
		url: MesofonUrl,
		type: "GET",
		dataType: "json",
		timeout: 5000,
		contentType: "text/xml; charset=\"utf-8\"",
		//complete: ws_updateAllUsers,
		success: function(html, status, jqXHR) {
			console.log("ws_getAllUsers sucess");	
			OK_cb(jqXHR, status);		
		},
		error: function(request, status, error) {
			alert("ws_getAllUsers FAIL");
			DB_hUPDATE.users(false);
			if(ERR_cb)
				ERR_cb();
		}

	});

}

/*
function ws_insertReading(ioId, time, value, comment)
OR
function ws_insertReading(url)	with all GET parameters
*/
function ws_insertReading(ioId, time, value, comment)
{

		// "MasofonService.asmx/InsertReading?ioId=1&comments="Oren"&readingTime=2014-4-15%2012:00:02&value=34567"
		// var MesofonUrl = 'http://5.100.248.223/MasofonService/MasofonService.asmx/InsertReading?ioId=1&comments="Oren"&readingTime=2014-4-15%2012:00:02&value=34567';
		var myAjaxObj = {
			//url: MesofonUrl,
			type: "GET",
			dataType: "text",
			//data : {'ioId' : ioId, 'readingTime':time, 'value':value, 'comments':comment},
			complete: ws_completeInsertReading,
			success: function(html) {
				console.log("ws_insertReading sucess");			
			},
			error: function(request, status, error) {
				setTimeout(function(){ws_insertReading(ioId,time, value, comment);}, UPDATE_TIMEOUT);
				console.log("ws_insertReading FAIL. Will automatically retry in 5 minutes.");
			}
		};
		
		// if ioID==url then use it as url and don't add data argument
		// this flavor is called by ws_completeInsertReading on a retry
		if(ioId.toString().match(/\d+\.\d+\.\d+\.\d+/))
			myAjaxObj.url = ioId;	// ioId includes full url rather than ioI
		else
		{
			myAjaxObj.url = 'http://5.100.248.223/MasofonService/MasofonService.asmx/InsertReading';
			myAjaxObj.data = {'ioId' : ioId, 'readingTime':time, 'value':value, 'comments':comment};
		}
		
		
		$.ajax(myAjaxObj);
}

function ws_completeInsertReading(request, status)
{
	if(request.responseText == "true")
	{
		//str.match(/(\w{2})ain/i)[1];
		db_updateCommit(this.url.match(/ioId=([\w\d-]+)/)[1]);
	 	console.log("InsertReading Complete");				
	}
	else
	{
		if(status!="error")
		{
			setTimeout(function(){ws_insertReading(this.url);}, UPDATE_TIMEOUT);
			console.log("InsertReading is unsuccessful. Will automaticall retry in 5 minutes.");
		}	
	}
	
}

function ws_uploadUncommitedTask(time, meter_id, user_id, meter_read)
{
	ws_insertReading(meter_id, time, meter_read, "Deferred");
}

function ws_uploadUncommitedReadings()
{
	db_taskUncommitedReadings(ws_uploadUncommitedTask);
}


function ws_uploadCurrentLocation(meter, callback)	// meter contains location data  
{
//DEBUG	var MesofonUrl = SITE_FULLPATH + '/InsertGPS';
	var MesofonUrl = 'http://5.100.248.223/MasofonService/MasofonService.asmx/UpdateLocation';
	$.ajax({
		url: MesofonUrl,
		type: "GET",
		dataType: "json",
		contentType: "text/xml; charset=\"utf-8\"",
		complete: callback,
		data: {'ioId' : meter.id, 'latitude':meter.LAT, 'longitude':meter.LONG, 'altitude':meter.ALT},
		success: function(html) {
			console.log("ws_saveCurrentLocation sucess");			
		},
		error: function(request, status, error) {
			alert("מיקום נוכחי לא נשמר");
		}
	
	});	
}



