$(document).ready(function() {
	$("#readws").click(function() {
		alert("Read WS was pressed");
		readWS();
	});
	
	goTable();
	db_catReadings();
	
	function goTable() {
		$("#tableImg").hide();
		$("#gpsImg").show();
		
		$("#Map").hide();
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
		$("#Map").show();
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
