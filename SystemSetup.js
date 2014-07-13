$(document).ready(function() {
	// entrance is allowed only if authenticated
	$("#User").html(sessionStorage.User);
	$(".cEmailInput").val(localStorage.EMAIL);

	$("#bSetup").click(function() {
		parent.history.back();
        return false;
 	});
 	
 	$("#bSetup").html("שמור");
 	$("#bLeft").hide();
 	$("#bRight").hide();
 	$("#bDetails").hide();
	$(".cWaitMsgDiv").hide();

	$("#radius").val(localStorage.RADIUS_SETUP*10);
	$("#amountId").html(parseFloat(localStorage.RADIUS_SETUP).toFixed(1));
	
		$("input").focusin(function() {
		$("body").css({fontSize:""});
		$(".center").css({
			"top": "0%",
			"height": ""
		});
		//$(".topBar").hide();
		//$(".footer").hide();

	});
	
	$("input").focusout(function() {
		$("body").css({fontSize:""});
		$(".center").css({
			"top": "",
			"height": ""
		});
		//$(".topBar").show();
		//$(".footer").show();
	});
	
	$(".cEmailInput").keyup(function(){
		localStorage.EMAIL = $(".cEmailInput").val();
	});


});

function setRadius(radius)
{
	localStorage.RADIUS_SETUP = (parseFloat(radius)/10).toFixed(1);
	return localStorage.RADIUS_SETUP;
}

var fadeOutFunc = function(animationObject, speed) {
	animationObject.fadeOut(speed,function(){fadeInFunc(animationObject, speed);});
};

var fadeInFunc = function(animationObject, speed) {
	animationObject.fadeIn(speed,function(){fadeOutFunc(animationObject, speed);});
};

function forceUpdate()
{
	if(confirm("הפעולה תגרום למחיקת כל נתוני המונים וטעינתם מחדש מהשרת.\nאנא אשר את הפעולה"))
	{
		preInit();
		initDB(postInit);
	}
}


function preInit()
{
	//$(".header").css({"webkitFilter":"blur(4px)"});
	//$(".center").css({"webkitFilter":"blur(4px)"});
	//$(".footer").css({"webkitFilter":"blur(4px)"});

	$("#bSetup").attr("disabled", "disabled");
	$(".cWaitMsg").show();
	fadeOutFunc($(".cWaitMsg"),2000);

}

function postInit()
{
	sessionStorage.latestPosition = "";	// This will force distances update on DB
	var msg="בסיס הנתונים עודכן בהצלחה";
	console.log(msg);
	//alert(msg);

	$(".cWaitMsg").stop();
	$(".cWaitMsg").hide();
	$("#bSetup").removeAttr("disabled");
	//$(".header").css({"webkitFilter":"blur(0px)"});
	//$(".center").css({"webkitFilter":"blur(0px)"});
	//$(".footer").css({"webkitFilter":"blur(0px)"});
}
