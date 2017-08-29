'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:InverfactDashboardCtrl
 * @description
 * # InverfactDashboardCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')
	.controller('InverfactDashboardCtrl', function($scope, $log, $interval, Utils, NgTableParams) {
	
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
 		empresasVisitadas: 9
 	};

 	var data = [
 		{
 			fullName: 'Juan Perez',
 			visitas: 4,
 			empresas: 4
 		},
 		{
 			fullName: 'Maria Lopez',
 			visitas: 7,
 			empresas: 5
 		}
 	];

 	$scope.tableParams = new NgTableParams({
		page: 1,
		total: 1, 
		noPager: true,
		count: data.length,
		sorting: {
			fullName: 'asc'
		}
	}, {
		total: data.length,
		dataset: data,
		counts: []
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
	        data: [
	            ['A', 23],
	            ['B', 16],
	            ['C', 14],
	            ['D', 14],
	            ['E', 12],
	            ['F', 12]
	        ]
	    }],
	);

	$scope.$watch('page.filters.date.loaded', function() {
		if ($scope.page.filters.date.loaded) {
			$scope.$watch('page.filters.date.value', function() {
				$log.error('Debo llamar al servicio');
				//$scope.getDashboardInfo();
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