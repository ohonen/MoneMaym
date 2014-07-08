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

function db_deleteDB(OK_cb)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql('DROP TABLE IF EXISTS GENERAL');
		tx.executeSql('DROP TABLE IF EXISTS METERS');
//		tx.executeSql('DROP TABLE IF EXISTS USERS');
		tx.executeSql('DROP TABLE IF EXISTS OLD_READINGS');

		// Readings is never drop to prevent situation of dropping actual reads
		//tx.executeSql('DROP TABLE IF EXISTS READINGS');
		

	},db_ERR, OK_cb);
}

function dbFunc(val)
{
	return 3;
};

function db_init(callback)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var msg;

	db.transaction(function (tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS GENERAL(key TEXT unique, value TEXT)');
	var sqlCmd = 'CREATE TABLE IF NOT EXISTS METERS(' +
		'ix INTEGER UNIQUE, ' +
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
		
//	tx.executeSql('CREATE TABLE IF NOT EXISTS USERS(id TEXT, name TEXT COLLATE NOCASE, pwd TEXT)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS READINGS(time TEXT, meter_id INTEGER, meter_read INTEGER, committed INTEGER)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS OLD_READINGS(time TEXT, meter_id INTEGER, meter_read INTEGER, type INTEGER)');

	// If READINGS already exists then clean it up
	tx.executeSql('DELETE FROM READINGS WHERE committed=1');
	
//	var dt = new Date();		// Now
//	db_addGeneral(DB_DATE, dt.toLocaleDateString());	
	

	},db_ERR, callback);
}


function db_initOK()
{	
//	var msg="בסיס הנתונים עודכן בהצלחה";
//	DB_hUPDATE.reset(alert(msg));
	db_OK();
}

// index (first column) is missing
function db_addMeterBase(id, qc, name, description, customer, iron, diameter, digits, factor, change_limit, gps_lat, gps_long, gps_alt)
{
	db_addMeter(id, qc, name, description, customer, iron, diameter, digits, factor, change_limit, gps_lat, gps_long, gps_alt, 5000,
		"time_0", 0, 0, 
		"time_1", 1, 1, 
		"time_2", 2, 2, 
		"time_3", 3, 3, 
		"time_4", 4, 4); 
}

// index (first column) is missing
function db_addMeter(id, qc, name, description, customer, iron, diameter, digits, factor, change_limit, gps_lat, gps_long, gps_alt, distance, time_0, reading_0, type_0, time_1, reading_1, type_1, time_2, reading_2, type_2, time_3, reading_3, type_3, time_4, reading_4, type_4) 
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'INSERT INTO METERS VALUES(' + id + ','+qc+', "' + name + '", "' + description + '","' + customer + '",' + iron +','+diameter+','+digits+','+factor+','+change_limit+','+gps_lat+','+ gps_long+','+ gps_alt+',' + distance + ',"'+ time_0+'",'+ reading_0+','+ type_0+',"'+ time_1+'",'+ reading_1+','+ type_1+',"'+ time_2+'",'+ reading_2+','+ type_2+',"'+ time_3+'",'+ reading_3+','+ type_3+',"'+ time_4+'",'+ reading_4+','+ type_4+')';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR, db_OK);		
}

