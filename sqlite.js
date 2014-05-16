var DB_NAME='monedb';
var DB_VERSION='1.0';
var G_USERS = new Object();
var G_METER;
var DB_DATE = "DBTime";
var DB_AGE_LIMIT = 1;
var DB_hUPDATE = new db_updateHandler();

function db_queryFunc(myFunc)
{
	var db = openDatabase(DB_NAME, DB_VERSION, 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(myFunc(tx) , db_ERR, db_OK );
}

function db_deleteDB(callback)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql('DROP TABLE IF EXISTS GENERAL');
		tx.executeSql('DROP TABLE IF EXISTS METERS');
		tx.executeSql('DROP TABLE IF EXISTS USERS');
		tx.executeSql('DROP TABLE IF EXISTS READINGS');
	},db_ERR, callback);
}

function db_init(callback)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var msg;

	db.transaction(function (tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS GENERAL(key TEXT unique, value TEXT)');
	var sqlCmd = 'CREATE TABLE IF NOT EXISTS METERS(' +
		'unit_number INTEGER UNIQUE, ' +
		'qc INTEGER UNIQUE, ' +
		'unit_name TEXT, ' +
		'description TEXT, ' +
		'customer_name TEXT, ' +
		'iron_number INTEGER UNIQUE, ' + 
		'diameter REAL, ' +
		'digits INTEGER, ' +
		'factor REAL, ' +
		'change_limit INTEGER, ' +
		'gps_lat REAL DEFAULT null, ' +
		'gps_long REAL, ' +
		'gps_alt REAL, ' +
		'distance REAL,' +
		'time_0 TEXT, ' +
		'reading_0 INTEGER, ' +
		'type_0 INTEGER, ' +
		'time_1 TEXT, ' +
		'reading_1 INTEGER, ' +
		'type_1 INTEGER, ' +
		'time_2 TEXT, ' +
		'reading_2 INTEGER, ' +
		'type_2 INTEGER, ' +
		'time_3 TEXT, ' +
		'reading_3 INTEGER, ' +
		'type_3 INTEGER, ' +
		'time_4 TEXT, ' +
		'reading_4 INTEGER, ' +
		'type_4 INTEGER)';
	tx.executeSql(sqlCmd);
		
	tx.executeSql('CREATE TABLE IF NOT EXISTS USERS(id TEXT unique, name TEXT COLLATE NOCASE, pwd TEXT)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS READINGS(time TEXT, meter_id INTEGER, meter_read INTEGER, committed INTEGER)');
	
	var dt = new Date();		// Now
	db_addGeneral(DB_DATE, dt.toLocaleDateString());	
	

//	msg = '<p>Log message created and row inserted.</p>';
//	document.querySelector('#status').innerHTML =  msg;
	},db_ERR, callback);
}


function db_initOK()
{	
//	var msg="בסיס הנתונים עודכן בהצלחה";
//	DB_hUPDATE.reset(alert(msg));
	db_OK();
}


function db_addMeterBase(id, qc, name, description, customer, iron, diameter, digits, factor, change_limit, gps_lat, gps_long, gps_alt)
{
	db_addMeter(id, qc, name, description, customer, iron, diameter, digits, factor, change_limit, gps_lat, gps_long, gps_alt, 5000,
		"time_0", 0, 0, 
		"time_1", 1, 1, 
		"time_2", 2, 2, 
		"time_3", 3, 3, 
		"time_4", 4, 4); 
}

function db_addMeter(id, qc, name, description, customer, iron, diameter, digits, factor, change_limit, gps_lat, gps_long, gps_alt, distance, time_0, reading_0, type_0, time_1, reading_1, type_1, time_2, reading_2, type_2, time_3, reading_3, type_3, time_4, reading_4, type_4) 
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'INSERT INTO METERS VALUES(' + id + ','+qc+', "' + name + '", "' + description + '","' + customer + '",' + iron +','+diameter+','+digits+','+factor+','+change_limit+','+gps_lat+','+ gps_long+','+ gps_alt+',' + distance + ',"'+ time_0+'",'+ reading_0+','+ type_0+',"'+ time_1+'",'+ reading_1+','+ type_1+',"'+ time_2+'",'+ reading_2+','+ type_2+',"'+ time_3+'",'+ reading_3+','+ type_3+',"'+ time_4+'",'+ reading_4+','+ type_4+')';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR2, db_OK);		
}

function db_addMeterReading(index, qc, date, value, type)
{
	var sqlCmd = 'UPDATE METERS SET time_' + index + '="'+ date + '", reading_' + index + '=' + value +', type_' + index + '='+ type +' WHERE qc=' + qc + ';';
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR, db_OK);			
}

function db_addUser(id, name, pwd)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'INSERT INTO USERS VALUES("' + id + '", "' + name + '", "'+pwd+'")';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR, db_OK);		
	
}

function db_checkUser(uname, password, PASS_Callback, FAIL_Callback)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'SELECT * FROM USERS WHERE name = "' + uname + '" AND pwd = "' + password + '";';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd, [], function (tx, results) {
			if(results.rows.length>0)	// is 0 or 1
				PASS_Callback(results.rows.item(0).name);
			else
				FAIL_Callback();
		});
	},db_ERR, db_OK);		
}

