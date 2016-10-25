
var express = require('express');
var http = require('http');
var path = require('path');
var router = express.Router();
var app = express();
var favicon = require("serve-favicon");
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use('/', router);

var routes = require('./routes/routes.js')(app);

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
