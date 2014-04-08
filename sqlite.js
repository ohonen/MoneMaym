var DB_NAME='monedb';
var DB_VERSION='1.0';

function db_deleteDB()
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql('DROP TABLE IF EXISTS GENERAL');
		tx.executeSql('DROP TABLE IF EXISTS METERS');
		tx.executeSql('DROP TABLE IF EXISTS USERS');
		tx.executeSql('DROP TABLE IF EXISTS READINGS');
	},db_ERR, db_OK);
}

function db_init()
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
		'time_0 TEXT, ' +
		'amount_0 INTEGER, ' +
		'type_0 INTEGER, ' +
		'time_1 TEXT, ' +
		'amount_1 INTEGER, ' +
		'type_1 INTEGER, ' +
		'time_2 TEXT, ' +
		'amount_2 INTEGER, ' +
		'type_2 INTEGER, ' +
		'time_3 TEXT, ' +
		'amount_3 INTEGER, ' +
		'type_3 INTEGER, ' +
		'time_4 TEXT, ' +
		'amount_4 INTEGER, ' +
		'type_4 INTEGER)';
	tx.executeSql(sqlCmd);
		
	tx.executeSql('CREATE TABLE IF NOT EXISTS USERS(id INTEGER unique, name TEXT, pwd TEXT)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS READINGS(time TEXT, meter_id INTEGER, meter_read INTEGER, commited INTEGER)');
//	msg = '<p>Log message created and row inserted.</p>';
//	document.querySelector('#status').innerHTML =  msg;
	},db_ERR, db_OK);
}

function db_addMeter(id, qc, name, description, customer, iron, diameter, digits, factor, change_limit, gps_lat, gps_long, gps_alt, time_0, amount_0, type_0, time_1, amount_1, type_1, time_2, amount_2, type_2, time_3, amount_3, type_3, time_4, amount_4, type_4) 
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'INSERT INTO METERS VALUES(' + id + ','+qc+', "' + name + '", "' + description + '","' + customer + '",' + iron +','+diameter+','+digits+','+factor+','+change_limit+','+gps_lat+','+ gps_long+','+ gps_alt+',"'+ time_0+'",'+ amount_0+','+ type_0+',"'+ time_1+'",'+ amount_1+','+ type_1+',"'+ time_2+'",'+ amount_2+','+ type_2+',"'+ time_3+'",'+ amount_3+','+ type_3+',"'+ time_4+'",'+ amount_4+','+ type_4+')';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR, db_OK);		
}


function db_addUser(id, name, pwd)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'INSERT INTO USERS VALUES(' + id + ', "' + name + '", "'+pwd+'")';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR, db_OK);		
	
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

function db_catMeters(filter)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var msg;
	var table;
	var sqlCmd = 'SELECT unit_number, unit_name, description FROM METERS';
	if(filter!=undefined)
	{
		sqlCmd += ' WHERE unit_number LIKE "%' + filter + '%"';
	}
	db.transaction(function (tx) {
	   tx.executeSql(sqlCmd, [], function (tx, results) {
		   var len = results.rows.length, i;
		   var tableHeader = document.getElementById("tableHeader").innerHTML;
		   msg = "<p>Found rows: " + len + "</p>";
		   document.getElementById("tableData").innerHTML = msg;
		   table = '<table dir="rtl">';
//		   table += '<tr><th>#</th><th>שם</th><th>תיאור</th></tr>';
		   table += '<tr id="tableHeader">' + tableHeader + '</tr>';
		   for (i = 0; i < len; i++){
		      //alert(results.rows.item(i).log );
		   		var thisread = results.rows.item(i);
		   		table+='<tr>';
		   		table+='<td>';
		   		table+='<form><input type="submit" formaction="MeterData.html" name="id" value="' + thisread.unit_number + '"></form>';
		   		table+='</td>';
		   		//table+='<td title="'+ thisread.description + '">' + thisread.unit_name;
		   		table+='<td>' + thisread.unit_name + '</td>';
		   		table+='<td>' + thisread.description + '</td>';
		   		table+='</tr>';
		   }
		   table += "</table>";
			document.getElementById("tableData").innerHTML = table;
		});
	},db_ERR, db_OK);
	
}


function db_ERR(err)
{
  	console.log("DB Err # : " + err.code);
    console.log("DB Err : " + err.message);
}

function db_OK()
{
	console.log("DB: OK");
}

