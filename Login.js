$(document).ready(function() {
	sessionStorage.User = "";
	$(".cWaitMsg").hide();

	checkDbDate();
	
	$(".cInputField").focusin(function() {
		$("body").css({fontSize:"150%"});
		$(".header").css({height:"100%"});
		$("#Logo").hide();		
	});

	$(".cInputField").focusout(function() {
//		$("body").css({fontSize:"100%"});
		$("#Logo").show();		
	});

	/*
    var obj = document.createElement("audio");
    obj.setAttribute("src", "Click.wav");
   
    $.get(); // download audio file right away.
 
        // Should work with tap events too. 
    $(".cButton").click(function() {
        obj.play();
    });           
	*/
});

function checkDbDate()
{	
	//db_checkAge(DB_AGE_LIMIT, TEST_initDB);
	//db_checkAge(DB_AGE_LIMIT, function(){initDB(preInit, postInit);});
	
	// If age, clear users table and rebuild users data
	db_checkAge(DB_AGE_LIMIT, function() {
		var msg="מעדכן משתמשים...";
		console.log(msg);
		preUserInit();
		initUsers(postUserInit);
	});
	
}

function preUserInit()
{
	$("#loginButton").attr('disabled','disabled');	
}

function postUserInit(isSuccess)
{
	if(isSuccess==undefined || isSuccess==true)
	{
		var msg="משתמשים עודכנו בהצלחה";
		console.log(msg);
		//alert(msg);
		$("#loginButton").removeAttr('disabled');
	} else {
		// DB was NOT updated successfully
		var msg="נכשל עדכון המשתמשים";
		console.log(msg);
		
		alert("עדכון המשתמשים נכשל.\n\nאנא נסה שנית במועד מאוחר יותר.");
		
	}
	
}

function checkUser(form)
{
	db_checkUser(form.uname.value, form.pwd.value, 
		function(){
			sessionStorage.User = form.uname.value;
			window.location="MeterSearch.html";
		}, 
		function()
		{
			alert("שם משתמש או סיסמא שגויים");
		}
	);
}

var fadeOutFunc = function(animationObject, speed) {
	animationObject.fadeOut(speed,function(){fadeInFunc(animationObject, speed);});
};

var fadeInFunc = function(animationObject, speed) {
	animationObject.fadeIn(speed,function(){fadeOutFunc(animationObject, speed);});
};

function preInit()
{
	$("#loginButton").attr('disabled','disabled');
	//$(".header").css({"webkitFilter":"blur(4px)"});
	//$(".center").css({"webkitFilter":"blur(4px)"});

	$(".cWaitMsg").show();
	fadeOutFunc($(".cWaitMsg"),3000);

}

function postInit(isSuccess)
{
	$(".cWaitMsg").stop();
	$(".cWaitMsg").hide();

	//$(".header").css({"webkitFilter":"blur(0px)"});
	//$(".center").css({"webkitFilter":"blur(0px)"});

	if(isSuccess==undefined || isSuccess==true)
	{
		var msg="בסיס הנתונים עודכן בהצלחה";
		console.log(msg);
		//alert(msg);
		$("#loginButton").removeAttr('disabled');
	} else {
		// DB was NOT updated successfully
		var msg="נכשל עדכון בסיס הנתונים";
		console.log(msg);
		
		alert("עדכון בסיס הנתונים נכשל. אנא נסה שנית במועד מאוחר יותר.");
		
	}
}
