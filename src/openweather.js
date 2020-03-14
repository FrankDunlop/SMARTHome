
(function() {
	var weatherReport = {loc:"", temp:0, humidity:0, report:""};

	module.exports = {
		asyncGetCurrentWeather: function() {
			return new Promise(resolve => {
				setTimeout(() => {
					var weatherURL = `http://api.openweathermap.org/data/2.5/weather?q=${process.env.WEATHER_CITY}&units=metric&appid=${process.env.WEATHER_KEY}` 
					var request = require('request');
					request.post(weatherURL, function(err, res, body) {
						if (!err && res.statusCode === 200) {
							var weatherData = JSON.parse(body);
							var message = `${weatherData.name} Temp: ${weatherData.main.temp}, Humidity: ${weatherData.main.humidity}, ${weatherData.weather[0].description}`;
							weatherReport.loc = weatherData.name;
							weatherReport.temp = weatherData.main.temp;
							weatherReport.humidity = weatherData.main.humidity;
							weatherReport.report = weatherData.weather[0].description;
							console.log('@OpenWeatherMapAPI: ' + weatherReport.temp + '°C, ' + weatherReport.humidity + '%');
						} else {
							console.log('Weather Reading Error: ' + err);
						}
					});
					resolve(weatherReport);
				}, 1000);
			});
		}
	}
})();
