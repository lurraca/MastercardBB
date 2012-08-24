document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	checkConnection();
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

function checkConnection() {
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    //alert('Connection type: ' + states[networkState]);
    if(networkState == Connection.NONE) {
    	var db = window.openDatabase("mastercard_db", "1.0", "Mastercard Database", 20000);
    	db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM data", [], function(tx, rs) {
				if(rs.rows.length == 0) {
					alert("Usted no tiene conexión a internet ni tiene data previa de la aplicación. La aplicación procederá a cerrarse.");
					navigator.app.exitApp();
				} else {
					alert("Usted no tiene conexión a internet. La data no estará actualizada ni se mostrarán los logos de las emrpesas.");
				}
			});
		});
    }
}



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
});

 function switchCSS(file_path, image_path){
	$("#custom").attr("href",file_path);
	if (typeof image_path != 'undefined'){
		$('#card-main').css({'background': 'url('+image_path+') no-repeat center center fixed'});
	}
}

jQuery(function($) {
	$.mobile.defaultPageTransition = "none";
	var RESTAURANTS_CATEGORY_ID = 1;
	var STORES_CATEGORY_ID = 2;
	var server_url = "http://107.20.213.141:3000/";

	var populateData = function() {
		window.MasterCardData = {};

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
			$.get(server_url + "benefits/active/all.json", function(benefitsStr) {
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
					$.get(server_url + "businesses/from_list/"+idsStr.substring(0,idsStr.length-1)+".json", function(businessesStr) {
						db.transaction(
							function(tx) {
								tx.executeSql("DROP TABLE data;");
								tx.executeSql("CREATE TABLE IF NOT EXISTS data(benefits TEXT, businesses TEXT, categories TEXT, update_id INT);");
								tx.executeSql("DELETE FROM data WHERE 1=1;");
								tx.executeSql("INSERT INTO data values('"+benefitsStr+"','"+businessesStr+"','"+categoriesStr+"',"+version.number+")");
							});

							queryDataToObj(db);
					}, "html");
				}, "html");
			}, "html");
		}
		$.getJSON(server_url + "get_data_version.json", function(version) {
			var db = window.openDatabase("mastercard_db", "1.0", "Mastercard Database", 20000);
			db.transaction(function(tx) {
				tx.executeSql("SELECT * FROM data", [], function(tx, rs) {
					if(rs.rows.item(0).update_id < version.number) {
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
		});
	}

	populateData();

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
			$("#platinum-benefits-content ul").append("<li class='benefit-lnk' benefit-id='"+el.id+"'><a href='#platinum-benefits-dtl'>" + el.name + "</a></li>");
		});
		$("#platinum-benefits-content ul").listview('refresh');
		$(".benefit-lnk").click(function() {
			loadBenefitDetail($(this).attr("benefit-id"));
		});
	});

	var loadBusinessDetail = function(bizId) {
		var biz = _.filter(MasterCardData.businesses, function(bz) {return bz.id == bizId})[0];
		$("#platinum-business-dtl .bizDtlTitle").html(biz.name);
		$("#platinum-business-dtl .bizDtlImg").attr("src", server_url + biz.logo_url);
		$("#platinum-business-dtl .bizDtlTel").html(biz.phone);
		$("#platinum-business-dtl .bizDtlAddr").html(biz.address);
		$("#platinum-business-dtl .bizDtlDesc").html(biz.description);

		var benefits = _.filter(MasterCardData.benefits, function(ben) {return ben.business_id == bizId});
		$("#platinum-business-dtl .bizDtlBenefits").empty();
		$.each(benefits, function(i, bnft) {
			$("#platinum-business-dtl .bizDtlBenefits").append("<li class='benefit-lnk' benefit-id='"+bnft.id+"'><a href='#platinum-benefits-dtl'>"+bnft.name+"</a></li>");
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
			jqList.append("<li class='category-lnk' category-id='"+ctg.id+"'><a href='#platinum-businesses'>" + ctg.name + "</a></li>");
		});
		jqList.listview('refresh');
		$(".category-lnk").click(function() {
			MasterCardData.currCatId = $(this).attr('category-id');
		});
	}

	$(document).delegate("#platinum-businesses", "pageshow",function() {
		loadBusinesses($("#platinum-businesses-content ul"), _.filter(MasterCardData.businesses, function(bz){return bz.category_id == MasterCardData.currCatId}));
	});

	$(document).delegate("#categories", "pageshow",function() {
		loadCategories($("#categories-content ul"), MasterCardData.categories);
	});
});