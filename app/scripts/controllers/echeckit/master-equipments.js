'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:MastersEquipmentsCtrl
 * @description
 * # MastersEquipmentsCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')

.controller('MastersEquipmentsCtrl', function($scope, $log, $uibModal, NgTableParams, $filter, Equipments, Utils) {

	$scope.page = {
		title: 'Equipos'
	};

	$scope.pagination = {
		pages: {
			current: 1,
			total: 0,
			size: 100
		}
	};

	var data = [],
		i, j = 0;

	$scope.incrementPage = function() {
		if ($scope.pagination.pages.current <= $scope.pagination.pages.total - 1) {
			$scope.pagination.pages.current++;
			$scope.getEquipments($scope.pagination.pages.current);
		}
	};

	$scope.decrementPage = function() {
		if ($scope.pagination.pages.current > 1) {
			$scope.pagination.pages.current--;
			$scope.getEquipments($scope.pagination.pages.current);
		}
	};

	$scope.getEquipments = function(page) {
		data = [];

		Equipments.query({
			idEquipment: '',
			'page[number]': page,
			'page[size]': $scope.pagination.pages.size
		}, function(success) {

			// $log.log(success);

			if (success.data) {

				$scope.pagination.pages.total = success.meta.page_count;

				data = [];
				for (i = 0; i < success.data.length; i++) {
					data.push({
						serialNumber: success.data[i].attributes.serial_number,
						configurationElement: success.data[i].attributes.configuration_element,
						alternativeId: success.data[i].attributes.alternative_id,
						equipmentModel: success.data[i].attributes.equipment_model,
						location: success.data[i].attributes.location,
						address: success.data[i].attributes.address,
						city: success.data[i].attributes.city,
						territory: success.data[i].attributes.territory,
						equipmentClass: success.data[i].attributes.equipment_class,
						client: success.data[i].attributes.client
					});
				}

				$scope.tableParams = new NgTableParams({
					page: 1, // show first page
					sorting: {
						serialNumber: 'asc' // initial sorting
					},
					count: data.length // count per page
				}, {
					counts: [],
					total: data.length, // length of data
					dataset: data
				});

			} else {
				$log.error(success);
			}
		}, function(error) {
			$log.error(error);
		});
	};

	$scope.openModalNewEquipment = function() {

		var modalInstance = $uibModal.open({
			animation: true,
			backdrop: false,
			templateUrl: 'newEquipment.html',
			controller: 'NewEquipmentModalInstance',
			resolve: {}
		});

		modalInstance.result.then(function() {
			$scope.getEquipments(1);
		}, function() {});
	};

	$scope.getEquipments($scope.pagination.pages.current);

})

.controller('NewEquipmentModalInstance', function($scope, $log, $uibModalInstance, $uibModal, Csv) {

	$scope.modal = {
		csvFile: null,
		btns: {
			chargeSave: {
				disabled: false
			}
		},
		overlay: {
			show: false
		},
		alert: {
			color: '',
			show: false,
			title: '',
			subtitle: '',
			text: ''
		}
	};

	$scope.saveEquipment = function() {

		$scope.modal.btns.chargeSave.disabled = true;

		if ($scope.modal.csvFile) {
			uploadCsvEquipments();
		} else {

		}

	};

	/*var uploadCsvEquipments = function() {

		var form = [{
			field: 'type',
			value: 'equipments'
		}, {
			field: 'csv',
			value: $scope.modal.csvFile
		}];

		$scope.modal.overlay.show = true;

		Csv.upload(form)
			.success(function(success) {
				// $log.log(success);
				$scope.modal.overlay.show = false;
				$uibModalInstance.close();
				openModalSummary(success);
			}, function(error) {
				$scope.modal.overlay.show = false;
				$log.error(error);
			});

	};*/

	var uploadCsvEquipments = function() {

		var form = [{
			field: 'type',
			value: 'equipments'
		}, {
			field: 'csv',
			value: $scope.modal.csvFile
		}];

		$scope.modal.overlay.show = true;

		Csv.upload(form)
			.success(function(success) {
				$scope.modal.overlay.show = false;
				$uibModalInstance.close();
				openModalSummary(success);
			}).error(function(error) {
				$scope.modal.overlay.show = false;
				$log.error(error);
				$scope.modal.alert.show = true;
				$scope.modal.alert.title = 'Error '+error.errors[0].status;
				$scope.modal.alert.text = error.errors[0].detail;
				$scope.modal.alert.color = 'danger';
				//openModalSummary(error);
			});

	};	

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.ok = function() {
		$uibModalInstance.close();
	};

	var openModalSummary = function(data) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'summary.html',
			controller: 'SummaryLoadEquipmentsModalInstance',
			resolve: {
				data: function() {
					return data;
				}
			}
		});

		modalInstance.result.then(function() {}, function() {
			// $scope.getUsers();
		});
	};

})

.controller('SummaryLoadEquipmentsModalInstance', function($scope, $log, $uibModalInstance, data, $sce) {

	$scope.modal = {
		countErrors: 0,
		countSuccesses: 0,
		countCreated: 0,
		countChanged: 0,
		errors: [],
		successes: []
	};
	var i = 0;

	for (i = 0; i < data.data.length; i++) {

		if (!data.data[i].meta.success) {
			$scope.modal.countErrors++;
		} else if (data.data[i].meta.created) {
			$scope.modal.countCreated++;
		} else if (data.data[i].meta.changed) {
			$scope.modal.countChanged++;
		}

		if (data.data[i].meta.errors) {
			$scope.modal.errors.push({
				rowNumber: data.data[i].meta.row_number,
				field: $sce.trustAsHtml(_.map(data.data[i].meta.errors, function(value, key) {
				    return '<strong>' + key + ":</strong> " + value.join(', ');
				}).join('<br />'))
			});
		}

	}

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});