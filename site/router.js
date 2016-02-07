var url = require('url');  
var fs = require('fs');
var express = require('express');

var app = express();
app.engine('html', function(path, options, fn){
  fs.readFile(path, 'utf8', function(err, str){
    if (err) return fn(err);
    fn(null, str);
  });
});

app.set('views', __dirname + '/views/theme');
app.set('view engine', 'html');

exports.get = function(req, res) {  
    req.requrl = url.parse(req.url, true);
    var path = req.requrl.pathname;
    app.use('/', express.static( __dirname + '/views/theme'));
    app.get('/', function(req, res) {
        res.render('index.html');
    });
    app.use(function(req, res, next){
        require('./controllers/404.js').get(req, res);
    });
};

app.listen(8080);