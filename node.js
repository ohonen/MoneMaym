var http = require('http');
var connect = require('connect');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '192.168.1.106');
console.log('Server running at http://127.0.0.1:1337/');

connect.createServer(
	connect.static(__dirname)
).listen(8080);
