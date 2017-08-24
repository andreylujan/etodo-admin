'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:GenricDashboardCtrl
 * @description
 * # GenricDashboardCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')
	.controller('PublicIDDDashboardCtrl', function($scope, $auth, $log, $interval, Utils, NgTableParams, DashboardIDD, NgMap) {
		
		$auth.setToken('5e14db9e991dd77358fa8d14736273aff5395b8634da12e1c340b7919d6c56d7');

		$scope.page = {
	 		filters: {
	 			date: {
	 				value: new Date(),
	 				opened: false
	 			}
	 		}
	 	};

	 	$scope.map = 
	 	{ 
			center: 
			{ 
				latitude: -33.3769732, 
				longitude: -56.5264399 
			}, 
			zoom: 15 
	 	};

	 	$scope.myInterval = 2000;
  		$scope.noWrapSlides = false;
  		$scope.active = 0;

	 	$scope.getDashboardInfo = function() {
	 		DashboardIDD.query({
	 			'type': 'public'
	 		}, function(success) {
			    if (success.data) {
			    	$scope.images = success.data.attributes.images;

			    	$scope.before = _.where($scope.images, {type: "before"});
					$scope.after = _.where($scope.images, {type: "after"});

					$scope.before[0].active = true;

					$scope.nombre = _.where($scope.before, {active: true})[0];

					$scope.recibidos = success.data.attributes.num_received;
		    		$scope.resueltos = success.data.attributes.num_resolved;

		    		$scope.report_locations = success.data.attributes.report_locations;

		    		// INICIO MAPA
					$scope.Mrecibidos = _.where(success.data.attributes.report_locations, {type: "recibido"})
					$scope.Mresueltos = _.where(success.data.attributes.report_locations, {type: "resuelto"})
			    	// FIN MAPA
			   	}
			}, function(error) {
				$log.error(error);
				if (error.status === 401) {
					Utils.refreshToken($scope.getDashboardInfo);


				}
			});
		};

		$scope.getDashboardInfo();

	 	$scope.openDatePicker = function($event) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.page.filters.date.opened = !$scope.page.filters.date.opened;
		};

		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};

		var myInterval = $interval(function()
		{
			if (_.last($scope.before) == $scope.nombre) 
			{
				_.last($scope.before).active = false;
				_.first($scope.before).active = true;

			} 
			else 
			{
				for (var i = 0; i < $scope.before.length; i++) 
				{
					if ($scope.before[i].active == true) 
					{
						$scope.before[i].active = false;
						$scope.before[i+1].active = true;
						break;
					}
				}
			}

			$scope.nombre = _.where($scope.before, {active: true})[0];

		}
		, 5000)

})
	
	.directive('before', ['$window', '$interval', 'dateFilter',
      function($window, $interval, dateFilter) {
        return function(scope, element, attrs) {
          	function updateTime() {
            	attrs.$set('src',scope.before[i].image);
            	i ++
            	if(i == scope.before.length)
            	{
              		i = 0
            	}
          	}

          	angular.element($window).bind('load', function() {
		         updateTime();
		    });
          
          	var i = 0;
          	var stopTime = $interval(updateTime, 5000);

          	element.on('$destroy', function() {
            	$interval.cancel(stopTime);
         	});
        }
    }])
    .directive('after', ['$window', '$interval', 'dateFilter',
      function($window, $interval, dateFilter) {
        return function(scope, element, attrs) {
          	function updateTime() {
            	attrs.$set('src',scope.after[i].image);
            	i ++
            	if(i == scope.after.length)
            	{
              		i = 0
            	}
          	}

          	angular.element($window).bind('load', function() {
		         updateTime();
		    });
          
          	var i = 0;
          	var stopTime = $interval(updateTime, 5000);

          	element.on('$destroy', function() {
            	$interval.cancel(stopTime);
         	});
        }
    }]);