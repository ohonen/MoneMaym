var readFilter = false;
var distanceFilter = false;

function Mone(number)
{
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
	// Store header as in original HTML
   	var tableHeader = $("#tableHeader").html();
   
   // Create new table
   // Leave table with header only
   $("#metersTable").empty();
   $("#metersTable").html(tableHeader);
   db_catMeters2(readFilter,distanceFilter, filter,rowsBuilderTask);

}

function rowsBuilderTask(meter)
{
	var $tdUnitName = $('<td>');
	var $form = $('<form action="MeterData.html" onSubmit=Mone("' + meter.unit_number + '")/>');
	var $input = $('<input>', { class:"cMeterId",  type:"submit", value: meter.unit_name });
	$input.appendTo($form);
	$form.appendTo($tdUnitName);
	
	$("#metersTable").append(
		$('<tr>').append(
			$tdUnitName,
			$('<td  class="cCustomerName">').text(meter.customer_name),
			$('<td>').text(meter.description)
		)		
	);	
}

Number.prototype.toRad = function() { return this * (Math.PI / 180); };
function getGpsDistance(point1, point2)
{
	var R = 6378140; // km  
	var dLat = (point2.lat-point1.lat).toRad();
	var dLon = (point2.lon-point1.lon).toRad();
	var lat1 = point1.lat.toRad();
	var lat2 = point2.lat.toRad();
	
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
}


function updateDistances()
{
	getLocation(updateDistanceCallback);
}

function updateDistanceCallback(position)
{
	updateDbDistanceCallback.currentPosition = position;
	db_catMeters2(readFilter, distanceFilter, $("#formInput").val(),updateDbDistanceCallback);
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
	
	db_updateMeterDistance(meter.unit_name, distance);
}
