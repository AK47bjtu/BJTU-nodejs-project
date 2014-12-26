var express = require('express');

var app = express();

app.get('/', function (req, res){
	console.log('hello world');
	res.send('hello world');
});

var server = app.listen((process.env.PORT || 5000), function() {
    console.log('Listening on port %d', server.address().port);
});

module.exports = app;
