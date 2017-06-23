'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:MassiveLoadCtrl
 * @description
 * # MassiveLoadCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')

.controller('MassiveLoadCtrl', function($scope, $log, $uibModal, $location, Csv, Utils) {

	$scope.page = {
		forms: {},
		title: 'Programar tareas por carga masiva',
		csvFile: null,
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

	$scope.massiveLoad = function() {

		$scope.page.buttons.createProgramTask.disabled = true;

		var form = [{
			field: 'type',
			value: 'reports'
		}, {
			field: 'csv',
			value: $scope.page.csvFile
		}];

		var csvFile = $scope.page.csvFile;

		Csv.upload(form)
			.success(function(success) {
				$log.error('1');
				$log.error(success);
				openModalSummary(success);
				$scope.page.buttons.createProgramTask.disabled = false;
				$scope.page.csvFile = null;
			}).error(function(error) {
				$log.error('2');
				$log.error(error);
				$scope.page.buttons.createProgramTask.disabled = false;
				$scope.page.alert.color = 'danger';
				Utils.gotoAnyPartOfPage('pageHeader');
				$scope.page.alert.title = 'Error al cargar tareas: ';
				var errorsito = error.errors[0].detail;
				$scope.page.alert.subtitle = errorsito.replace(/,/g, ', ');
				$scope.page.alert.show = true;
				//openModalSummary(error);
			});
	};

	var openModalSummary = function(data) {
		var modalInstance = $uibModal.open({
			animation: true,
			// templateUrl: '../views/tmpl/modals/summaryLoadTasks.html', // en local
			templateUrl: 'http://50.16.161.152/generic/admin/views/tmpl/modals/summaryLoadTasks.html', //en server
			// templateUrl: 'http://50.16.161.152/generic-staging/admin/views/tmpl/modals/summaryLoadTasks.html', //en server

			
			controller: 'SummaryLoadTasksModalInstance',
			resolve: {
				data: function() {
					return data;
				}
			}
		});

		modalInstance.result.then(function() {}, function() {});
	};
});