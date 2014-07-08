localStorage.RADIUS_SETUP = localStorage.RADIUS_SETUP || 5;


$(document).ready(function() {
	// entrance is allowed only if authenticated
	if(!sessionStorage.User && window.location.pathname.indexOf("Login.html")==-1)
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
			initDB(function(isSuccess) {
				if(postInit)
					postInit(isSuccess);
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
					db_addGeneral(DB_DATE, dt.getTime());
					console.log("DB updated successfully");
					
					// update distances 
					console.log("Updating distances");
					updateDistances(function() {
						//clearUpdateMessage();
						console.log("Distances updated");
					}, true);

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



/******************************************************************************
 * 
 *                    GPS related functions
 */

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
			},
			{	// Always use GPS
				/*
		         timeout: 1000,	// let GPS answer within 1 Sec (for slow devices)
		         enableHighAccuracy: true,		// GPS data only
		         maximumAge: 10000	// enable 10Sec of old GPS data
		         */
		     }
		);
	}
	else
	{
		alert("Geolocation is not supported by this browser.");
	}
}


// degrees to radians. Assist with globe distance calculation.
function deg2Rad(deg)
{
	return 	deg * (Math.PI / 180);
}

// Extension to 'Number' element. Doesn't work properly and was replaced with deg2Rad
Number.prototype.toRad = function() { return this * (Math.PI / 180); };

// accurate global distance between 2 GPS points. Used to calculate distance from current location to each meter 
function getGpsDistance(point1, point2)
{
	var R = 6378140; // km  
	var dLat = deg2Rad(point2.lat-point1.lat);	// (point2.lat-point1.lat).toRad();
	var dLon = deg2Rad(point2.lon-point1.lon); // (point2.lon-point1.lon).toRad();
	var lat1 = deg2Rad(point1.lat);	// point1.lat.toRad();
	var lat2 = deg2Rad(point2.lat);	// point2.lat.toRad();
	
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
}

function getPositionsDistance(position1, position2)
{
	return getGpsDistance(
		{'lat':position1.coords.latitude, 'lon':position1.coords.longitude }, 
		{'lat':position2.coords.latitude, 'lon':position2.coords.longitude }
	);
}

// get current location and update distances to all meters
function updateDistances(callback, DbUpdated)
{
	$("#iWarning").html("");
	getLocation(function(position) {
		
		var distance=0;
		if(position)
		{
			distance=999999; // force update if no latestPosition or unabel to parse it
			if(!DbUpdated) {	// no need to calculate distances if new DB
				
				if(sessionStorage.latestPosition)
				{
					try
					{
						latestPosition = JSON.parse(sessionStorage.latestPosition);
						distance = getPositionsDistance(latestPosition, position);
					}
					catch(e)
					{
						// if JSON parse fails, do nothing
					}
				} 
			}			
		} else {	// no position
			$("#iWarning").html("*** מיקום נוכחי אינו זמין ***");
			sessionStorage.latestPosition="";
		}

		
		if(distance>50)
		{
			sessionStorage.latestPosition = JSON.stringify(position);
			updateDistanceCallback(position, callback);
		}
		else
		{
			if(callback)
				callback();
		}
	});
}

// after location is received from GPS, update distances from meters.
function updateDistanceCallback(position, callback)
{
	// Done in the background. no message is required
	updateDbDistanceCallback.currentPosition = position;

	db_updateAllMetersDistance(position, getGpsDistance, function() {
		if(callback)
			callback();
	});
}

// deprecated ?
function updateDbDistanceCallback(meter)
{
	var distance;
	if(meter.gps_lat && updateDbDistanceCallback.currentPosition.coords.latitude)
	{
		var myPosition = {'lat': updateDbDistanceCallback.currentPosition.coords.latitude, 'lon': updateDbDistanceCallback.currentPosition.coords.longitude};
		var meterPosition = {'lat': meter.gps_lat, 'lon': meter.gps_long};
		distance = getGpsDistance(myPosition,meterPosition);
	}
	else
		distance = 5000;	// some average so unupdated meters will not be too far or too close. anyway it should be temporary
	
	//db_updateMeterDistance(meter.unit_name, distance);
}


