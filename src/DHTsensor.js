var sensorLib = require('node-dht-sensor');								//Temp & Humidity Sensor
const config = require('./config');

(function() {
	var DHTVals = {temp:0, humidity:0};

	function getTimestamp(){
		var today = new Date();
		var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		return date + ' '+ time;
	}
	
	module.exports = {
		initialize: function() {
			if(sensorLib.initialize(config.sensorType, config.sensorGPIO)) {	
				console.log('DHT Sensor Initialized');
				return true;
			} else {
				console.warn('Failed to Initialize DHT Sensor');
				return false;
			}	
		},
		
		asyncGetDHTVals: function() {
			return new Promise(resolve => {
				setTimeout(() => {
					var readout = sensorLib.read();
					sensorLib.read(config.sensorType, config.sensorGPIO, function(err, temperature, humidity) {
						if (!err){
							DHTVals.temp = readout.temperature.toFixed(0);		
							DHTVals.humidity  = readout.humidity.toFixed(0);
							console.log(getTimestamp() + ' @DHT: ' + DHTVals.temp + '°C, ' + DHTVals.humidity + '%');
						}
						else{
							console.log('DHT Sensor Reading Error: ' + err); 
						}
					});
					resolve(DHTVals);
				}, 1000);
			});
		},
		
		GetDHTVals: function() {
			var readout = sensorLib.read();
			sensorLib.read(config.sensorType, config.sensorGPIO, function(err, temperature, humidity) {
				if (!err){
					DHTVals.temp = readout.temperature.toFixed(0) - 5;		
					DHTVals.humidity  = readout.humidity.toFixed(0);
					console.log(getTimestamp() + ' @DHT: ' + DHTVals.temp + '°C, ' + DHTVals.humidity + '%');
				}
				else{
					console.log('DHT Sensor Reading Error: ' + err);
				}
			});
			return DHTVals;
		}
	}
})();
