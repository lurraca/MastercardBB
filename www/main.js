jQuery(function($) {

	var populateData = function() {
		MasterCardData = {};
		var db = window.openDatabase("mastercard_db", "1.0", "Mastercard Database", 20000);
		db.transaction(
			function(tx) {
				tx.executeSql("CREATE TABLE IF NOT EXISTS data(benefits TEXT, businesses TEXT, update_id INT);");
				tx.executeSql("DELETE FROM TABLE data;");
				tx.executeSql("INSERT INTO data values('[{id:1,name:\"2x1 Chimi\", description:\"2x1 de chimi :S\","+
					"begin_date:0, end_date:0,business_id:1, benefit_type_id:1},"+
					"{id:1,name:\"2x1 Chimi\", description:\"2x1 de chimi :S\","+
					"begin_date:0, end_date:0,business_id:1, benefit_type_id:1}]',"+
					"'{id:1, name:\"El Chimi\"}',1)");
			});

		db.transaction(
			function(tx) {
				tx.executeSql("SELECT * FROM data;",[], function(tx,rs){
					MasterCardData.benefits = eval("(" + rs.rows.item(0).benefits + ")");
					MasterCardData.businesses = eval("(" + rs.rows.item(0).businesses + ")");
					alert(MasterCardData.benefits[0].name);
				});
			});
	}

	populateData();

	$(document).delegate("#platinum-benefits", "pageshow",function() {	
		$.each(MasterCardData.benefits, function(i,el) {
			$("#platinum-benefits-content ul")	.append("<li><a href='#'>" + el.name + "</a></li>");
		});
		$("#platinum-benefits-content ul").listview('refresh');
	});
});




