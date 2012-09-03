$(document).delegate("#main", "pageshow",function() {
	var footerHeight = $('div[data-role="footer"]').height();
	var headerHeight = $('div[data-role="header"]').height();
	var contentHeight = $(window).height();
	var contentWidth = $(window).width();
	$(function() {
		alert($(window).height());
		$('div[data-role="content"]').height(100);
		$('div[data-role="content"]').width(contentWidth);
	});	
});