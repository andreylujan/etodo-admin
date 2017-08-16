'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:GenricDashboardCtrl
 * @description
 * # GenricDashboardCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')
	.controller('PublicIDDDashboardCtrl', function($scope, $log, $interval, Utils, NgTableParams, Dashboard, NgMap) {
		
		$scope.page = {
	 		filters: {
	 			date: {
	 				value: new Date(),
	 				opened: false
	 			}
	 		}
	 	};

	 	$scope.openDatePicker = function($event) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.page.filters.date.opened = !$scope.page.filters.date.opened;
		};

		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};


		//SLIDER
		$scope.myInterval = 2000;
  		$scope.noWrapSlides = false;
  		$scope.active = 0;
  		$scope.images = [{
		    	image: "https://sonar.es/system/attached_images/12194/medium/nina-kraviz-sonar-bcn-2017.jpg?1497721012",
		    	currentPoint: "0",
		    	endPoint: "1"
		  	}, {
		    	image: "https://laxelectronica.com/wp-content/uploads/2016/11/59a9f4f9fd5608775345da654978d894.jpg",
		    	currentPoint: "0",
		    	endPoint: "4"
		  	}, {
		    	image: "http://warp.la/wp-content/uploads/2017/06/totally_dublin_nina_kraviz_1-1.jpg",
		    	currentPoint: "0",
		    	endPoint: "4"
		  	}, {
		    	image: "https://media.npr.org/assets/img/2016/11/28/ninakravizcamilleblake_wide-7875d27fbf31a6310dcf6a3304a7789d07b322b6.jpeg?s=1400",
		    	currentPoint: "0",
		    	endPoint: "1"
		  	}
		];
	})
	
	.directive('myImages', ['$interval', 'dateFilter',
      function($interval, dateFilter) {
        return function(scope, element, attrs) {
          	function updateTime() {
            	attrs.$set('src',scope.images[i].image);
            	i ++
            	if(i == scope.images.length)
            	{
              		i = 0
            	}
          	}
          
          	var i = 0;
          	var stopTime = $interval(updateTime, 15000);

          	element.on('$destroy', function() {
            	$interval.cancel(stopTime);
         	});
        }
    }
	]);