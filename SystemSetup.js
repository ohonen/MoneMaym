$(document).ready(function() {
	$("#bSetup").click(function() {
		parent.history.back();
        return false;
 	});
 	
 	$("#bSetup").html("חזור");
 	$("#bLeft").hide();
 	$("#bRight").hide();
 	$("#bDetails").hide();


});