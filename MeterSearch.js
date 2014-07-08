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

	updateDatabase(preInitDbUpdate, postInitDbUpdate);

});

function preInitDbUpdate()
{
	$(".cWaitMsg").html(" טעינת מונים ...<br>אנא המתן");
	$(".cMsgProgress").html("*");
	$(".cMsgProgress").show();
	
	
	fadeInFunc($(".cWaitMsg"),2000);
}

function postInitDbUpdate()
{
	clearUpdateMessage();
	
	buildMetersTable();

	// update distances without knowing if its new DB
	console.log("Updating distances");
	updateDistances(function() {
		//clearUpdateMessage();
		console.log("Distances updated");

		if(sessionStorage.latestPosition)
			$("#bCloseby").removeAttr("disabled");
		else
			$("#bCloseby").attr("disabled","disabled");

	});

}


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

// postpone activation until key stroke sequence ends
function inputChanged(newValue)
{
	holdValue = newValue;
	setTimeout(function() {
		if(holdValue==newValue)
			buildMetersTable(newValue);		
	}, 800);
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
var metersTable;
function buildMetersTable(filter)
{
	// Clear old table and Meters Id Array
	$("#metersTable").empty();	
	metersTable = $("#metersTable");
	
	metersIdArr = [];
	
	db_catMeters2(readFilter,distanceFilter, filter,rowsBuilderTaskQuick, metersTablePostBuild);

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

function rowsBuilderTaskQuick(meter)
{
	metersIdArr.push(meter.qc);
	
	sInput = '<input class="cMeterId" type="submit" value="' + meter.unit_name + '">';
	sForm = '<form action="MeterData.html" onSubmit=Mone(' + (metersIdArr.length-1) + ',"' + meter.qc + '")>' + sInput + '</form>';	
	sTd1 = '<td class="cMeterIdData">' + sForm + '</td>';
	sTd2 = '<td class="cCustomerName">' + meter.description + '</td>';
	sTd3 = '<td class="cMeterDescription">' + meter.customer_name + '</td>';
	sTr = '<tr class="cMeterRow">' + sTd1 + sTd2 + sTd3 + '</tr>';
	
	metersTable.append(sTr);	
}


function metersTablePostBuild()
{
	sessionStorage.metersIdArr = JSON.stringify(metersIdArr);
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
