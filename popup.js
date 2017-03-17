// console.log("loaded");
$(document).ready(function(){

	$(function() {
		$("#slider").on('input', function(){
			var sVal = $(this).val();
			$("#densityLabel").html(sVal);

			chrome.extension.sendMessage({type: "densityChange", 
				value: sVal});
		});
	});

	$(function(){
		$("#toggleButton").click(function(){
			chrome.extension.sendMessage({type: "toggle"});
		})
	});

	chrome.extension.sendMessage({type: "densityQuery"}, 
		function(response){
			console.log("received repsonse: " + response)
			console.log("val: " + response.val)
			var densityVal = response.val;
			$("#slider").val(densityVal);
			$("#densityLabel").html(densityVal);
		});
});