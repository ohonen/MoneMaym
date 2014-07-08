var readFilter = false;
var distanceFilter = false;
var metersIdArr = [];

function Mone(index, number)
{
	sessionStorage.meterIndex = index;
	sessionStorage.meterId = number;
}

$(document).ready(function() {
	// upload all uncomitted
	ws_uploadUncommitedReadings();

	$("#User").html(sessionStorage.User);
	
	$("#readws").click(function() {
		alert("Read WS was pressed");
		//readWS2();
	});
	
	$("#footerSetup").click(function() {
		window.location = "SystemSetup.html";
	});


	$("#footerLeft").hide();
	$("#footerRight").hide();
	$("#footerDetails").hide();
	
	//$("#bUnread").click(function(){filterRead();});
	clearUpdateMessage();

	$(".cFormInput").focusin(function() {
		$("body").css({fontSize:"200%"});
		$(".header").css({
			"height":"30%"
		});
		$(".center").css({
			"top": "35%",
			"height": "65%"
		});
		$(".footer").hide();
	});

	$(".cFormInput").focusout(function() {
		$("body").css({fontSize:"200%"});
		$(".header").css({
			"height":"20%"
		});
		$(".center").css({
			"top": "25%",
			"height": "70%"
		});
		$(".footer").show();
	});


	// update distances and build meters table afterwards
	updateDistances(function() {
		buildMetersTable();
	});


});

function filterRead()
{
	if(readFilter)
	{
		readFilter = false;
		$("#bUnread").html("לא נקרא");
	}
	else
	{
		readFilter = true;
		$("#bUnread").html("נקרא");
	}
	
	inputChanged($("#formInput").val());
}

function filterDistance()
{
	distanceFilter = !distanceFilter;
	$("#bCloseby").html(distanceFilter?"רחוק":"קרוב");
	inputChanged($("#formInput").val());		
}


function inputChanged(newValue)
{
	buildMetersTable(newValue);	
}

function verifyKey(e)
{
    var keycode;
    if (window.event)
        keycode = window.event.keyCode;
    else if (e)
        keycode = e.which;


    if(keycode<31 || keycode>127)	// non-ascii character
    {
		setTimeout(function(){buildMetersTable($("#formInput").val());}, 0);
	}
    
}

function showResult(str)
{
	if (str.length==0)
	  {
		  document.getElementById("livesearch").innerHTML="";
		  document.getElementById("livesearch").style.border="0px";
		  return;
	  }

	if (window.XMLHttpRequest)
  	{// code for IE7+, Firefox, Chrome, Opera, Safari
  		xmlhttp=new XMLHttpRequest();
  	}
	
	xmlhttp.onreadystatechange=function()
  	{
  		if (xmlhttp.readyState==4 && xmlhttp.status==200)
	    {
	    	document.getElementById("livesearch").innerHTML=xmlhttp.responseText;
    		document.getElementById("livesearch").style.border="1px solid #A5ACB2";
    	}
	};
	
xmlhttp.open("GET","livesearch.php?q="+str,true);
xmlhttp.send();
};


function dataFilter(str)
{
	if (str.length==0)
	{
		document.getElementById("tableData").innerHTML="";
		document.getElementById("tableData").style.border="0px";
		return;
	}

	if (window.XMLHttpRequest)
  	{// code for IE7+, Firefox, Chrome, Opera, Safari
  		xmlhttp=new XMLHttpRequest();
  	}
	
	xmlhttp.onreadystatechange=function()
  	{
  		if (xmlhttp.readyState==4 && xmlhttp.status==200)
	    {
	    	document.getElementById("tableData").innerHTML=xmlhttp.responseText;
    		document.getElementById("tableData").style.border="1px solid #A5ACB2";
    	}
	};
	
	xmlhttp.open("GET","dataFilter.php?q="+str,true);
	xmlhttp.send();
};

//var productServiceUrl = "http://5.100.248.223/MesophonTest/service1.asmx?op=GetSingleInstanceForTestUsingContext";

function buildMetersTable(filter)
{
	// Clear old table and Meters Id Array
	$("#metersTable").empty();	
	metersIdArr = [];
	
	db_catMeters2(readFilter,distanceFilter, filter,rowsBuilderTask, metersTablePostBuild);

}

