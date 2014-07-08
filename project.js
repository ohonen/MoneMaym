localStorage.RADIUS_SETUP = localStorage.RADIUS_SETUP || 5;


$(document).ready(function() {
	// entrance is allowed only if authenticated
	if(!sessionStorage.User && window.location.pathname!="/Login.html")
	{
		window.location.href="Login.html";
		exit();	// stop processing further javascripts
	}
	

	$("#readws").click(function() {
		alert("Read WS was pressed");
		readWS();
	});
});

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

function getLocation(callback)
{
	if (navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(
			function(position) {
				callback(position);
			}, 
			function(e) {
			// error getting current position
			callback();
		});
	}
	else
	{
		alert("Geolocation is not supported by this browser.");
	}
}


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

function updateTable()
{
	
	db_init();
	db_addMeter(1, "M1", "METER OF FIELD 1");
	db_addMeter(2, "M2", "METER OF FIELD 2", "32.6559 35.1152"); // Yokneam
	db_addMeter(3, "M3", "METER OF FIELD 3", "32.8304 34.9743"); // Haifa
	db_addUser(1,"123123", "Oren H");
	db_addUser(2,"456456", "Erez");
	db_addUser(3,"789789", "Tomer");
	db_addReading(1,2,32);
	db_addReading(2,1,25);
	db_addReading(2,3,35);	
}

function Mone(number)
{
	window.location.href = "MeterData.html?Num="+number;
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

function updateDatabase(preInit, postInit)
{
	db_checkAge(DB_AGE_LIMIT,
		// function to execute if DB is too old 
		function() {
			if(preInit)
				preInit();
			initDB(function() {
				if(postInit)
					postInit();
			});
		}, 
		// function to execute if DB is not old
		postInit);
}

function initDB(postInit)
{
	console.log("Start initializing DB");
	
	db_deleteDB(function(){
		console.log("DB Deleted.");
		db_init(function(){
			console.log("DB Initialized.");
			buildDB(function(isSuccess) { // function to execute after the DB is rebuilt
				if(isSuccess) {
					// update DB age date
					var dt = new Date();		// Now
					db_addGeneral(DB_DATE, dt.toLocaleDateString());
					console.log("DB updated successfully");
				} else {
					console.log("DB updated ERROR");
				}	

				if(postInit)
					postInit(isSuccess);
			});
		});
		
	});

}

function buildDB(callback)
{
	DB_hUPDATE.reset(function(isSuccess){	// triggered when all vars updated
		if(callback) 
			callback(isSuccess);
	});

	// update meters, readings and users
 	ws_getAllMeters();
 	// ws_getLastReadings();
	console.log("build DB started.");

}

function initUsers(OK_cb)
{
	db_initUsers(function() {buildUsersData(OK_cb);}, function() {OK_cb(false);});
}

// Build USERS only data. This is done before Login
function buildUsersData(OK_cb)
{
	// Debug user. To be removed on operational system
	db_addUser(4,"אופיר", "123");

 	ws_getAllUsers(function(xmlHttpRequest, status) {
 		updateAllUsers(xmlHttpRequest, status, OK_cb);
 	}, 
 	function() {	// Error function for ws_getAllUsers
 		OK_cb(false);
 	});
	
}

function updateAllUsers(xmlHttpRequest, status, OK_cb)
{
	// on getting all users from server, add them to DB
	$(xmlHttpRequest.responseJSON).each(function(index)
	{
		var user = $(this)[0];
		db_addUser(user.UserId, user.UserName, user.Password);
		//db_addUser(4,"אופיר", "123");

	}).promise().done(function() {
		/*alert("users read");*/
		// uodate G_USERS tables with all users
		db_readUsers(OK_cb, function() {OK_cb(false);});
 
		DB_hUPDATE.users();
	});
					

}



function sendMessage(oldRead, newRead, newIron, newDiameter, newFactor)
{
	var mailTo = "mailto:";
	mailTo += localStorage.EMAIL;
	mailTo += "?subject=החלפת מונה מים מספר " + G_METER.unit_name;
	mailTo += "&body=";
	mailTo += "קריאה ישנה אחרונה: " + oldRead + "%0D%0A";
	mailTo += "קריאה חדשה ראשונה: " + newRead + "%0D%0A";
	mailTo += "מספר ברזל חדש: " + newIron + "%0D%0A";
	mailTo += "קוטר חדש: " + newDiameter + "%0D%0A";
	mailTo += "פקטור חדש: " + newFactor + "%0D%0A";
	mailTo += "%0D%0Aסיבת החלפה: " + "%0D%0A";
	mailTo += "%0D%0Aהערות נוספות: " + "%0D%0A";
	//window.location.href = "mailto:oren.honen@gmail.com?subject=subject&body=message";
	window.location.href = mailTo;
}

