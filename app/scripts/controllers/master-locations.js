'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:LocationsCtrl
 * @description
 * # LocationsCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')

.controller('LocationsCtrl', function($scope, $log, $uibModal, NgTableParams, Locations) {

	$scope.page = {
		title: 'Lugares'
	};

	$scope.show = {
		locations: false
	};

	var data = [];

	$scope.getLocations = function() {

		data = [];

		Locations.query({
		}, function(success) {

			//$log.error(success);

			if (success.data) {
				data = [];
				//$log.error(success.data);
				for (var i = 0; i < success.data.length; i++) {
					data.push({
						id: success.data[i].id,
						name: success.data[i].attributes.name,
					});
				}

				if (data.length > 0) 
				{
					$scope.show.locations = true;
				}

				$log.log(data);

				$scope.tableParams = new NgTableParams({
					page: 1,
					count: 50,
					sorting: {
						name: 'asc'
					}
				}, {
					total: data.length,
					dataset: data
				});
				$scope.page.tableLoaded = true;

			} else {
				$log.error(success);
			}
		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getLocations);
			}
		});

	};

	$scope.openModalLocationsDetails = function(idLocation) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'locationsDetails.html',
			controller: 'locationsDetailInstance',
			resolve: {
				idLocation: function() {
					return idLocation;
				}
			}
		});
		modalInstance.result.then(function(datos) {
 			if (datos.action === 'removeLocation') {
 				for (var i = 0; i < data.length; i++) {
 					if (data[i].id === datos.idLoc) {
 						data.splice(i, 1);
 					}
 				}
 			}
 			if (datos.action === 'editLocation') {
 				for (var j = 0; j < data.length; j++) {
 					if (data[j].id === datos.success.data.id) {
 						data[j].name = datos.success.data.attributes.name;
 					}
 				}
 			}
 			$scope.tableParams.reload();
 		}, function() {});
 	};

 	$scope.openModalNewLocation = function() {

		var modalInstance = $uibModal.open({
			animation: true,
			backdrop: false,
			templateUrl: 'newLocation.html',
			controller: 'newLocationModalInstance',
			resolve: {}
		});

		modalInstance.result.then(function() {
			$scope.getLocations(1);
		}, function() {});
	};

	$scope.openModalLoad = function() {

		var modalInstance = $uibModal.open({
			animation: true,
			backdrop: false,
			templateUrl: 'loadLocations.html',
			controller: 'LoadLocationsModalInstance',
			resolve: {}
		});

		modalInstance.result.then(function() {}, function() {});
	};

	$scope.getLocations();

})

.controller('newLocationModalInstance', function($scope, $log, $filter, Categories, $uibModalInstance, Locations, $uibModal, Csv, Validators) {

	$scope.modal = {
		csvFile: null
	};

	$scope.modal.location = {
 		id: null,
 		type: {
 			text: '',
 			disabled: true
 		}
 	};

 	$scope.elements = {
 		alert: {
 			show: false,
 			title: '',
 			text: '',
 			color: '',
 		}
 	};

	$scope.modal.categories = [];


	$scope.getCategories = function(filter) {
 		Categories.query({
			// fields[equipments]: filter
		}, function(success) {
			$scope.modal.categories = [];
			if (success.data) {
				$scope.modal.categories.push({
					id: '',
					serial_number: 'Seleccione categoría',
					disabled: true
				});

				//$log.error(success.data);
				for (var i = 0; i < success.data.length; i++) {
					$scope.modal.categories.push({
						id: success.data[i].id,
						serial_number: $filter('capitalize')(success.data[i].attributes.name, true),
						disabled: false
					});
				}
				$scope.modal.selectedCategories = $scope.modal.categories[0];
				$scope.modal.categoriesLoaded = true;

			} else {
				$log.error(success);
			}

		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getCategories);
			}
		});
 	};

	$scope.saveLocation = function() {

			if (!Validators.validateRequiredField($scope.modal.location.type.text)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = 'Tipo de lugar es requerido';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}

			if (!Validators.validateRequiredField($scope.modal.selectedCategories.id)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = 'Categoria del lugar es requerido';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}

			Locations.save({
			data: {
				type: 'locations',
				attributes: {
					name: $scope.modal.location.type.text,
					category_id: $scope.modal.selectedCategories.id
				}
			}
			}, function(success) {
				if (success.data) {

					$uibModalInstance.close({
						action: 'saveLocation',
						success: success
					});
				} 
				else 
				{
					$log.error(success);
					$scope.modal.alert.title = 'Error al Guardar';
					$scope.modal.alert.text = '';
					$scope.modal.alert.color = 'danger';
					$scope.modal.alert.show = true;
					return;
				}
			}, function(error) {
				$log.error(error);
				if (error.status === 401) {
					Utils.refreshToken($scope.saveLocation);
				}
				$scope.modal.alert.title = 'Error al Guardar';
				$scope.modal.alert.text = '';
				$scope.modal.alert.color = 'danger';
				$scope.modal.alert.show = true;
				return;
			});

	};

	var uploadCsvActivity = function() {

		$log.log($scope.modal.csvFile);

		var form = [{
			field: 'type',
			value: 'activities'
		}, {
			field: 'csv',
			value: $scope.page.csvFile
		}, {
			field: 'namespace',
			value: 'belltech'
		}];

		Csv.uploadFileToUrl(form);

	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

})

