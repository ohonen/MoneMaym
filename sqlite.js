var DB_NAME='monedb';
var DB_VERSION='1.0';
var G_USERS = new Object();
var G_METER;

function db_queryFunc(myFunc)
{
	var db = openDatabase(DB_NAME, DB_VERSION, 'Water Meter DB', 2 * 1024 * 1024);
	db.transaction(myFunc(tx) , db_ERR, db_OK );
}

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
		
	tx.executeSql('CREATE TABLE IF NOT EXISTS USERS(id INTEGER unique, name TEXT COLLATE NOCASE, pwd TEXT)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS READINGS(time TEXT, meter_id INTEGER, meter_read INTEGER, commited INTEGER)');
//	msg = '<p>Log message created and row inserted.</p>';
//	document.querySelector('#status').innerHTML =  msg;
	},db_ERR, db_OK);
}

function db_addMeter(id, qc, name, description, customer, iron, diameter, digits, factor, change_limit, gps_lat, gps_long, gps_alt, time_0, reading_0, type_0, time_1, reading_1, type_1, time_2, reading_2, type_2, time_3, reading_3, type_3, time_4, reading_4, type_4) 
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'INSERT INTO METERS VALUES(' + id + ','+qc+', "' + name + '", "' + description + '","' + customer + '",' + iron +','+diameter+','+digits+','+factor+','+change_limit+','+gps_lat+','+ gps_long+','+ gps_alt+',"'+ time_0+'",'+ reading_0+','+ type_0+',"'+ time_1+'",'+ reading_1+','+ type_1+',"'+ time_2+'",'+ reading_2+','+ type_2+',"'+ time_3+'",'+ reading_3+','+ type_3+',"'+ time_4+'",'+ reading_4+','+ type_4+')';
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

function db_checkUser(uname, password)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'SELECT * FROM USERS WHERE name = "' + uname + '" AND pwd = "' + password + '";';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
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
		   table = '<table class="cTable" dir="rtl">';
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

function db_addGeneral(key, val)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'INSERT INTO GENERAL VALUES (' + key + ', ' + val + ')';
	db.transaction(function (tx) {
/*		tx.executeSql(sqlCmd, function (tx, results) {
	   		
		});
		*/
		tx.executeSql(sqlCmd);
	}, db_ERR, db_OK);


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

