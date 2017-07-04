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
		//$authProvider.loginUrl = 'http://50.16.161.152/efinding/oauth/token'; 	//Produccion
		$authProvider.loginUrl = 'http://50.16.161.152/efinding-staging/oauth/token'; 	//Desarrollo
		//$authProvider.loginUrl = 'http://localhost:3000/oauth/token'; 					//Local
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
		

		.state('efinding', {
			abstract: true,
			url: '/efinding',
			templateUrl: 'views/tmpl/app.html'
		})

		//FIN ESTADOS GENERICOS

		//INICIO EFINDING

		//dashboard
		.state('efinding.dashboard', {
				url: '/dashboard',
				template: '<div ui-view></div>'
			})
			.state('efinding.dashboard.generic', {
				url: '/generic',
				templateUrl: 'views/tmpl/efinding/dashboard/generic.html',
				controller: 'GenericDashboardCtrl'
			})
			.state('efinding.dashboard.manflas', {
				url: '/manflas',
				templateUrl: 'views/tmpl/efinding/dashboard/dashboard-manflas.html',
				controller: 'ManflasDashboardCtrl'
			})

		//Users
		.state('efinding.users', {
				url: '/usuarios',
				template: '<div ui-view></div>'
			})
			.state('efinding.users.list', {
				url: '/lista',
				templateUrl: 'views/tmpl/efinding/users/list.html',
				controller: 'UsersListCtrl'
			})
			.state('efinding.users.invite', {
				url: '/invitar',
				templateUrl: 'views/tmpl/efinding/users/invite.html',
				controller: 'UsersInviteCtrl'
			})
		//Reports
		.state('efinding.inspecciones', {
				url: '/inspecciones',
				template: '<div ui-view></div>'
			})
			.state('efinding.inspecciones.list', {
				url: '/lista',
				templateUrl: 'views/tmpl/efinding/reports/list.html',
				controller: 'ReportsListCtrl'
			})

		//Hallazgos MANFLAS
		.state('efinding.hallazgos', {
				url: '/hallazgos',
				template: '<div ui-view></div>'
			})
			.state('efinding.hallazgos.lista', {
				url: '/lista',
				templateUrl: 'views/tmpl/efinding/reports/manflas.html',
				controller: 'HallazgosManflas'
			})
			.state('efinding.hallazgos.tareas', {
				url: '/listaTareas',
				templateUrl: 'views/tmpl/efinding/reports/manflas.html',
				controller: 'TareasManflas'
			})
			.state('efinding.hallazgos.propios', {
				url: '/propios',
				templateUrl: 'views/tmpl/efinding/reports/manflas.html',
				controller: 'MisHallazgosManflas'
			})

		//Checklist
		.state('efinding.checklist', {
				url: '/checklist',
				template: '<div ui-view></div>'
			})
			.state('efinding.checklist.list', {
				url: '/lista',
				templateUrl: 'views/tmpl/efinding/masters/checklist.html',
				controller: 'ChecklistCtrl'
			})

		//Masters
		.state('efinding.maestros', {
				url: '/maestros',
				template: '<div ui-view></div>'
			})
			.state('efinding.maestros.tabla', {
				url: '/generic?type',
				templateUrl: 'views/tmpl/efinding/masters/generic.html',
				controller: 'MastersGenericCtrl'
			})

		//Obras
		.state('efinding.obras', {
				url: '/obras',
				template: '<div ui-view></div>'
			})
			.state('efinding.obras.tabla', {
				url: '/construction',
				templateUrl: 'views/tmpl/efinding/masters/construction.html',
				controller: 'MastersConstructionCtrl'
			})
			.state('efinding.obras.personal', {
				url: '/personnel',
				templateUrl: 'views/tmpl/efinding/masters/personnel.html',
				controller: 'MastersPersonnelCtrl'
			})
			.state('efinding.obras.checklist', {
				url: '/checklist',
				templateUrl: 'views/tmpl/efinding/masters/master-checklist.html',
				controller: 'MasterChecklistCtrl'
			})
			.state('efinding.obras.new-checklist', {
				url: '/new-checklist?idChecklist',
				controller: 'NewChecklistCtrl',
				templateUrl: 'views/tmpl/efinding/masters/new-checklist.html'
			})
			.state('efinding.obras.cargas', {
				url: '/history-massive-loads',
				templateUrl: 'views/tmpl/efinding/masters/history-massive-loads.html',
				controller: 'HistoryMassiveLoadsCtrl'
			})
    
		//Areas
		.state('efinding.areas', {
				url: '/areas',
				template: '<div ui-view></div>'
			})
			.state('efinding.areas.lista', {
				url: '/lista?type=23',
				templateUrl: 'views/tmpl/efinding/masters/areas-manflas.html',
				controller: 'MasterAreasManflasCtrl'
			})

		//Roles
		.state('efinding.roles', {
				url: '/roles',
				template: '<div ui-view></div>'
			})
			.state('efinding.roles.lista', {
				url: '/lista',
				templateUrl: 'views/tmpl/efinding/masters/roles-list.html',
				controller: 'MasterRolesList'
			})
			.state('efinding.roles.editar-rol', {
				url: '/editar?idRol',
				templateUrl: 'views/tmpl/efinding/masters/roles-edit.html',
				controller: 'MasterRolesEdit'
			})
		//FIN EFINDING
    	
    	//INICIO ECHECKIT
    	.state('echeckit', {
			abstract: true,
			url: '/echeckit',
			templateUrl: 'views/tmpl/app.html'
		})

		//dashboard
		.state('echeckit.dashboard', {
				url: '/dashboard',
				template: '<div ui-view></div>'
			})
			.state('echeckit.dashboard.generic', {
				url: '/generic',
				templateUrl: 'views/tmpl/echeckit/dashboard/generic.html',
				controller: 'GenericDashboardCtrl'
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
				templateUrl: 'views/tmpl/echeckit/users/list.html',
				controller: 'UsersListCtrl'
			})
			.state('echeckit.users.invite', {
				url: '/invitar',
				templateUrl: 'views/tmpl/echeckit/users/invite.html',
				controller: 'UsersInviteCtrl'
			})

		//Reports
		.state('echeckit.reports', {
				url: '/reportes',
				template: '<div ui-view></div>'
			})
			.state('echeckit.reports.list', {
				url: '/lista',
				templateUrl: 'views/tmpl/echeckit/reports/list.html',
				controller: 'ReportsListEcheckitCtrl'
			})
			.state('echeckit.reports.dom', {
				url: '/dom',
				templateUrl: 'views/tmpl/echeckit/reports/dom.html',
				controller: 'ReportsListDomEcheckitCtrl'
			})
			.state('echeckit.reports.mydom', {
				url: '/user-dom',
				templateUrl: 'views/tmpl/echeckit/reports/dom.html',
				controller: 'ReportsListMyDomEcheckitCtrl'
			})

		//Tasks
		.state('echeckit.tasks', {
				url: '/tareas',
				template: '<div ui-view></div>'
			})
			.state('echeckit.tasks.manual-load', {
				url: '/carga-manual',
				templateUrl: 'views/tmpl/echeckit/tasks/manual-load.html',
				controller: 'ManualLoadCtrl'
			})
			.state('echeckit.tasks.manual-load-antalis', {
				url: '/carga-manual-antalis',
				templateUrl: 'views/tmpl/echeckit/tasks/manual-load-antalis.html',
				controller: 'ManualLoadAntalisCtrl'
			})
			.state('echeckit.tasks.manual-load-pausa', {
				url: '/carga-manual-pausa',
				templateUrl: 'views/tmpl/echeckit/tasks/manual-load-pausa.html',
				controller: 'ManualLoadPausaCtrl'
			})
			.state('echeckit.tasks.manual-load-demo', {
				url: '/carga-manual-demo',
				templateUrl: 'views/tmpl/echeckit/tasks/manual-load-demo.html',
				controller: 'ManualLoadDemoCtrl'
			})
			.state('echeckit.tasks.massive-load', {
				url: '/carga-masiva',
				templateUrl: 'views/tmpl/echeckit/tasks/massive-load.html',
				controller: 'MassiveLoadCtrl'
			})
			.state('echeckit.tasks.list', {
				url: '/listaTareas',
				templateUrl: 'views/tmpl/echeckit/tasks/list-dom.html',
				controller: 'TareasCtrl'
			})

		//Masters
		.state('echeckit.masters', {
				url: '/maestros',
				template: '<div ui-view></div>'
			})
			.state('echeckit.masters.equipments', {
				url: '/equipos',
				templateUrl: 'views/tmpl/echeckit/masters/equipments.html',
				controller: 'MastersEquipmentsCtrl'
			})
			.state('echeckit.masters.activities', {
				url: '/actividades',
				templateUrl: 'views/tmpl/echeckit/masters/activities.html',
				controller: 'MastersActivitiesCtrl'
			})
			.state('echeckit.masters.checklists', {
				url: '/checklits',
				templateUrl: 'views/tmpl/echeckit/masters/checklists.html',
				controller: 'MastersChecklistsCtrl'
			})
			.state('echeckit.masters.history-massive-loads', {
				url: '/history-massive-loads',
				templateUrl: 'views/tmpl/echeckit/masters/history-massive-loads.html',
				controller: 'HistoryMassiveLoadsCtrl'
			})
			.state('echeckit.masters.locations', {
				url: '/locations',
				templateUrl: 'views/tmpl/echeckit/masters/locations.html',
				controller: 'LocationsCtrl'
			})
			.state('echeckit.masters.categories', {
				url: '/categories',
				templateUrl: 'views/tmpl/echeckit/masters/categories.html',
				controller: 'CategoriesCtrl'
			})

		//Masters
		.state('echeckit.maestros', {
				url: '/maestros',
				template: '<div ui-view></div>'
			})
			.state('echeckit.maestros.tabla', {
				url: '/generic?type',
				templateUrl: 'views/tmpl/echeckit/masters/generic.html',
				controller: 'MastersEcheckitGenericCtrl'
			})
    	//FIN ECHECKIT



		//INICIO CHANGE PASS
		.state('efinding.change-password', {
			url: '/change-password',
			templateUrl: 'views/tmpl/pages/change-password.html',
			controller: 'ChangePasswordCtrl'
		});
		//FIN CHANGE PASS
	}
]);