.controller('locationsDetailInstance', function($scope, $log, $filter, $uibModalInstance, idLocation, Locations, Validators, Utils, Categories) {
 	$scope.location = {
 		id: null,
 		type: {
 			text: '',
 			disabled: true
 		}
 	};
 	$scope.elements = {
 		buttons: {
 			editUser: {
 				text: 'Editar',
 				border: 'btn-border'
 			},
 			removeUser: {
 				text: 'Eliminar',
 				border: 'btn-border'
 			}
 		},
 		title: '',
 		alert: {
 			show: false,
 			title: '',
 			text: '',
 			color: '',
 		}
 	};
 	$scope.location.categories = [];

 	$scope.ok = function() {
		// $uibModalInstance.close($scope.selected.item);
		$uibModalInstance.close();
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.getLocation = function(idLocation) {
		Locations.query({
			idLocation: idLocation
		}, function(success) {
			if (success.data) {
				$scope.elements.title = success.data.attributes.name;

				$scope.location.id = success.data.id;
				$scope.location.type.text = success.data.attributes.name;
				$scope.location.category_id = success.data.attributes.category_id;

			} else {
				$log.log(success);
			}
		}, function(error) {
			$log.log(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getLocation);
			}
		});

	};

	$scope.getCategories = function(filter) {
 		Categories.query({
			// fields[equipments]: filter
		}, function(success) {
			if (success.data) {
				//$log.error(success.data);
				for (var i = 0; i < success.data.length; i++) {
					$scope.location.categories.push({
						id: success.data[i].id,
						serial_number: $filter('capitalize')(success.data[i].attributes.name, true),
						category_id: success.data[i].id,
						disabled: false
					});
				}
				for (var i = $scope.location.categories.length - 1; i >= 0; i--) {
					//$log.error($scope.location.category_id);
					//$log.error($scope.location.categories[i]);

					if ($scope.location.category_id === $scope.location.categories[i].category_id) 
					{
						$scope.location.selectedCategories = $scope.location.categories[i];
						$log.error($scope.location.selectedCategories);
						break;
					}
				}
				$scope.location.categoriesLoaded = true;

			} else {
				$log.error(success);
			}

		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getCategories);
			}
		});
 	};

	$scope.getLocation(idLocation);

	$scope.editLocation = function(idLoc) {
		if ($scope.elements.buttons.editUser.text === 'Editar') {
			$scope.elements.buttons.editUser.text = 'Guardar';
			$scope.elements.buttons.editUser.border = '';
			enableFormInputs();
		} else {

			if (!Validators.validateRequiredField($scope.location.type.text)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = 'Tipo de lugar es requerido';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}

			if (!Validators.validateRequiredField($scope.location.selectedCategories.id)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = '';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}

			$scope.elements.buttons.editUser.text = 'Editar';
			$scope.elements.buttons.editUser.border = 'btn-border';
			disableFormInputs();

			Locations.update({
				data: {
					type: 'locations',
					id: idLoc,
					attributes: {
						name: $scope.location.type.text,
						category_id: $scope.location.selectedCategories.id
					}
				},
				idLocation: idLoc
			}, function(success) {
				if (success.data) {
					$scope.elements.alert.title = 'Se han actualizado los datos del lugar';
					$scope.elements.alert.text = '';
					$scope.elements.alert.color = 'success';
					$scope.elements.alert.show = true;

					disableFormInputs();

					//$scope.getCategories(idCat);

					$uibModalInstance.close({
						action: 'editLocation',
						success: success
					});

				} else {
					$log.log(success);
				}
			}, function(error) {
				$log.log(error);
				if (error.status === 401) {
					Utils.refreshToken($scope.editLocation);
				}

			});

		}

	};

	$scope.removeLocation = function(idLoc) {
		if ($scope.elements.buttons.removeUser.text === 'Eliminar') {
			$scope.elements.buttons.removeUser.text = 'Si, eliminar';

			$scope.elements.buttons.removeUser.border = '';
			$scope.elements.alert.show = true;
			$scope.elements.alert.title = '¿Seguro que desea eliminar el lugar?';
			$scope.elements.alert.text = 'Para eliminarlo, vuelva a presionar el botón';
			$scope.elements.alert.color = 'danger';

		} else {
			$scope.elements.buttons.removeUser.text = 'Eliminar';

			Locations.delete({
				idLocation: idLoc
			}, function(success) {
				$uibModalInstance.close({
					action: 'removeLocation',
					idLoc: idLoc
				});

			}, function(error) {
				$log.log(error);
				if (error.status === 401) {
					Utils.refreshToken($scope.removeLocation);
				}
			});
		}

	};

	$scope.formatRut = function(rut) {

		if (Validators.validateRutCheckDigit(rut)) {
			$scope.user.rut.text = Utils.formatRut(rut);
		}

	};

	var enableFormInputs = function() {
		$scope.location.type.disabled = false;
	};

	var disableFormInputs = function() {
		$scope.location.type.disabled = true;
	};

	$scope.hideAlert = function() {
		$scope.elements.alert.show = false;
		$scope.elements.alert.title = '';
		$scope.elements.alert.text = '';
		$scope.elements.alert.color = '';
	};

})


