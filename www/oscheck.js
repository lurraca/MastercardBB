document.addEventListener("deviceready", function(){
	if(navigator.userAgent.match(/(BlackBerry)/)){
		if(device.version.match(/\d/)==5){
			location.replace('index-os5.html');
		}
	}
}, false);

var contentHeight = window.screen.availHeight;
var contentWidth = window.screen.availHeight;
$('#content').height(contentHeight);
$('#content').width(contentWidth);