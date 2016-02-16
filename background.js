// background.js

//initialize the words
var dict = [];
var seenWords = [];

//reads the wordlist
$.get('words', function(data) {
	var lines = data.split("\n");
	for (var i = 0, len = lines.length; i < len; i++) {
		dict.push({key: lines[i],
			value: "" });
		//console.log(lines[i]);
	}
}, 'text');

//Listens for words to replace
chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
		var ans = ""; //the string to return
		if (message.type == "request"){
    		var text = message.content;
    		//console.log(message.content);
    		var words = text.split(" ");
    		for (var i = 0, len = words.length; i < len; i++) {
    			//check if it contains only letters
    			var word = words[i];
    			var word = "REPLACED";
    			if(/^[a-zA-Z]+$/.test(word))
    				ans += "<span class='highlight-replace'>" + word + " </span>";
    			else
    				ans += word + " ";
    		}
    	}
    	var resp = {type: "response", content: ans};
    	sendResponse(resp);
    	return true;
	}
);


// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  	var activeTab = tabs[0];
  	chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
});

