const config = require('./config');		
const message = require('./messagesender');	
		
(function() {
	var deviceVals  = {heat:0, immersion:0, light:0};
	
	module.exports = {
		asyncSetAutoDevices: function(deviceStatus, sensorVals) {
			return new Promise(resolve => {
				setTimeout(() => {
					//auto heat code based on room temp
					if(config.autoTempSetting){
						AutoHeating(deviceStatus.heat, sensorVals.heat);
					}
					
					//auto immersion code based on time on setting
					if(config.autoImmersionSetting){
						AutoImmersion(deviceStatus.immersion);
					}
					
					//auto light code based on photoresistor
					if(config.autoLightHourSetting){
						AutoLight(deviceStatus.light);
					}
					resolve(deviceVals);
				}, 1000);
			});
		},
		
		sendIFTTTMessage: function (device, status, event) {
			message.sendIFTTTMessage(device, status, event, 'Manual');
		}
	}

	function AutoHeating(status, sensorVal) {
		if(sensorVal <= config.autoTempSetting){
			if(status == 0){
				deviceVals.heat = 1;
				message.sendIFTTTMessage('Heat', deviceVals.heat, 'TurnHeatOnX', 'Auto');
			}
		} else {
			if(status == 1){
				deviceVals.heat = 0;
				message.sendIFTTTMessage('Heat', deviceVals.heat, 'TurnHeatOffX', 'Auto');
			}
		}
	}

	function AutoImmersion(status){
		var d = new Date();		
		var hour = d.getHours();
		if(hour >= config.autoImmersionSetting){
			if(status == 0){
				deviceVals.immersion = 1;
				message.sendIFTTTMessage('Immersion', deviceVals.immersion, 'SwitchImmersionOnX', 'Auto');
			}
		} else {
			if(status == 1){
				deviceVals.immersion = 0;
				message.sendIFTTTMessage('Immersion', deviceVals.immersion, 'SwitchImmersionOffX', 'Auto');
			}
		}
	}
	
	function AutoLight(status){
		var d = new Date();		
		var hour = d.getHours();
		if(hour >= config.autoLightHourSetting){
			if(status == 0){
				deviceVals.light = 1;
				message.sendIFTTTMessage('Light', deviceVals.light, 'SwitchLightOn', 'Auto');
			}
		} else {
			if(status == 1){
				deviceVals.light = 0;
				message.sendIFTTTMessage('Light', deviceVals.light, 'SwitchLightOff', 'Auto');
			}
		}
	}
})();
