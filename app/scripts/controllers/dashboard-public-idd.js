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
		    	image: "http://fotos02.farodevigo.es/fotos/noticias/318x200/2011-09-25_IMG_2011-09-25_23:06:13_morra2.jpg",
		    	type: "before",
		    	usuario: "Andres Lagos",
		    	active: true
		  	}, {
		    	image: "http://www.que.es/archivos/201509/contenedorbasura-672xXx80.jpg",
		    	type: "after",
		    	usuario: "Andres Lagos",
		    	active: true
		  	}, {
		    	image: "http://www.multimedios.com/files/article_main/uploads/2017/02/20/58ab386a394a6.jpeg",
		    	type: "before",
		    	usuario: "Juan Perez",
		    	active: false
		  	}, {
		    	image: "https://pbs.twimg.com/media/Cwc25NoWgAESieW.jpg",
		    	type: "after",
		    	usuario: "Juan Perez",
		    	active: false
		  	}, {
		    	image: "https://s3-sa-east-1.amazonaws.com/assets.abc.com.py/2015/06/01/la-calle-del-maestro-esta-horrible-pozos-con-agua-y-serie-de-desniveles-ponen-en-jaque-a-muchos-conductores-_763_573_1237436.jpg",
		    	type: "before",
		    	usuario: "Mario de la Torre",
		    	active: false
		  	}, {
		    	image: "http://elgarinense.com.ar/wp-content/uploads/2016/11/calle.jpg",
		    	type: "after",
		    	usuario: "Mario de la Torre",
		    	active: false
		  	}
		];


		$scope.before = _.where($scope.images, {type: "before"});
		$scope.after = _.where($scope.images, {type: "after"});
		
		$scope.nombre = _.where($scope.before, {active: true})[0];
		
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