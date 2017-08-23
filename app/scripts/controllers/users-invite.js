'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:UsersListCtrl
 * @description
 * # UsersListCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')

.controller('UsersInviteCtrl', function($scope, $log, $filter, $window, $uibModal, Users, Invitations, Csv, Utils, Roles) {

	$scope.page = {
		title: 'Invitar usuarios',
		formGroups: {
			invite: [{
				faIcon: 'plus',
				email: '',
				index: 0,
				roleId: null,
				showIcon: false,
				is_superuser: false,
			}]
		},
		csvFile: null,
		msg: {
			show: false,
			text: '',
			color: ''
		}
	};

	$scope.roles = [];
	$scope.responseInvitations = [];

	var getRoles = function(e) {
		$scope.roles = [];

		Roles.query({
			idOrganization: Utils.getInStorage('organization')
		}, function(success) {
			if (success.data) {
				for (var i = 0; i < success.data.length; i++) {
					$scope.roles.push({
						name: success.data[i].attributes.name,
						id: success.data[i].id,
						index: i
					});
				}
			} else {
				$log.log('error al obtener los roles');
			}

		}, function(error) {
			$log.log(error);
			if (error.status === 401) {
				Utils.refreshToken(getRoles);
			}
		});

	};

	getRoles();

	$scope.validateMailAndRol = function(index) {

		if ($scope.page.formGroups.invite[index].email) {
			$scope.page.formGroups.invite[index].showIcon = true;
		}
	};

	$scope.addFormGroup = function(index) {

		if (index === ($scope.page.formGroups.invite.length - 1)) {
			$scope.page.formGroups.invite.push({
				faIcon: 'plus',
				email: '',
				index: index + 1,
				roleId: null
			});

			// Cambia los iconos que tienen signo "+" por el icono "-" a todos MENOS el último
			for (var i = 0; i < $scope.page.formGroups.invite.length - 1; i++) {
				$scope.page.formGroups.invite[i].faIcon = 'minus';
			}

		} else {
			$scope.page.formGroups.invite.splice(index, 1);
		}

	};

	$scope.invite = function() {

		if ($scope.page.csvFile) {
			uploadCsvInvitation();
		} else {
			sendInvitations();
		}

	};

	var uploadCsvInvitation = function() {

		var form = [{
			field: 'type',
			value: 'invitations'
		}, {
			field: 'csv',
			value: $scope.page.csvFile
		}];

		var csvFile = $scope.page.csvFile;

		Csv.upload(form)
			.success(function(success) {
				$log.log(success);
				openModalSummary(success);
			}).error(function(error) {
				$log.error(error);
				$scope.page.msg.color = 'danger';
				$scope.page.msg.show = true;
				$scope.page.msg.text = 'Error '+ error.errors[0].status + ' - ' + error.errors[0].detail;
				//openModalSummary(error);
			});

	};

	var sendInvitations = function() {
		$scope.responseInvitations = [];
		$scope.page.msg.color = 'orange-ps';
		$scope.page.msg.show = true;
		$scope.page.msg.text = 'Se han enviado las invitaciones a:';
		/* jshint ignore:start */
		for (var i = 0; i < $scope.page.formGroups.invite.length; i++) {

			Invitations.save({
				"data": {
					"type": "invitations",
					"attributes": {
						"role_id": $scope.page.formGroups.invite[i].roleId,
						"email": $scope.page.formGroups.invite[i].email
					}
				}
			}, function(success) {
				$log.log(success);

				if (success.data) {
					$scope.responseInvitations.push({
						color: 'greensea',
						icon: 'check',
						email: success.data.attributes.email
					});
				} else {
					$scope.responseInvitations.push({
						color: 'danger',
						icon: 'times',
						// email: success.data.attributes.email
						email: success.errors[0].title
					});
				}

			}, function(error) {
				$log.error(error);

				$scope.responseInvitations.push({
					color: 'danger',
					icon: 'times',
					email: error.data.errors[0].detail
				});

			});
		}
		/* jshint ignore:end */

		clearFormGroups();
	};

	var clearFormGroups = function() {
		$scope.page.formGroups.invite = [];
		$scope.page.formGroups.invite.push({
			faIcon: 'plus',
			email: '',
			index: 0,
			roleId: null,
			showIcon: false
		});

	};

	var openModalSummary = function(data) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'summary.html',
			controller: 'SummaryModalInstance',
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

.controller('SummaryModalInstance', function($scope, $log, $uibModalInstance, data, $sce) {

	$scope.modal = {
		errors: [],
		successes: []
	};
	var i = 0,
		email = null;

	for (i = 0; i < data.data.length; i++) {

		if (data.data[i].meta.errors) {
			$scope.modal.errors.push({
				email: data.data[i].meta.row_data.email,
				rowNumber: data.data[i].meta.row_number,
				field: $sce.trustAsHtml(_.map(data.data[i].meta.errors, function(value, key) {
				    return '<strong>' + key + ":</strong> " + value.join(', ');
				}).join('<br />'))
			});
		} else {
			$scope.modal.successes.push({
				email: data.data[i].meta.row_data.email
			});
		}

	}

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};



});