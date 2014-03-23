function db_init()
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var msg;
	db.transaction(function (tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS METERS(id INTEGER unique, name TEXT, description TEXT, location TEXT)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS USERS(id INTEGER unique, ext_id TEXT, name TEXT, pwd_sha1 TEXT, pwd_time TEXT)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS READINGS(time TEXT, meter_id INTEGER, user_id INTEGER, meter_read INTEGER)');
//	msg = '<p>Log message created and row inserted.</p>';
//	document.querySelector('#status').innerHTML =  msg;
	},db_ERR, db_OK);
}

function db_addMeter(id, name, description, location)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'INSERT INTO METERS VALUES(' + id + ', "' + name + '", "' + description + '","' + location + '")';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR, db_OK);		
}


function db_addUser(id, ext_id, name)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var sqlCmd = 'INSERT INTO USERS VALUES(' + id + ', "'+ ext_id + '", "' + name + '", "", "")';
	db.transaction(function (tx) {
		tx.executeSql(sqlCmd);
	},db_ERR, db_OK);		
	
}

function db_addReading(user_id, meter_id, reading)
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var now = new Date();
	var nowStr = now.toUTCString();
	var sqlCmd = 'INSERT INTO READINGS VALUES("' + nowStr + '", ' + user_id + ', ' + meter_id + ', ' + reading + ')';
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

function db_catMeters()
{
	var db = openDatabase('monedb', '1.0', 'Water Meter DB', 2 * 1024 * 1024);
	var msg;
	var table;
	db.transaction(function (tx) {
	   tx.executeSql('SELECT * FROM METERS', [], function (tx, results) {
		   var len = results.rows.length, i;
		   msg = "<p>Found rows: " + len + "</p>";
		   document.getElementById("tableData").innerHTML = msg;
		   
		   table = '<table>';
		   table += '<th>ID</th><th>Name</th><th>Location</th>';
		   for (i = 0; i < len; i++){
		      //alert(results.rows.item(i).log );
		   		var thisread = results.rows.item(i);
		   		table+='<tr>';
		   		table+='<td>';
		   		table+='<form><input type="submit" formaction="MeterData.html" name="id" value="' + thisread.id + '"></form>';
		   		table+='</td>';
		   		table+='<td title="'+ thisread.description + '">' + thisread.name;
		   		table+='</td>';
		   		table+='<td>' + thisread.location + '</td>';
		   		table+='</tr>';
		   }
		   table += "</table>";
			document.getElementById("tableData").innerHTML += table;
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

