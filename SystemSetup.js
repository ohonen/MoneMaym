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

function setRadius(radius)
{
	localStorage.RADIUS_SETUP = parseFloat(radius)/10;
	return localStorage.RADIUS_SETUP;
}