.controller('LoadLocationsModalInstance', function($scope, $log, $uibModalInstance, $uibModal, Csv) {

	$scope.modal = {
		csvFile: null,
		buttons: {
			load: {
				disabled: false,
				text: 'Cargar'
			}
		}
	};

	$scope.loadLocations = function() {
		if ($scope.modal.csvFile) {
			uploadLocations();
		}
	};

	var uploadLocations = function() {

		var form = [{
			field: 'type',
			value: 'locations'
		}, {
			field: 'csv',
			value: $scope.modal.csvFile
		}, {
			field: 'namespace',
			value: 'pausa'
		}];

		$scope.modal.buttons.load.disabled = true;
		$scope.modal.buttons.load.text = 'Subiendo...';

		Csv.upload(form)
			.success(function(success) {
				$uibModalInstance.close();
				openModalSummaryLoad(success);
			}).error(function(error) {
				$log.error(error);
			});

	};

	var openModalSummaryLoad = function(data) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'summaryLoad.html',
			controller: 'SummaryLoadLocationsModalInstance',
			resolve: {
				data: function() {
					return data;
				}
			}
		});

		modalInstance.result.then(function() {}, function() {});
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

})

.controller('SummaryLoadLocationsModalInstance', function($scope, $log, $uibModalInstance, data) {

	$scope.modal = {
		title: {
			text: 'Resumen de carga'
		},
		subtitle: {
			text: ''
		},
		alert: {
			show: false,
			title: '',
			text: '',
			color: ''
		},
		summaryData: data,
		successes: {
			data: [],
			count: 0
		},
		errors: {
			data: [],
			count: 0
		}
	};

	var i = 0,
		j = 0;

	for (i = 0; i < data.data.length; i++) {
		// éxito
		if (data.data[i].meta.success) {
			$scope.modal.successes.count++;
			if (data.data[i].meta.created) {
				$scope.modal.successes.data.push({
					name: data.data[i].meta.row_data.name,
					state: 'Creado'
				});
			}
			if (data.data[i].meta.changed) {
				$scope.modal.successes.data.push({
					name: data.data[i].meta.row_data.name,
					state: 'Actualizado'
				});
			}
			if (!data.data[i].meta.created && !data.data[i].meta.changed) {
				$scope.modal.successes.data.push({
					name: data.data[i].meta.row_data.name,
					state: 'Sin cambios'
				});
			}

			// error
		} else {
			$scope.modal.errors.count++;

			// var storeCode = data.data[i].meta.errors.store_code ? storeCode = 'Código producto' : storeCode = null;
			// var descriptionStoreCode = data.data[i].meta.errors.store_code ? descriptionStoreCode = data.data[i].meta.errors.store_code[0] : descriptionStoreCode = null;

			// var monthlyGoal = data.data[i].meta.errors.monthly_goal ? monthlyGoal = 'Monto' : monthlyGoal = null;
			// var descriptionMonthlyGoal = data.data[i].meta.errors.monthly_goal ? descriptionMonthlyGoal = data.data[i].meta.errors.monthly_goal[0] : descriptionMonthlyGoal = null;

			// $scope.modal.errors.data.push({
			// 	rowNumber: data.data[i].meta.row_number + 1,
			// 	fields: [{
			// 		name: storeCode,
			// 		detail: descriptionStoreCode
			// 	}, {
			// 		name: monthlyGoal,
			// 		detail: descriptionMonthlyGoal
			// 	}]
			// });
		}
	}

	$scope.cancel = function() {
		$uibModalInstance.close();
	};

});