function db_addAllMeters(allMeters_JSON, OK_callback, ERR_callback)
{
	var allMetersSerialized=[];
	$(allMeters_JSON).each(function(i, meter)
	{
//   		var name = $(this).find('Name').text();
//   		var meter = $(this)[0];
		//if(i<1000)
		{
   		var meterSerialized = '';
   		meterSerialized += i + ',';
   		meterSerialized += meter.ParentUnitId + ',';
   		meterSerialized += meter.IOId + ',';
   		meterSerialized += '"' + meter.ParentUnitName.replace(/[\'\"]/g,'') + '",';
   		meterSerialized += '"' + meter.Description.replace(/[\'\"]/g,'') + '",';
   		meterSerialized += '"' + (meter.CustomerName || 'אגודה').replace(/[\'\"]/g,'') + '",';
   		meterSerialized += meter.IronId + ',';
   		meterSerialized += meter.Diameter + ',';
   		meterSerialized += meter.Digits + ',';
   		meterSerialized += meter.Factor + ',';
   		meterSerialized += 9999999999 + ',';				// default read limit
   		meterSerialized += meter.GPS_LAT + ',';
   		meterSerialized += meter.GPS_LONG + ',';
   		meterSerialized += meter.GPS_ALT + ',';
   		meterSerialized += 5000 + ',';				// default map distance
		meterSerialized += '"time_0", 0, 0,';
		meterSerialized += '"time_1", 1, 1,'; 
		meterSerialized += '"time_2", 2, 2,'; 
		meterSerialized += '"time_3", 3, 3,'; 
		meterSerialized += '"time_4", 4, 4'; 
		allMetersSerialized[i] = meterSerialized;
		}
	}).promise().done(function(){	// When all meters read and schedule for DB insert
		/*alert("meters read");*/ 
		var db = openDatabase(DB_NAME, DB_VERSION, 'Water Meter DB', 2 * 1024 * 1024);
		var sqlCmdBase = 'INSERT INTO METERS VALUES ';
		db.transaction(function (tx) {
			for(var i=0; i<allMetersSerialized.length; ++i)
			{
				var sqlCmd = sqlCmdBase + '(' + allMetersSerialized[i] + ');';
				tx.executeSql(sqlCmd);
			}
		},ERR_callback || db_ERR, OK_callback || db_OK);		
	});
					

}


function db_addMeterReading(index, qc, date, value, type)
{
	var sqlCmd = 'UPDATE METERS SET time_' + index + '="'+ date + '", reading_' + index + '=' + value +', type_' + index + '='+ type +' WHERE qc=' + qc + ';';
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR, db_OK);			
}

// DB_hUPDATE.readings();
function db_addMeterReading2(allMetersUpdate_JSON, OK_callback, ERR_callback)
{
	var metersUpdateSqlCmd = [];
	var old_readingsSqlCmd = [];
	$(allMetersUpdate_JSON).each(function(index, item)
	{
		//var reading = $(this)[0];
		var dateNum = item.ReadingTime.replace(/\D/g,'');
		var date = new Date(parseInt(dateNum));
		var type = 0; // MISSING
		var modIndex = index%4;
		metersUpdateSqlCmd[index] = 'UPDATE METERS SET ';
		metersUpdateSqlCmd[index] += 'time_' + modIndex + '="' + date.toLocaleDateString() + '",';
		metersUpdateSqlCmd[index] += 'reading_' + modIndex + '=' + item.Value + ',';
		metersUpdateSqlCmd[index] += 'type_' + modIndex + '=' + type;
		metersUpdateSqlCmd[index] += ' WHERE qc=' + item.IoId + ';';
		
		// 	tx.executeSql('CREATE TABLE IF NOT EXISTS OLD_READINGS(time TEXT, meter_id INTEGER, meter_read INTEGER, type INTEGER)');
		//old_readingsSqlCmd.push('INSERT INTO OLD_READINGS VALUES ("' + date.toLocaleDateString()+ '", ' + item.IoId + ', ' + item.Value + ', ' + type + ')');
		old_readingsSqlCmd.push('INSERT INTO OLD_READINGS VALUES ("' + date.getTime()+ '", ' + item.IoId + ', ' + item.Value + ', ' + type + ')');

	}).promise().done(function(){
		var db = openDatabase(DB_NAME, DB_VERSION, 'Water Meter DB', 2 * 1024 * 1024);
		db.transaction(function (tx) {
			for(var i=0; i<metersUpdateSqlCmd.length; ++i) {
				tx.executeSql(metersUpdateSqlCmd[i]);
				tx.executeSql(old_readingsSqlCmd[i]);
			}
		},ERR_callback || db_ERR, OK_callback || db_OK);			
		
	});
					

}


function db_initUsers(OK_cb, ERR_cb)
{
	var db = openDatabase(DB_NAME, DB_VERSION, 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
	
		tx.executeSql('DROP TABLE IF EXISTS USERS');
		tx.executeSql('CREATE TABLE IF NOT EXISTS USERS(id TEXT, name TEXT COLLATE NOCASE, pwd TEXT)');
	}, ERR_cb, OK_cb);
}

function db_addUser(id, name, pwd)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'INSERT INTO USERS VALUES("' + id + '", "' + name + '", "'+pwd+'")';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR2, db_OK);		
	
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
	},function(err) { db_ERR(err); FAIL_Callback(); }, db_OK);		
}

