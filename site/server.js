var http = require('http');
var dispatcher = require('httpdispatcher');

try {       var cfg = require('../src/config.js'); }
catch (e) { var cfg = {}; }

var http_IP = cfg.uiIp || '127.0.0.1';  
var http_port = cfg.uiPort || 8080;  

module.exports = function(ipAndPort) {
    var ip, port;
    if (ipAndPort !== undefined) {
        ip = ipAndPort.match(/[^:]+/);
        if (ip) ip = ip[0];
        port = ipAndPort.match(/[^:]+/);
        if (port) port = port[1];
    }
    port = port || http_port;
    ip = ip || http_IP;

    var server = http.createServer(function(req, res) {  
        require('./router').get(req, res);
    });
    server.listen(port, ip);  
    console.log('Listening to http://' + ip + ':' + port);  
}
