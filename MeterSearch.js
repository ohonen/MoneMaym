var readFilter = false;
var distanceFilter = false;
var metersIdArr = [];
var metersIdMap;
var metersIdArrComplete=false;
// Buttons vars
var filterState = 1;
var buttonsFilterText;
var btn_closeTxt;	// Text on Close/Far button
var btn_readTxt;	// Text on Read/Unread button
var CLOSE_BUTTON=1;
var READ_BUTTON=2;
// Text on buttons
var BTN_ALL="הכל";
var BTN_CLOSE="קרוב";
var BTN_FAR="רחוק";
var BTN_READ="נקרא";
var BTN_UNREAD="לא נקרא";

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
	
	$("#formInput").val("");
	$("#footerSetup").click(function() {
		window.location = "SystemSetup.html";
	});


	$("#footerLeft").hide();
	$("#footerRight").hide();
	$("#footerDetails").hide();
	
	//$("#bUnread").click(function(){filterRead();});
	clearUpdateMessage();

	/*
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
	*/

	$(".cFormInput").focusin(function() {
		$("body").css({fontSize:"120%"});
		$(".header").css({
			"height":""
		});
		$(".center").css({
			"top": "",
			"height": "",
			"fontSize":"150%"
		});
		//$(".footer").hide();
	});

	/*
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
	*/
	$(".cFormInput").focusout(function() {
		$("body").css({fontSize:""});
		$(".header").css({
			"height":""
		});
		$(".center").css({
			"top": "",
			"height": ""
		});
		//$(".footer").show();
	});

//	$(".cWaitMsg").html(" טעינת מונים ...<br>אנא המתן");

	updateDatabase(preInitDbUpdate, postInitDbUpdate);

});

function preInitDbUpdate()
{
	$(".cWaitMsg").html(" טעינת מונים ...<br>אנא המתן");
	$(".cMsgProgress").html("*");
	
	
	fadeInFunc($(".cWaitMsgDiv"),2000);
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
	changeFilterState(READ_BUTTON);	
	inputChanged($("#formInput").val());
}

function filterDistance()
{
	changeFilterState(CLOSE_BUTTON);	
	inputChanged($("#formInput").val());		
}

function inputChangedUp(newValue)
{
	inputChanged(newValue);
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
	
	if(!metersIdArrComplete)
	{
		metersIdArr = [];
		metersIdMap = {};
	}
	db_catMeters2(buttonsFilterText, filter,rowsBuilderTaskQuick, metersTablePostBuild);

}

// Building table
function rowsBuilderTask(meter)
{
	if(!metersIdArrComplete)
	{
		metersIdArr.push(meter.qc);
		metersIdMap[meter.qc] = metersIdArr.length-1;
	}
	
	var $tdUnitName = $('<td>', { class: "cMeterIdData"});
	var $form = $('<form action="MeterData.html" onSubmit=Mone(' + (metersIdMap[meter.qc]) + ',"' + meter.qc + '")/>');
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
	if(!metersIdArrComplete)
	{
		metersIdArr.push(meter.qc);
		metersIdMap[meter.qc] = metersIdArr.length-1;
	}
	
	sInput = '<input class="cMeterId" type="submit" value="' + meter.unit_name + '">';
	sForm = '<form action="MeterData.html" onSubmit=Mone(' + (metersIdMap[meter.qc]) + ',"' + meter.qc + '")>' + sInput + '</form>';	
	sTd1 = '<td class="cMeterIdData">' + sForm + '</td>';
	sTd2 = '<td class="cCustomerName">' + meter.description + '</td>';
	sTd3 = '<td class="cMeterDescription">' + meter.customer_name + '</td>';
	sTr = '<tr class="cMeterRow">' + sTd1 + sTd2 + sTd3 + '</tr>';
	
	metersTable.append(sTr);	
}


function metersTablePostBuild()
{
	if(!metersIdArrComplete)
	{
		sessionStorage.metersIdArr = JSON.stringify(metersIdArr);
		//sessionStorage.metersIdMap = JSON.stringify(metersIdMap);
		metersIdArrComplete=true;
	}
}


/*
 * buttonId==1: close/all
 * buttonId==2; read/unread
 */
function changeFilterState(buttonId)
{
	// filterState transition
	switch(filterState*10 + buttonId) {
		case 11: filterState=4; break;
		case 12: filterState=2; break;
		
		case 21: filterState=4; break;
		case 22: filterState=3; break;

		case 31: filterState=4; break;
		case 32: filterState=2; break;
		
		case 41: filterState=1; break;
		case 42: filterState=5; break;
		
		case 51: filterState=1; break;
		case 52: filterState=6; break;
		
		case 61: filterState=1; break;
		case 62: filterState=5; break;
		
	}
	
	var BASE_FILTER_TEXT = "SELECT * FROM METERS LEFT JOIN READINGS ON READINGS.meter_id = METERS.qc ";
	var BASE_READ_FILTER = "READINGS.meter_id IS "; 
	var BASE_CLOSE_FILTER = "METERS.distance<" + (localStorage.RADIUS_SETUP * 1000);
	var BASE_FILTER_ORDER = " ORDER BY METERS.unit_name";
	// new filterState action
	switch(filterState) {
		case 1:	// Show all meters 
			btn_closeTxt = BTN_CLOSE;
			btn_readTxt = BTN_UNREAD;
			buttonsFilterText = "";
			break;		

		case 2:	// Show unread only
			btn_closeTxt = BTN_CLOSE;
			btn_readTxt = BTN_READ;
			buttonsFilterText = BASE_READ_FILTER + "NULL";
			break;		

		case 3:	// Show read only
			btn_closeTxt = BTN_CLOSE;
			btn_readTxt = BTN_UNREAD;
			buttonsFilterText = BASE_READ_FILTER + "NOT NULL";
			break;		

		case 4:	// Show all close
			btn_closeTxt = BTN_ALL;
			btn_readTxt = BTN_UNREAD;
			buttonsFilterText = BASE_CLOSE_FILTER;
			break;		

		case 5:	// Show close and unread only
			btn_closeTxt = BTN_ALL;
			btn_readTxt = BTN_READ;
			buttonsFilterText = BASE_CLOSE_FILTER + " AND " + BASE_READ_FILTER + "NULL";
			break;		

		case 6:	// Show close and read only
			btn_closeTxt = BTN_ALL;
			btn_readTxt = BTN_UNREAD;
			buttonsFilterText = BASE_CLOSE_FILTER + " AND " + BASE_READ_FILTER + "NOT NULL";
			break;		
	}
	
	$("#bCloseby").html(btn_closeTxt);
	$("#bUnread").html(btn_readTxt);

}

/*
 * Wait Message Section
 * 
 */
var fadeOutFunc = function(animationObject, speed) {
	animationObject.fadeOut(speed,function(){fadeInFunc(animationObject, speed);});
};

var fadeInFunc = function(animationObject, speed) {
	animationObject.fadeIn(speed,function(){fadeOutFunc(animationObject, speed);});
};


function clearUpdateMessage()
{
	console.log("stop blinking");
	$(".cWaitMsgDiv").stop();
	$(".cWaitMsgDiv").hide();
}
