//$(document).delegate("#main", "pageshow",function() {
function loadOs5Stuff() {
	var footerHeight = $('div[data-role="footer"]').height();
	var headerHeight = $('div[data-role="header"]').height();
	var contentHeight = $(window).height();
	var contentWidth = $(window).width();
	$('div[data-role="content"]').height(screen.height - (footerHeight + headerHeight));
	$('div[data-role="content"]').width(contentWidth);
};

$.get = function(url, callback, dummyVar) {
	var xmlHttp = new XMLHttpRequest();

	xmlHttp.open('GET', url, true);
	xmlHttp.onreadystatechange = function() {
		callback(xmlHttp.responseText);
	};
	xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xmlHttp.send(null);
};

function bb5Ajax(url, callback, timeoutCallback) {
	var xmlHttp = new XMLHttpRequest();

	xmlHttp.open('GET', url, true);
	xmlHttp.onreadystatechange = function() {
		callback(xmlHttp.responseText);
	};
	xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xmlHttp.timeout = 5000;
	xmlHttp.ontimeout = function() {
		timeoutCallback();
	};
	xmlHttp.send(null);
}