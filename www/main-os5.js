//$(document).delegate("#main", "pageshow",function() {
function loadOs5Stuff() {
	var footerHeight = $('div[data-role="footer"]').height();
	var headerHeight = $('div[data-role="header"]').height();
	var contentHeight = $(window).height();
	var contentWidth = $(window).width();
	$(function() {
		$('div[data-role="content"]').height(screen.height - (footerHeight + headerHeight));
		$('div[data-role="content"]').width(contentWidth);
	});
};