function db_readUsers()
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
	   tx.executeSql('SELECT * FROM USERS', [], function (tx, results) {
		   var len = results.rows.length, i;
		   
		   for (i = 0; i < len; i++)
		   {
		      //alert(results.rows.item(i).log );
		   		var thisread = results.rows.item(i);
				G_USERS[thisread.name] = thisread.pwd;
		   }
		});
	},db_ERR, db_OK);
}


function db_readMeter(readMeterOK)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM METERS WHERE unit_number=' + parseInt(sessionStorage.meterId), [], function(tx, results) { 
//		tx.executeSql('SELECT * FROM METERS', [], function(tx, results) { 
	 	G_METER = results.rows.item(0);

	 } );
	},db_ERR, readMeterOK);

}


function db_addReading(readTime, meter, reading)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var now = new Date();
	var nowStr = now.toUTCString();
//	var sqlCmd = 'INSERT INTO READINGS VALUES("' + nowStr + '", ' + user_id + ', ' + meter_id + ', ' + reading + ')';
	var sqlCmd = 'INSERT INTO READINGS VALUES("' + readTime + '", ' + meter + ', ' + reading + ', 0)';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR, db_OK);			
}

function db_catReadings()
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var msg;
	var table;
	db.transaction(function (tx) {
	   tx.executeSql('SELECT * FROM READINGS', [], function (tx, results) {
		   var len = results.rows.length, i;
		   msg = "<p>Found rows: " + len + "</p>";
		   document.getElementById("tableData").innerHTML = msg;
		   
		   table = '<table>';
		   table += '<th>Time</th><th>Meter ID</th><th>User ID</th><th>Meter Read</th>';
		   for (i = 0; i < len; i++){
		      //alert(results.rows.item(i).log );
		   		var thisread = results.rows.item(i);
		   		table+='<tr>';
		   		table+='<td>' + thisread.time + '</td>';
		   		table+='<td>' + thisread.meter_id + '</td>';
		   		table+='<td>' + thisread.user_id + '</td>';
		   		table+='<td>' + thisread.meter_read + '</td>';
		   		table+='</tr>';
		   }
		   table += "</table>";
			document.getElementById("tableData").innerHTML += table;
		});
	},db_ERR, db_OK);
}

function db_taskUncommitedReadings(task)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var msg;
	var table;
	db.transaction(function (tx) {
	   tx.executeSql('SELECT * FROM READINGS WHERE committed=0', [], function (tx, results) {
		   var len = results.rows.length, i;
		   for (i = 0; i < len; i++){
		   		var thisread = results.rows.item(i);
		   		task(thisread.time, thisread.meter_id, thisread.user_id, thisread.meter_read);
		   }
		});
	},db_ERR, db_OK);
}


function db_catMeters(readFilter,filter)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var msg;
	var table;
	var sqlCmd = 'SELECT unit_number, unit_name, description FROM METERS';

	if(readFilter)
	{
		sqlCmd += ' LEFT JOIN READINGS ON READINGS.meter_id = METERS.unit_number WHERE READINGS.meter_id IS NULL';
		if(filter)
			sqlCmd += ' AND METERS.unit_number LIKE "%' + filter + '%"';
	}
	else
	{
		if(filter)
			sqlCmd += ' WHERE unit_number LIKE "%' + filter + '%"';
	}
	
	db.transaction(function (tx) {
	   tx.executeSql(sqlCmd, [], function (tx, results) {
		   var len = results.rows.length, i;
		   var tableHeader = document.getElementById("tableHeader").innerHTML;
		   msg = "<p>Found rows: " + len + "</p>";
		   document.getElementById("tableData").innerHTML = msg;
		   table = '<table id="metersTable" class="cTable" dir="rtl">';
//		   table += '<tr><th>#</th><th>שם</th><th>תיאור</th></tr>';
		   table += '<tr id="tableHeader">' + tableHeader + '</tr>';
		   for (i = 0; i < len; i++){
		      //alert(results.rows.item(i).log );
		   		var thisread = results.rows.item(i);
		   		table+='<tr>';
		   		table+='<td>';
//		   		table+='<form><input type="submit" formaction="MeterData.html" name="id" value="' + thisread.unit_number + '"></form>';
		   		table+='<form action="MeterData.html" onSubmit=Mone("' + thisread.unit_number + '")><input class="cMeterId" type="submit" value="' + thisread.unit_number + '"></form>';
		   		table+='</td>';
		   		//table+='<td title="'+ thisread.description + '">' + thisread.unit_name;
		   		table+='<td class="cUnitName">' + thisread.unit_name + '</td>';
		   		table+='<td>' + thisread.description + '</td>';
		   		table+='</tr>';
		   }
		   table += "</table>";
			document.getElementById("tableData").innerHTML = table;
		});
	},db_ERR, db_OK);
	
}


