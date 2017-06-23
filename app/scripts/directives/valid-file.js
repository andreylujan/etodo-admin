'use strict';

/**
 * @ngdoc directive
 * @name adminProductsApp.directive:activateButton
 * @description
 * # activateButton
 */
angular.module('adminProductsApp')
  .directive('validFile', function() {
    return {
      require: 'ngModel',
      link: function(scope, el, attrs, ngModel) {
        el.bind('change', function() {
          scope.$apply(function() {
            ngModel.$setViewValue(el.val());
            ngModel.$render();
          });
        });
      }
    };
  });