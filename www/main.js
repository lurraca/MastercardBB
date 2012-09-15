$(function() {
	$.mobile.defaultPageTransition = "none";	
});

document.addEventListener("deviceready", onDeviceReady, false);

var isNetworkAvailable= null;
var isDatabasePresent = null;
var MODES = {"Internet + DB":1, "No Internet + DB":2, "Internet + No DB":3, "No Internet + No DB":4}
var actualMode;
var actualVersion;
function networkAvailable() {
   return isNetworkAvailable;
}

function databaseAvailable(){
	return isDatabasePresent;
}

function setOffline() {
    isNetworkAvailable=false;
    console.log("Device is Offline")
}

function setDatabase(status){
	isDatabasePresent = status;
}

function setOnline() {
    isNetworkAvailable=true;
    console.log("Device is Online");
}

function block(){
	$.blockUI({ message: $('#loader'), css: { 
            border: 'none', 
            padding: '15px', 
            backgroundColor: '#000', 
            '-webkit-border-radius': '10px', 
            '-moz-border-radius': '10px', 
            opacity: .5, 
            color: '#fff' 
        } }); 
}

function onDeviceReady() {
	window.isBbOs5 = false;
	if(navigator.userAgent.match(/(BlackBerry)/)){
		if(device.version.match(/\d/)==5){
			window.isBbOs5 = true;
		}
	}

	//console.log("PhoneGap Loaded!");
	if (!isBbOs5) {
		block();
	} else {
		loadOs5Stuff();
	}
	checkConnection();
    document.addEventListener("offline", setOffline, false);
    document.addEventListener("resume", onResume, false);
    document.addEventListener("online", setOnline, false);
	//alert("Phonegap Loaded");
	blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK,
		function() {
			if ($.mobile.activePage.attr('id') == 'main') {
				navigator.app.exitApp();
			} else {
				history.back();
				return false;
			}
		});
}


function onResume() {
   setTimeout(function() {
          // TODO: do your thing!
           location.replace("index.html");
        }, 0);
}

function checkConnection(){
	var successFn = function() { checkDatabase(); setOnline(); };
	var errorFn = function() { checkDatabase(); setOffline() };
	if(!isBbOs5) {
		$.ajax({
			url:"http://mastercard.devmbs.com/get_data_version.json",
			dataType : 'json',
			success : successFn,
			error : errorFn,
			timeout : 5000
		});
	} else {
		bb5Ajax("http://mastercard.devmbs.com/get_data_version.json", successFn, function() {alert("FUCK OFF!")});
	}
}

function doFlow(status){
	if(status){
		//DB True
		if(networkAvailable()){
			//Internet + Database created! Done!
			$.unblockUI();
			actualMode = 1;
			populateData();
		}
		else {
			//No Internet + Database created! Done!
			actualMode = 2;
			populateData();
			$.unblockUI();
		}
	} else {
		//No DB
		if(networkAvailable()){
			//Internet + No database, Download! Done!
			actualMode = 3;
			populateData();
			$.unblockUI();
		} else {
			//No DB + No data
			$.unblockUI();
			actualMode = 4;
			$.blockUI({ message: 'Usted no tiene conexión a internet ni tiene data previa de la aplicación. Favor intentar el restablecer el servicio.', css: { 
            	border: 'none',
            	top: '40%',
            	left: '10%',
            	width: '70%',
            	padding: '15px',
            	backgroundColor: '#000',
            	'-webkit-border-radius': '10px',
            	'-moz-border-radius': '10px',
            	opacity: .5,
            	color: '#fff'
        } });
		}
	}
}

function checkDatabase(){
	if (isBbOs5) {
		$.unblockUI();
		actualMode = 5;
		//if(isNetworkAvailable) 
			populateData();
		//else
		//	doFlow(false);
		return ;
	}
	var db = window.openDatabase("mastercard_db", "1.0", "Mastercard Database", 20000);
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM data", [], function (tx, rs) { setDatabase(true); doFlow(true);},
      function (tx, err) {setDatabase(false); doFlow(false);});
	});
	
}

// function checkConnection() {
//     var networkState = navigator.network.connection.type;

//     var states = {};
//     states[Connection.UNKNOWN]  = 'Unknown connection';
//     states[Connection.ETHERNET] = 'Ethernet connection';
//     states[Connection.WIFI]     = 'WiFi connection';
//     states[Connection.CELL_2G]  = 'Cell 2G connection';
//     states[Connection.CELL_3G]  = 'Cell 3G connection';
//     states[Connection.CELL_4G]  = 'Cell 4G connection';
//     states[Connection.NONE]     = 'No network connection';
//     // Check network status
//     //
//     //alert('Connection type: ' + states[networkState]);
//     if(networkState == Connection.NONE) {
//     	var db = window.openDatabase("mastercard_db", "1.0", "Mastercard Database", 20000);
//     	db.transaction(function(tx) {
// 			tx.executeSql("SELECT * FROM data", [], function(tx, rs) {
// 				if(rs.rows.length == 0) {
// 					alert("Usted no tiene conexión a internet ni tiene data previa de la aplicación. La aplicación procederá a cerrarse.");
// 					navigator.app.exitApp();
// 				} else {
// 					alert("Usted no tiene conexión a internet. La data no estará actualizada ni se mostrarán los logos de las empreesas.");
// 				}
// 			});
// 		});
//     }
// }