function db_catMeters2(readFilter,distanceFilter, filter,task)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var msg;
	var table;
	var sqlCmd = 'SELECT * FROM METERS LEFT JOIN READINGS ON READINGS.meter_id = METERS.unit_number';
	var filterWord = " WHERE ";
	
	if(readFilter) { sqlCmd += filterWord + 'READINGS.meter_id IS NULL'; filterWord = " AND "; }
	
	if(distanceFilter) { sqlCmd += filterWord + 'METERS.distance<' + (localStorage.RADIUS_SETUP * 1000); filterWord = " AND "; }
		
	if(filter) { sqlCmd += filterWord+ 'METERS.unit_name LIKE "%' + filter + '%"'; filterWord = " AND "; }
	
	db.transaction(function (tx) {
	   tx.executeSql(sqlCmd, [], function (tx, results) {
		   var len = results.rows.length, i;
		   for (i = 0; i < len; i++){
		   		task(results.rows.item(i));
		   }
		});
	},db_ERR, db_OK);
	
}


function db_updateMeterDistance(unit_name, distance)
{
	
	var sqlCmd = 'UPDATE METERS SET distance=' + distance + ' WHERE unit_name=' + unit_name + ';';
	var db = openDatabase(DB_NAME, DB_VERSION, 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR, db_OK);			

}

function db_addGeneral(key, val)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'INSERT INTO GENERAL VALUES ("' + key + '", "' + val + '")';
	db.transaction(function (tx) {
/*		tx.executeSql(sqlCmd, function (tx, results) {
	   		
		});
		*/
		tx.executeSql(sqlCmd);
	}, db_ERR, db_OK);


}

function db_checkAge(ageInDays, tooOldFunction)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'SELECT * FROM GENERAL WHERE ( key = "' + DB_DATE + '");';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd,[], function(tx, results) {
			var update;
			var DEBUG_FORCE_UPDATE = false;
			var len = results.rows.length, i;
			
			update = false;
			if(len == 0 || DEBUG_FORCE_UPDATE)
				update = true;
			else
			{
				// 
				var today = new Date();	// now
				var dbDate = new Date(results.rows.item(0).value);
				dbDate.setDate(dbDate.getDate()+ ageInDays);	// Set update date 
				if(dbDate < today) 
					update = true;
			}; 

			if(update) {
				alert("בסיס הנתונים אינו מעודכן.\nמעדכן...");
				tooOldFunction();
			};
		});
	}, function(err){
		alert("בסיס הנתונים חדש או לא תקין.\nמאתחל...");
		tooOldFunction();
	}, db_OK);
	
}

function db_dummy(okCallback)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'SELECT * FROM GENERAL;';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd,[], function(tx, results) {
				;	// do nothing with the result
		});
	}, db_ERR, okCallback);
	
}


function db_updateCommit(id)
{
	var sqlCmd = 'UPDATE READINGS SET committed=1 WHERE meter_id=' + id + ';';
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR, db_OK);			

}


function db_checkAgeERR(err)
{
	alert("בסיס הנתונים פגום.\nמאתחל...");
	tooOldFunction();
	
}


function db_saveCurrentLocation(locationData)
{
	alert(locationData.toString());
	// locationData.id, locationData.LAT, locationData.LONG, locationData.ALT
	var sqlCmd = 'UPDATE METERS SET gps_lat='+ locationData.LAT + ', gps_long=' + locationData.LONG +', gps_alt='+ locationData.ALT +' WHERE unit_name=' + locationData.id + ';';
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR, db_OK);			

}







function db_ERR(err)
{
  	console.log("DB Err # : " + err.code);
    console.log("DB Err : " + err.message);
}

function db_ERR1(err)
{
  	console.log("DB Err # : " + err.code);
    console.log("DB Err : " + err.message);
}

function db_ERR2(err)
{
  	console.log("DB Err # : " + err.code);
    console.log("DB Err : " + err.message);
}

function db_ERR3(err)
{
  	console.log("DB Err # : " + err.code);
    console.log("DB Err : " + err.message);
}

function db_OK()
{
	console.log("DB: OK");
}

function db_updateHandler()
{
	var callback = function(){alert("1234567");};
	var metersUpdated=false, readingsUpdated=false, usersUpdated=false, callbackDone=false;

//	function trigger(callback, metersUpdated, readingsUpdated, usersUpdated, callbackDone)
	this.trigger=function()
	{
		if(callback && !callbackDone && metersUpdated && readingsUpdated && usersUpdated)
		{
			callbackDone = true;
			callback();
		}
	};
	
	this.reset = function(_callback)
	{
		callback=_callback; 
		callbackDone =false; 
		metersUpdated=false; 
		readingsUpdated=false; 
		usersUpdated=false;
	};
	
	this.meters = function() 
	{
		metersUpdated=true; 
		//trigger(callback, metersUpdated, readingsUpdated, usersUpdated, callbackDone);
		this.trigger();
	};

	this.readings = function() 
	{
		readingsUpdated=true; 
		//trigger(callback, metersUpdated, readingsUpdated, usersUpdated, callbackDone);
		this.trigger();
	};
	
	this.users = function() 
	{
		usersUpdated=true; 
		//trigger(callback, metersUpdated, readingsUpdated, usersUpdated, callbackDone);
		this.trigger();
	};
}
