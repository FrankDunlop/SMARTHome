
// add properties to our constructor function so those properties are also exported
config.sensorType = 11;													//DHT11 = 11, DTH22 = 22
config.sensorGPIO = 22;
config.autoTempSetting = 0;												//Auto Temp to activate heating
config.autoImmersionSetting = 0;										//Auto Temp to activate immersion
config.autoLightHourSetting = 0;

config.deviceVals = {heat:0, immersion:0, light:0};
config.sensorVals = {heat:0, immersion:0, light:0};
config.autoVals = {heat:0, immersion:0, light:0};
config.autoSetting = 0;	

module.exports = config;

function config() {
 
}


