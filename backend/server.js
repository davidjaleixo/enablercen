// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var constants	   = require('../constants.js');
var mongoose	   = require('mongoose');
var logger		   = require('../config/logger.js');


// configuration ===========================================

// config files
var db = require('../config/db');


// set our port
var port = process.env.PORT || 3000; 

mongoose.set('debug', true);

// connect to our mongoDB database 
try {
	logger.info("Mongodb Trying to connect with options: ", db.options);
	mongoose.connect(db.url, db.options);
} catch (err){
	logger.error("Mongodb error", err.stack);
}
//mongoose events:
// When successfully connected
mongoose.connection.on('connected', function () {  
  logger.info('Mongoose default connection open to ', db.url);
});
// If the connection throws an error 
mongoose.connection.on('error',function (err) {  
  logger.error('Mongoose default connection error: ', err);
});
// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  logger.error('Mongoose default connection disconnected'); 
});
// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
app.use(express.static(constants.FRONTEND_PATH + '/public'));

// routes ==================================================
require('./routes')(app); // configure our routes

// start app ===============================================
// startup our app at http://localhost:3000
app.listen(port);               


logger.info("Configuration Enabler is running at port", port);

// expose app           
exports = module.exports = app;
