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

    if (window.location.href.includes('efinding')) 
    {
      $scope.main = {
        title: 'eFinding',
        url: Utils.getInStorage('adminPath'),
        settings: {
          navbarHeaderColor: 'scheme-default',
          sidebarColor: 'scheme-default',
          brandingColor: 'scheme-default',
          activeColor: 'default-scheme-color',
          branding: 'styles/{{main.settings.branding}}.css'
        }
      };
      return;

    }
    else if (window.location.href.includes('echeckit')) 
    {
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
    }
    else if (window.location.href.includes('localhost')) 
    {
      $scope.main = {
        title: 'localhost',
        url: Utils.getInStorage('adminPath'),
        settings: {
          navbarHeaderColor: '',
          sidebarColor: '',
          brandingColor: '',
          activeColor: '',
          branding: 'efinding'
        }
      };
      return;
    }

  });