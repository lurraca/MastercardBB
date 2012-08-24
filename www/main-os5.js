$(document).delegate("#main", "pageshow",function() {
	var footerHeight = $('div[data-role="footer"]').height();
	var headerHeight = $('div[data-role="header"]').height();
	var contentHeight = window.screen.availHeight;
	var contentWidth = window.screen.availWidth;
	$(function() {
		$('div[data-role="content"]').height(contentHeight - (footerHeight + headerHeight));
		$('div[data-role="content"]').width(contentWidth);
	});	
});