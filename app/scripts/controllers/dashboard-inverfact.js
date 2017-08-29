'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:InverfactDashboardCtrl
 * @description
 * # InverfactDashboardCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')
	.controller('InverfactDashboardCtrl', function($scope, $log, $interval, Utils, NgTableParams, DashboardInverfact) {
	
	$scope.page = {
 		title: 'Inverfact',
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
 		empresasVisitadas: 0
 	};


 	$scope.getDashboardInfo = function() {
 		DashboardInverfact.query({
 			'year': $scope.page.filters.date.value.getFullYear(),
 			'month': $scope.page.filters.date.value.getMonth()+1
 		}, function(success) {
		    if (success.data) 
		    {
		    	$scope.tableParams = new NgTableParams({
					page: 1,
					total: 1, 
					noPager: true,
					count: success.data.attributes.reports_by_user.length,
					sorting: {
						fullName: 'asc'
					}
				}, {
					total: success.data.attributes.reports_by_user.length,
					dataset: success.data.attributes.reports_by_user,
					counts: []
				});


				$scope.dashboard.empresasVisitadas = success.data.attributes.num_companies;

				var datos = [];
				angular.forEach(success.data.attributes.reports_by_reason, function(value, key){
					datos.push([value.reason, value.num_reports]);
				});


				$scope.titulo = Utils.setChartConfig(
					'column', 
					null, 
					{}, 
					{
			        	min: 0,
				        title: {
				            text: 'Cantidad de Vistas Realizadas'
				        }
			    	}, 
					{
				        type: 'category',
				        labels: {
				            style: {
				                fontSize: '13px',
				                fontFamily: 'Verdana, sans-serif'
				            }
				        }
				    }, 
				    [{
				        name: 'Motivo de visita',
				        data: datos
				    }],
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


	$scope.$watch('page.filters.date.loaded', function() {
		if ($scope.page.filters.date.loaded) {
			$scope.$watch('page.filters.date.value', function() {
				$scope.getDashboardInfo();
			});
		}
	});



 	$scope.openDatePicker = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.page.filters.date.opened = !$scope.page.filters.date.opened;
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});