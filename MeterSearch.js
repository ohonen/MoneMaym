function Mone(number)
{
	sessionStorage.meterId = number;
}

$(document).ready(function() {
	$("#User").html(sessionStorage.User);
	
	$("#readws").click(function() {
		alert("Read WS was pressed");
		readWS2();
	});
	
	$("#footerSetup").click(function() {
		window.location = "SystemSetup.html";
	});


	$("#footerLeft").hide();
	$("#footerRight").hide();
	$("#footerDetails").hide();
	
	db_catMeters();

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

//var productServiceUrl = "http://5.100.248.223/MesophonTest/service1.asmx?op=GetSingleInstanceForTestUsingContext";

