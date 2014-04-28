var productServiceUrl = "http://5.100.248.223/MasofonService/MasofonService.asmx?op=GetAllMeters";

function readWS()
{
/*
var soapMessage =
'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> \
	<soap:Body> \
		<SaveProduct xmlns="http://sh.inobido.com/"> \
	<productID>' + productID + '</productID> \
<productName>' + productName + '</productName> \
<manufactureDate>' + manufactureDate + '</manufactureDate> \
</SaveProduct> \
</soap:Body> \
</soap:Envelope>';
*/

var soapMessage = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> \
  <soap:Body> \
    <GetSingleInstanceForTestUsingContext xmlns="http://tempuri.org/" /> \
  </soap:Body> \
</soap:Envelope>';


var soapArrayMessage = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> \
  <soap:Body> \
    <GetArrayOfTestClass xmlns="http://tempuri.org/" /> \
  </soap:Body> \
</soap:Envelope>';

	$.ajax({
		url: productServiceUrl,
		type: "POST",
		dataType: "xml",
		data: soapArrayMessage,
		complete: endReadWS,
		contentType: "application/json; charset=\"utf-8\""
	});
 
	return false;
}

function endReadWS(xmlHttpRequest, status)
{
 $(xmlHttpRequest.responseXML)
    .find('SaveProductResult')
    .each(function()
	{
   		var name = $(this).find('Name').text();
	});
	
}

var soapGetAllMeters = '<?xml version="1.0" encoding="utf-8"?> \
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> \
  <soap:Body> \
    <GetAllMeters xmlns="http://tempuri.org/" /> \
  </soap:Body> \
</soap:Envelope>';


//var productServiceUrl2 = "http://5.100.248.223/MesophonTest/service1.asmx?op=GetSingleInstanseForTestXML";
var productServiceUrl2 = "http://5.100.248.223/MesophonTest/service15.asmx?op=GetSingleInstanseForTestXML";

var soapGetSingleInstanseForTestXML = '<?xml version="1.0" encoding="utf-8"?> \
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> \
  <soap:Body> \
    <GetSingleInstanseForTestXML xmlns="http://iosighttest.com/" /> \
  </soap:Body> \
</soap:Envelope>';

/*		headers: {
        	SOAPAction: 'http://tempuri.org/GetSingleInstanseForTestXML'
    	},
*/

function readWS2()
{
	$.ajax({
		url: productServiceUrl2,
   		headers: { "SOAPAction": "GetSingleInstanseForTestXML" },
		type: "POST",
 		dataType: "xml",
		data: soapGetSingleInstanseForTestXML,
		complete: endReadWS2,
		contentType: "text/xml; charset=\"utf-8\"",
		success: function(html) {
			alert("sucess");
		},
		error: function(request, status, error) {
			alert("fail");
		}
	});
 
	return false;

};

function ws_getMeters()
{
	var xmlhttp = new XMLHttpRequest();
	
	xmlhttp.onreadystatechange= function() {
		if(xmlhttp.readyState==4) {
			if(xmlhttp.status==200) {
				if(xmlhttp.responseText != '') {
					alert("Meters received");
					
					var metersArrayStr = xmlhttp.responseText;
					metersArrayStr = metersArrayStr.replace(/\\/g,'');
					
					var metersArray = JSON.parse(metersArrayStr);
					for(var i=0; i< metersArray.length; ++i)
					{
						var meter = metersArray[i];
// function db_addMeter(id, qc, name, description, customer, iron, diameter, digits, factor, change_limit, gps_lat, gps_long, gps_alt, time_0, reading_0, type_0, time_1, reading_1, type_1, time_2, reading_2, type_2, time_3, reading_3, type_3, time_4, reading_4, type_4)  
/*CreationDate: "/Date(1328047200000)/"
CustomerName: "Customer 1"
Description: "Description for Meter id = 1"
Diameter: 3
Digits: 4
ExtensionData: Object
Factor: 4.538895033085204
GPS_ALT: 4.619258494870392
GPS_LAT: 34.161446521133854
GPS_LONG: 6.718025099354808
IOId: 1
IronId: "273438"
ParentUnitId: 55
ParentUnitName: "151266"
*/
						db_addMeterBase(meter.ParentUnitId, meter.IOId, meter.ParentUnitName, meter.Description, meter.CustomerName, 
							meter.IronId, meter.Diameter, meter.Digits, meter.Factor, 10000,
							meter.GPS_LAT, meter.GPS_LONG, meter.GPS_ALT);
					}
					setTimeout(DB_hUPDATE.meters(), 1000);					

				}
			}
		}	
	}
	
	xmlhttp.open("GET","Meters.json",true); 
	xmlhttp.send();
	
};

