// background.js

//initialize the words
var dict = {};
var seenWords = {};
var skipwords = {};

var pos = {"J":"adj", "N":"noun", "V":"verb"};
var punc = {"!":true, ".": true, ",": true, "?": true}
var callsLeft = 0;
var resp = "";

var paragraph = [];

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

function ajaxRequest(count, sentence){
  return $.Deferred( 
    function(){
      var self = this;
      $.ajax({
        url: "http://text-processing.com/api/tag/",
        type: "POST",
        data: "text=" + sentence,
        dataType: "json",
        success: function(resultData){
          changedSent = getSynonym(resultData["text"]);
          paragraph[count] = changedSent.join(' ');
          self.resolve();
        }
      })
    });
}

//creates a deferred list of the asynchronous definition calls
function createDeferred(sentences){
  var deferreds = [];
  var i = 0;
  for (i = 0; i < sentences.length; i++) {
    var count = i;
    // console.log("ADDING: " + sentences[i]);
    if(sentences[i].indexOf(";") > -1 || sentences[i].indexOf("'") > -1){
      paragraph[count] = sentences[i];
      continue;
    }
    deferreds.push(ajaxRequest(count, sentences[i]));
  }
  return deferreds;
}

function getSynonym(sentence){
  var words = sentence.split(" ");
  var out = [];
  // console.log("sentence: " + words);
  for(var i = 0; len = words.length, i < len; i++){
    var word = words[i];
    var slash = word.indexOf("/");
    var w = word.substring(0, slash);
    if(slash < 0)
      continue;
    //get pos
    var c = word.charAt(slash + 1);
    if(c in punc){ //attach punctuation to previous word
      out[out.length - 1] += c;
      continue;
    }
    if (!(c in pos)){
      out.push(w);
      continue;
    }
    var p = pos[c];
    var key = w + " " + p;
    // console.log("key: " + key);
    if(! (key in dict)){
      out.push(w);
      continue;
    }
    var replace = dict[key][Math.floor(Math.random()*dict[key].length)];
    out.push("<span title=\"" + w +"\" class=\"masterTooltip exthighlight\">" + replace + "</span>");
  }
  return out;
}

//Listens for words to replace
chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
		var ans = ""; //the string to return
		if (message.type == "request"){

      //extract sentences with regex
      var text = message.content;
      var sentences = text.match( /[^\.!\?]+[\.!\?]+/g );

      if(sentences == null){
        return;
      }

      paragraph = []
      var deferreds = createDeferred(sentences);

      $.when.apply(null, deferreds).done(function() {
        var ans = paragraph.join(' ');
        // console.log("REPLACEMENT: " + ans);
        var resp = {type: "response", content: ans};
        // console.log("response: " + resp)
        sendResponse(resp);
      });
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

