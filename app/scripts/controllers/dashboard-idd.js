'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:GenricDashboardCtrl
 * @description
 * # GenricDashboardCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')
	.controller('IDDDashboardCtrl', function($scope, $log, $interval, Utils, NgTableParams, Dashboard, NgMap) {
		
	$scope.map = 
 	{ 
		center: 
		{ 
			latitude: -33.3769732, 
			longitude: -56.5264399 
		}, 
		zoom: 15 
 	};
 	$scope.page = {
 		filters: {
 			date: {
 				value: new Date(),
 				opened: false
 			}
 		},
 		buttonList:
 		{
 			text: 'Ver todos...',
 			active: true,
 			show: 'more'
 		}
 	};

 	$scope.dashboard = {
 		pendientes: []
 	};

 	//Falta logica de buttonList que aparezca cuando son mas de 5 
 	$scope.dashboard.pendientes = [
 		{
 			name: 'Recoleccion',
 			num_reports: 20,
 			active: true
 		},
 		{
 			name: 'Alumbrado',
 			num_reports: 10,
 			active: true
 		},
 		{
 			name: 'Ruidos molestos',
 			num_reports: 15,
 			active: true
 		},
 		{
 			name: 'Aseo y hornato',
 			num_reports: 1,
 			active: true
 		},
 		{
 			name: 'Levanta arboles',
 			num_reports: 8,
 			active: false
 		},
 		{
 			name: 'Luminaria publica',
 			num_reports: 22,
 			active: false
 		},
 		{
 			name: 'PRUEBA',
 			num_reports: 13,
 			active: false
 		}
 	];

 	$log.error();

 	$scope.cantidadHallazgosDonut = Utils.setChartConfig(
		'pie', 
		500, 
		{
	        pie: 
	        {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        }, 
		{
						        	title: {
            style: {
                fontSize: '48px',
                fontWeight: 'bold'
            },
            verticalAlign: 'middle'
        }
		}, 
		{
						        	title: {
            style: {
                fontSize: '48px',
                fontWeight: 'bold'
            },
            verticalAlign: 'middle'
        }
		}, 
		[
			{
			    name: 'Cantidad',
			    colorByPoint: true,
			    innerSize: '50%',
			    data: _.map($scope.dashboard.pendientes, function(num, key){ return {name: num.name, y:num.num_reports}; })
		    }
		]
	);

 	$scope.showAllItems = function() {

 		if ($scope.page.buttonList.show == 'more') 
 		{	
 			angular.forEach($scope.dashboard.pendientes, function(value, key)
			{
				value.active = true;
			});
 			$scope.page.buttonList.text = 'Ver menos...';
 			$scope.page.buttonList.show = 'less';
 		}
 		else
 		{
 			for (var i = $scope.dashboard.pendientes.length - 1; i >= 5; i--) {
 				$scope.dashboard.pendientes[i].active = false;
 			}
 			$scope.page.buttonList.text = 'Ver todos...';
 			$scope.page.buttonList.show = 'more';
 		}
	};


 	$scope.openDatePicker = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.page.filters.date.opened = !$scope.page.filters.date.opened;
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	



 	//MAPA
	var vm = this;

	NgMap.getMap().then(function(map) {
		vm.map = map;
	});

	vm.reportes = [
		{
			id:'1', 
			name: 'REPORTE 1', 
			position:[-33.3769732, -56.5264399],
			type: 'resuelto',
			color: 'green'
		},
		{
			id:'2', 
			name: 'REPORTE 2', 
			position:[-33.3762923, -56.5314288],
			type: 'recibido',
			color: 'orange'
		}
	];

	vm.recibidos = _.where(vm.reportes, {type: "recibido"})
	vm.resueltos = _.where(vm.reportes, {type: "resuelto"})

	vm.report = vm.reportes[0];

	vm.showDetail = function(e, report) {
		vm.report = report;
		vm.map.showInfoWindow('foo-iw', report.id);
	};

	vm.hideDetail = function() {
		vm.map.hideInfoWindow('foo-iw');
	};
});