// Building table
function rowsBuilderTask(meter)
{
	metersIdArr.push(meter.qc);
	
	var $tdUnitName = $('<td>', { class: "cMeterIdData"});
	var $form = $('<form action="MeterData.html" onSubmit=Mone(' + (metersIdArr.length-1) + ',"' + meter.qc + '")/>');
	var $input = $('<input>', { class:"cMeterId",  type:"submit", value: meter.unit_name });
	$input.appendTo($form);
	$form.appendTo($tdUnitName);
	
	$("#metersTable").append(
		$('<tr>', {class:"cMeterRow"}).append(
			$tdUnitName,
			$('<td  class="cCustomerName">').text(meter.description),
			$('<td>', {class: "cMeterDescription"}).text(meter.customer_name)
		)		
	);	
}

function metersTablePostBuild()
{
	sessionStorage.metersIdArr = JSON.stringify(metersIdArr);
}

// degrees to radians. Assist with globe distance calculation.
function deg2Rad(deg)
{
	return 	deg * (Math.PI / 180);
}

// Extension to 'Number' element. Doesn't work properly and was replaced with deg2Rad
Number.prototype.toRad = function() { return this * (Math.PI / 180); };

// accurate global distance between 2 GPS points. Used to calculate distance from current location to each meter 
function getGpsDistance(point1, point2)
{
	var R = 6378140; // km  
	var dLat = deg2Rad(point2.lat-point1.lat);	// (point2.lat-point1.lat).toRad();
	var dLon = deg2Rad(point2.lon-point1.lon); // (point2.lon-point1.lon).toRad();
	var lat1 = deg2Rad(point1.lat);	// point1.lat.toRad();
	var lat2 = deg2Rad(point2.lat);	// point2.lat.toRad();
	
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
}

function getPositionsDistance(position1, position2)
{
	return getGpsDistance(
		{'lat':position1.coords.latitude, 'lon':position1.coords.longitude }, 
		{'lat':position2.coords.latitude, 'lon':position2.coords.longitude }
	);
}

// get current location and update distances to all meters
function updateDistances(callback)
{
	$("#iWarning").html("");
	getLocation(function(position) {
		
		var distance=0;
		if(position)
		{
			distance=999999; // force update if no latestPosition or unabel to parse it
			if(sessionStorage.latestPosition)
			{
				try
				{
					latestPosition = JSON.parse(sessionStorage.latestPosition);
					distance = getPositionsDistance(latestPosition, position);
				}
				catch(e)
				{
					// if JSON parse fails, do nothing
				}
			} 
			
		} else {	// no position
			$("#iWarning").html("*** מיקום נוכחי אינו זמין ***");
		}

		
		if(distance>50)
		{
			sessionStorage.latestPosition = JSON.stringify(position);
			updateDistanceCallback(position, callback);
		}
		else
		{
			callback();
		}
	});
}

// after location is received from GPS, update distances from meters.
function updateDistanceCallback(position, callback)
{
	fadeInFunc($(".cWaitMsg"),2000);
	updateDbDistanceCallback.currentPosition = position;

	db_updateAllMetersDistance(position, getGpsDistance, function() {
		clearUpdateMessage();
		callback();
	});
}

// deprecated ?
function updateDbDistanceCallback(meter)
{
	var distance;
	if(meter.gps_lat && updateDbDistanceCallback.currentPosition.coords.latitude)
	{
		var myPosition = {'lat': updateDbDistanceCallback.currentPosition.coords.latitude, 'lon': updateDbDistanceCallback.currentPosition.coords.longitude};
		var meterPosition = {'lat': meter.gps_lat, 'lon': meter.gps_long};
		distance = getGpsDistance(myPosition,meterPosition);
	}
	else
		distance = 5000;	// some average so unupdated meters will not be too far or too close. anyway it should be temporary
	
	//db_updateMeterDistance(meter.unit_name, distance);
}

var fadeOutFunc = function(animationObject, speed) {
	animationObject.fadeOut(speed,function(){fadeInFunc(animationObject, speed);});
};

var fadeInFunc = function(animationObject, speed) {
	animationObject.fadeIn(speed,function(){fadeOutFunc(animationObject, speed);});
};


function clearUpdateMessage()
{
	console.log("stop blinking");
	$(".cWaitMsg").stop();
	$(".cWaitMsg").hide();
}
