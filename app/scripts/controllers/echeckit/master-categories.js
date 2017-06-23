'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:CategoriesCtrl
 * @description
 * # CategoriesCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')

.controller('CategoriesCtrl', function($scope, $log, $uibModal, Activities, NgTableParams, Categories) {

	$scope.page = {
		title: 'Categorías'
	};

	$scope.show = {
		categories: false
	};


	var data = [];

	$scope.getCategories = function() {

		data = [];

		Categories.query({
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
					$scope.show.categories = true;
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
					Utils.refreshToken($scope.getCategories);
				}
		});

	};

	$scope.openModalCategoriesDetails = function(idCat) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'categoriesDetails.html',
			controller: 'categoriesDetailInstance',
			resolve: {
				idCat: function() {
					return idCat;
				}
			}
		});
		modalInstance.result.then(function(datos) {
 			if (datos.action === 'removeCategory') {
 				for (var i = 0; i < data.length; i++) {
 					if (data[i].id === datos.idCat) {
 						data.splice(i, 1);
 					}
 				}
 			}
 			if (datos.action === 'editCat') {
 				for (var j = 0; j < data.length; j++) {
 					if (data[j].id === datos.success.data.id) {
 						data[j].name = datos.success.data.attributes.name;
 					}
 				}
 			}
 			$scope.tableParams.reload();
 		}, function() {});
 	};

 	$scope.openModalNewCategory = function() {

		var modalInstance = $uibModal.open({
			animation: true,
			backdrop: false,
			templateUrl: 'newCategory.html',
			controller: 'newCategoryModalInstance',
			resolve: {}
		});

		modalInstance.result.then(function() {
			$scope.getCategories(1);
		}, function() {});
	};

	$scope.openModalLoad = function() {

		var modalInstance = $uibModal.open({
			animation: true,
			backdrop: false,
			templateUrl: 'loadCategories.html',
			controller: 'LoadCategoriesModalInstance',
			resolve: {}
		});

		modalInstance.result.then(function() {}, function() {});
	};

	$scope.getCategories();

})

.controller('newCategoryModalInstance', function($scope, $log, $uibModalInstance, Categories, $uibModal, Csv, Validators) {

	$scope.modal = {
		csvFile: null
	};

	$scope.modal.category = {
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

	$scope.saveCategory = function() {

			//$log.error($scope.modal.activity.type);

			if (!Validators.validateRequiredField($scope.modal.category.type.text)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = 'El tipo de categoria es requerido';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}
			Categories.save({
			data: {
				type: 'categories',
				attributes: {
					name: $scope.modal.category.type.text
				}
			}
			}, function(success) {
				if (success.data) {

					$uibModalInstance.close({
						action: 'saveCategory',
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
					Utils.refreshToken($scope.saveCategory);
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

.controller('categoriesDetailInstance', function($scope, $log, $uibModalInstance, idCat, Categories, Validators, Utils) {
 	$scope.category = {
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

 	$scope.ok = function() {
		// $uibModalInstance.close($scope.selected.item);
		$uibModalInstance.close();
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.getCatDetail = function(idCat) {
		Categories.query({
			idCategory: idCat
		}, function(success) {
			if (success.data) {
				$scope.elements.title = success.data.attributes.name;

				$scope.category.id = success.data.id;
				$scope.category.type.text = success.data.attributes.name;

			} else {
				$log.log(success);
			}
		}, function(error) {
			$log.log(error);
		});

	};

	$scope.getCatDetail(idCat);

	$scope.editCat = function(idCat) {

		if ($scope.elements.buttons.editUser.text === 'Editar') {
			$scope.elements.buttons.editUser.text = 'Guardar';
			$scope.elements.buttons.editUser.border = '';
			enableFormInputs();
		} else {

			if (!Validators.validateRequiredField($scope.category.type.text)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = '';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}

			$scope.elements.buttons.editUser.text = 'Editar';
			$scope.elements.buttons.editUser.border = 'btn-border';
			disableFormInputs();

			Categories.update({
				data: {
					type: 'categories',
					id: idCat,
					attributes: {
						name: $scope.category.type.text,
					}
				},
				idCategory: idCat
			}, function(success) {
				if (success.data) {
					$scope.elements.alert.title = 'Se han actualizado los datos de la categoria';
					$scope.elements.alert.text = '';
					$scope.elements.alert.color = 'success';
					$scope.elements.alert.show = true;

					disableFormInputs();

					//$scope.getCategories(idCat);

					$uibModalInstance.close({
						action: 'editCat',
						success: success
					});

				} else {
					$log.log(success);
				}
			}, function(error) {
				$log.log(error);
			});

		}

	};

	$scope.removeCat = function(idCat) {
		if ($scope.elements.buttons.removeUser.text === 'Eliminar') {
			$scope.elements.buttons.removeUser.text = 'Si, eliminar';

			$scope.elements.buttons.removeUser.border = '';
			$scope.elements.alert.show = true;
			$scope.elements.alert.title = '¿Seguro que desea eliminar la categoria?';
			$scope.elements.alert.text = 'Para eliminarlo, vuelva a presionar el botón';
			$scope.elements.alert.color = 'danger';

		} else {
			$scope.elements.buttons.removeUser.text = 'Eliminar';

			Categories.delete({
				idCategory: idCat
			}, function(success) {
				$uibModalInstance.close({
					action: 'removeCategory',
					idCat: idCat
				});

			}, function(error) {
				$log.log(error);
				if (error.status === 401) {
					Utils.refreshToken($scope.removeCat);
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
		$scope.category.type.disabled = false;
	};

	var disableFormInputs = function() {
		$scope.category.type.disabled = true;
	};

	$scope.hideAlert = function() {
		$scope.elements.alert.show = false;
		$scope.elements.alert.title = '';
		$scope.elements.alert.text = '';
		$scope.elements.alert.color = '';
	};

})

.controller('LoadCategoriesModalInstance', function($scope, $log, $uibModalInstance, $uibModal, Activities, Csv) {

	$scope.modal = {
		csvFile: null,
		buttons: {
			load: {
				disabled: false,
				text: 'Cargar'
			}
		}
	};

	$scope.loadCategories = function() {
		if ($scope.modal.csvFile) {
			uploadCategories();
		}
	};

	var uploadCategories = function() {

		var form = [{
			field: 'type',
			value: 'categories'
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
			controller: 'SummaryLoadCategoriesModalInstance',
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

.controller('SummaryLoadCategoriesModalInstance', function($scope, $log, $uibModalInstance, data) {

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
			//  rowNumber: data.data[i].meta.row_number + 1,
			//  fields: [{
			//		name: storeCode,
			//		detail: descriptionStoreCode
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