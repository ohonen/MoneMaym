$(document).ready(function() {
	$("#User").html(sessionStorage.User);


	$("#bSetup").click(function() {
		parent.history.back();
        return false;
 	});
 	
 	$("#bSetup").html("חזור");
 	$("#bLeft").hide();
 	$("#bRight").hide();
 	$("#bDetails").hide();

	$("#radius").val(localStorage.RADIUS_SETUP*10);
	$("#amountId").html(localStorage.RADIUS_SETUP);
	
		$("input").focusin(function() {
		$("body").css({fontSize:"200%"});
		$(".center").css({
			"top": "0%",
			"height": "100%"
		});
		$(".topBar").hide();
		$(".footer").hide();

	});
	
	$("input").focusout(function() {
		$("body").css({fontSize:"200%"});
		$(".center").css({
			"top": "5%",
			"height": "90%"
		});
		$(".topBar").show();
		$(".footer").show();
	});


});

function setRadius(radius)
{
	localStorage.RADIUS_SETUP = parseFloat(radius)/10;
	return localStorage.RADIUS_SETUP;
}
