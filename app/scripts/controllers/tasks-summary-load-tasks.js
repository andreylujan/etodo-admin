'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:SummaryLoadTasksModalInstance
 * @description
 * # SummaryLoadTasksModalInstance
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')

.controller('SummaryLoadTasksModalInstance', function($scope, $log, $uibModalInstance, data, $sce) {

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