// content.js
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if( request.message === "clicked_browser_action" ) {
			var firstHref = $("a[href^='http']").eq(0).attr("href");

			console.log(firstHref);
			chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
		}
		if( request.message === "request_complete" ) {
			console.log("hava nagila");
		}
	}
	);

var findSynonym = function(paragraph){
	var text = paragraph.html();
	chrome.runtime.sendMessage({type: "request", content: text}, 
		function(response){
			paragraph.html(response.content);
		});
}

$(document).ready(function(){
	$("p").each( function(){
		//replace words with their synonyms
		findSynonym($(this));
	});
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
	    		$paragraphs.each(function(){
	    			findSynonym($(this));
	    		});
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

//http://words.bighugelabs.com/api/{version}/{api key}/{word}/{format}


