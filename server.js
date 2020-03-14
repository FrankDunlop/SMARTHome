var path = require('path');
(function() {
	const express = require('express');
	const events = require('./src/events');
	const auto = require('./src/autocontrol');
	const config = require('./src/config');
	var dotenv = require('dotenv').config();
	//const DHTsensor = require('./src/DHTsensor');
	//var Gpio = require('onoff').Gpio; 
	var app = express();
	
	
	// Database
	var mongo = require('mongodb');
	var monk = require('monk');
	var db = monk('process.env.DATABASE_URL');
	// Make db accessible to our router
	app.use(function(req,res,next){
		req.db = db;
		next();
	});
	
	app.set('view engine', 'ejs');	
	app.set('views', __dirname + '/views');
	app.set("view options", {layout: false}); 

	app.use(express.static(__dirname + '/public'));
	app.use('/', express.static(path.join(__dirname, 'stream')));
	//app.use(express.static(__dirname + '/src/stream')); 
	
	console.log(__dirname);
	
	var authRouter = require('./routes/auth');
	var homeRouter = require('./routes/home');
	var settingsRouter = require('./routes/settings');
	app.use('/', authRouter);
	app.use('/home', homeRouter);
	app.use('/settings', settingsRouter);
	app.use(function(err, req, res, next) {
		console.log('Error: ' + err.message);
		res.render('error');
	});
									
	//if (DHTsensor.initialize()) {
	//	events.AsyncReadDHTSensor();
		events.AsyncGetWeatherReport();
	//} else {
	//	process.exit(); 
	//}
	
	var port = process.env.Port || 3000
	var server = app.listen(port, () => console.log('Server Listening on port ' +port));
	events.ConfigSockets(server, app);
	
	//auto update UI with sensor and weather readings
	var UpdateWeatherDataInterval = setInterval(UpdateWeatherData, 60000);
	function UpdateWeatherData(){ 
		try {
			//events.AsyncReadDHTSensor(); 							
			events.AsyncGetWeatherReport();
		} catch(err) {
			console.log('Sensor/Weather Reading Error: ' + err.message);
		}						
	}

	async function asyncSetAuto(){
		config.deviceVals = await auto.asyncSetAutoDevices(config.deviceVals, config.sensorVals);
		events.UpdateClients();
	} 	 

	//configure devices based on auto setting 
	var AutoDeviceCheckInterval = setInterval(AutoDeviceCheck, 60000);
	function AutoDeviceCheck(){ 
		if(config.autoSetting){
			console.log('Auto Device Check');
			asyncSetAuto();
		}
	}
	 
	process.on('SIGINT', function () {										
		clearInterval(UpdateWeatherDataInterval);
		clearInterval(AutoDeviceCheckInterval);
		process.exit(); 												
	});
	
	module.exports = app;
})();
