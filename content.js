//queue for paragraphs
pq = [];
var numP = 0;
var doneP = 0;

// content.js
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if( request.message === "clicked_browser_action" ) {
			var firstHref = $("a[href^='http']").eq(0).attr("href");

			chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
		}
		if( request.message === "request_complete" ) {
		}
	}
	);

function analyzeQueue(){
	if(pq.length == 0)
		return;

	paragraph = pq.shift();
	// console.log("paragraph: " + paragraph);
	var text = paragraph.html();
	var content = paragraph.text();

	// console.log("TEXT: " + text)
	// console.log("CONTENT: " + content)

	if(text != content){
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
			if(response != null)
				paragraph.html(response.content);
			doneP++;
			analyzeQueue();
		});
}

$(document).ready(function(){
	console.log("ready");
	$("p").each( function(){
		//replace words with their synonyms
		pq.push($(this));
		numP++;
	});

	// console.log("pq: " + pq);

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
