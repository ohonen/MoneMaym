var monthNames = [ "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר" ];

function readMeterOK()
{
	// *** Head data
	$("#headName").html(G_METER.unit_name);
	$("#headDetails").html(G_METER.description);		

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
	$("#detailedFactor").html(G_METER.factor);		
	$("#detailedLimit").html(G_METER.change_limit);	
	
	// *** Table data
	// Rows data and format
	var myDate0 = new Date(G_METER.time_0);
	$("#Date0").html(myDate0.toLocaleDateString());
	myDate0.setDate(myDate0.getDate()-10);	// set 10 days back	
	$("#Month0").html(monthNames[myDate0.getMonth()]);	
	$("#Reading0").html(G_METER.reading_0);
	amountSet($("#Amount0"), G_METER.type_0, G_METER.reading_0, G_METER.reading_1, G_METER.change_limit);

	var myDate1 = new Date(G_METER.time_1);
	$("#Date1").html(myDate1.toLocaleDateString());	
	myDate1.setDate(myDate1.getDate()-10);	// set 10 days back	
	$("#Month1").html(monthNames[myDate1.getMonth()]);	
	$("#Reading1").html(G_METER.reading_1);
	amountSet($("#Amount1"), G_METER.type_1, G_METER.reading_1, G_METER.reading_2, G_METER.change_limit);

	var myDate2 = new Date(G_METER.time_2);
	$("#Date2").html(myDate2.toLocaleDateString());	
	myDate2.setDate(myDate2.getDate()-10);	// set 10 days back	
	$("#Month2").html(monthNames[myDate2.getMonth()]);	
	$("#Reading2").html(G_METER.reading_2);
	amountSet($("#Amount2"), G_METER.type_2, G_METER.reading_2, G_METER.reading_3, G_METER.change_limit);

}

function currentReadAdjust(value)
{
	// Amount Format
	var currentAmount = value - G_METER.reading_0;
	var elem = $("#readAmount");
	elem.html(currentAmount);
	if(currentAmount>0 && currentAmount<=G_METER.change_limit)
		elem.css("background-color", "green");
	else
		elem.css("background-color", "red");			
}

function amountSet(elem, type, curRead, prevRead, limit)
{
	switch(type)
	{
		case 0:	// normal read
		case 2: // last old meter read
			var amount = curRead - prevRead;
			elem.html(amount);
			if(amount>0 && amount<=limit)
				elem.css("background-color", "green");
			else
				elem.css("background-color", "red");			
			break;	

		case 1:	// first new meter reading
			elem.html("---");
			elem.css("background-color", "blue");
			break;
	
	}	
	
}

$(document).ready(function() {
	db_readMeter(readMeterOK);
	
	$("#User").html(sessionStorage.User);
	
	$("#headId").html(sessionStorage.meterId);
	$("#headName").html(sessionStorage.meterId);
	$("#headDetails").html(sessionStorage.meterId);
	
	
	$("#readws").click(function() {
		alert("Read WS was pressed");
		ws_getMeters();
		ws_getReadings();
	});
	
	$("#bSetup").click(function() {
		window.location="SystemSetup.html";
	});

	
    $("#mySubmitData").on("click", "#submitButton", function (e) {
        e.preventDefault();
    	appendAndSendData();
    });


	goTable();
//	db_catReadings();
	db_checkRead();

	function goTable() {
		$("#tableImg").hide();
		$("#gpsImg").show();
		
		document.getElementById("Map").style.display = 'none';
		//$("#Map").hide();
		//$("iframe").hide();
		$("#tableDetails").hide();
		$("#switchOver").hide();
		$("#tableData").show();

		$("#headButton").click(function() {
			goGPS();	
		});
		$("#bDetails").click(function() {
			goDetails();	
		});

		$("#bDetails").html("פרטים");
	
	}
	
	function goGPS() {
		$("#gpsImg").hide();
		$("#tableImg").show();
		
		$("#tableData").hide();
		document.getElementById("Map").style.display = 'inline';
//		$("#Map").show();
//		$("iframe").show();

		$("#tableDetails").hide();
			
		$("#headButton").click(function() {
			goTable();	
		});
	}

	function goDetails() {
		$("#tableImg").show();
		$("#gpsImg").hide();
		
		$("#Map").hide();
		$("#tableData").hide();
		$("#switchOver").hide();
		$("#tableDetails").show();
		
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
	
	function goSwitch() {
		$("#tableImg").show();
		$("#gpsImg").hide();

		$("#tableDetails").hide();
		$("#switchOver").show();

		$("#bDetails").html("פרטים");
		$("#bDetails").click(function() {
			goDetails();	
		});
		
		$("#bLeft").attr('disabled','disabled');
		$("#bRight").attr('disabled','disabled');
		
	}
	
});


function appendAndSendData()
{
	var now = new Date();
	db_addReading(now, sessionStorage.meterId, $("#currentRead").val());
	db_checkRead();
	
	ws_insertReading(sessionStorage.meterId, now.toISOString(), $("#currentRead").val(), "NONE");

}
	
function db_checkRead()
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
	   tx.executeSql('SELECT * FROM READINGS WHERE meter_id=' + sessionStorage.meterId, [], function (tx, results) {
		   //var len = results.rows.length, i;
			if(results.rows.length>0)
			{
   				$("#currentRead").val(results.rows.item(0).meter_read);
   				currentReadAdjust(results.rows.item(0).meter_read);
   				$("#submitButton").hide();
   				$("#currentRead").prop('disabled', true);
 			}
	
		});
	},db_ERR, db_OK);
}


