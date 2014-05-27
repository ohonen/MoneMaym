$(document).ready(function() {
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

    var obj = document.createElement("audio");
    obj.setAttribute("src", "Click.wav");
   
    $.get(); // download audio file right away.
 
        // Should work with tap events too. 
    $(".cButton").click(function() {
        obj.play();
    });           

});

function checkDbDate()
{	
	//db_checkAge(DB_AGE_LIMIT, TEST_initDB);
	db_checkAge(DB_AGE_LIMIT, initDB);
}

function TEST_initDB()
{
			
			db_deleteDB();
			db_init();
			db_addMeter(1, 1, "אבוקדו", "ליד העץ הגבוה", "beit zera", 1, 4.3, 6, 0.95, 700, 0.0, 0.0, 0.0, "time0", 67865, 0, "time1", 67865, 0,"time2", 67865, 0,"time3", 67865, 0,"time4", 67865, 0);
			db_addMeter(020005, 2101, "לימון", "צינור ירוק עם מדבקה של החברה להגנת הטבע", "קיבוץ דגניה א", "6666221", 4.3, 6, 0.95, 700, 32.6852841,35.5719753, 0.0, "2/26/2014 16:00:00", 32540, 0, "1/26/2014 16:00:00", 32220, 1,"1/4/2014 16:00:00", 80100, 2,"11/26/2013 16:00:00", 70000, 0,"10/26/2013 16:00:00", 60000, 0);
//			db_addMeter(2, "M2", "METER OF FIELD 2", "32.6559 35.1152"); // Yokneam
//			db_addMeter(3, "M3", "METER OF FIELD 3", "32.8304 34.9743"); // Haifa
			db_addUser("1","Oren", "qwerty");
			db_addUser("2","Erez", "123");
			db_addUser("3","Tomer", "123");
			db_addUser("4","אופיר", "123");
			db_addReading("time0", 1, 67899);
			//db_addReading(2,1,25);
			//db_addReading(2,3,35);
			//db_readUsers();	// Initialize G_USERS
			
			// Get real data as well
			initDB();
}

function initDB()
{
	preInit();
	db_deleteDB(function(){
		console.log("DB Deleted.");
		db_init(function(){
			console.log("DB Initialized.");
			buildDB(postInit);
		});
		
	});

}

function buildDB(callback)
{
	db_addUser("MY","אופיר", "123");

	
	DB_hUPDATE.reset(function(){	// triggered when all vars updated
		if(callback)
			callback();
	});

	// update meters, readings and users
 	ws_getAllMeters();
 	// ws_getLastReadings();
 	ws_getAllUsers();
	db_readUsers();

	console.log("build DB started.");

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
	$(".header").css({"webkitFilter":"blur(4px)"});
	$(".center").css({"webkitFilter":"blur(4px)"});

	$(".cWaitMsg").show();
	fadeOutFunc($(".cWaitMsg"),3000);

}

function postInit()
{
	var msg="בסיס הנתונים עודכן בהצלחה";
	console.log(msg);
	//alert(msg);
	$("#loginButton").removeAttr('disabled');

	$(".cWaitMsg").stop();
	$(".cWaitMsg").hide();
	$(".header").css({"webkitFilter":"blur(0px)"});
	$(".center").css({"webkitFilter":"blur(0px)"});
}
