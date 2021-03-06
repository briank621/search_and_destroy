// background.js

//initialize the words
var dict = {};
var seenWords = {};
var skipwords = {};
var active = true;
var density = 10;

var pos = {"J":"adj", "N":"noun", "V":"verb"};
var punc = {"!":true, ".": true, ",": true, "?": true}
var callsLeft = 0;
var resp = "";

var paragraph = [];

if(active)
  chrome.browserAction.setIcon({path: "icon.png"})
else
  chrome.browserAction.setIcon({path: "negate.png"})


function sendAll(json){
  console.log("json: " + json["message"]);
  chrome.tabs.query({}, function(tabs) {
    for(var i = 0; i < tabs.length; i++){
      console.log("sending to: " + tabs[i].url);
      chrome.tabs.sendMessage(tabs[i].id, json, function(a){});
    }
  });
  console.log("sent");
}

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

function updateIcon(path) {
  chrome.browserAction.setIcon({path:path});
}


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
  console.log("sentence: " + words);
  for(var i = 0; len = words.length, i < len; i++){
    var word = words[i];
    var slash = word.indexOf("/");
    var w = word.substring(0, slash);
    if(slash < 0)
      continue;
    //get pos
    console.log("word: " + w)
    var c = word.charAt(slash + 1);
    if(punc[w]){ //attach punctuation to previous word
      out[out.length - 1] += w;
      console.log("before: " + out[out.length - 1]);
      console.log(w);
      console.log("inside: " + out[out.length - 1]);
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
    if(seenWords[dict[key]]){
      out.push(w);
      continue;
    }
    seenWords[dict[key]] = true;
    var replace = dict[key][Math.floor(Math.random()*dict[key].length)];
    var hr = 'href=\"' + "http://www.dictionary.com/browse/" + w + "?s=t\""
    var target = " target=\"_blank\""
    var titleTag = " inactiveTitle=\"" + replace
    var classTag = "\" class=\"inactiveMaster nounderline\""
    out.push("<a " + hr + target + titleTag + classTag + ">" + w + "</a>");
  }
  return out;
}

//Listens for words to replace
chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
		var ans = ""; //the string to return
		if (message.type == "request"){

      if(! active){
        sendResponse(null);
        return true;
      }
      //extract sentences with regex
      var text = message.content;
      var sentences = text.match( /[^\.!\?]+[\.!\?]+/g );

      console.log("sentences: " + sentences)

      if(sentences == null){
        return;
      }
      
      seenWords = {};
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
    if (message.type == "toggle"){
      console.log("TOGGLED")
      active = !active;
      try{
        if(active){
          chrome.browserAction.setIcon({path: "icon.png"});
          sendAll({"message":"toggledOn", val:density});
        }
        else{
          chrome.browserAction.setIcon({path: "negate.png"});
          sendAll({"message":"toggledOff"});
        }
      }
      catch(e){
        console.log(e);
      }
    }
    if (message.type == "densityQuery"){
      sendResponse({val: density});
    }
    if(message.type == "densityChange"){
      density = message.value;
      sendAll({"message":"densityChange", val:density})
    }
    if(message.type == "activeQuery"){
      sendResponse({val:active})
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

