 'use strict';

/**
 * @ngdoc overview
 * @name adminProductsApp
 * @description
 * # adminProductsApp
 *
 * Main module of the application.
 */
angular
	.module('adminProductsApp', [
		'ngAnimate',
		'ngCookies',
		'ngResource',
		'ngSanitize',
		'ngTouch',
		'picardy.fontawesome',
		'ui.bootstrap',
		'ui.router',
		'ui.utils',
		'angular-loading-bar',
		'angular-momentjs',
		'angularBootstrapNavTree',
		'ui.select',
		'datatables',
		'ngTable',
		'LocalStorageModule',
		'angular-underscore',
		'satellizer',
		'highcharts-ng',
		'angularjs-dropdown-multiselect',
		'daterangepicker',
		'ngMap'
	])

.run(['$rootScope', '$state', '$stateParams', 'Utils', '$log',
	function($rootScope, $state, $stateParams, Utils, $log) {
		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;

		$rootScope.$on('$stateChangeSuccess', function(event, toState) {

			event.targetScope.$watch('$viewContentLoaded', function() {

				angular.element('html, body, #content').animate({
					scrollTop: 0
				}, 200);

				setTimeout(function() {
					angular.element('#wrap').css('visibility', 'visible');

					if (!angular.element('.dropdown').hasClass('open')) {
						angular.element('.dropdown').find('>ul').slideUp();
					}
				}, 200);
			});
			$rootScope.containerClass = toState.containerClass;
		});

		$rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {

			var isLogin = toState.name === 'login' || toState.name === 'signup' || toState.name === 'forgotpass';

			if (isLogin) {
				return;
			}

			if (!Utils.getInStorage('logged')) {
				e.preventDefault(); // stop current execution
				$state.go('login'); // go to login
			}

		});
	}

])

.config(['uiSelectConfig',
	function(uiSelectConfig) {
		uiSelectConfig.theme = 'bootstrap';
	}
])

.config(['localStorageServiceProvider',
	function(localStorageServiceProvider) {
		localStorageServiceProvider
			.setStorageType('localStorage');
	}
])

.config(['$authProvider',
	function($authProvider) {
		// Parametros de configuración
		$authProvider.loginUrl = 'http://50.16.161.152/productos/oauth/token'; 	//Produccion
		//$authProvider.loginUrl = 'http://50.16.161.152/efinding-staging/oauth/token'; 	//Desarrollo
		//$authProvider.loginUrl = 'http://192.168.100.28:3000//oauth/token'; 					//Local
		$authProvider.tokenName = 'access_token';
	}
])

