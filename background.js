// background.js

//initialize the words
var dict = {};
var seenWords = {};
var skipwords = {};

//reads the wordlist
$.get('words', function(data) {
	var lines = data.split("\n");
	for (var i = 0, len = lines.length; i < len; i++) {
    dict[lines[i]] = 1;
  }
}, 'text');

//reads common words
//reads the wordlist
$.get('skip_words', function(data) {
  var lines = data.split("\n");
  for (var i = 0, len = lines.length; i < len; i++) {
    skipwords[lines[i]] = 1;
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
        var seenLeft = 0; //checks for tags
        for (var i = 0, len = words.length; i < len; i++) {
    			//check if it contains only letters
    			var word = words[i];
          //lowercase word and check
          var first = word.charAt(0);
          var last = word.charAt(word.length - 1);
          var lower = true;
          var check_word = word;
          if(first != word.toLowerCase().charAt(0)){
            lower = false;
            check_word = word.toLowerCase();
          }
          if(first === "<"){
            seenLeft += 1;
            ans += word + " ";
            continue;
          }
          if(last === ">"){
            seenLeft -= 1;
            ans += word + " ";
            continue;
          }
          if(seenLeft > 0){
            ans += word + " ";
            continue;
          }
          //check if word can be skipped
          if(skipwords[check_word] === 1 || !/^[a-zA-Z]+$/.test(word)){
            //console.log(check_word);
            ans += word + " ";
            continue;
          }
          ans += "<span class='highlight-replace'>" + word + "</span> ";
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

