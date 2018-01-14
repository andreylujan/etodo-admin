'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:InverfactDashboardCtrl
 * @description
 * # InverfactDashboardCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')
	.controller('IntralotDashboardCtrl', function($scope, $log, $interval, Utils, NgTableParams, DashboardIntralot) {
	
	$scope.page = {
 		title: 'Intralot',
 		filters: {
 			date: {
 				value: new Date(),
 				opened: false,
 				loaded: true
 			}
 		}
 	};

 	$scope.dashboard = 
 	{
 		reports_by_day: 0,
 		current_month: 0
 	};

 	var setTableDeliveryReportsCurrentMonth = function(data) {
		$scope.tableParamsDeliveryReportsCurrentMonth = new NgTableParams({
			page: 1,
			count: data.length,
			sorting: {
				'userName': 'asc'
			}
		}, {
			counts: [],
			total: data.length,
			dataset: data
		});
	};

	var setTableReportsByUserCurrentMonth = function(data) {
		$scope.tableParamsReportsByUserCurrentMonth = new NgTableParams({
			page: 1,
			count: data.length,
			sorting: {
				'userName': 'asc'
			}
		}, {
			counts: [],
			total: data.length,
			dataset: data
		});
	};

	var setTableReportsByWeek = function(data) {
		$scope.tableParamsReportsByWeek = new NgTableParams({
			page: 1,
			count: data.length,
			sorting: {
				'userName': 'asc'
			}
		}, {
			counts: [],
			total: data.length,
			dataset: data
		});
	};


 	$scope.getDashboardInfo = function() {
 		DashboardIntralot.query({
 		}, function(success) {
		    if (success.data) 
		    {
		    	$scope.dashboard.reports_by_day = success.data.attributes.report_counts.num_reports_by_day;
		    	$scope.dashboard.current_month = success.data.attributes.report_counts.num_current_month;

				setTableDeliveryReportsCurrentMonth(success.data.attributes.reports_by_delivery_result);

				var current_month_user_reports = [];
				var reports_by_user = _.countBy(_.map(success.data.attributes.current_month_user_reports, 
						function(r){ return r.creator_id; }),
					function(report) {
						return report;
					});
				for (var i in reports_by_user) {
					current_month_user_reports.push({ name: i, count: reports_by_user[i]});
   				}
   				setTableReportsByUserCurrentMonth(current_month_user_reports);


   				var reports_by_week = [];
				var reports_by_user = _.countBy(_.map(success.data.attributes.reports_by_week, 
						function(r){ return r.week_code; }),
					function(report) {
						return report;
					});
				for (var i in reports_by_user) {
					reports_by_week.push({ name: i, count: reports_by_user[i]});
   				}
   				setTableReportsByWeek(reports_by_week);

   				var reports_last_fifteen = [];
   				var reports_last_fifteen_days =  _.countBy(_.map(success.data.attributes.reports_last_fifteen_days, 
						function(r){ return moment(r.created_at).format('D/M'); }),
					function(report) {
						return report;
				})

				for (var i in reports_last_fifteen_days) {
					reports_last_fifteen.push({ name: i, data: reports_last_fifteen_days[i]});
   				}
   				$scope.titulo = Utils.setChartConfig(
					'spline', 
					null, 
					{
						column: {
				            dataLabels: {
				                enabled: true
				            },
				            enableMouseTracking: false
				        }
					}, 
					{
			        	min: 0,
				        title: {
				            text: 'Cantidad de Reportes en los ultimos 15 días'
				        }
			    	}, 
					{
				        categories: _.map(reports_last_fifteen, function(num, key){ return num.name; }),
				        crosshair: true
				    },
				    [{
				    	name: 'Cantidad de reportes',
				    	data: _.map(reports_last_fifteen, function(num, key){ return num.data; })
				    }]
				);
		   	}
		}, function(error) {
			$log.error(error);
			if (error.status === 401) 
			{
				Utils.refreshToken($scope.getDashboardInfo);
			}
		});
	};
	$scope.getDashboardInfo();
});