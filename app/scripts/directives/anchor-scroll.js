'use strict';

/**
 * @ngdoc directive
 * @name adminProductsApp.directive:anchorScroll
 * @description
 * # anchorScroll
 */
angular.module('adminProductsApp')
  .directive('anchorScroll', ['$location', '$anchorScroll', function($location, $anchorScroll) {
    return {
      restrict: 'AC',
      link: function(scope, el, attr) {
        el.on('click', function(e) {
          $location.hash(attr.anchorScroll);
          $anchorScroll();
        });
      }
    };
  }]);
