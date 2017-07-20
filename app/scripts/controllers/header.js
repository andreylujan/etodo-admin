'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:NavCtrl
 * @description
 * # NavCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')
.controller('HeaderCtrl', function($scope, $log, $state, $auth, Utils) {

	$scope.page = {
		title: Utils.getInStorage('organization_name'),
		user: {
			fullName: Utils.getInStorage('fullName'),
			image: Utils.getInStorage('image')
		}
	};

	$scope.logout = function() {
		$auth.logout()
			.then(function() {
				Utils.clearAllStorage();
			});
	};
});