//reset the css on main screen and set overflow hidden for the 2 main screens
$(document).on('pagehide','#card-main', function(){
	if ($("#custom").attr("href") != 'jquery.mobile.theme-1.1.1.min.css'){
		$("html").css({'overflow':'auto'});
	}
});
$(document).on('pagebeforeshow','#main', function(){
	$("#custom").attr("href",'jquery.mobile.theme-1.1.1.min.css');
	$("html").css({'overflow':'hidden'});
});

$(document).on('pagebeforeshow','#card-main', function(){
	$("html").css({'overflow':'hidden'});
	if(isBbOs5) {
		loadOs5Stuff();
	}
});

 function switchCSS(file_path, image_path){
	$("#custom").attr("href",file_path);
	if (typeof image_path != 'undefined'){
		$('#card-main').css({'background': 'url('+image_path+') no-repeat center center fixed'});
	}
}


	var RESTAURANTS_CATEGORY_ID = 1;
	var STORES_CATEGORY_ID = 2;
	var server_url = "http://mastercard.devmbs.com/";
	var sendlocalytics =  function(event){
		localyticsSession.init("a0aa57284cbe8a78a6268e2-3fe88d2a-f01a-11e1-4f7f-00ef75f32667");
		localyticsSession.open();
		localyticsSession.tagEvent(event);
		localyticsSession.upload();
		console.log("Localytic fired.")
	}

	var populateData = function() {


		var queryDataToObj = function(db) {
			db.transaction(
				function(tx) {
					tx.executeSql("SELECT * FROM data;",[], function(tx,rs){
						MasterCardData.benefits = eval("(" + rs.rows.item(0).benefits + ")");
						MasterCardData.businesses = eval("(" + rs.rows.item(0).businesses + ")");
						MasterCardData.categories = eval("(" + rs.rows.item(0).categories + ")");
					});
				});
		}

		var getNewData = function(db, version) {
			console.log("Getting new data: ");
			$.get(server_url + "benefits/active/all.json", function(benefitsStr) {
				console.log("Getting all active businesses");
				sendlocalytics("getNewData");
				var bens = eval("(" + benefitsStr + ")");
				var businessesIds = [];
				businessesIds = _.reduce(bens, 
					function(xs, el){
						if(xs.indexOf(el.business_id != 0)) 
							xs.push(el.business_id);
						return xs;
					}, []);
				var idsStr = _.reduce(businessesIds, function(str, bid) { return str + bid + ","},"");


				$.get(server_url + "categories.json", function(categoriesStr) {
					console.log("Getting all categories");
					$.get(server_url + "businesses/from_list/"+idsStr.substring(0,idsStr.length-1)+".json", function(businessesStr) {
						db.transaction(
							function(tx) {
								tx.executeSql("DROP TABLE IF EXISTS data;");
								tx.executeSql("CREATE TABLE IF NOT EXISTS data(benefits TEXT, businesses TEXT, categories TEXT, update_id INT);");
								tx.executeSql("DELETE FROM data WHERE 1=1;");
								tx.executeSql("INSERT INTO data values('"+benefitsStr+"','"+businessesStr+"','"+categoriesStr+"',"+version.number+")");
							});
							queryDataToObj(db);
					}, "html");
				}, "html");
			}, "html");
		}
		var getDataVersion = function (){
			$.getJSON(server_url + "get_data_version.json", function(version) {
				console.log("Getting data version. Version: :"+version.number);
				sendlocalytics("getDataVersion");
				actualVersion = version;
				var db = window.openDatabase("mastercard_db", "1.0", "Mastercard Database", 20000);
				if(databaseAvailable){
					var db = window.openDatabase("mastercard_db", "1.0", "Mastercard Database", 20000);
					db.transaction(function(tx) {
						tx.executeSql("SELECT * FROM data", [], function(tx, rs) {
							if(rs.rows.item(0).update_id !== version.number) {
								getNewData(db, version);
							} else {
								queryDataToObj(db);
							}
						});
					},
					function() {
						var db = window.openDatabase("mastercard_db", "1.0", "Mastercard Database", 20000);
						getNewData(db, version);
					});
				} else {
					getNewData(db, version);
				}
			});
		}

		var os5LoadData = function() {
			$.get(server_url + "benefits/active/all.json", function(benefitsStr) {
				console.log("Getting all active businesses");
				sendlocalytics("getNewData");
				var bens = eval("(" + benefitsStr + ")");
				var businessesIds = [];
				businessesIds = _.reduce(bens, 
					function(xs, el){
						if(xs.indexOf(el.business_id != 0)) 
							xs.push(el.business_id);
						return xs;
					}, []);
				var idsStr = _.reduce(businessesIds, function(str, bid) { return str + bid + ","},"");


				$.get(server_url + "categories.json", function(categoriesStr) {
					console.log("Getting all categories");
					$.get(server_url + "businesses/from_list/"+idsStr.substring(0,idsStr.length-1)+".json", function(businessesStr) {
						MasterCardData.benefits = eval("(" + benefitsStr + ")");
						MasterCardData.businesses = eval("(" + businessesStr + ")");
						MasterCardData.categories = eval("(" + categoriesStr + ")");
					}, "html");
				}, "html");
			}, "html");
		}
		window.MasterCardData = {};
		switch(actualMode){
		case 1:
			getDataVersion();
  			break;
		case 2:
			queryDataToObj(window.openDatabase("mastercard_db", "1.0", "Mastercard Database", 20000));
			break;
		case 3:
			getDataVersion();
			break;
		case 4:
			onDeviceReady();
			break;
		case 5:
			os5LoadData();
			break;
		default:
		 	
		}
	//populateData();

	var loadBenefitDetail = function(benId) {
		var ben = _.filter(MasterCardData.benefits, function(ben) {return ben.id == benId})[0];
		$("#platinum-benefits-dtl .benDtlTitle").html(_.filter(MasterCardData.businesses, 
			function(bs) {return bs.id == ben.business_id})[0].name + ' - ' +ben.name);
		$("#platinum-benefits-dtl .benDtlDescription").html(ben.description);
		$("#platinum-benefits-dtl .benDtlFrom").html(ben.begin_date);
		$("#platinum-benefits-dtl .benDtlTo").html(ben.end_date);
	}

	$(document).delegate("#platinum-benefits", "pageshow",function() {
		$("#platinum-benefits-content ul").empty();
		$.each(MasterCardData.benefits, function(i,el) {
			biz = _.filter(MasterCardData.businesses, function(bs) {return bs.id == el.business_id})[0];
			$("#platinum-benefits-content ul").append("<li class='benefit-lnk' benefit-id='"+el.id+"'><h3>"+biz.name
				+"</h3><a href='#platinum-benefits-dtl'><p>" + el.name + "</p></a></li>");
		});
		$("#platinum-benefits-content ul").listview('refresh');
		$(".benefit-lnk").click(function() {
			loadBenefitDetail($(this).attr("benefit-id"));
		});
	});

	var loadBusinessDetail = function(bizId) {
		var biz = _.filter(MasterCardData.businesses, function(bz) {return bz.id == bizId})[0];
		$("#platinum-business-dtl .bizDtlTitle").html(biz.name);
     	if(networkAvailable()){
     		$("#platinum-business-dtl .bizDtlImg").attr("src", server_url + biz.logo_url);
       	} else {
       		$("#platinum-business-dtl .bizDtlImg").attr("src","images/noinet.jpg");
       }
		$("#platinum-business-dtl .bizDtlTel").html(biz.phone);
		$("#platinum-business-dtl .bizDtlAddr").html(biz.address);
		$("#platinum-business-dtl .bizDtlDesc").html(biz.description);

		var benefits = _.filter(MasterCardData.benefits, function(ben) {return ben.business_id == bizId});
		$("#platinum-business-dtl .bizDtlBenefits").empty();

		$.each(benefits, function(i, bnft) {

			$("#platinum-business-dtl .benDtlDescription").html(bnft.description);
			$("#platinum-business-dtl .benDtlFrom").html(bnft.begin_date);
			$("#platinum-business-dtl .benDtlTo").html(bnft.end_date);
		});

		if($("#platinum-business-dtl .bizDtlBenefits").hasClass('ui-listview'))
			$("#platinum-business-dtl .bizDtlBenefits").listview('refresh');

		$(".benefit-lnk").click(function() {
			loadBenefitDetail($(this).attr("benefit-id"));
		});
	}

	var loadBusinesses = function(jqList, bizs) {
		jqList.empty();
		$.each(bizs, function(i, el) {
			jqList.append("<li class='business-lnk' business-id='"+el.id+"'><a href='#platinum-business-dtl'>" + el.name + "</a></li>");
		});
		jqList.listview('refresh');
		$(".business-lnk").click(function() {
			loadBusinessDetail($(this).attr("business-id"));
		});
	};

	var loadCategories = function(jqList, categories) {
		jqList.empty();
		$.each(categories, function(i, ctg) {
			jqList.append("<a href='#platinum-businesses' data-theme='c' class='category-lnk' category-id='"+ctg.id+"' data-role='button'>" + ctg.name + "</a>");
		});
		$("#categories").trigger('create');
		$(".category-lnk").click(function() {
			MasterCardData.currCatId = $(this).attr('category-id');
		});
	}

	$(document).delegate("#platinum-businesses", "pageshow",function() {
		loadBusinesses($("#platinum-businesses-content ul"), _.filter(MasterCardData.businesses, function(bz){return bz.category_id == MasterCardData.currCatId}));
	});

	$(document).delegate("#categories", "pageshow",function() {
		loadCategories($("#categories-content ul"), MasterCardData.categories);
	});}