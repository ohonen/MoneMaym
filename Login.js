$(document).ready(function() {
	checkDbDate();
	db_readUsers();
});

function checkDbDate()
{	
	//db_checkAge(DB_AGE_LIMIT, TEST_initDB);
	db_checkAge(0, initDB);
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

	db_deleteDB();
	db_init();
	db_addUser("MY","אופיר", "123");
	
	// update meters, readings and users
 	ws_getAllMeters();
 	// ws_getLastReadings();
 	ws_getAllUsers();

	// "MasofonService.asmx/InsertReading?ioId=1&comments="Oren"&readingTime=2014-4-15%2012:00:02&value=34567"
	// ws_insertReading(1, "2014-4-15%2012:00:02", 34567, "Oren"); 	

	//ws_getMeters();
	//ws_getReadings();
	//ws_getUsers();
	
	// Example by Evgeny
    //makeCorsRequest();
    //makeJRequest();
 
}

function checkUser(form)
{
	if(G_USERS[form.uname.value] == form.pwd.value)
	{
		sessionStorage.User = form.uname.value;
		window.location="MeterSearch.html";				
	}
	else
	{
		alert("שם משתמש או סיסמא שגויים");
	}
}


