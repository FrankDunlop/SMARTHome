var socket = io(); 														//load socket.io-client and connect to the host that serves the page

(function() {
	var autoVals = {heat:0, immersion:0, light:0};

	//listeners for UI/socket tx events
	$(document).ready(function() {	
		socket.emit("getAutoConfig");
						
		var autoSwitch = $("#autoSwitch"); 
		autoSwitch.change(function(){										
			ConfigDeviceButtons(this.checked);
			socket.emit("autoChange", Number(this.checked)); 				
		});
	  
		var heatSwitch = $("#heatSwitch"); 
		heatSwitch.change(function(){	
			socket.emit("heatChange", Number(this.checked)); 	
		});
	  
		var immersionSwitch = $("#immersionSwitch"); 
		immersionSwitch.change(function(){
			console.log('immersionchange');		
			socket.emit("immersionChange", Number(this.checked)); 	
		});
		
		var lightSwitch = $("#lightSwitch"); 
		lightSwitch.change(function(){	
			socket.emit("lightChange", Number(this.checked)); 		
		});
		
		var camSwitch = $("#camSwitch"); 
		camSwitch.change(function(){
			if(this.checked){
				//$("#camview").show();
				window.scrollTo(0,document.body.scrollHeight);
			}else{
				//$("#camview").hide();
				$('#camview').attr('src', "./images/cam.jpg");
				window.scrollTo(0,0);
			}	
			socket.emit("camChange", Number(this.checked)); 		
		});
		
		$("#autoHeatVal").hide();
		$("#autoImmersionVal").hide();
		$("#autoLightVal").hide();
		$("#autoCamVal").hide();
		
		$("#settings").click(function(){
			ToggeleAutoSettings();
			if($('#heatVal').is(':hidden')){
				autoVals.heat = $("#heatVal").val(); 
				autoVals.immersion = $("#immersionVal").val(); 
				autoVals.light = $("#lightVal").val();
				socket.emit("autoValsChange", autoVals);
			} else {
				socket.emit("getAutoConfig");
			}
		});
	});

	function ToggeleAutoSettings(){ 
		$("#heat").toggle();
		$("#immersion").toggle();
		$("#light").toggle();
		$("#cam").toggle();
		$("#autoHeatVal").toggle();
		$("#autoImmersionVal").toggle();
		$("#autoLightVal").toggle();
		$("#autoCamVal").toggle();
	}
	
	function ConfigDeviceButtons(autoStatus){
		if(autoStatus) {
			$("#heatSwitch").prop("disabled", true);
			$("#immersionSwitch").prop("disabled", true);
			$("#lightSwitch").prop("disabled", true);
			$("#camSwitch").prop("disabled", true);
		} else {
			$("#heatSwitch").prop("disabled", false);
			$("#immersionSwitch").prop("disabled", false);
			$("#lightSwitch").prop("disabled", false);
			$("#camSwitch").prop("disabled", false);
		}
	}

	//socket rx events
	socket.on('recDHTVals', function (data) {
		$("#tempspan").html(data.temp + '℃');
		$("#humspan").html(data.humidity + '%');
	});

	socket.on('recWeatherReport', function (data) {
		$("#reportTempspan").html(data.temp + '℃');
		$("#reportHumspan").html(data.humidity + '%');
		$("#reportDescspan").html(data.report + ' in ' + data.loc);
	});

	socket.on('AutoStatus', function (status) { 						
		$("#autoSwitch").prop('checked', status);
		ConfigDeviceButtons(status);							
	});

	socket.on('HeatStatus', function (status) { 						
		$("#heatSwitch").prop('checked', status);								
	});

	socket.on('ImmersionStatus', function (status) { 						
		$("#immersionSwitch").prop('checked', status);									
	});

	socket.on('LightStatus', function (status) { 						
		$("#lightSwitch").prop('checked', status);									
	});

	socket.on('CamStatus', function (status) { 						
		$("#camSwitch").prop('checked', status);								
	});

	socket.on('liveStream', function(url) {
    	$('#camview').attr('src', url);
  	});

	socket.on('recAutoConfig', function (data) { 						
		$("#heatVal").val(data.heat);
		$("#immersionVal").val(data.immersion);
		$("#lightVal").val(data.light);											
	});
})();