function ws_getReadings()
{
	var xmlhttp = new XMLHttpRequest();
	
	xmlhttp.onreadystatechange= function() {
		if(xmlhttp.readyState==4) {
			if(xmlhttp.status==200) {
				if(xmlhttp.responseText != '') {
					alert("Readings received");
					var readingsStr = xmlhttp.responseText;
					readingsStr = readingsStr.replace(/\\/g,'');
					
					var readingsArray = JSON.parse(readingsStr);
/*
Comments: null
ExtensionData: Object
IoId: 1
ReadingTime: "/Date(1354455236324)/"
Value: 3.2134020501810134
*/
// db_addMeterReading(index, qc, date, value)
					for(var i=0; i<readingsArray.length; ++i)
					{
						var reading = readingsArray[i];
						var dateNum = reading.ReadingTime.replace(/\D/g,'');
						var date = new Date(parseInt(dateNum));
						var type = 0; // MISSING
						db_addMeterReading(i%4, reading.IoId, date.toLocaleDateString(),reading.Value, type);
					}
					
					setTimeout(DB_hUPDATE.readings(), 1000);					
				}
			}
		}	
	}
	
	var date = new Date();
	
	xmlhttp.open("GET","MetersReadings.json",true); 
/*	xmlhttp.open("GET","http://5.100.248.223/MetersHandler.ashx",true); */ 
/*	xmlhttp.open("GET","http://5.100.248.223/masofonsite/MetersHandler.ashx",true); */  
/*	xmlhttp.open("GET","http://5.100.248.223/masofonsite/Handler.ashx?dummy=" + date.toString(),true); */ 
/*	xmlhttp.open("GET","http://5.100.248.223/masofonsite/",true);  */
	xmlhttp.send();
	
};

function endReadWS2(xmlHttpRequest, status)
{
 $(xmlHttpRequest.responseXML)
    .each(function()
	{
   		var name = $(this).find('Name').text();
	});
	
}


function ws_getUsers()
{
	// STUB
	setTimeout(DB_hUPDATE.users(), 1000);					

	return;
}


// Example by Evgeny
function example() {

    makeCorsRequest();
}

// Create the XHR object.
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;
}

// Make the actual CORS request.
function makeCorsRequest() {
    var url = 'http://5.100.248.223/MesophonTest/service1.asmx/GetSingleInstanceForTestUsingContext';
    var xhr = createCORSRequest('GET', url);
    if (!xhr) {
        alert('CORS not supported');
        return;
    }

    // Response handlers.
    xhr.onload = function () {
        var text = xhr.responseText;
        var responseObj = JSON.parse(text);
        //new Date(parseInt(JSONDateFromServerSide.substr(6))
        responseObj.CreationDate = new Date(parseInt(responseObj.CreationDate.substr(6)));
        alert(text);
        alert(responseObj);
    };

    xhr.onerror = function () {
        alert('Woops, there was an error making the request.');
    };

    xhr.send();
}