function db_readUsers(DONE_cb, ERR_cb)
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
		   
		   if(DONE_cb)
		   		DONE_cb();
		   
		});
	},function(err) {
		db_ERR(err);
		ERR_cb();
	}, db_OK);
}


function db_readMeter(readMeterOK)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM METERS WHERE qc=' + parseInt(sessionStorage.meterId), [], function(tx, results) { 
//		tx.executeSql('SELECT * FROM METERS', [], function(tx, results) { 
	 	G_METER = results.rows.item(0);

	 } );
	},db_ERR, readMeterOK);

}

function db_readOldReadings(qc, callback)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		var sqlCmd = 'SELECT * FROM OLD_READINGS WHERE meter_id=' + qc + ' ORDER BY time DESC';
		tx.executeSql(sqlCmd, [], function(tx, results) { 
//		tx.executeSql('SELECT * FROM METERS', [], function(tx, results) { 
	 		callback(results);
	 } );
	},db_ERR, db_OK);
	
}

function db_addReading(readTime, meter, reading, callback)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var now = new Date();
	var nowStr = now.toUTCString();
//	var sqlCmd = 'INSERT INTO READINGS VALUES("' + nowStr + '", ' + user_id + ', ' + meter_id + ', ' + reading + ')';
	var sqlCmd = 'INSERT INTO READINGS VALUES("' + readTime + '", ' + meter + ', ' + reading + ', 0)';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd,[],callback);
	},db_ERR1, db_OK);			
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


// Get current system reading of a specific meter
function db_taskMeterReadings(id, task)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var msg;
	var table;
	db.transaction(function (tx) {
		sqlCmd = 'SELECT * FROM READINGS WHERE meter_id=' + id;
//		tx.executeSql(sqlCmd, [], function (tx, results) {
//	   		task(tx,results);
//		});
		tx.executeSql(sqlCmd, [], task);
	},db_ERR1, db_OK);	
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
	},db_ERR2, db_OK);
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


