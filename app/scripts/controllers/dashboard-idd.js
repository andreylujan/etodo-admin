'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:GenricDashboardCtrl
 * @description
 * # GenricDashboardCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')
	.controller('IDDDashboardCtrl', function($scope, $log, $interval, Utils, NgTableParams, DashboardIDD, NgMap) {
		
	$scope.map = 
 	{ 
		center: 
		{ 
			latitude: -33.4428576054363,//-33.3769732, 
			longitude: -70.6258822605672//-56.5264399 
		}, 
		zoom: 15 
 	};
 	$scope.page = {
 		filters: {
 			date: {
 				value: new Date(),
 				opened: false,
 				loaded: true
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
 		pendientes: [],
 		pines: []
 	};

 	var vm = this;
 	$scope.getDashboardInfo = function() {
 		DashboardIDD.query({
 			'type': 'internal',
 			'year': $scope.page.filters.date.value.getFullYear(),
 			'month': $scope.page.filters.date.value.getMonth()+1
 		}, function(success) {
		    if (success.data) {
		    	// INICIO POR DEPARTAMENTO
		    	$scope.dashboard.pendientes = success.data.attributes.by_department;

		    	if ($scope.dashboard.pendientes.length > 5) 
		    	{
		    		var aux = 0;
		    		angular.forEach($scope.dashboard.pendientes, function(value, key){
		    			if (aux > 4) 
		    			{
		    				value.active = false;
		    			}
		    			else
		    			{
		    				value.active = true;
		    			}
		    		});

		    		$scope.page.buttonList.active = true;
		    	}
		    	else
		    	{
		    		angular.forEach($scope.dashboard.pendientes, function(value, key){
		    			value.active = true;
		    		});
		    		$scope.page.buttonList.active = false;

		    	}
		    	// FIN POR DEPARTAMENTO

		    	// INICIO CHAR DONUT
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
		    	// FIN CHAR DONUT


		    	// INICIO RESUELTOS/RECIBIDOS
		    	$scope.recibidos = success.data.attributes.num_received;
		    	$scope.resueltos = success.data.attributes.num_resolved;
		    	// FIN RESUELTOS/RECIBIDOS

		    	// INICIO MAPA
		    	$scope.dashboard.pines = success.data.attributes.report_locations;
		    	vm.reportes = $scope.dashboard.pines;

				$scope.Mrecibidos = _.where(vm.reportes, {type: "recibido"})
				$scope.Mresueltos = _.where(vm.reportes, {type: "resuelto"})

				$scope.report = vm.reportes[0];
		    	// FIN MAPA
		   	}
		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getDashboardInfo);


			}
		});
	};

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

	NgMap.getMap().then(function(map) {
		vm.map = map;
	});

	vm.showDetail = function(e, report) {
		$scope.report  = report;
		vm.map.showInfoWindow('foo-iw', report.id);
	};

	vm.hideDetail = function() {
		vm.map.hideInfoWindow('foo-iw');
	};

	$scope.$watch('page.filters.date.loaded', function() {
		if ($scope.page.filters.date.loaded) {
			$scope.$watch('page.filters.date.value', function() {
				$scope.getDashboardInfo();
			});
		}
	});
});