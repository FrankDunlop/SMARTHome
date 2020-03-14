const config = require('./config');	
	
(function() {
	module.exports = {
		sendIFTTTMessage: function (device, status, event, mode) {
			var eventURL = `https://maker.ifttt.com/trigger/${event}/with/key/${ process.env.IFTTT_key}`
			var request = require('request');
			request.post(eventURL, function(err, res) {
				if (!err && res.statusCode === 200) {
					console.log(mode + ' ' + device + ' ' + status)
				} else {
					console.log('IFTTT Send Event Error: ' + err)
				}
			});
		},
		
		sendMQTTMessage: function () {
			
		}
	}
})();
