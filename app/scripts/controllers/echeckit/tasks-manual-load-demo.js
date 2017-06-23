'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:ManualLoadCtrl
 * @description
 * # ManualLoadCtrl
 * Controller of the adminProductsApp
 */
 angular.module('adminProductsApp')

 .controller('ManualLoadDemoCtrl', function($scope, $log, $uibModal, $filter, Users, Equipments, Activities, Reports, Utils, Validators) {

 	$scope.page = {
 		forms: {},
 		title: 'Programar Tarea',
 		users: [],
 		selectedUser: null,
 		equipments: [],
 		selectedEquipment: null,
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

 	$scope.isBelltech = function() {
 		var organizationId = Utils.getInStorage('organization_id');
 		if(!organizationId) {
 			return true;
 		} else {
 			return organizationId == "1";
 		}
 	};

 	$scope.isAntalis = function() {
 		var organizationId = Utils.getInStorage('organization_id');
 		if(!organizationId) {
 			return false;
 		} else {
 			return organizationId == "4";
 		}
 	}

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

 	$scope.getEquipments = function(filter) {
		// if (filter.length < 4) {
		// 	return;
		// }

		// $log.log('palabra: ' + filter + ', largo: ' + filter.length);
		// $scope.page.equipments = [];

		// $scope.page.equipments.push({
		// 	id: 1,
		// 	serialNumber: 'asd1'
		// });

		// $scope.page.equipments.push({
		// 	id: 2,
		// 	serialNumber: 'asd2'
		// });

		// $scope.page.equipments.push({
		// 	id: 3,
		// 	serialNumber: 'asd3'
		// });

		Equipments.query({
			idEquipment: '',
			// fields[equipments]: filter
		}, function(success) {

			$scope.page.equipments.push({
				id: '',
				serial_number: 'Seleccione equipo',
				disabled: true
			});

			for (var i = 0; i < success.data.length; i++) {
				$scope.page.equipments.push({
					id: success.data[i].id,
					serial_number: $filter('capitalize')(success.data[i].attributes.serial_number, true),
					disabled: false
				});
			}
			$scope.page.selectedEquipment = $scope.page.equipments[0];
			$scope.page.equipmentsLoaded = true;

		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getEquipments);
			}
		});
	};

	$scope.getActivityTypes = function() {

		$scope.page.activityTypes = [];

		Activities.query({
			idActivity: ''
		}, function(success) {

			$scope.page.activityTypes.push({
				id: '',
				name: 'Seleccione tipo de actividad',
				disabled: true
			});

			for (var i = 0; i < success.data.length; i++) {
				$scope.page.activityTypes.push({
					id: success.data[i].id,
					name: success.data[i].attributes.name,
					disabled: false
				});
			}
			$scope.page.selectedActivityType = $scope.page.activityTypes[0];
			$scope.page.activityTypesLoaded = true;


		}, function(error) {
			$log.error(error);
			if (error.status == 401) {
				Utils.refreshToken($scope.getActivityTypes);
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

 		if (!Validators.validateRequiredField($scope.page.titulo)) {
 			$scope.page.alert.color = 'danger';
 			$scope.page.alert.title = 'Faltan campos por seleccionar';
 			$scope.page.alert.subtitle = 'Debe escribir el número de sillón';
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
 		$log.error(limitDate);

 		Reports.save({
 			"data": {
 				"type": "reports",
 				"attributes": {
 					"limit_date": limitDate,
 					"finished": false,
 					"dynamic_attributes": {
 						"19":{
 							"text": $scope.page.titulo
 						}
 					},
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
				$scope.page.usersLoaded = true;
				$scope.page.forms.form1.user.$pristine = true;
				$scope.getUsers();
				//$scope.$apply();
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

	$scope.cargarEquiposSerialNumber = function(asd) {


	};

	$scope.getUsers();
	$scope.getEquipments();
	$scope.getActivityTypes();

});