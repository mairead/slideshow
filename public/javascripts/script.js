$(function() {


	$('.nav-link').bind('click', function(e){
		var href = $($(e.target)[0]).attr('href');
		console.log("bound", href);
		//scroll to area of page
		$('html, body').animate({
			scrollTop : $(href).position().top+'px'
		},500)
		e.preventDefault();
	});
});