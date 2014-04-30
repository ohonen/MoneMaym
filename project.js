localStorage.RADIUS_SETUP = localStorage.RADIUS_SETUP || 5;


$(document).ready(function() {
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
		navigator.geolocation.getCurrentPosition(callback);
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

