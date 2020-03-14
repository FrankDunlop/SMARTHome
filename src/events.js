const auto = require('./autocontrol');
const config = require('./config');
//const DHTsensor = require('./DHTsensor');
const weatherReport = require('./openweather');
var fs = require('fs');var fs = require('fs');
var spawn = require('child_process').spawn;
var proc;

var io; 
var app;

(function() {
	module.exports = {
		ConfigSockets: function(server, app1){
			io = require('socket.io').listen(server);
			app = app1;
			
			//websocket events
			io.sockets.on('connection', function (socket) {							
				var address = socket.handshake.address;
				console.log('Client IP' + address + ' Connected...');				
				
				module.exports.UpdateClients();
				
				//ReadDHTSensor(); 
				GetWeatherReport();					
				
				socket.on('autoChange', function(status) { 							
					config.autoSetting = status;
					console.log('AutoStatus ' + config.autoSetting);
					
					if(config.autoSetting){
						console.log('Setting Auto Devices');
						asyncSetAuto();
					}
					
					io.sockets.emit('AutoStatus', config.autoSetting);	
				});
			  
				socket.on('heatChange', function(status) { 							
					if (status == 1) { 	
						auto.sendIFTTTMessage ('Heat', status, 'TurnHeatOn', config.autoSetting)	
					} else {
						auto.sendIFTTTMessage ('Heat', status, 'TurnHeatOff', config.autoSetting);	  
					}	
					config.deviceVals.heat = status;	
					io.sockets.emit('HeatStatus', config.deviceVals.heat);					
				});					
				
				socket.on('immersionChange', function(status) { 							
					if (status == 1) { 	
						auto.sendIFTTTMessage ('Immersion', status, 'TurnImmersionOn', config.autoSetting)	
					} else {
						auto.sendIFTTTMessage ('Immersion', status, 'TurnImmersionOff', config.autoSetting);	  
					}	
					config.deviceVals.immersion = status;	
					io.sockets.emit('ImmersionStatus', config.deviceVals.immersion);					
				});		
				
				socket.on('lightChange', function(status) { 						
					if (status == 1) { 	
						auto.sendIFTTTMessage ('Light', status, 'SwitchLightOn', config.autoSetting)	
					} else {
						auto.sendIFTTTMessage ('Light', status, 'SwitchLightOff', config.autoSetting);
					}		
					config.deviceVals.light = status;
					io.sockets.emit('LightStatus', config.deviceVals.light);					
				});
				
				socket.on('camChange', function(status) { 						
					if (status == 1) { 	
						console.log("Starting stream.....");
    					startStreaming(io);	
						io.sockets.emit('CamStatus', 1);		
					} else {
						app.set('watchingFile', false);
    					if (proc) proc.kill();
    					fs.unwatchFile('./stream/image_stream.jpg');
						io.sockets.emit('CamStatus', 0);		
					}		
					//config.deviceVals.light = status;
								
				});
				
				
				socket.on('getAutoConfig', function() { 	
					console.log('Auto Values Read: ' + config.autoTempSetting + ' ' + config.autoImmersionSetting + ' ' + config.autoLightHourSetting);

					var request = require('request');
					request.get(process.env.IP+'/settings/autosettings', function(err, res, body) {
						if (!err && res.statusCode === 200) {
							var data = JSON.parse(body);
							//console.log(data);
							config.autoTempSetting = data[0].autoTempSetting;
							config.autoImmersionSetting = data[0].autoImmersionSetting;
							config.autoLightHourSetting = data[0].autoLightSetting;
							console.log('Auto Values DB Read: ' + config.autoTempSetting + ' ' + config.autoImmersionSetting + ' ' + config.autoLightHourSetting);
							config.autoVals.heat = config.autoTempSetting;
							config.autoVals.immersion = config.autoImmersionSetting;
							config.autoVals.light = config.autoLightHourSetting;				
							socket.emit('recAutoConfig', config.autoVals);	
						}
						else {
							console.log('Autosetting Read Error: ' + err);
						}			
					});
				});
				
				socket.on('autoValsChange', function(data) { 	
					config.autoVals.heat = config.autoTempSetting = data.heat;
					config.autoVals.immersion = config.autoImmersionSetting = data.immersion;
					config.autoVals.light = config.autoLightHourSetting = data.light;
					console.log('Auto Values Change: ' + data.heat + ' ' + data.immersion + ' ' + data.light);
					
					var request = require('request');
					request.post(process.env.IP+'/settings/autosettings', function(err, res, body) {
						if (!err) {
							console.log('Autosetting Write Success');
						}
						else {
							console.log('Autosetting Write Error: ' + err);
						}			
					});
					
					
					io.sockets.emit('recAutoConfig', config.autoVals);								
				});
			});
		},
		
		UpdateClients: function UpdateUIButtons() {
			io.sockets.emit('AutoStatus', config.autoSetting);
			io.sockets.emit('HeatStatus', config.deviceVals.heat);
			
			io.sockets.emit('ImmersionStatus', config.deviceVals.immersion);
			io.sockets.emit('LightStatus', config.deviceVals.light);
		},
		 
		SendEvent: function(event, data){
			io.sockets.emit(event, data);
		},
		
		AsyncReadDHTSensor: async function () {
			ReadDHTSensor();
		},

		AsyncGetWeatherReport: async function () {
			GetWeatherReport(); 
		},
		
		AsyncSetAuto: async function (){
			asyncSetAuto();
		}

	}

	function startStreaming(io) {
	  if (app.get('watchingFile')) {
		console.log("Socket Emit livestream1.....");
	    io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
	    return;
	  }
	 
	  var args = ["-w", "320", "-h", "240", "-o", "./stream/image_stream.jpg", "-t", "999999999", "-tl", "100"];
	  proc = spawn('raspistill', args);
	 
	  console.log('Watching for changes...');
	 
	  app.set('watchingFile', true);
	 
	  fs.watchFile('./stream/image_stream.jpg', function(current, previous) {
		console.log("Socket Emit livestream.....");
	    io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
	  })
	}
	
	async function asyncSetAuto(){
		config.deviceVals = await auto.asyncSetAutoDevices(config.deviceVals, config.sensorVals);
		module.exports.UpdateClients();
	}
	
	async function ReadDHTSensor(){
		var result = await DHTsensor.asyncGetDHTVals();
		config.sensorVals.heat = result.temp;
		io.sockets.emit('recDHTVals', result);
	}
	
	async function GetWeatherReport()
	{
		var result = await weatherReport.asyncGetCurrentWeather();
		io.sockets.emit('recWeatherReport', result);
	} 
	
})();
