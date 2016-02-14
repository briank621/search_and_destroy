// background.js

//initialize the words
var dict = [];

//reads the wordlist
$.get('words', function(data) {
	var lines = data.split("\n");
	for (var i = 0, len = lines.length; i < len; i++) {
		dict.push({key: lines[i],
			value: "" });
		//console.log(lines[i]);
	}
}, 'text');

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  	var activeTab = tabs[0];
  	chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
});