function ws_getAllMeters()
{
	    //var MesofonUrl = 'http://5.100.248.223/MesophonTest/service1.asmx/GetSingleInstanceForTestUsingContext';
		var MesofonUrl = 'http://5.100.248.223/MasofonService/MasofonService.asmx/GetAllMeters';
		$.ajax({
		url: MesofonUrl,
		type: "GET",
		dataType: "json",
		contentType: "text/xml; charset=\"utf-8\"",
		complete: ws_updateAllMeters,
		success: function(html) {
			console.log("ws_getAllMeters sucess");			
		},
		error: function(request, status, error) {
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
				meter.IronId, meter.Diameter, meter.Digits, meter.Factor, 10000,
				meter.GPS_LAT, meter.GPS_LONG, meter.GPS_ALT);

	}).promise().done(function(){	// When all meters read and schedule for DB insert
		alert("meters read"); 
		DB_hUPDATE.meters();
		ws_getLastReadings();	// read latest readings
	});
					

}

function ws_getLastReadings()
{
		var MesofonUrl = 'http://5.100.248.223/MasofonService/MasofonService.asmx/GetLastReadings';
		$.ajax({
		url: MesofonUrl,
		type: "GET",
		dataType: "json",
		contentType: "text/xml; charset=\"utf-8\"",
		complete: ws_updateAllMetersReadings,
		success: function(html) {
			console.log("ws_getLastReadings sucess");			
		},
		error: function(request, status, error) {
			alert("ws_getLastReadings FAIL");
		}

	});

}

function ws_updateAllMetersReadings(xmlHttpRequest, status)
{
 $(xmlHttpRequest.responseJSON).each(function(index)
	{
		var reading = $(this)[0];
		var dateNum = reading.ReadingTime.replace(/\D/g,'');
		var date = new Date(parseInt(dateNum));
		var type = 0; // MISSING
		db_addMeterReading(index%4, reading.IoId, date.toLocaleDateString(),reading.Value, type);
	}).promise().done(function(){alert("readings read"); DB_hUPDATE.readings();});
					

}

function ws_getAllUsers()
{
		var MesofonUrl = 'http://5.100.248.223/MasofonService/MasofonService.asmx/GetAllUsers';
		$.ajax({
		url: MesofonUrl,
		type: "GET",
		dataType: "json",
		contentType: "text/xml; charset=\"utf-8\"",
		complete: ws_updateAllUsers,
		success: function(html) {
			console.log("ws_getAllUsers sucess");			
		},
		error: function(request, status, error) {
			alert("ws_getAllUsers FAIL");
		}

	});

}

function ws_updateAllUsers(xmlHttpRequest, status)
{
 $(xmlHttpRequest.responseJSON).each(function(index)
	{
		var user = $(this)[0];
		db_addUser(user.UserId, user.UserName, user.Password);
		//db_addUser(4,"אופיר", "123");

	}).promise().done(function(){alert("users read"); DB_hUPDATE.users();});
					

}

//		data : {'ioId' : ioId, 'readingTime':time, 'value':value, 'comments':comment},
//			contentType: "text/xml; charset=\"utf-8\"",

function ws_insertReading(ioId, time, value, comment)
{

		// "MasofonService.asmx/InsertReading?ioId=1&comments="Oren"&readingTime=2014-4-15%2012:00:02&value=34567"
		// var MesofonUrl = 'http://5.100.248.223/MasofonService/MasofonService.asmx/InsertReading?ioId=1&comments="Oren"&readingTime=2014-4-15%2012:00:02&value=34567';
		var MesofonUrl = 'http://5.100.248.223/MasofonService/MasofonService.asmx/InsertReading';
//		MesofonUrl += '?ioId=' + ioId;
//		MesofonUrl += '&readingTime=' + time;
//		MesofonUrl += '&value=' + value;
//		MesofonUrl += '&comments=' + comment;
		$.ajax({
			url: MesofonUrl,
			type: "GET",
			dataType: "text",
			data : {'ioId' : ioId, 'readingTime':time, 'value':value, 'comments':comment},
			complete: ws_completeInsertReading,
			success: function(html) {
				console.log("ws_insertReading sucess");			
			},
			error: function(request, status, error) {
				alert("ws_insertReading FAIL");
			}
		});
	

}

function ws_completeInsertReading(data)
{
	var test = data;
	if(data.responseText == "true")
	{
	 	console.log("InsertReading Complete");				
	}

}


