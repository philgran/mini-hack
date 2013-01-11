(function(){

	var eTop = Math.round($('.login-header').offset().top);
	// function to see if the table header should be fixed to top of the page.

	$(window).resize(function() {
		fixDisplay("#site");
	});


	var fixDisplay = function(el) {
		var $e = $(el);
		var nonApp = $e.hasClass("non-appNexus");
		var isWhite = $("#footer").css("color");

		if(nonApp){
			var height = ($e.outerHeight() / 1.3) * -1;
			$e.css("marginTop", height);
		}

		var pos = $e.offset();

		if(pos.top < 0) {
			height = height -pos.top;
			$e.css("marginTop", height);
		}

		return height;

	};

	fixDisplay("#site");

})();