function db_catMeters2(readFilter,distanceFilter, filter,task, postTask)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var msg;
	var table;
	var sqlCmd = 'SELECT * FROM METERS LEFT JOIN READINGS ON READINGS.meter_id = METERS.qc';
	var filterWord = " WHERE ";
	
	if(readFilter) { sqlCmd += filterWord + 'READINGS.meter_id IS NULL'; filterWord = " AND "; }
	
	if(distanceFilter) { sqlCmd += filterWord + 'METERS.distance<' + (localStorage.RADIUS_SETUP * 1000); filterWord = " AND "; }
		
	if(filter) { 
		sqlCmd += filterWord+ '(METERS.unit_name LIKE "%' + filter + '%" OR '; 
		sqlCmd += 'METERS.description LIKE "%' + filter + '%" OR '; 
		sqlCmd += 'METERS.customer_name LIKE "%' + filter + '%")'; 
		filterWord = " AND "; 
	}
	
	
	sqlCmd += " ORDER BY METERS.unit_name";
	
	db.transaction(function (tx) {
	   tx.executeSql(sqlCmd, [], function (tx, results) {
		   var len = results.rows.length, i;
		   for (i = 0; i < len; i++){
		   		task(results.rows.item(i));
		   }
		   
		   postTask();
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

// 
function db_updateAllMetersDistance(currentPosition, getGpsDistance, OK_callback)
{
	var sqlCmdRead = 'SELECT * FROM METERS;';
	var sqlCmdUpdate = 'UPDATE METERS SET distance=myDbFunc(5);';
	//var sqlCmd = 'UPDATE METERS SET distance=' + distance + ' WHERE unit_name=' + unit_name + ';';
	var db = openDatabase(DB_NAME, DB_VERSION, 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
	   tx.executeSql(sqlCmdRead, [], function (tx, results) {
			var len = results.rows.length, i;
			var db = openDatabase(DB_NAME, DB_VERSION, 'Water Meter DB', 2 * 1024 * 1024);
	   		db.transaction(function(tx){
				for (i = 0; i < len; i++){
			   		//task(results.rows.item(i));
			   		var item = results.rows.item(i);
			   		var distance = getGpsDistance({lat: currentPosition.coords.latitude, lon: currentPosition.coords.longitude}, {lat:item.gps_lat, lon:item.gps_long});
			   		// NOT FINISHED !!!!
			   		var sqlCmd = 'UPDATE METERS SET distance=' + distance + ' WHERE unit_name="' + item.unit_name + '";';
			   		tx.executeSql(sqlCmd);
				}  
	   		}, db_ERR, OK_callback);
		});
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

function db_checkAge(ageInDays, tooOldFunction, notOldFunction)
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
				var dbDate = new Date(results.rows.item(0).value*1);
				dbDate.setDate(dbDate.getDate()+ ageInDays);	// Set update date 
				if(dbDate < today) 
					update = true;
			}; 

			if(update) {
				//alert("בסיס הנתונים אינו מעודכן.\nמעדכן...");
				if(tooOldFunction)
					tooOldFunction();
			} else {
				if(notOldFunction)
					notOldFunction();
			}
		});
	}, function(err){
		if(tooOldFunction)
		{
			//alert("בסיס הנתונים חדש או לא תקין.\nמאתחל...");
			tooOldFunction();
		}
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
	//alert(locationData.toString());
	// locationData.id, locationData.LAT, locationData.LONG, locationData.ALT
	var sqlCmd = 'UPDATE METERS SET gps_lat='+ locationData.LAT + ', gps_long=' + locationData.LONG +', gps_alt='+ locationData.ALT +' WHERE unit_name="' + locationData.id + '";';
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR, db_OK);			

}

function db_onMeterTask(meterId, unitCallback)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
	   tx.executeSql('SELECT * FROM METERS WHERE unit_number=' + meterId, [], function (tx, results) {
		   //var len = results.rows.length, i;
			if(results.rows.length>0)
			{
				unitCallback(results.rows.item(0));
 			}
	
		});
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

// usersUpdate disabled(not checked in trigger) after separated from DB init 
function db_updateHandler()
{
	var callback = function(){alert("1234567");};
	var metersUpdated=false, readingsUpdated=false, usersUpdated=false, callbackDone=false;
	var isSuccess = true;

//	function trigger(callback, metersUpdated, readingsUpdated, usersUpdated, callbackDone)
	this.trigger=function()
	{
		//if(callback && !callbackDone && metersUpdated && readingsUpdated && usersUpdated)
		if(callback && !callbackDone && metersUpdated && readingsUpdated)
		{
			callbackDone = true;
			callback(isSuccess);
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
	
	this.meters = function(_isSuccess) 
	{
		metersUpdated=true; 
		if(_isSuccess==false)
			isSuccess &= _isSuccess;
			
		//trigger(callback, metersUpdated, readingsUpdated, usersUpdated, callbackDone);
		this.trigger();
	};

	this.readings = function(_isSuccess) 
	{
		readingsUpdated=true; 
		if(_isSuccess==false)
			isSuccess &= _isSuccess;
		//trigger(callback, metersUpdated, readingsUpdated, usersUpdated, callbackDone);
		this.trigger();
	};
	
	this.users = function(_isSuccess) 
	{
		usersUpdated=true; 
		if(_isSuccess==false)
			isSuccess &= _isSuccess;
		//trigger(callback, metersUpdated, readingsUpdated, usersUpdated, callbackDone);
		this.trigger();
	};
}