.config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		//INICIO ESTADOS GENERICOS
		$urlRouterProvider.otherwise('/login');
		$stateProvider

			.state('login', {
			url: '/login',
			controller: 'LoginCtrl',
			templateUrl: 'views/tmpl/pages/login.html'
		})

		.state('signup', {
			url: '/signup?confirmation_token&id',
			controller: 'SignupCtrl',
			templateUrl: 'views/tmpl/pages/signup.html'
		})

		.state('forgotpass', {
			url: '/forgotpass',
			controller: 'ForgotPasswordCtrl',
			templateUrl: 'views/tmpl/pages/forgotpass.html'
		})

		.state('page404', {
			url: '/page404',
			templateUrl: 'views/tmpl/pages/page404.html'
		})
		

    	.state('echeckit', {
			abstract: true,
			url: '/echeckit',
			templateUrl: 'views/tmpl/app.html'
		})

		.state('iddPublic', {
			url: '/publicidd',
			controller: 'PublicIDDDashboardCtrl',
			templateUrl: 'views/tmpl/dashboard/publicidd.html'
		})

		//dashboard
		.state('echeckit.dashboard', {
				url: '/dashboard',
				template: '<div ui-view></div>'
			})
			.state('echeckit.dashboard.generic', {
				url: '/generic',
				templateUrl: 'views/tmpl/dashboard/generic.html',
				controller: 'GenericDashboardCtrl'
			})
			.state('echeckit.dashboard.idd', {
				url: '/idd',
				templateUrl: 'views/tmpl/dashboard/idd.html',
				controller: 'IDDDashboardCtrl'
			})
			.state('echeckit.dashboard.inverfact', {
				url: '/inverfact',
				templateUrl: 'views/tmpl/dashboard/inverfact.html',
				controller: 'InverfactDashboardCtrl'
			})
			.state('echeckit.dashboard.intralot', {
				url: '/intralot',
				templateUrl: 'views/tmpl/dashboard/intralot.html',
				controller: 'IntralotDashboardCtrl'
			})

		// Channels
		.state('echeckit.channel', {
			url: '/channel',
			template: '<div ui-view></div>'
		})

		//Users
		.state('echeckit.users', {
				url: '/usuarios',
				template: '<div ui-view></div>'
			})
			.state('echeckit.users.list', {
				url: '/lista',
				templateUrl: 'views/tmpl/users/list.html',
				controller: 'UsersListCtrl'
			})
			.state('echeckit.users.invite', {
				url: '/invitar',
				templateUrl: 'views/tmpl/users/invite.html',
				controller: 'UsersInviteCtrl'
			})

		//Reports
		.state('echeckit.reports', {
				url: '/reportes',
				template: '<div ui-view></div>'
			})
			.state('echeckit.reports.list', {
				url: '/lista',
				templateUrl: 'views/tmpl/reports/list.html',
				controller: 'ReportsListEcheckitCtrl'
			})
			.state('echeckit.reports.dom', {
				url: '/dom',
				templateUrl: 'views/tmpl/reports/dom.html',
				controller: 'ReportsListDomEcheckitCtrl'
			})
			.state('echeckit.reports.mydom', {
				url: '/user-dom',
				templateUrl: 'views/tmpl/reports/dom.html',
				controller: 'ReportsListMyDomEcheckitCtrl'
			})
			.state('echeckit.reports.idd', {
				url: '/idd',
				templateUrl: 'views/tmpl/reports/idd.html',
				controller: 'ReportsListIddCtrl'
			})
			.state('echeckit.reports.inverfact', {
				url: '/inverfact',
				templateUrl: 'views/tmpl/reports/list.html',
				controller: 'ReportsListInverfactCtrl'
			})
			.state('echeckit.reports.intralot', {
				url: '/intralot',
				templateUrl: 'views/tmpl/reports/intralot.html',
				controller: 'ReportsListIntralotCtrl'
			})

		//Tasks
		.state('echeckit.tasks', {
				url: '/tareas',
				template: '<div ui-view></div>'
			})
			.state('echeckit.tasks.manual-load', {
				url: '/carga-manual',
				templateUrl: 'views/tmpl/tasks/manual-load.html',
				controller: 'ManualLoadCtrl'
			})
			.state('echeckit.tasks.manual-load-antalis', {
				url: '/carga-manual-antalis',
				templateUrl: 'views/tmpl/tasks/manual-load-antalis.html',
				controller: 'ManualLoadAntalisCtrl'
			})
			.state('echeckit.tasks.manual-load-pausa', {
				url: '/carga-manual-pausa',
				templateUrl: 'views/tmpl/tasks/manual-load-pausa.html',
				controller: 'ManualLoadPausaCtrl'
			})
			.state('echeckit.tasks.manual-load-pausap', {
				url: '/carga-manual-pausaperu',
				templateUrl: 'views/tmpl/tasks/manual-load-pausap.html',
				controller: 'ManualLoadPausaPeruCtrl'
			})
			.state('echeckit.tasks.manual-load-demo', {
				url: '/carga-manual-demo',
				templateUrl: 'views/tmpl/tasks/manual-load-demo.html',
				controller: 'ManualLoadDemoCtrl'
			})
			.state('echeckit.tasks.massive-load', {
				url: '/carga-masiva',
				templateUrl: 'views/tmpl/tasks/massive-load.html',
				controller: 'MassiveLoadCtrl'
			})
			.state('echeckit.tasks.list', {
				url: '/listaTareas',
				templateUrl: 'views/tmpl/tasks/list-dom.html',
				controller: 'TareasCtrl'
			})

		//Masters
		.state('echeckit.masters', {
				url: '/maestros',
				template: '<div ui-view></div>'
			})
			.state('echeckit.masters.equipments', {
				url: '/equipos',
				templateUrl: 'views/tmpl/masters/equipments.html',
				controller: 'MastersEquipmentsCtrl'
			})
			.state('echeckit.masters.activities', {
				url: '/actividades',
				templateUrl: 'views/tmpl/masters/activities.html',
				controller: 'MastersActivitiesCtrl'
			})
			.state('echeckit.masters.checklists', {
				url: '/checklits',
				templateUrl: 'views/tmpl/masters/checklists.html',
				controller: 'MastersChecklistsCtrl'
			})
			.state('echeckit.masters.history-massive-loads', {
				url: '/history-massive-loads',
				templateUrl: 'views/tmpl/masters/history-massive-loads.html',
				controller: 'HistoryMassiveLoadsCtrl'
			})
			.state('echeckit.masters.locations', {
				url: '/locations',
				templateUrl: 'views/tmpl/masters/locations.html',
				controller: 'LocationsCtrl'
			})
			.state('echeckit.masters.categories', {
				url: '/categories',
				templateUrl: 'views/tmpl/masters/categories.html',
				controller: 'CategoriesCtrl'
			})

		//Masters
		.state('echeckit.maestros', {
				url: '/maestros',
				template: '<div ui-view></div>'
			})
			.state('echeckit.maestros.tabla', {
				url: '/generic?type',
				templateUrl: 'views/tmpl/masters/generic.html',
				controller: 'MastersEcheckitGenericCtrl'
			})

		.state('echeckit.change-password', {
			url: '/change-password',
			templateUrl: 'views/tmpl/pages/change-password.html',
			controller: 'ChangePasswordCtrl'
		});
	}
]);