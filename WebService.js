var productServiceUrl = "http://5.100.248.223/MasofonService/MasofonService.asmx?op=GetAllMeters";

function readWS()
{
/*
var soapMessage =
'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> \
	<soap:Body> \
		<SaveProduct xmlns="http://sh.inobido.com/"> \
	<productID>' + productID + '</productID> \
<productName>' + productName + '</productName> \
<manufactureDate>' + manufactureDate + '</manufactureDate> \
</SaveProduct> \
</soap:Body> \
</soap:Envelope>';
*/

var soapMessage = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> \
  <soap:Body> \
    <GetSingleInstanceForTestUsingContext xmlns="http://tempuri.org/" /> \
  </soap:Body> \
</soap:Envelope>';


var soapArrayMessage = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> \
  <soap:Body> \
    <GetArrayOfTestClass xmlns="http://tempuri.org/" /> \
  </soap:Body> \
</soap:Envelope>';

	$.ajax({
		url: productServiceUrl,
		type: "POST",
		dataType: "xml",
		data: soapArrayMessage,
		complete: endReadWS,
		contentType: "text/xml; charset=\"utf-8\""
	});
 
	return false;
}

function endReadWS(xmlHttpRequest, status)
{
 $(xmlHttpRequest.responseXML)
    .find('SaveProductResult')
    .each(function()
	{
   		var name = $(this).find('Name').text();
	});
	
}

var soapGetAllMeters = '<?xml version="1.0" encoding="utf-8"?> \
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> \
  <soap:Body> \
    <GetAllMeters xmlns="http://tempuri.org/" /> \
  </soap:Body> \
</soap:Envelope>';


function readWS2()
{
	$.ajax({
		url: productServiceUrl,
		type: "POST",
		dataType: "xml",
		data: soapGetAllMeters,
		complete: endReadWS2,
		contentType: "text/xml; charset=\"utf-8\""
	});
 
	return false;

};

function endReadWS2(xmlHttpRequest, status)
{
 $(xmlHttpRequest.responseXML)
    .each(function()
	{
   		var name = $(this).find('Name').text();
	});
	
}
