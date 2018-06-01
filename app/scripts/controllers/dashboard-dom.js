'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:GenricDashboardCtrl
 * @description
 * # GenricDashboardCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp').controller('DomDashboardCtrl', function($scope, $log, Utils, 
	Collection, Users, DashboardDOM, NgMap) {

	$scope.page = {
		title: 'Dashboard',
		filters: {
			constructions: {
				list: [],
				selected: null,
				disabled: true
			},
			users: {
				list: [],
				selected: null,
				disabled: true
			},
			dateSearch: {
				value: null
			}
		}
	};

	$scope.map = 
 	{ 
		center: 
		{ 
			latitude: -33.4378394, 
			longitude: -70.6526683
		}, 
		zoom: 10,
		reports: []
 	};

	$scope.dashboard = {
 		pendientes: [],
 		pins: []
 	};

	var data = [];

	$scope.getCollection = function() {
		data = [];

		Collection.query({
			idCollection: 27
		}, function(success) {
			if (success.data) {
				data = [];
				$scope.page.filters.constructions.list.push({
					name: 'Cliente no seleccionado',
					id: 'null',
				});
				for (var i = 0; i < success.included.length; i++) {
					$scope.page.filters.constructions.list.push({
						name: success.included[i].attributes.name,
						id: success.included[i].id,
					});
				}
				$scope.page.filters.constructions.disabled = false;
				$scope.getUsers();
			} else {
				$log.error(success);
			}
		}, function(error) {
			$log.error(error);
			if (error.status) {
				Utils.refreshToken($scope.getCollection);
			}
		});
	};

	$scope.getUsers = function() {
		Users.query({
			idUser: ''
		}, function(success) {
			if (success.data) {
				for (var i = 0; i < success.data.length; i++) {
					if (success.data[i].attributes.active == true) {
						$scope.page.filters.users.list.push({
							id: success.data[i].id,
							name: success.data[i].attributes.first_name + ' ' + success.data[i].attributes.last_name,
						});
					}
				}
				$scope.page.filters.users.disabled = false;

				$scope.getDashboardInfo();
			} else {
				$log.error(success);
			}
		}, function(error) {
			$log.error(error);
			if (error.status) {
				Utils.refreshToken($scope.getUsers);
			}
		});
	};

	var vm = this;
 	$scope.getDashboardInfo = function() {
 		const creator_id = $scope.page.filters.users.selected != null ? $scope.page.filters.users.selected.id : '';
 		const construction_id = $scope.page.filters.constructions.selected != null ? $scope.page.filters.constructions.selected.id : '';

 		var date = '';

 		if ($scope.page.filters.dateSearch.value != null) {
 			date = ($scope.page.filters.dateSearch.value.getMonth() + 1) + '-' + $scope.page.filters.dateSearch.value.getFullYear();
 		}

 		const data = {
 			creator_id: creator_id,
 			construction_id: construction_id,
 			period: date
 		}

 		DashboardDOM.query(data, function(success) {
 			if (success.data) {
 				$scope.map.reports = _.map(success.data.attributes.report_locations, function(r){ return {
	 					id: r.id,
	 					position: r.position
 					}; 
 				});

 				console.error(success.data.attributes);

 				$scope.reportsByReason = Utils.setChartConfig(
					'column', 
					null, 
					{
					}, 
					{
						title: {
			            	text: 'Cantidad'
			        	}
					}, 
				 	{
						categories: _.map(success.data.attributes.by_reason, function(r){ return r.reason })
					}, 
					[{
				        type: 'column',
				        name: 'Negocios perdidos',
				        data: _.map(success.data.attributes.by_reason, function(r){ return r.num_reports })
				    }]
	    		);

	    		$scope.reportsByBusiness = Utils.setChartConfig(
					'pie', 
					200, 
					{
			            pie: {
			                allowPointSelect: true,
			                cursor: 'pointer',
			                dataLabels: {
			                    enabled: false
			                },
			                showInLegend: true
			            }
		        	}, 
					{}, 
					{}, 
					[
						{
					        name: 'Cantidad negocios',
					        colorByPoint: true,
					        data: _.map(success.data.attributes.by_business, function(r){ return {
					        	name: r.name,
					        	y: r.num_reports
					        } })
				    	}
				    ]
				);

				$scope.reportsByStates = Utils.setChartConfig(
					'pie', 
					200, 
					{
			            pie: {
			                allowPointSelect: true,
			                cursor: 'pointer',
			                dataLabels: {
			                    enabled: false
			                },
			                showInLegend: true
			            }
		        	}, 
					{}, 
					{}, 
					[
						{
					        name: 'Cantidad negocios',
					        colorByPoint: true,
					        data: _.map(success.data.attributes.by_state, function(r){ return {
					        	name: r.state,
					        	y: r.num_reports
					        } })
				    	}
				    ]
				);


 			}
		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getDashboardInfo);
			}
		});
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

	$scope.getCollection();

});