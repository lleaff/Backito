var express = require('express');
var app = express();

app.use(express.logger('dev'))

app.set('views', '/theme');
app.set('view engine', 'html');

app.get('/', function(req, res){
    res.render("index");
});

app.listen(8080);