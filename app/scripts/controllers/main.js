'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')
  .controller('MainCtrl', function($scope, Utils) {

    $scope.main = {
      title: 'eCheckit',
      url: Utils.getInStorage('adminPath'),
      settings: {
        navbarHeaderColor: 'scheme-default',
        sidebarColor: 'scheme-default',
        brandingColor: 'scheme-default',
        activeColor: 'default-scheme-color',
        branding: 'echeckit'
      }
    };
    return;

  });