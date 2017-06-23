'use strict';

/**
 * @ngdoc directive
 * @name adminProductsApp.directive:vectorMap
 * @description
 * # vectorMap
 */
angular.module('adminProductsApp')
  .directive('vectorMap', function () {
    return {
      restrict: 'AE',
      scope: {
        options: '='
      },
      link: function postLink(scope, element) {
        var options = scope.options;
        element.vectorMap(options);
      }
    };
  });
