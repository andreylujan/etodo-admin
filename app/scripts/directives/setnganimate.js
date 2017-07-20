'use strict';

/**
 * @ngdoc directive
 * @name adminProductsApp.directive:setNgAnimate
 * @description
 * # setNgAnimate
 */
angular.module('adminProductsApp')
  .directive('setNgAnimate', ['$animate', function ($animate) {
    return {
      link: function ($scope, $element, $attrs) {
        $scope.$watch( function() {
          return $scope.$eval($attrs.setNgAnimate, $scope);
        }, function(valnew){
          console.log('Directive animation Enabled: ' + valnew);
          $animate.enabled(!!valnew, $element);
        });
      }
    };
  }]);
