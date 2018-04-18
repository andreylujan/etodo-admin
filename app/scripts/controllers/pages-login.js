'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:PagesLoginCtrl
 * @description
 * # PagesLoginCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')

.controller('LoginCtrl', function($scope, MenuSections, TableColumns, $state, $q, $log, $auth, Login, Users, Utils) {

	$scope.page = {
		user: {
			username: '',
			password: ''
		}
	};

	$scope.elements = {
		msg: {
			show: '',
			text: ''
		}
	};

	var menu = [],
		i = 0,
		j = 0,
		k = 0;

	var i = 0;

	$scope.login = function() {

		$auth.login({
				username: $scope.page.user.username,
				password: $scope.page.user.password,
				grant_type: "password"
			})
			.then(function(success) {
				Utils.setInStorage('logged', true);
				Utils.setInStorage('refresh_t', success.data.data.attributes.refresh_token);
				Utils.setInStorage('role_id', success.data.data.relationships.role.data.id);
				Utils.setInStorage('idUser', success.data.data.relationships.user.data.id);

				$auth.setToken(success.data.data.attributes.access_token);

				if ($auth.getToken() !== null) 
				{
					getUserData(success.data.data.relationships.user.data.id)
						.then(function(data) {
							Utils.setInStorage('fullName', data.data.fullName);
							Utils.setInStorage('image', data.data.image);

							getMenu();
							getColumns();
						})
						.catch(function(error) {
							$log.error(error);
							if (!error.success) {

								if (error.detail.status === 404) {
									$scope.elements.msg.text = 'Error al cargar datos de usuario, vuelva a logear';
									$scope.elements.msg.show = true;
								} 
								else if (error.detail.status === 401)
								{
									$scope.elements.msg.text = 'Error al cargar datos de usuario, vuelva a logear';
									$scope.elements.msg.show = true;
								}
								else if (error.detail === 'DOM')
								{
									$scope.elements.msg.text = 'El usuario ingresado no esta autorizado para entrar al administrador';
									$scope.elements.msg.show = true;
								}
								else {
									$scope.elements.msg.text = error.detail.data.errors[0].detail;
									$scope.elements.msg.show = true;
								}
							}
						});
				}
				else
				{
					$log.log('null');
					$state.go('login');
				}
			})
			.catch(function(error) {
				if (error.status === 401) 
				{
					$scope.elements.msg.text = 'Usuario y/o contraseña invalida. Intente nuevamente';
					$scope.elements.msg.show = true;
				}
			});

	};

	

	var getUserData = function(idUser) {

		var defered = $q.defer();
		var promise = defered.promise;
		var user = {};

		const loginDom = [
			'jdominguez@dom.cl',
			'rosario.dominguez@dom.cl',
			'mariant.davila@dom.cl',
			'dom@bildchile.com',
			'lagos.jara.a+dom@gmail.com',
			'laura.guanco+dom@gmail.com',
			'pruebas.bild+dom@gmail.com'
		]

		Users.query({
			idUser: idUser,
			include: 'role.organization'
		}, function(success) {
			$log.log(success);

			var organization = 0;
			user.fullName = success.data.attributes.full_name;
			user.image = success.data.attributes.image;
			user.type = success.data.type;

			for (var i = 0; i < success.included.length; i++) {
				if (success.included[i].type === 'organizations') 
				{
					organization = success.included[i].id;
					Utils.setInStorage('organization', success.included[i].id);
					Utils.setInStorage('adminPath', success.included[i].attributes.default_admin_path);
					Utils.setInStorage('organization_name', success.included[i].attributes.name);
				}
			}

			if (organization === '5') {
				if (_.find(loginDom, function(mail){ return mail === $scope.page.user.username; }) === undefined) {
					defered.reject({
						success: false,
						detail: 'DOM',
						data: ''
					});
				} 
			}

			defered.resolve({
				success: true,
				detail: 'OK',
				data: user
			});

		}, function(error) {
			defered.reject({
				success: false,
				detail: error,
				data: ''
			});
		});

		return promise;
	};

	var getMenu = function() {
		menu = [];

		MenuSections.query({
			include: 'menu_items'
		}, function(success) {
			if (success.data) {
				for (i = 0; i < success.data.length; i++) {
					menu.push({
						name: success.data[i].attributes.name,
						path: success.data[i].attributes.admin_path,
						items: success.data[i].relationships.menu_items.data,
						icon: success.data[i].attributes.icon
					});
				}

				for (i = 0; i < menu.length; i++) {
					for (j = 0; j < menu[i].items.length; j++) {
						for (k = 0; k < success.included.length; k++) {
							if (success.included[k].type === 'menu_items') {
								if (menu[i].items[j].id === success.included[k].id) {
									menu[i].items[j].name = success.included[k].attributes.name;
									menu[i].items[j].path = success.included[k].attributes.admin_path;
								}
							}
							if (success.included[k].id === menu[i].items[j].id) 
							{
								menu[i].items[j].included= success.included[k].attributes.url_include;
							}
						}
					}
				}
				Utils.setInStorage('menu', menu);
				$scope.page.menu = menu;
				$scope.page.menuLoaded = true;
			} else {
				$log.error(success);
			}
		}, function(error) {
			$log.error();
			if (error.status === 401) {
        		Utils.refreshToken(getMenu);
      		}
		});

	};

	var getColumns = function() {

		var defered = $q.defer();
		var promise = defered.promise;
		var columns = {};

		TableColumns.query({
			type: Utils.getInStorage('collection_name')
		}, function(success) {

			$log.log(success);

			columns.reportColumns = [];

			for (i = 0; i < success.data.length; i++) {
				/*
					title: Titulo de la columna
					field: Se utiliza para ir a ese dato en especifico
					field: para filtrar en servicio
				*/
				columns.reportColumns.push({
					title: success.data[i].attributes.column_name,
					field: success.data[i].attributes.field_name,
					field_a: success.data[i].attributes.column_name + '+' + success.data[i].attributes.field_name,
					name: i,
					visible: true,
					relationshipName: success.data[i].attributes.relationship_name,
					dataType: success.data[i].attributes.data_type,
					filter: {}
				});
				columns.reportColumns[columns.reportColumns.length - 1].filter[success.data[i].attributes.field_name] = success.data[i].attributes.field_name;
			}

			Utils.setInStorage('report_columns', columns.reportColumns);
			gotoAdminPath(Utils.getInStorage('adminPath'));
			

		}, function(error) {
			defered.reject({
				success: false,
				detail: error,
				data: ''
			});
		});

		return promise;
	};

	var gotoAdminPath = function(adminPath) {
		$state.go(adminPath);
	};

});