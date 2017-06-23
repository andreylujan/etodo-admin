'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:ManualLoadCtrl
 * @description
 * # ManualLoadCtrl
 * Controller of the adminProductsApp
 */
 angular.module('adminProductsApp')

 .controller('ManualLoadAntalisCtrl', function($scope, $log, $uibModal, $filter, Users, Equipments, Activities, Reports, Utils, Validators) {

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

		if (!Validators.validateRequiredField($scope.page.client)) {
			$scope.page.alert.color = 'danger';
			$scope.page.alert.title = 'Faltan campos por seleccionar';
			$scope.page.alert.subtitle = 'Debe escribir el nombre de un cliente';
			$scope.page.alert.show = true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

		if (!Validators.validateRequiredField($scope.page.address)) {
			$scope.page.alert.color = 'danger';
			$scope.page.alert.title = 'Faltan campos por seleccionar';
			$scope.page.alert.subtitle = 'Debe escribir una dirección';
			$scope.page.alert.show = true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

		$.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + $scope.page.address + "&key=AIzaSyDDtkvENcKmg67yXYMAfSu12kw2NrrZsYo")
		.done(function(response) {
			console.log(response);
			if(response.status === "OK") {
				var result = response.results[0];
				var location = result.geometry.location;
				var lat = location.lat;
				var lng = location.lng;
				var commune, region;
				for(var i = 0; i < result.address_components.length; ++i) {
					var component = result.address_components[i];
					if(component.types.length === 2 && component.types[0] === "locality" && component.types[1] === "political") {
						commune = component.long_name;
					} else if(component.types.length === 2 && component.types[0] === "administrative_area_level_1" && component.types[1] === "political") {
						region = component.long_name;
					}
				}
				var markedLocationAttributes = {
					latitude: lat,
					longitude: lng,
					address: $scope.page.address,
					region: region,
					commune: commune
				};
				console.log(markedLocationAttributes);
				var limitDate = new Date(
					$scope.page.limitDate.getFullYear(),
					$scope.page.limitDate.getMonth(),
					$scope.page.limitDate.getDate(),
					$scope.page.limitTime.getHours(),
					$scope.page.limitTime.getMinutes(),
					$scope.page.limitTime.getSeconds(),
					$scope.page.limitTime.getMilliseconds());

				Reports.save({
					"data": {
						"type": "reports",
						"attributes": {
							"limit_date": limitDate,
							"finished": false,
							"dynamic_attributes": {
								"130": {
									"text": $scope.page.client
								}
							},
							"marked_location_attributes" : markedLocationAttributes
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
				$scope.page.equipmentsLoaded = false;
				$scope.page.activityTypesLoaded = false;
				$scope.page.forms.form1.user.$pristine = true;
				$scope.page.forms.form1.client.$pristine = true;
				$scope.page.forms.form1.address.$pristine = true;
				$scope.getUsers();
				$scope.getEquipments();
				$scope.getActivityTypes();
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
			} else if(response.status == "ZERO_RESULTS") {
				$scope.page.alert.color = 'danger';
				$scope.page.alert.title = 'Dirección inválida';
				$scope.page.alert.subtitle = 'No se pudo encontrar la dirección indicada';
				$scope.page.alert.show = true;
				console.log('Gets here');
				Utils.gotoAnyPartOfPage('pageHeader');
				$scope.$apply();
				return;
			} else {
				$scope.page.alert.color = 'danger';
				$scope.page.alert.title = 'Error de dirección';
				$scope.page.alert.subtitle = 'No se pudo buscar la dirección, revisa tu conexión a Internet';
				$scope.page.alert.show = true;
				Utils.gotoAnyPartOfPage('pageHeader');
				$scope.$apply();
				return;
			}
			
		})
		.error(function() {
			$scope.page.alert.color = 'danger';
			$scope.page.alert.title = 'Dirección inválida';
			$scope.page.alert.subtitle = 'No se pudo encontrar la dirección indicada';
			$scope.page.alert.show = true;
			Utils.gotoAnyPartOfPage('pageHeader');
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