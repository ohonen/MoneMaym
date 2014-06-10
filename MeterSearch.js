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



	updateDistances();
	//db_catMeters(false);
	buildMetersTable();	

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
	metersIdArr.push(meter.unit_number);
	
	var $tdUnitName = $('<td>', { class: "cMeterIdData"});
	var $form = $('<form action="MeterData.html" onSubmit=Mone(' + (metersIdArr.length-1) + ',"' + meter.unit_number + '")/>');
	var $input = $('<input>', { class:"cMeterId",  type:"submit", value: meter.unit_name });
	$input.appendTo($form);
	$form.appendTo($tdUnitName);
	
	$("#metersTable").append(
		$('<tr>', {class:"cMeterRow"}).append(
			$tdUnitName,
			$('<td  class="cCustomerName">').text(meter.customer_name),
			$('<td>', {class: "cMeterDescription"}).text(meter.description)
		)		
	);	
}

function metersTablePostBuild()
{
	sessionStorage.metersIdArr = JSON.stringify(metersIdArr);
}

function deg2Rad(deg)
{
	return 	deg * (Math.PI / 180);
}

Number.prototype.toRad = function() { return this * (Math.PI / 180); };
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


function updateDistances()
{
	$(".cWaitMsg").show();
	getLocation(updateDistanceCallback);
}

function updateDistanceCallback(position)
{
	updateDbDistanceCallback.currentPosition = position;
	//db_catMeters2(readFilter, distanceFilter, $("#formInput").val(),updateDbDistanceCallback);
	db_updateAllMetersDistance(position, getGpsDistance, clearUpdateMessage);
}

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

function clearUpdateMessage()
{
	$(".cWaitMsg").hide();
}
