jQuery(function($) {

	var RESTAURANTS_CATEGORY_ID = 1;
	var populateData = function() {
		window.MasterCardData = {};
		var server_url = "http://107.20.213.141:3000/"

		$.get(server_url + "benefits/active/all.json", function(benefitsStr) {
			var bens = eval("(" + benefitsStr + ")");
			var businessesIds = [];
			businessesIds = _.reduce(bens, 
				function(xs, el){
					if(xs.indexOf(el.business_id < 0)) 
						xs.push(el.business_id);
					return xs;
				}, []);
			var idsStr = _.reduce(businessesIds, function(str, bid) { return str + bid + ","},"");

			$.get(server_url + "businesses/from_list/"+idsStr.substring(0,idsStr.length-1)+".json", function(businessesStr) {
				var db = window.openDatabase("mastercard_db", "1.0", "Mastercard Database", 20000);
				db.transaction(
					function(tx) {
						tx.executeSql("CREATE TABLE IF NOT EXISTS data(benefits TEXT, businesses TEXT, update_id INT);");
						tx.executeSql("DELETE FROM data WHERE 1=1;");
						tx.executeSql("INSERT INTO data values('"+benefitsStr+"','"+businessesStr+"',1)");
					});

				db.transaction(
					function(tx) {
						tx.executeSql("SELECT * FROM data;",[], function(tx,rs){
							MasterCardData.benefits = eval("(" + rs.rows.item(0).benefits + ")");
							MasterCardData.businesses = eval("(" + rs.rows.item(0).businesses + ")");
						});
					});
			}, "html");
		}, "html");
	}

	populateData();

	var loadBenefitDetail = function(benId) {
		var ben = _.filter(MasterCardData.benefits, function(ben) {return ben.id == benId})[0];
		$("#platinum-benefits-dtl .benDtlTitle").html(ben.name);
		$("#platinum-benefits-dtl .benDtlBusiness").html(_.filter(MasterCardData.businesses, 
			function(bs) {return bs.id == ben.business_id})[0].name);
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

	var loadBusinesses = function(jqList, bizs) {
		jqList.empty();
		$.each(bizs, function(i, el) {
			jqList.append("<li class='business-lnk' business-id='"+el.id+"'><a href='#platinum-business-dtl'>" + el.name + "</a></li>");
		});
	};
	$(document).delegate("#platinum-restaurants", "pageshow",function() {
		loadBusinesses($("#platinum-restaurants-content ul"), _.filter(MasterCardData.businesses, function(bz){return bz.category_id == RESTAURANTS_CATEGORY_ID}));
	});
});