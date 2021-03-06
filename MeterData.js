var monthNames = [ "ינואר", "פבר'", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוג'", "ספט'", "אוק'", "נוב'", "דצמבר" ];
var EQUATOR_LENGTH = 6378140;
var metersIdArr = [];
var latestOldRead;
// for dbl click workaround (you cant combine click & dbl click on the same element)
var DELAY = 700, clicks = 0, timer = null;
var GREEN = "LawnGreen";
var RED = "LightCoral";
var BLUE = "LightBlue";


$(document).ready(function() 
{
	// 1111111
	// make sure waiting message is hidden
	$("#iWaitMsg").hide();


	// upload all uncomitted
	ws_uploadUncommitedReadings();
		
	// read meter data from DB and callback readMeterOK
	db_readMeter(readMeterOK);

	// set user info	
	$("#User").html(sessionStorage.User);
	
//	$("#headId").html(sessionStorage.meterId);
//	$("#headName").html(sessionStorage.meterId);
//	$("#headDetails").html(sessionStorage.meterId);
	
	// convert filtered JSON data to meters IDs array (for next and prev)
	metersIdArr = JSON.parse(sessionStorage.metersIdArr);

	// old button TBR
	$("#readws").click(function() {
		alert("Read WS was pressed");
		ws_getMeters();
		ws_getReadings();
	});
	
	// set SETUP functionality. Consider insert into HTML
	$("#bSetup").click(function() {
		window.location="SystemSetup.html";
	});

	// 'submit' click functionality with attachment to external element (original element does not exist somewhere during execution) 
    $("#mySubmitData").on("click", "#submitButton", function (e) {
        e.preventDefault();
        $("#colorDummy").css('color', GREEN);
        if($("#readAmount").css("background-color")===$("#colorDummy").css('color') || confirm("הכמות שנרשמה אינה בטווח החוקי.\nהאם אתה בטוח שברצונך לאשר את הקריאה הנוכחית ?"))
    		appendAndSendData(); 
    });
	
	// 'switch-submit' event
	$("#bSwitchSubmit").click(function(){
		if($("#iOldRead").val()=="" || $("#iNewRead").val()=="") {
			alert("המידע לא נשלח. חובה למלא את כל השדות");
			return;
		}
		$("#bSwitchSubmit").attr('disabled', 'disabled');	// will be re-enabled on next page reload
		sendMessage($("#iOldRead").val(), $("#iNewRead").val(), $("#iNewIron").val(), $("#iNewDiameter").val(), $("#iNewFactor").val() );
	});

	// map click and dblclick(workaround)
	$("#mapImage").click(function() {
		clicks++;
		if(clicks==1) {
			timer=setTimeout(function(){
				updateMapZoom(1);
				clicks=0;
			}, DELAY);
		} else {
			clearTimeout(timer);
			updateMapZoom(-1);
			clicks=0;
		}
	});
	
	// show content as list of latest readings
	goTable();
//	db_catReadings();

	// show content as list of latest readings
	function goTable() {
		// set correct button image
		$("#tableImg").hide();
		$("#gpsImg").show();
		
		// show or hide sub sections
		// hide map (jQuery doesn't work here)
		var map = document.getElementById("Map");
		if(map)
			map.style.display = 'none';
		//$("#Map").hide();
		//$("iframe").hide();
		$("#tableDetails").hide();
		$("#switchOver").hide();
		$("#tableData").show();
		$(".cReadForm").show();

		// change bottom buttons functionality
		$("#headButton").click(function() {
			goGPS();	
		});
		$("#bDetails").click(function() {
			goDetails();	
		});

		$("#bDetails").html("פרטים");
	
	}
	
	// show content as map
	function goGPS() {
		$("#gpsImg").hide();
		$("#tableImg").show();
		$(".cReadForm").hide();
		
		$("#tableData").hide();
		$("#tableDetails").hide();

//		document.getElementById("Map").style.display = 'inline';
		$("#Map").show();
//		$("iframe").show();

			
		$("#headButton").click(function() {
			goTable();	
		});
	}

	// show content as meter's details
	function goDetails() {
		$("#tableImg").show();
		$("#gpsImg").hide();
		
		$("#Map").hide();
		$("#tableData").hide();
		$("#switchOver").hide();
		$("#tableDetails").show();
		$(".cReadForm").show();
	
		$("#bDetails").html("החלפה");
		$("#bDetails").click(function() {
			goSwitch();	
		});
		
		$("#headButton").click(function() {
			goTable();	
		});
		
		$("#bLeft").removeAttr('disabled');
		$("#bRight").removeAttr('disabled');

	}
	
	// show content as switching data
	function goSwitch() {
		$("#tableImg").show();
		$("#gpsImg").hide();

		$("#tableDetails").hide();
		$("#switchOver").show();
		$(".cReadForm").hide();

		$("#bDetails").html("פרטים");
		$("#bDetails").click(function() {
			goDetails();	
		});
		
		$("#bLeft").attr('disabled','disabled');
		$("#bRight").attr('disabled','disabled');
		
	}

	// increase zoom and remove top & bottom during data input
	$("input").focusin(function() {
		//$("body").css({fontSize:"200%"});
		$(".header").css({
//			"top": "0%",
//			"height":"30%"
		});
		$(".center").css({
//			"top": "30%",
//			"height": "70%"
		});
		//$(".topBar").hide();
		//$(".footer").hide();

	});
	
	// reverse zooming in on leaving data input
	$("input").focusout(function() {
		//$("body").css({fontSize:""});
		$(".header").css({
			"top" : "",
			"height":""
		});
		$(".center").css({
			"top": "",
			"height": ""
		});
		//$(".topBar").show();
		//$(".footer").show();
	});

/*
	$(".switchInput").focusin(function() {
		$("body").css({fontSize:"200%"});
		$(".footer").hide();
		$(".topBar").hide();
		
		
	
	});
	$(".switchInput").focusout(function() {
		$("body").css({fontSize:"200%"});
		$(".footer").show();
		$(".topBar").show();
	
	});
*/
}); // Document Ready


// callback on reading specific meter from METERS in DB. Set to be called in 'document ready'
function readMeterOK()
{
	// *** Head data
	$("#headId").html(G_METER.unit_name);
	$("#headName").html(G_METER.description);
	$("#headDetails").html(G_METER.customer_name);		

	// *** Current reading
	// Set current month
	var readDate = new Date();
	readDate.setDate(readDate.getDate()-10);	// set 10 days back	
	$("#readMonth").html(monthNames[readDate.getMonth()]);	
	
	$("#currentRead").attr('maxlength',G_METER.digits);

	// *** Details Data
	$("#detailedCustomer").html(G_METER.customer_name);		
	$("#detailedIron").html(G_METER.iron_number);		
	$("#detailedDiameter").html(G_METER.diameter);		
	$("#detailedDigits").html(G_METER.digits);		
	$("#detailedFactor").html(G_METER.factor?G_METER.factor.toFixed(3):"לא מוגדר");		
	$("#detailedLimit").html(G_METER.change_limit);	
	
	// read latest readings from OLD_READINGS db table and list them on page
	db_readOldReadings(G_METER.qc, function(results) {
		listLastReadings(results);
		checkReadStatus();
	});
	// MAP
	updateMap({coords : { latitude: G_METER.gps_lat, longitude: G_METER.gps_long}});
//	$('#Map').css('background-image', "url(http://maps.googleapis.com/maps/api/staticmap?' + centerStr + '&' + zoomStr + '&size=500x300&markers=color:blue|label:11543|32.6853626,35.5726944&sensor=false)");

}

// list latest readings on page and store latest old reading
function listLastReadings(results)
{
	var len = results.rows.length;
	var refDate = new Date();
	refDate.setDate(refDate.getDate()-10);
	for(var i=0;i<len; ++i)
	{
		var reading=results.rows.item(i);
		// store latest (newest) old read for future reference
		if(i==0)
		{
			latestOldRead = jQuery.extend({}, reading);	// 'reading' shallow copy
		}
		
		var myDate = new Date(reading.time*1);
		$("#Date" + i).html("" + myDate.getDate() + "/" + (myDate.getMonth()+1) + "/" + myDate.getYear()%100);
		//$("#Date" + i).html(myDate);
		//$("#Date" + i).html(reading.time);

		myDate.setDate(myDate.getDate()-10);	// set 10 days back	
		$("#Month"+i).html(monthNames[myDate.getMonth()]);	
		$("#Reading"+i).html(reading.meter_read);
		if(i+1<len)
			amountSet($("#Amount"+i), reading.type, reading.meter_read, results.rows.item(i+1).meter_read, 9999999999);	
		else
			$("#Amount"+i).html('---');

	}
}


function getZoomForMetersWide (latitude)
 // final double desiredMeters,
 // final double mapWidth,
 // final double latitude )
{
	var mapWidth = 500;
  var latitudinalAdjustment = Math.cos( Math.PI * latitude / 180.0 );

  var arg = EQUATOR_LENGTH * mapWidth * latitudinalAdjustment / ( localStorage.RADIUS_SETUP * 256.0 * 1000.0);	// * 256.0

  return Math.log( arg ) / Math.log( 2.0 );
}

// get current read value and set read amount properly
function currentReadAdjust(newValue)
{
	holdValue = newValue;
	setTimeout(function() {
		if(holdValue==newValue)
			currentReadAdjustFinal(holdValue);		
	}, 1000);
}


function currentReadAdjustFinal(value)
{
	var elem = $("#readAmount");
	if(!latestOldRead || value==0)
	{
		elem.html('-');
		elem.css("background-color", "transparent");
		return;		
	}
	
	// Amount Format
	var currentAmount = value - latestOldRead.meter_read;
	// overlap checking for 10% of number of digits
	if(currentAmount<0)
	{
		if((parseInt(value) + Math.pow(10,G_METER.digits)) < (parseInt(latestOldRead.meter_read) + Math.pow(10,G_METER.digits-1)))
			currentAmount = parseInt(value) + Math.pow(10,G_METER.digits) - parseInt(latestOldRead.meter_read);
	}
	//elem.html(currentAmount.toFixed(2));
	elem.html(currentAmount);
	//if(currentAmount>0 && currentAmount<=G_METER.change_limit)	change limit check is disabled
	if(currentAmount==0)
		elem.css("background-color", "transparent");
	else if(currentAmount>0)
		elem.css("background-color", GREEN);
	else
		elem.css("background-color", RED);			
}

// set amount for old readings
function amountSet(elem, type, curRead, prevRead, limit)
{
	switch(type)
	{
		case 0:	// normal read
		case 2: // last old meter read
			var amount = curRead - prevRead;
			//elem.html(amount.toFixed(2));
			elem.html(amount);
			// if(amount>0 && amount<=limit) limit check removed
			if(amount>0)
				elem.css("background-color", GREEN);
			else
				elem.css("background-color", RED);			
			break;	

		case 1:	// first new meter reading
			elem.html("---");
			elem.css("background-color", BLUE);
			break;
	
	}	
	
}


// send data wrapper. redundent. TBR
function appendAndSendDataWrapper()
{
	appendAndSendData();	
}

// add to db and send input data
function appendAndSendData(now)
{
	if(now==undefined)
		now = new Date();
		
	// db_addReading(now.toISOString(), sessionStorage.meterId, $("#currentRead").val());
	db_addReading(now.getTime(), metersIdArr[sessionStorage.meterIndex], $("#currentRead").val(), function(tx, results) {
		// following read insertion to DB read it back and make sure it is there
		checkReadStatus();
	});
	
	// send data to server as ISO string
	ws_insertReading(G_METER.qc, now.toISOString(), $("#currentRead").val(), "NONE");

	// if location does not exist, update it automatically
	db_onMeterTask(sessionStorage.meterId, unitAutoLocationUpdate);
}

// Get current system reading of a specific meter and enable/disable active reading accordingly 	
function checkReadStatus()
{
	db_taskMeterReadings(sessionStorage.meterId, function(tx, results) {
		var disabled = checkReadStatusCallback(tx, results);
		if(!disabled)
			checkLatestRead();
	});
}

// Check latest read to enable/disable active reading
function checkReadStatusCallback(tx,results)
{
	// calculate current month on 10 days back
	var now = new Date();
	now.setDate(now.getDate()-10);

	// run through all readings and see if current month was already read
	// this loop will return if current month was already read
	// There is expected one reading at most
	for(var i=0; i<results.rows.length; ++i)
	{
		var meterRead = results.rows.item(i);
		var readDate = new Date(meterRead.time*1);
		readDate.setDate(readDate.getDate()-10);
		if(readDate.getMonth()==now.getMonth() && readDate.getYear()==now.getYear())
		{
			disableReading(meterRead);
			return true;
		}
	}
	
	return false;
	
}

// check current system latest read
function checkLatestRead()
{
	if(latestOldRead)
	{
		var now = new Date();
		now.setDate(now.getDate()-10);

		var oldReadingDate = new Date(latestOldRead.time*1);
		oldReadingDate.setDate(oldReadingDate.getDate()-10);

		if(now.getMonth()==oldReadingDate.getMonth() && now.getYear()==oldReadingDate.getYear())
		{
			disableReading();
			return;
		}		
	}
}



function disableReading(meter)
{
	if(meter)
	{
		$("#currentRead").val(meter.meter_read);
		currentReadAdjust(meter.meter_id?meter.meter_read:0);		
	} else {
		$("#currentRead").val('');
		currentReadAdjust(0);		
	}
	$("#submitButton").hide();
	$("#currentRead").prop('disabled', true);	
}

function enableReading()
{
	$("#currentRead").val('');
	currentReadAdjust(0);
	$("#submitButton").show();
	$("#currentRead").prop('disabled', false);	
}

function unitAutoLocationUpdate(unit)
{
	if(unit.gps_lat==0)
	{
		storeLocation();
	}
}

storeLocation.meterGeoData;
function storeLocation()
{
	//getLocationCallback = new storeLocationCallback();
	$("#iWaitMsg").html("שומר מיקום נוכחי");
	$("#iWaitMsg").show();
	setTimeout(function(){$("#iWaitMsg").hide();}, 2000);

	getLocation(storeLocationCallback);
}

function storeLocationCallback(position)
{
	if(position)
	{
		updateMap(position);
		//var locationComplete = new storeLocationUploadComplete();
		var gpsLat = position.coords.latitude || 0;
		var gpsLong = position.coords.longitude || 0;
		var gpsAlt = position.coords.altitude || 0;
		storeLocation.meterGeoData = {'id': G_METER.qc, 'LAT':gpsLat, 'LONG':gpsLong, 'ALT': gpsAlt};
		// Update center
		ws_uploadCurrentLocation(storeLocation.meterGeoData, storeLocationUploadComplete);
	}
}

function storeLocationUploadComplete(xmlHttpRequest, status)
{
	var forceTrue=true; // TBR after debug
	if(xmlHttpRequest.responseText == "true" || forceTrue)
	{
		// update local db
		db_saveCurrentLocation(storeLocation.meterGeoData, function() {
			db_readMeter(function(){});
		});
		//db_readMeter(); // update G_METER
	 	console.log("storeLocation Complete");				
	}
	else
	{
		//setTimeout(ws_insertReading(this.url), UPDATE_TIMEOUT);
		console.log("storeLocation is unsuccessful.");	
	}
}

function showPosition(position)
{
	x.innerHTML = "Latitude: " + position.coords.latitude + 
	"<br>Longitude: " + position.coords.longitude; 
}

function updateMapZoom(zoomChange)
{
	updateMap({coords : { latitude: G_METER.gps_lat, longitude: G_METER.gps_long}}, currentZoom+zoomChange);	
}

// currentZoom is page global
function updateMap(position, zoom)
{
	if(zoom)
		currentZoom = zoom;
	else
		currentZoom = 15;
		// MAP
	var centerLat = position.coords.latitude;
	var centerLong = position.coords.longitude;
//	var centerStr = 'center=' + G_METER.gps_lat +',' + G_METER.gps_long;
	var centerStr = 'center=' + centerLat +',' + centerLong;
//	var zoom = 15;
	var zoomStr = 'zoom=' + currentZoom; // no need for calculation. Similar locations+ parseInt(getZoomForMetersWide(G_METER.gps_lat));	
	var size = 'size=' + 1280 + 'x' + 720; 
  	var type = 'maptype=hybrid';
	var language = 'language=iw'; //'hl=iw';	//Hebrew
	var markers = 'markers=color:blue|label:' + G_METER.unit_name + '|' + position.coords.latitude + ',' + position.coords.longitude;
	var src = "http://maps.googleapis.com/maps/api/staticmap?" + centerStr + "&" + zoomStr + "&" + size + "&" + type + "&" + markers + "&sensor=false" + "&" + language;
	$('#mapImage').attr('src', src);
//	$('#Map').css('background-image', "url(http://maps.googleapis.com/maps/api/staticmap?' + centerStr + '&' + zoomStr + '&size=500x300&markers=color:blue|label:11543|32.6853626,35.5726944&sensor=false)");


}

function loadNextMeter()
{
	reloadNewMeter(parseInt(sessionStorage.meterIndex)+1);
}

function loadPrevMeter()
{
	reloadNewMeter(parseInt(sessionStorage.meterIndex)-1);	
}

function reloadNewMeter(meterIndex)
{
	if(meterIndex<0)
		return;
//	metersIdArr = JSON.parse(sessionStorage.metersIdArr);
	if(meterIndex>=metersIdArr.length)
		return;
		
	sessionStorage.meterIndex = meterIndex;
	sessionStorage.meterId = metersIdArr[meterIndex];

	window.location.href='MeterData.html';
}
