//queue for paragraphs
pq = [];
changedParagraphs = [];
var punc = {"!":true, ".": true, "?": true}
var numP = 0;
var doneP = 0;
var density = 10;
var active = true;

chrome.extension.sendMessage({type: "activeQuery"}, 
function(response){
	active = response.val;
});

// content.js
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log("received: " + request);
		if(request.message === "clicked_browser_action" ) {
			var firstHref = $("a[href^='http']").eq(0).attr("href");
			chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
		}
		if(request.message === "toggledOff"){
			console.log("received toggledoff");
			density = 0;
			stripParagraphs(changedParagraphs);
			active = false;
		}
		if(request.message === "toggledOn"){
			console.log("received toggledon");
			density = request["val"];
			activateAll();
			active = true;
		}
		if(request.message === "densityChange"){
			density = request["val"];
			console.log("active: " + active);
			if(active)
				activateAll();
		}
	}
	);

chrome.extension.sendMessage({type: "densityQuery"}, 
	function(response){
		density = response.val;
	});

function stripParagraphs(paragraphs){
	console.log("paragraphs: " + paragraphs);
	$.each(paragraphs, function(index, value){
		$(this).find("a").each(function(){
			console.log($(this).attr("title"));
			if($(this).attr("title") != undefined){
				nullify($(this));
			}
		});
	});
}

function printParagraphs(paragraphs){
	for (var i = 0; i < paragraphs.length; i++) 
		console.log(paragraphs[i].html());
}

function activateAll(){
	$(changedParagraphs).each(function(){
		modifyParagraph($(this));
	});
}

function activate(aref){
	var syn = $(aref).attr("inactiveTitle");
	var originalWord = $(aref).text();
	$(aref).removeAttr("inactiveTitle");
	$(aref).attr("title", originalWord);
	$(aref).text(syn);
	$(aref).removeClass("inactiveMaster");
	$(aref).addClass("masterTooltip");
	$(aref).addClass("exthighlight");
}

function nullify(aref){
	var originalWord = $(aref).attr("title");
	var syn = $(aref).text();
	$(aref).removeAttr("title");
	$(aref).attr("inactiveTitle", syn);
	$(aref).text(originalWord);
	$(aref).addClass("inactiveMaster");
	$(aref).removeClass("masterTooltip");
	$(aref).removeClass("exthighlight");
}

function modifyParagraph(paragraph){
	console.log("density: " + density);
	$(paragraph).find("a").each(function(){
		if(Math.random() * 10 < density ){
			if($(this).attr("title") == undefined)
				activate($(this));
		}
		else{
			if($(this).attr("inactiveTitle") == undefined)
				nullify($(this));
		}
	});
}

function analyzeQueue(){
	if(pq.length == 0)
		return;

	paragraph = pq.shift();
	console.log("paragraph: " + paragraph);
	var text = paragraph.html();
	var content = paragraph.text();

	console.log("TEXT: " + text)
	console.log("CONTENT: " + content)

	if(text != content || ! punc[text[text.length - 1]]){
		doneP++;
		if(pq.length == 0)
			return;
		else{
			analyzeQueue();
			return;
		}
	}

	chrome.runtime.sendMessage({type: "request", content: text}, 
		function(response){
			console.log("RESP: " + response)
			if(response != null)
				paragraph.html(response.content);
			changedParagraphs.push(paragraph);
			modifyParagraph(paragraph);
			doneP++;
			analyzeQueue();
		});
}

$(document).ready(function(){
	// console.log("ready");
	$("p").each( function(){
		//replace words with their synonyms
		pq.push($(this));
		numP++;
	});

	analyzeQueue();
	// The node to be monitored
	var target = $("body,html");

	// Create an observer instance
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
	    var newNodes = mutation.addedNodes; // DOM NodeList
	    if( newNodes !== null ) { // If there are new nodes added
	    	var $nodes = $( newNodes ); // jQuery set
	    	$nodes.each(function() {
	    		var $node = $( this );
	    		var $paragraphs = $node.find("p");
	    		var done = (doneP == numP);
	    		$paragraphs.each(function(){
	    			pq.push($(this));
	    			numP++;
	    		});
	    		if(done) //if previous analyze is finished
	    			analyzeQueue();
	    	});
	    }
	});
	});  

	// Configuration of the observer:
	var config = { 
		attributes: true, 
		childList: true, 
		characterData: true,
		subtree: true 
	};

	// Pass in the target node, as well as the observer options
	observer.observe(target[0], config);
});

