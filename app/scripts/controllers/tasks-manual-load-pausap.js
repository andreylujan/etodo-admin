'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:ManualLoadCtrl
 * @description
 * # ManualLoadCtrl
 * Controller of the adminProductsApp
 */
 angular.module('adminProductsApp')

 .controller('ManualLoadPausaPeruCtrl', function($scope, $log, $uibModal, $filter, Users, Reports, Utils, Collection, Validators) {

 	$scope.page = {
 		forms: {},
 		title: 'Programar Tarea',
 		users: [],
 		selectedUser: null,
 		equipments: [],
 		selectedEquipment: null,
 		selectedCategories: null,
 		selectedLocations: null,
 		activityTypes: [],
 		selectedActivityType: null,
 		usersLoaded: false,
 		equipmentsLoaded: false,
 		activityTypesLoaded: false,
 		dateOptions: {
 			formatYear: 'yy',
 			startingDay: 1,
 			'class': 'datepicker',
 			format: 'dd-MMMM-yyyy',
 			datepickerOpened: false,
 			minDate: new Date()
 		},
 		limitDate: new Date(),
 		limitTime: new Date(),
 		buttons: {
 			createProgramTask: {
 				disabled: true
 			}
 		},
 		alert: {
 			title: '',
 			subtitle: '',
 			color: '',
 			show: false
 		}
 	};
 	var i = 0;

 	$scope.openDatepicker = function() {
 		$scope.page.dateOptions.datepickerOpened = true;
 	};

 	$scope.getUsers = function() {

 		$scope.page.users = [];

 		Users.query({
 			idUser: ''
 		}, function(success) {

 			$scope.page.users.push({
 				id: '',
 				fullName: 'Seleccione un usuario',
 				disabled: true
 			});

 			for (i = 0; i < success.data.length; i++) {
 				if (success.data[i].attributes.active) {
 					$scope.page.users.push({
 						id: success.data[i].id,
 						fullName: success.data[i].attributes.first_name + ' ' + success.data[i].attributes.last_name,
 						disabled: false
 					});
 				}
 			}
 			$scope.page.selectedUser = $scope.page.users[0];
 			$scope.page.usersLoaded = true;
 		}, function(error) {
 			$log.error(error);
 			if (error.status === 401) {
 				Utils.refreshToken($scope.getUsers);
 			}
 		});
 	};

 	$scope.getCategories = function(filter) {
 		Collection.query({
			idCollection: 38
		}, function(success) {
			$scope.page.categories = [];
			if (success.data) {

				$scope.page.categories.push({
					id: '',
					serial_number: 'Seleccione categoría',
					disabled: true
				});

				//$log.error(success.data);
				for (var i = 0; i < success.included.length; i++) {
					$scope.page.categories.push({
						id: success.included[i].id,
						serial_number: $filter('capitalize')(success.included[i].attributes.name, true),
						disabled: false
					});
				}
				$scope.page.selectedCategories = $scope.page.categories[0];
				$scope.page.categoriesLoaded = true;

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

 	$scope.getLocations = function(filter) {
 		Collection.query({
			idCollection: 39
		}, function(success) {
			$scope.page.locations = [];
			if (success.data) {
				$scope.page.locations.push({
					id: '',
					name_location: 'Seleccione lugar',
					disabled: true
				});

				//$log.error(success.data);
				for (var i = 0; i < success.included.length; i++) {
					$scope.page.locations.push({
						id: success.included[i].id,
						name_location: $filter('capitalize')(success.included[i].attributes.name, true),
						disabled: false
					});
				}
				$scope.page.selectedLocations = $scope.page.locations[0];
				$scope.page.LocationsLoaded = true;

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

 	$scope.manualLoad = function() {

 		$scope.page.buttons.createProgramTask.disabled = true;

 		$scope.page.alert.color = '';
 		$scope.page.alert.title = '';
 		$scope.page.alert.subtitle = '';
 		$scope.page.alert.show = false;

 		if (!Validators.validateRequiredField($scope.page.selectedUser.id)) {
 			$scope.page.alert.color = 'danger';
 			$scope.page.alert.title = 'Faltan campos por seleccionar';
 			$scope.page.alert.subtitle = 'Debe serleccionar un usuario';
 			$scope.page.alert.show = true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}

 		if (!Validators.validateRequiredField($scope.page.selectedCategories.id)) {
 			$scope.page.alert.color = 'danger';
 			$scope.page.alert.title = 'Faltan campos por seleccionar';
 			$scope.page.alert.subtitle = 'Debe seleccionar una categoria';
 			$scope.page.alert.show = true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}

 		if (!Validators.validateRequiredField($scope.page.selectedLocations.id)) {
 			$scope.page.alert.color = 'danger';
 			$scope.page.alert.title = 'Faltan campos por seleccionar';
 			$scope.page.alert.subtitle = 'Debe seleccionar un lugar';
 			$scope.page.alert.show = true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}

 		if (!Validators.validateRequiredField($scope.page.caja)) {
 			$scope.page.alert.color = 'danger';
 			$scope.page.alert.title = 'Faltan campos por seleccionar';
 			$scope.page.alert.subtitle = 'Debe escribir el número de caja';
 			$scope.page.alert.show = true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}

 		if (!Validators.validateRequiredField($scope.page.sillon)) {
 			$scope.page.alert.color = 'danger';
 			$scope.page.alert.title = 'Faltan campos por seleccionar';
 			$scope.page.alert.subtitle = 'Debe escribir el número de sillón';
 			$scope.page.alert.show = true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}

 		if (!Validators.validateRequiredField($scope.page.contador)) {
 			$scope.page.alert.color = 'danger';
 			$scope.page.alert.title = 'Faltan campos por seleccionar';
 			$scope.page.alert.subtitle = 'Debe escribir el número de contador';
 			$scope.page.alert.show = true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}

 		if (!Validators.validateRequiredField($scope.page.requerimiento)) {
 			$scope.page.alert.color = 'danger';
 			$scope.page.alert.title = 'Faltan campos por seleccionar';
 			$scope.page.alert.subtitle = 'Debe escribir un requerimiento';
 			$scope.page.alert.show = true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}

 		var limitDate = new Date(
			$scope.page.limitDate.getFullYear(),
			$scope.page.limitDate.getMonth(),
			$scope.page.limitDate.getDate(),
			$scope.page.limitTime.getHours(),
			$scope.page.limitTime.getMinutes(),
			$scope.page.limitTime.getSeconds(),
			$scope.page.limitTime.getMilliseconds());

 		function isEditable(varStr) {
 			if(varStr === undefined || varStr === null)
 				return true;

 			varStr = "" + varStr;

 			if(varStr === "")
 				return true;

 			return false; 			
 		}

 		Reports.save({
 			"data": {
 				"type": "reports",
 				"attributes": {
 					"limit_date": limitDate,
 					"finished": false,
 					"dynamic_attributes": {
 						"109": {
 							"value": $scope.page.selectedCategories.serial_number,
 							"id": $scope.page.selectedCategories.id,
 							"editable": isEditable($scope.page.selectedCategories.serial_number)
 						},
 						"120":{
 							"value": $scope.page.selectedLocations.name_location,
 							"id": $scope.page.selectedLocations.id,
 							"editable": isEditable($scope.page.selectedLocations.name_location)
 						},
 						"104":{
 							"value": $scope.page.caja,
 							"editable": isEditable($scope.page.caja)
 						},
 						"105":{
 							"value": $scope.page.contador,
 							"editable": isEditable($scope.page.contador)
 						},
 						"111":{
 							"value": $scope.page.requerimiento,
 							"editable": isEditable($scope.page.requerimiento)
 						},
 						"103":{
 							"value": $scope.page.sillon,
 							"editable": isEditable($scope.page.sillon)
 						}
 					},
 					"state_id": 28
 				},
 				"relationships": {
 					"assigned_user": {
 						"data": {
 							"type": "users",
 							"id": $scope.page.selectedUser.id
 						}
 					}
 				}
 			}
 		}, function(success) {
				// $log.log(success);
				Utils.gotoAnyPartOfPage('pageHeader');
				$scope.page.alert.color = 'success';
				$scope.page.alert.title = 'Tarea programada';
				$scope.page.alert.subtitle = '';
				$scope.page.alert.show = true;
				$scope.page.usersLoaded = false;
				$scope.page.activityTypesLoaded = false;
				$scope.page.forms.form1.user.$pristine = true;
				$scope.page.forms.form1.client.$pristine = true;
				$scope.page.forms.form1.address.$pristine = true;
				$scope.getUsers();
				$scope.getCategories();
				$scope.getLocations();
				$scope.$apply();
			}, function(error) {
				if (error.status == 401) {
					Utils.refreshToken($scope.manualLoad);
				}
				$log.error(error);
				$scope.page.buttons.createProgramTask.disabled = false;
				$scope.page.alert.color = 'danger';
				Utils.gotoAnyPartOfPage('pageHeader');
				$scope.page.alert.title = 'Error al programar la tarea: ';
				$scope.page.alert.subtitle = error.data.errors[0].detail;
				$scope.page.alert.show = true;
				$scope.$apply();
			});

 	};

 	var openModalSummary = function(data) {
 		var modalInstance = $uibModal.open({
 			animation: true,
 			templateUrl: 'summary.html',
 			controller: 'SummaryLoadTasksModalInstance',
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

 	$scope.equipments = [];
 	$scope.getUsers();

 });