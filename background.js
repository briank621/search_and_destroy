// background.js

//initialize the words
var dict = {};
var seenWords = {};
var skipwords = {};

var pos = {"J":"adj", "N":"noun", "V":"verb"};
var callsLeft = 0;
var resp = "";

//reads the wordlist
$.get('syn.json', function(data) {
  var syn = JSON.parse(data)
  for (var key in syn)
    dict[key] = syn[key]
}, 'text');

//reads common words
$.get('skip_words', function(data) {
  var lines = data.split("\n");
  for (var i = 0, len = lines.length; i < len; i++)
    skipwords[lines[i]] = 1;
}, 'text');

var getSynonym = function(sentence){
  var words = sentence.split(" ");
  var out = "";
  console.log("sentence: " + sentence)
  console.log("words: " + words)
  for(var i = 0; len = word.length i < len; i++){
    var word = words[i];
    var slash = word.indexOf("/");
    var w = word.substring(0, slash);
    if(slash < 0)
      continue;
    var c = word.charAt(slash + 1);
    if (!(c in pos)){
      out += w + " ";
      continue;
    }
    var p = pos[c];
    var key = w + " " + p;
    if(! (key in dict)){
      out += w + " ";
      continue;
    }
    var replace = dict[key]
    out += "<span class='highlight-replace' title='text'>HUYAH " + replace + "(" + w + ")" + "</span> ";
  }
  console.log("OUT: " + out)
  return out;
}

var parseSentence = function(sentence){
  $.ajax({
    async: false,
    url: "http://text-processing.com/api/tag/",
    type: "POST",
    data: "text=" + sentence,
    dataType: "json",
    success: function(resultData){

      return getSynonym(resultData["text"]);
    }
  })
}

//Listens for words to replace
chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
		var ans = ""; //the string to return
		if (message.type == "request"){

      //extract sentences with regex
      var text = message.content;
      console.log("TEXT: " + text)
      var sentences = text.match( /[^\.!\?]+[\.!\?]+/g );

      console.log("sentences: " + sentences)

      sentences.forEach(function(e, i){
        ans += parseSentence(e);
      });

      console.log("ans after foreach: " + ans)

      for(i = 0; i < sentences.length; i++){
        ans += parseSentence(sentences[i]);
      }

      var resp = {type: "response", content: ans};
      console.log("SENDING:  " + resp.content)
      sendResponse(resp);
      return true;
    }
  });


// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  	var activeTab = tabs[0];
  	chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
});

