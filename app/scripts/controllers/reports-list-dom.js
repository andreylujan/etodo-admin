'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:ReportsListEcheckitCtrl
 * @description
 * # ReportsListEcheckitCtrl
 * Controller of the adminProductsApp
 */
angular.module('adminProductsApp')

.controller('ReportsListDomEcheckitCtrl', function($scope, $log, $filter, $window, $timeout, $uibModal, NgTableParams, Reports, Utils) {

	$scope.page = {
		title: 'Lista de reportes DOM',
		prevBtn: {
			disabled: true
		},
		nextBtn: {
			disabled: false
		}
	};

	$scope.role_id = Utils.getInStorage('role_id');

	$scope.pagination = {
		pages: {
			current: 1,
			total: 0,
			size: 25
		}
	};

	var data = [],
		activityTypes = [],
		users = [],
		reportsIncluded = [],
		reportes = [];

	$scope.sort_direction = 'asc';

	var receiverName = null,
		equipmentId = null,
		activityTypeId = null,
		assignedUserId = null,
		state = '',
		i = 0,
		j = 0,
		k = 0,
		filterTimeout = null,
		filterTimeoutDuration = 1000;

	$scope.columns = _.where(Utils.getInStorage('report_columns'), {visible: true});
	$scope.filter = {};
	var included = Utils.getInStorage('menu');

	for (i = 0; i < $scope.columns.length; i++) {

		if ($scope.columns[i].relationshipName) {
			if (!_.contains($scope.columns[i].relationshipName, '.')) {
				$scope.filter['filter[' + $scope.columns[i].relationshipName + ']' + '[' + $scope.columns[i].field + ']'] = {};
				$scope.filter['filter[' + $scope.columns[i].relationshipName + ']' + '[' + $scope.columns[i].field + ']'].filter = '';
				$scope.filter['filter[' + $scope.columns[i].relationshipName + ']' + '[' + $scope.columns[i].field + ']'].field = $scope.columns[i].field;
				$scope.filter['filter[' + $scope.columns[i].relationshipName + ']' + '[' + $scope.columns[i].field + ']'].field_a = $scope.columns[i].field_a;
				$scope.filter['filter[' + $scope.columns[i].relationshipName + ']' + '[' + $scope.columns[i].field + ']'].name = $scope.columns[i].field;
				$scope.filter['filter[' + $scope.columns[i].relationshipName + ']' + '[' + $scope.columns[i].field + ']'].columnName = $scope.columns[i].title;
				$scope.filter['filter[' + $scope.columns[i].relationshipName + ']' + '[' + $scope.columns[i].field + ']'].relationshipName = $scope.columns[i].relationshipName;
			}
			else
			{
				var aux = $scope.columns[i].relationshipName.split('.');
				var texto = 'filter';
				for (var j = 0; j <= aux.length -1; j++) {
					texto = texto + '[' + aux[j] + ']';
				}
				texto = texto + '[' + $scope.columns[i].field + ']';
				$scope.filter[texto] = {};
				$scope.filter[texto].filter = '';
				$scope.filter[texto].field = $scope.columns[i].field;
				$scope.filter[texto].field_a = $scope.columns[i].field_a;
				$scope.filter[texto].name = $scope.columns[i].field;
				$scope.filter[texto].columnName = $scope.columns[i].title;
				$scope.filter[texto].relationshipName = $scope.columns[i].relationshipName;
			}

		} else {
			var res = $scope.columns[i].field.split(".");
			var auxiliar = 'filter';

			for (j = 0; j < res.length; j++) {
				auxiliar = auxiliar+'['+ res[j]+']';
			}
			$scope.filter[auxiliar] = {};
			$scope.filter[auxiliar].filter = '';
			$scope.filter[auxiliar].field = $scope.columns[i].field;
			$scope.filter[auxiliar].field_a = $scope.columns[i].field_a;
			$scope.filter[auxiliar].name = $scope.columns[i].name;
			$scope.filter[auxiliar].columnName = $scope.columns[i].title;
			$scope.filter[auxiliar].relationshipName = $scope.columns[i].relationshipName;
		}
		$scope.filter.include = _.findWhere(_.findWhere(included, { name: 'Reportes'}).items, { path: 'echeckit.reports.dom'}).included;
		$scope.filter['page[number]'] = $scope.pagination.pages.current;
		$scope.filter['page[size]'] = $scope.pagination.pages.size;
	}

	$scope.columns2 = [];
	for (var attr in $scope.filter) {
		if (attr.indexOf('filter') !== -1) {

			$scope.columns2.push({
				visible: true,
				filter: attr,
				field: $scope.filter[attr].field,
				field_a: $scope.filter[attr].field_a,
				name: $scope.filter[attr].name,
				title: $scope.filter[attr].columnName,
				relationshipName: $scope.filter[attr].relationshipName
			});
		}
	}

	$scope.$watch('filter', function(newFilters) {
		if (filterTimeout) {
			$timeout.cancel(filterTimeout);
		}

		filterTimeout = $timeout(function() {
			$log.log(newFilters);

			$scope.getReports({
				success: true,
				detail: 'OK'
			}, $scope.pagination.pages.current, $scope.filter);

		}, filterTimeoutDuration);
	}, true);

	$scope.getReports = function(e, page, filters) {
		if (!e.success) {
			$log.error(e.detail);
			return;
		}
		data = [];
		var test = [];
		var filtersToSearch = {};
		for (var attr in filters) {
			if (attr.indexOf('filter') !== -1) {
				filtersToSearch[attr] = filters[attr].filter;
			} else {
				filtersToSearch[attr] = filters[attr];
			}
		}

		Reports.query(filtersToSearch, function(success) {
			reportsIncluded = success.included;
			$scope.pagination.pages.total = success.meta.page_count;

			//$log.error(success.data);

			for (i = 0; i < success.data.length; i++) {
				test.push({});

				for (var j = 0; j < $scope.columns2.length; j++) {
					test[test.length - 1]['pdf'] 			= success.data[i].attributes.pdf;
					test[test.length - 1]['pdfUploaded'] 	= success.data[i].attributes.pdf_uploaded;
					test[test.length - 1]['state'] 			= success.data[i].attributes.state_id;
					test[test.length - 1]['id'] 			= success.data[i].id;
					test[test.length - 1]['negocio'] 		= '';

					if (success.data[i].attributes.dynamic_attributes['60'] != undefined) 
					{
						test[test.length - 1]['negocio'] 		= success.data[i].attributes.dynamic_attributes['60'].value;
					}

					//if (success.data[i].dynamic_attributes) {}
					//no tiene relacion o es un objeto de consulta directa al dato
					if (success.data[i].attributes[$scope.columns2[j].field]) {
						test[test.length - 1][$scope.columns2[j].field_a] = success.data[i].attributes[$scope.columns2[j].field];
						test[test.length - 1][$scope.columns2[j].name] = success.data[i].attributes[$scope.columns2[j].field];
					} 
					else
					{
						var res = $scope.columns2[j].field.split(".");

						if (res.length === 1)
						{
							if ($scope.columns2[j].relationshipName !== null) 
							{
								var relationships = $scope.columns2[j].relationshipName.split('.');
								//tiene relacion a solo un objeto
								if (relationships.length == 1) 
								{
									for (k = 0; k < success.included.length; k++) {
										if (success.data[i].relationships[$scope.columns2[j].relationshipName].data != null) 
										{
											if (success.data[i].relationships[$scope.columns2[j].relationshipName].data.id === success.included[k].id &&
											success.data[i].relationships[$scope.columns2[j].relationshipName].data.type === success.included[k].type) 
											{
												if (success.included[k].attributes[$scope.columns2[j].field] != null) 
												{
													test[test.length - 1][$scope.columns2[j].field_a] = success.included[k].attributes[$scope.columns2[j].field];
												}
												else
												{
													test[test.length - 1][$scope.columns2[j].field_a] = '-';
												}
												break;
											}
										}
										else
										{
											test[test.length - 1][$scope.columns2[j].field_a] = '-';
											break;
										}
									}
								}
								else
								{
									//Es una relacion dentro de otra.
									//se debe encontrar el relationship y buscar dentro de el todos los relationships, 
									//despues de eso se debe volver a buscar en includes para encontrar a los que estan asociados.
									var relacion = success.data[i].relationships[relationships[0]].data;
									var relaciones = {};

									for (k = 0; k < success.included.length; k++) {
										if (relacion.id === success.included[k].id &&
											relacion.type === success.included[k].type) {
											
											relaciones = success.included[k].relationships;
											break;
										}
									}
									if (relationships.length === 2) 
									{
										//Al ser solo una relacion doble, se busca el padre y luego al hijo
										for (k = 0; k < success.included.length; k++) {
											if (relaciones[relationships[1]].data != null) 
											{
												if ( relaciones[relationships[1]].data.id === success.included[k].id &&
												 relaciones[relationships[1]].data.type === success.included[k].type) 
												{
													if (success.included[k].attributes[$scope.columns2[j].field] != null) 
													{
														test[test.length - 1][$scope.columns2[j].field_a] = success.included[k].attributes[$scope.columns2[j].field];
													}
													else
													{
														test[test.length - 1][$scope.columns2[j].field_a] = '-';
													}
													break;
												}
											}
											else
											{
												test[test.length - 1][$scope.columns2[j].field_a] = '-';
											}
										}
									}
									else
									{
										//Al ser una relacion multiple, se busca el padre y todas sus relaciones, luego al hijo y sus relaciones
										//y asi segun el numero de relaciones, luego de encontrar la ultima relacion, 
										//se busca en el include a quien corresponde como el ultimo hijo
										for (k = 1; k < relationships.length-1; k++) {
											for (var l = 0; l < success.included.length; l++) {
												if ( relaciones[relationships[k]].data.id === success.included[l].id &&
												 relaciones[relationships[k]].data.type === success.included[l].type) 
												{
													relaciones = success.included[l].relationships;
													break;
												}
											}
										}
										for (k = 0; k < success.included.length; k++) {
											if ( relaciones[relationships[relationships.length-1]].data.id === success.included[k].id &&
											 relaciones[relationships[relationships.length-1]].data.type === success.included[k].type) 
											{
												if (success.included[k].attributes[$scope.columns2[j].field] != null) 
												{
													test[test.length - 1][$scope.columns2[j].field_a] = success.included[k].attributes[$scope.columns2[j].field];
												}
												else
												{
													test[test.length - 1][$scope.columns2[j].field_a] = '-';
												}
												break;
											}
										}
									}
								}
							}
							else
							{
								test[test.length - 1][$scope.columns2[j].name] = '-';
							}

						}
						else if (res.length > 2) 
						{
							//apunta a un dynamic attribute
							var aux = res;
							var flag = success.data[i].attributes.dynamic_attributes;

							//valida que existe el objeto dentro de los dynamic_attributes
							if (flag.hasOwnProperty(aux[1])) 
							{
								//Valida que exista el objeto value
								if (flag[aux[1]].hasOwnProperty('value')) 
								{
									//$log.error('2')
									//$log.error(flag[aux[1]]);
									test[test.length - 1][$scope.columns2[j].field_a] = flag[aux[1]].value;
									test[test.length - 1][$scope.columns2[j].name] = flag[aux[1]].value;
								}
								else
								{
									test[test.length - 1][$scope.columns2[j].field_a] = '-';
									test[test.length - 1][$scope.columns2[j].name] = '-';
								}
							}
							else
							{
								test[test.length - 1][$scope.columns2[j].field_a] = '-';
								test[test.length - 1][$scope.columns2[j].name] = '-';
							}
						}
						else
						{
							test[test.length - 1][$scope.columns2[j].field_a] = '';
							test[test.length - 1][$scope.columns2[j].name] = '';
						}
					}
				}
			}
			reportes = test;

			$scope.tableParams = new NgTableParams({
				page: 1, // show first page
				count: reportes.length // count per page
			}, {
				counts: [],
				total: reportes.length, // length of test
				dataset: reportes
			});

		}, function(error) {
			$log.error(error);
			if (error.status) {
				Utils.refreshToken($scope.getReports);
			}
		});
	};

	$scope.downloadPdf = function(event) {
		var pdf = angular.element(event.target).data('pdf');
		if (pdf) {
			$window.open(pdf, '_blank');
		}
	};

	$scope.openModalDownloadPdfs = function() {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'modalDownloadPdfs.html',
			controller: 'DownloadPdfsModalInstance',
			resolve: {}
		});

		modalInstance.result.then(function() {}, function() {});
	};

	$scope.openModalDownloadPdfsByMonth = function() {
		var modalInstance = $uibModal.open({
			animation: true,
			backdrop: false,
			templateUrl: 'modalDownloadPdfsByMonth.html',
			controller: 'DownloadPdfsByMonthModalInstance',
			resolve: {}
		});

		modalInstance.result.then(function() {}, function() {});
	};

	$scope.sortBy = function(field_a) {
		if ($scope.sort_direction === 'asc') 
		{
			var aux = _.sortBy(inspecciones, function(insp){ return insp[field_a].toLowerCase();});
			$scope.sort_direction = 'desc';
		}
		else
		{
			var aux = _.sortBy(inspecciones, function(insp){ return insp[field_a].toLowerCase();}).reverse();
			$scope.sort_direction = 'asc';
		}
		$scope.tableParams = new NgTableParams({
				page: 1, // show first page
				count: 25 // count per page
			}, {
				counts: [],
				total: aux.length, // length of test
				dataset: aux
			});
	};

	$scope.incrementPage = function() {
		if ($scope.pagination.pages.current <= $scope.pagination.pages.total - 1) {
			$scope.pagination.pages.current++;
			$scope.filter['page[number]'] = $scope.pagination.pages.current;
			$scope.getReports({
				success: true
			}, $scope.pagination.pages.current, $scope.filter);
		}
	};

	$scope.decrementPage = function() {
		if ($scope.pagination.pages.current > 1) {
			$scope.pagination.pages.current--;
			$scope.filter['page[number]'] = $scope.pagination.pages.current;
			$scope.getReports({
				success: true
			}, $scope.pagination.pages.current, $scope.filter);
		}
	};

	$scope.AssignedUser = function(idReport) {

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'AssignedUser.html',
			controller: 'AssignedUserInstance',
			resolve: {
				idReport: function() {
					return idReport;
				}
			}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'close') {
				$scope.getReports({
					success: true,
					detail: 'OK'
				}, $scope.pagination.pages.current, $scope.filter);
			}
			$scope.tableParams.reload();
		}, function() {});
	};

	$scope.UpdateReport = function(idReport) {

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'UpdateReport.html',
			controller: 'UpdateReportInstance',
			resolve: {
				idReport: function() {
					return idReport;
				}
			}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'close') {
				$scope.getReports({
					success: true,
					detail: 'OK'
				}, $scope.pagination.pages.current, $scope.filter);
			}
			$scope.tableParams.reload();
		}, function() {});
	};


	$scope.ChangeStateReport = function(idReport, idState) {

		var template = '';
		var controller = '';

		if (idState == 8) 
		{
			template 	= 'AgregarPropuesta.html';
			controller 	= 'AgregarPropuestaInstance';
		}
		else if(idState == 9)
		{
			template 	= 'CierreDeNegocio.html';
			controller 	= 'CierreDeNegocioInstance';
		}

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: template,
			controller: controller,
			resolve: {
				idReport: function() {
					return idReport;
				},
				idState: function() {
					return idState;
				}
			}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'close') {
				$scope.getReports({
					success: true,
					detail: 'OK'
				}, $scope.pagination.pages.current, $scope.filter);
			}
			if (datos.action === 'cierreNegocio') 
			{
				$scope.ChangeStateReport(idReport, datos.data.attributes.state_id);
			}
			$scope.tableParams.reload();
		}, function() {});
	};

})

.controller('AgregarPropuestaInstance', function($scope, $log, $uibModalInstance, idReport, idState, Validators, Utils, Reports) {
	$scope.report = {
		id: idReport,
		montoOferta: 
			{ value: '' },
		version: 
			{ value: '' },
		comentario: 
			{ value: '' }
	},
	$scope.dynamic_attributes = [];

	$scope.elements = {
		buttons: {
			agregar: {
				text: 'Guardar propuesta.',
				border: 'btn-border',
				disabled: true
			},
			guardar: {
				text: 'Negocio cerrado.',
				border: 'btn-border',
				disabled: true
			}
		},
		title: '',
		alert: {
			show: false,
			title: '',
			text: '',
			color: '',
		}
	};

	$scope.agregarPropuesta = function() 
	{
		//METODO QUE AGREGA UNA PROPUESTA
		$scope.elements.alert.color = '';
 		$scope.elements.alert.title = '';
 		$scope.elements.alert.text 	= '';
 		$scope.elements.alert.show 	= false;

 		if (!Validators.validateRequiredField($scope.report.montoOferta.value)) {
 			$scope.elements.alert.color = 'danger';
 			$scope.elements.alert.title = 'Faltan campos por seleccionar';
 			$scope.elements.alert.text 	= 'Debe ingresar un monto de presupuesto';
 			$scope.elements.alert.show 	= true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}
 		if (!Validators.validateRequiredField($scope.report.version.value)) {
 			$scope.elements.alert.color = 'danger';
 			$scope.elements.alert.title = 'Faltan campos por seleccionar';
 			$scope.elements.alert.text 	= 'Debe ingresar la versión del presupuesto';
 			$scope.elements.alert.show 	= true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}
 		if (!Validators.validateRequiredField($scope.report.comentario.value)) {
 			$scope.elements.alert.color = 'danger';
 			$scope.elements.alert.title = 'Faltan campos por seleccionar';
 			$scope.elements.alert.text 	= 'Debe ingresar un comentario';
 			$scope.elements.alert.show 	= true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}


 		//LLAMA SERVICIO PARA AGREGAR PROPUESTA;
		$scope.agregarPropuestaWS(function (data) {
	        if(data.success) 
	        {
            	$scope.elements.alert.title = 'Se ingreso la propuesta exitosamente.';
				$scope.elements.alert.text 	= '';
				$scope.elements.alert.color = 'success';
				$scope.elements.alert.show 	= true;
        	}
        	else
        	{
        		$scope.elements.alert.title = data.error.title;
				$scope.elements.alert.text 	= data.error.detail;
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show 	= true;
        	}
	    });
	};

	$scope.finalizarPropuesta = function() 
	{
		//METODO QUE AGREGA UNA PROPUESTA Y PASA AL SIGUIENTE ESTADO
		$scope.elements.alert.color = '';
 		$scope.elements.alert.title = '';
 		$scope.elements.alert.text 	= '';
 		$scope.elements.alert.show 	= false;

 		if (!Validators.validateRequiredField($scope.report.montoOferta.value)) {
 			$scope.elements.alert.color = 'danger';
 			$scope.elements.alert.title = 'Faltan campos por seleccionar';
 			$scope.elements.alert.text 	= 'Debe ingresar un monto de oferta';
 			$scope.elements.alert.show 	= true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}
 		if (!Validators.validateRequiredField($scope.report.version.value)) {
 			$scope.elements.alert.color = 'danger';
 			$scope.elements.alert.title = 'Faltan campos por seleccionar';
 			$scope.elements.alert.text 	= 'Debe ingresar la versión del presupuesto';
 			$scope.elements.alert.show 	= true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}
 		if (!Validators.validateRequiredField($scope.report.comentario.value)) {
 			$scope.elements.alert.color = 'danger';
 			$scope.elements.alert.title = 'Faltan campos por seleccionar';
 			$scope.elements.alert.text 	= 'Debe ingresar un comentario';
 			$scope.elements.alert.show 	= true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}

 		//LLAMA SERVICIO DE AGREGAR PROPUESTA Y CAMBIAR DE ESTADO
		$scope.agregarPropuestaWS(function (data) {
	        if(data.success) 
	        {
            	$scope.stateChangeWS(function (datos) {
			        if(datos.success) 
			        {
		            	$uibModalInstance.close({
							action: 'cierreNegocio',
							success: datos.success,
							data: datos.data
						});
		        	}
		        	else
		        	{
		        		$scope.elements.alert.title = datos.error.title;
						$scope.elements.alert.text 	= datos.error.detail;
						$scope.elements.alert.color = 'danger';
						$scope.elements.alert.show 	= true;
		        	}
			    })
        	}
        	else
        	{
        		$scope.elements.alert.title = data.error.title;
				$scope.elements.alert.text 	= data.error.detail;
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show 	= true;
        	}
	    });
	};

	//LLAMA AL SERVICIO PARA AGREGAR UNA PROPUESTA
	$scope.getOneReport = function (callback) {

		Reports.query(
			{idReport: idReport }, 
			function(success) {
				callback({success: true, object: success.data});
			}, function(error) {
				callback({success: false, error: error.data.errors[0]});
			}
		);
	}

	//LLAMA AL SERVICIO PARA AGREGAR UNA PROPUESTA
	$scope.agregarPropuestaWS = function (callback) {
		
		if ($scope.dynamic_attributes['58'] == undefined) 
		{
			$scope.dynamic_attributes['58'] = [];
		}

		$scope.dynamic_attributes['58'].push({
			54: { value: $scope.report.montoOferta.value },
			56: { value: $scope.report.comentario.value },
			59: { value: $scope.report.version.value } 
		});

		var aux = {};
		aux = {  data: { type: 'reports', id: idReport, attributes: 
					{ 
						dynamic_attributes: $scope.dynamic_attributes,
						pdf: null,
    	   				pdf_uploaded: false
					}, 
					relationships: { } } , idReport: idReport 
		};

		Reports.update(aux, 
			function(success) {
				$scope.report.montoOferta.value = '';
				$scope.report.comentario.value 	= '';
				$scope.report.version.value 	= '';
				callback({success: true});
			}, function(error) {
				callback({success: false, error: error.data.errors[0]});
			}
		);
	}

	//LLAMA AL SERVICIO PARA CAMBIAR DE ESTADO
	$scope.stateChangeWS = function (callback) {
		var aux = {};
		aux = 
		{  
			data: 
			{ 
				type: 'reports', 
				id: idReport,
				relationships: 
				{
					state: 
					{
						data:
						{
							type: 'states',
							id: '9' 
						}
					} 
				} 
			} , idReport: idReport 
		};

		Reports.update(aux, 
			function(success) {
				callback({success: true, data: success.data});
			}, function(error) {
				callback({success: false, error: error.data.errors[0]});
			}
		);
	}


	//VA A BUSCAR EL DETALLE DE UN REPORTE
	$scope.getOneReport(function (data) {
	    $scope.dynamic_attributes = data.object.attributes.dynamic_attributes;
	});
})

.controller('UpdateReportInstance', function($scope, $log, $uibModalInstance, idReport, Validators, Utils, Reports, Collection) {
	
	$scope.report = {
		id: idReport,
		attributes: {}
	},
	$scope.tipoConstructora = {
		data: [],
		selected: null
	},
	$scope.constructora = {
		data: [],
		selected: null
	};

	$scope.elements = {
		buttons: {
			agregar: {
				text: 'Guardar reporte.',
				border: 'btn-border',
				disabled: true
			}
		},
		title: '',
		alert: {
			show: false,
			title: '',
			text: '',
			color: '',
		}
	};

	$scope.getCollectionTipo = function() {
		Collection.query({
			idCollection: 28
		}, function(success) {
			if (success.data) {
				for (var i = 0; i < success.included.length; i++) {
					$scope.tipoConstructora.data.push({
						name: success.included[i].attributes.name,
						id: success.included[i].id
					});
					if ($scope.report.attributes.dynamic_attributes['66'] != undefined) 
					{
						if ($scope.report.attributes.dynamic_attributes['66'].value == success.included[i].attributes.name) 
						{
							$scope.report.attributes.dynamic_attributes['66'].selected = {id: success.included[i].id, 
								name: success.included[i].attributes.name};
						}
					}
				}
			} else {
				$log.log(success);
			}

		}, function(error) {
			$log.error(error);
			if (error.status) {
				Utils.refreshToken($scope.getCollectionTipo);
			}

		});
	};

	$scope.getCollectionConstructora = function() {
		Collection.query({
			idCollection: 27
		}, function(success) {
			if (success.data) {
				for (var i = 0; i < success.included.length; i++) {
					$scope.constructora.data.push({
						name: success.included[i].attributes.name,
						id: success.included[i].id
					});

					if ($scope.report.attributes.dynamic_attributes['65'] != undefined) 
					{
						if ($scope.report.attributes.dynamic_attributes['65'].value == success.included[i].attributes.name) 
						{
							$scope.report.attributes.dynamic_attributes['65'].selected = {id: success.included[i].id, 
								name: success.included[i].attributes.name};
						}
					}
				}
			}

		}, function(error) {
			$log.error(error);
			if (error.status) {
				Utils.refreshToken($scope.getCollectionConstructora);
			}

		});
	};

	$scope.formatRut = function(rut) {

		if (Validators.validateRutCheckDigit(rut)) {
			$scope.report.attributes.dynamic_attributes['72'].value = Utils.formatRut(rut);
			$scope.elements.alert.color = '';
	 		$scope.elements.alert.title = '';
	 		$scope.elements.alert.text 	= '';
	 		$scope.elements.alert.show 	= false;
		} else {
			$scope.elements.alert.color = 'danger';
		 	$scope.elements.alert.title = 'Rut no válido';
		 	$scope.elements.alert.text 	= '';
		 	$scope.elements.alert.show = true;
		}

	};


	$scope.updateReport = function() 
	{
		$scope.elements.alert.color = '';
 		$scope.elements.alert.title = '';
 		$scope.elements.alert.text 	= '';
 		$scope.elements.alert.show 	= false;
 		$log.error($scope.report.attributes.dynamic_attributes['72'].value);

 		if (!Validators.validateRutCheckDigit($scope.report.attributes.dynamic_attributes['72'].value)) {
		 	$scope.elements.alert.color = 'danger';
		 	$scope.elements.alert.title = 'Rut no válido';
		 	$scope.elements.alert.text 	= 'Debe ingresar un rut con formato 12.345.678-9';
		 	$scope.elements.alert.show = true;
		 	Utils.gotoAnyPartOfPage('pageHeader');
		 	return;
		}
		if (!Validators.validateRequiredField($scope.report.attributes.dynamic_attributes['64'].value)) {
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.title = 'Faltan campos por completar';
			$scope.elements.alert.text 	= 'Nombre del proyecto';
			$scope.elements.alert.show 	= true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

		if (!Validators.validateRequiredField($scope.report.attributes.dynamic_attributes['66'].selected.name)) {
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.title = 'Faltan campos por completar';
			$scope.elements.alert.text 	= 'Tipo de constructora';
			$scope.elements.alert.show 	= true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

		if (!Validators.validateRequiredField($scope.report.attributes.dynamic_attributes['65'].selected.name)) {
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.title = 'Faltan campos por completar';
			$scope.elements.alert.text 	= 'Constructora';
			$scope.elements.alert.show 	= true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

		if (!Validators.validateRequiredField($scope.report.attributes.dynamic_attributes['68'].value)) {
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.title = 'Faltan campos por completar';
			$scope.elements.alert.text 	= 'Persona de contacto';
			$scope.elements.alert.show 	= true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

		if (!Validators.validateRequiredField($scope.report.attributes.dynamic_attributes['69'].value)) {
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.title = 'Faltan campos por completar';
			$scope.elements.alert.text 	= 'Mail de contacto';
			$scope.elements.alert.show 	= true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

		if (!Validators.validateRequiredField($scope.report.attributes.dynamic_attributes['70'].value)) {
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.title = 'Faltan campos por completar';
			$scope.elements.alert.text 	= 'Teléfono de contacto';
			$scope.elements.alert.show 	= true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

		if (!Validators.validateRequiredField($scope.report.attributes.dynamic_attributes['71'].value)) {
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.title = 'Faltan campos por completar';
			$scope.elements.alert.text 	= 'Razón social del cliente';
			$scope.elements.alert.show 	= true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

		if (!Validators.validateRequiredField($scope.report.attributes.dynamic_attributes['72'].value)) {
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.title = 'Faltan campos por completar';
			$scope.elements.alert.text 	= 'RUT del cliente';
			$scope.elements.alert.show 	= true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

 		//LLAMA SERVICIO PARA CERRAR NEGOCIO
 		$scope.editarReport(function (data) {
	        if(data.success) 
	        {
            	$uibModalInstance.close({
					action: 'close',
					success: data.success
				});
        	}
        	else
        	{
        		$scope.elements.alert.title = data.error.title;
				$scope.elements.alert.text 	= data.error.detail;
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show 	= true;
				Utils.gotoAnyPartOfPage('pageHeader');
        	}
	    });


	};

	//LLAMA AL SERVICIO PARA AGREGAR UNA PROPUESTA
	$scope.editarReport = function (callback) {
		$scope.report.attributes.dynamic_attributes['65'] = { id: $scope.report.attributes.dynamic_attributes['65'].selected.id,
			value: $scope.report.attributes.dynamic_attributes['65'].selected.name };
		$scope.report.attributes.dynamic_attributes['66'] = { id: $scope.report.attributes.dynamic_attributes['66'].selected.id,
			value: $scope.report.attributes.dynamic_attributes['66'].selected.name };
		var aux = {};
		aux = 
		{  
			data: 
			{ 
				type: 'reports', 
				id: idReport, 
				attributes: {
					dynamic_attributes: $scope.report.attributes.dynamic_attributes,
					pdf: null,
    	   			pdf_uploaded: false
				}, 
				relationships: { } 
			}, 
			idReport: idReport 
		};

		Reports.update(aux, 
			function(success) {
				callback({success: true});
			}, function(error) {
				callback({success: false, error: error.data.errors[0]});
			}
		);
	}

	$scope.stateChangeWS = function (callback) {
		var aux = {};
		aux = 
		{  
			data: 
			{ 
				type: 'reports', 
				id: idReport,
				relationships: 
				{
					state: 
					{
						data:
						{
							type: 'states',
							id: '8' 
						}
					} 
				} 
			} , idReport: idReport 
		};

		Reports.update(aux, 
			function(success) {
				callback({success: true});
			}, function(error) {
				callback({success: false, error: error.data.errors[0]});
			}
		);
	}

	//LLAMA AL SERVICIO PARA AGREGAR UNA PROPUESTA
	$scope.getOneReport = function (callback) {

		Reports.query(
			{idReport: idReport }, 
			function(success) {
				callback({success: true, object: success.data});
			}, function(error) {
				callback({success: false, error: error.data.errors[0]});
			}
		);
	}


	//VA A BUSCAR EL DETALLE DE UN REPORTE
	$scope.getOneReport(function (data) {
	    $scope.report.attributes = data.object.attributes;
	    $scope.getCollectionTipo();
	    $scope.getCollectionConstructora();
	    if ($scope.report.attributes.dynamic_attributes['73'].value == 'true') 
	    {
	    	$scope.report.attributes.dynamic_attributes['73'].value = true;
	    }
	    else
	    {
	    	$scope.report.attributes.dynamic_attributes['73'].value = false;
	    }
	});
})

.controller('AssignedUserInstance', function($scope, $log, $uibModalInstance, idReport, Validators, Utils, Reports, Users) {
	
	$scope.report = {
		id: idReport,
		attributes: {}
	},
	$scope.dynamic_attributes = [];

	$scope.usuarios = {
		visible: false,
		data: [],
		selected: null
	};

	$scope.elements = {
		buttons: {
			cambiar: {
				text: 'Asignar usuario.',
				border: 'btn-border',
				disabled: true
			}
		},
		title: '',
		alert: {
			show: false,
			title: '',
			text: '',
			color: '',
		}
	};

	var selected = '';



	$scope.getUsers = function() {

		Users.query({
			idUser: ''
		}, function(success) {
			if (success.data) {
				for (var i = 0; i < success.data.length; i++) {
					if (success.data[i].id != '') 
					{	
						$scope.usuarios.data.push({
							id: success.data[i].id,
							name: success.data[i].attributes.first_name + ' ' + success.data[i].attributes.last_name,
						});

						if (success.data[i].id == selected.id) 
						{
							$scope.usuarios.selected = { id: success.data[i].id, 
							name:  success.data[i].attributes.first_name + ' ' + success.data[i].attributes.last_name };
						}
					}
				}
			} else {
				$log.error(success);
			}
		}, function(error) {
			$log.error(error);
			if (error.status) {
				Utils.refreshToken($scope.getUsers);
			}
		});
	};


	$scope.asignarUsuario = function() 
	{
		$scope.elements.alert.color = '';
 		$scope.elements.alert.title = '';
 		$scope.elements.alert.text 	= '';
 		$scope.elements.alert.show 	= false;

		if (!Validators.validateRequiredField($scope.usuarios.selected.name)) {
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.title = 'Faltan campos por seleccionar';
			$scope.elements.alert.text 	= 'Debe ingresar un usuario';
			$scope.elements.alert.show 	= true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

 		//LLAMA SERVICIO PARA CERRAR NEGOCIO
 		$scope.asignarUnUsuario(function (data) {
	        if(data.success) 
	        {
            	$uibModalInstance.close({
					action: 'close',
					success: data.success
				});
        	}
        	else
        	{
        		$scope.elements.alert.title = data.error.title;
				$scope.elements.alert.text 	= data.error.detail;
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show 	= true;
        	}
	    });


	};

	//LLAMA AL SERVICIO PARA AGREGAR UNA PROPUESTA
	$scope.asignarUnUsuario = function (callback) {
		var aux = {};
		aux = 
		{  
			data: 
			{ 
				type: 'reports', 
				id: idReport, 
				attributes: {
					assigned_user_id: $scope.usuarios.selected.id,
					dynamic_attributes: $scope.report.attributes.dynamic_attributes 
				}, 
				relationships: { } 
			}, 
			idReport: idReport 
		};

		Reports.update(aux, 
			function(success) {
				callback({success: true});
			}, function(error) {
				callback({success: false, error: error.data.errors[0]});
			}
		);
	}

	//LLAMA AL SERVICIO PARA AGREGAR UNA PROPUESTA
	$scope.getOneReport = function (callback) {

		Reports.query(
			{idReport: idReport }, 
			function(success) {
				callback({success: true, object: success.data});
			}, function(error) {
				callback({success: false, error: error.data.errors[0]});
			}
		);
	}

	//VA A BUSCAR EL DETALLE DE UN REPORTE
	$scope.getOneReport(function (data) {
	    selected = { id: data.object.attributes.assigned_user_id, name: ''};
	    $scope.report.attributes = data.object.attributes;

	    $scope.getUsers();
	});
})

.controller('CierreDeNegocioInstance', function($scope, $log, $uibModalInstance, idReport, idState, Validators, Reports, Utils, Collection) {

	$scope.report = {
		id: idReport,
		cierreNegocio: 
			{ value: false },
		montoCierre: 
			{ value: '' },
		comentario: 
			{ value: '' }
	},
	$scope.dynamic_attributes = [];

	$scope.motivoPerdida = {
		visible: false,
		data: [],
		selected: null
	};

	$scope.elements = {
		buttons: {
			finalizar: {
				text: 'Finalizar',
				border: 'btn-border',
				disabled: true
			}
		},
		title: '',
		alert: {
			show: false,
			title: '',
			text: '',
			color: '',
		}
	};



	$scope.getCollection = function() {
		Collection.query({
			idCollection: 26
		}, function(success) {
			if (success.data) {
				for (var i = 0; i < success.included.length; i++) {
					$scope.motivoPerdida.data.push({
						name: success.included[i].attributes.name,
						id: success.included[i].id
					});
				}
				$scope.motivoPerdida.selected = {name: $scope.motivoPerdida.data[0].name, id: $scope.motivoPerdida.data[0].id};
			} else {
				$log.log(success);
			}

		}, function(error) {
			$log.error(error);
			if (error.status) {
				Utils.refreshToken($scope.getCollection);
			}

		});
	};
	$scope.getCollection();


	$scope.finalizarCierreNegocio = function() 
	{
		$scope.elements.alert.color = '';
 		$scope.elements.alert.title = '';
 		$scope.elements.alert.text 	= '';
 		$scope.elements.alert.show 	= false;

 		if ($scope.report.cierreNegocio.value) 
 		{
 			if (!Validators.validateRequiredField($scope.report.montoCierre.value)) {
	 			$scope.elements.alert.color = 'danger';
	 			$scope.elements.alert.title = 'Faltan campos por seleccionar';
	 			$scope.elements.alert.text 	= 'Debe ingresar un monto de cierre';
	 			$scope.elements.alert.show 	= true;
	 			Utils.gotoAnyPartOfPage('pageHeader');
	 			return;
 			}
 		}
 		else
 		{
 			if (!Validators.validateRequiredField($scope.motivoPerdida.selected.name)) {
	 			$scope.elements.alert.color = 'danger';
	 			$scope.elements.alert.title = 'Faltan campos por seleccionar';
	 			$scope.elements.alert.text 	= 'Debe ingresar un motivo de perdida';
	 			$scope.elements.alert.show 	= true;
	 			Utils.gotoAnyPartOfPage('pageHeader');
	 			return;
 			}
 		}

 		if (!Validators.validateRequiredField($scope.report.comentario.value)) {
 			$scope.elements.alert.color = 'danger';
 			$scope.elements.alert.title = 'Faltan campos por seleccionar';
 			$scope.elements.alert.text 	= 'Debe ingresar un comentario';
 			$scope.elements.alert.show 	= true;
 			Utils.gotoAnyPartOfPage('pageHeader');
 			return;
 		}

 		//LLAMA SERVICIO PARA CERRAR NEGOCIO
 		$scope.negocioCerrado(function (data) {
	        if(data.success) 
	        {
            	$scope.stateChangeWS(function (datos) {
			        if(datos.success) 
			        {
		            	$uibModalInstance.close({
							action: 'close',
							success: datos.success
						});
		        	}
		        	else
		        	{
		        		$scope.elements.alert.title = datos.error.title;
						$scope.elements.alert.text 	= datos.error.detail;
						$scope.elements.alert.color = 'danger';
						$scope.elements.alert.show 	= true;
		        	}
			    })
        	}
        	else
        	{
        		$scope.elements.alert.title = data.error.title;
				$scope.elements.alert.text 	= data.error.detail;
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show 	= true;
        	}
	    });


	};

	$scope.stateChangeWS = function (callback) {
		var aux = {};
		aux = 
		{  
			data: 
			{ 
				type: 'reports', 
				id: idReport,
				relationships: 
				{
					state: 
					{
						data:
						{
							type: 'states',
							id: '10' 
						}
					} 
				} 
			} , idReport: idReport 
		};

		Reports.update(aux, 
			function(success) {
				callback({success: true});
			}, function(error) {
				callback({success: false, error: error.data.errors[0]});
			}
		);
	}

	//LLAMA AL SERVICIO PARA AGREGAR UNA PROPUESTA
	$scope.negocioCerrado = function (callback) {
		$scope.dynamic_attributes['60'] = { value: $scope.report.cierreNegocio.value };
		$scope.dynamic_attributes['61'] = { value: $scope.motivoPerdida.selected.name, id: $scope.motivoPerdida.selected.id };
		$scope.dynamic_attributes['63'] = { value: $scope.report.montoCierre.value };
		$scope.dynamic_attributes['62'] = { value: $scope.report.comentario.value };

		var aux = {};
		aux = 
		{  
			data: 
			{ 
				type: 'reports', 
				id: idReport, 
				attributes: 
				{ 
					dynamic_attributes: $scope.dynamic_attributes,

				}, 
				relationships: { } 
			}, 
			idReport: idReport 
		};


		Reports.update(aux, 
			function(success) {
				callback({success: true});
			}, function(error) {
				callback({success: false, error: error.data.errors[0]});
			}
		);
	}

	$scope.getOneReport = function (callback) {

		Reports.query(
			{idReport: idReport }, 
			function(success) {
				callback({success: true, object: success.data});
			}, function(error) {
				callback({success: false, error: error.data.errors[0]});
			}
		);
	}

	//VA A BUSCAR EL DETALLE DE UN REPORTE
	$scope.getOneReport(function (data) {
	    $scope.dynamic_attributes = data.object.attributes.dynamic_attributes;
	});

})

.controller('DownloadPdfsByMonthModalInstance', function($scope, $log, $timeout, $moment, $uibModalInstance, Utils, ReportsByMonth) {
	$scope.modal = {
		alert: {
			color: null,
			show: null,
			title: null,
			text: null
		},
		month: {
			date: new Date()
		},
		datepicker: {
			opened: false
		},
		buttons: {
			download: {
				disabled: false,
				text: ''
			}
		}
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.removeMessage = function() {
		$scope.modal.alert.show = false;
	};

	$scope.openDatePicker = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.modal.datepicker.opened = !$scope.modal.datepicker.opened;
	};

	$scope.downloadReports = function() {
		var month = $scope.modal.month.date.getMonth() + 1;
		var year = $scope.modal.month.date.getFullYear();

		$scope.modal.buttons.download.disabled = true;
		$scope.modal.buttons.download.text = 'Descargando...';

		ReportsByMonth.getFile('#downloadReportsByMonth', 'reportes_' + month + '_' + year, month, year);

		$timeout(function() {
			$scope.modal.buttons.download.disabled = false;
			$scope.modal.buttons.download.text = '';
		}, 3500);
	};

})

.controller('DownloadPdfsModalInstance', function($scope, $log, $timeout, $moment, $uibModalInstance, Equipments, Reports, Utils, GetPdfsZip) {

	$scope.modal = {
		alert: {
			color: null,
			show: null,
			title: null,
			text: null
		},
		clients: {
			list: [],
			selected: {}
		},
		executers: {
			list: [],
			selected: []
		},
		territories: {
			list: [],
			selected: []
		},
		equipments: {
			list: [],
			selected: {}
		},
		classes: {
			list: [],
			selected: {}
		},
		dropdownMultiselect: {
			settings: {
				enableSearch: true,
				displayProp: 'name',
				scrollable: true,
				scrollableHeight: 300,
				externalIdProp: '',
				showCheckAll: true,
				showUncheckAll: true
			},
			texts: {
				checkAll: 'Seleccionar todos',
				uncheckAll: 'Desmarcar todos',
				searchPlaceholder: 'Buscar',
				buttonDefaultText: 'Seleccionar',
				dynamicButtonTextSuffix: 'seleccionados'
			}
		},
		dateRange: {
			options: {
				locale: {
					format: 'DD/MM/YYYY',
					applyLabel: 'Buscar',
					cancelLabel: 'Cerrar',
					fromLabel: 'Desde',
					toLabel: 'Hasta',
					customRangeLabel: 'Personalizado',
					daysOfWeek: ['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vie', 'Sab'],
					monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
					firstDay: 1
				},
				autoApply: true,
				maxDate: $moment().add(1, 'months').date(1).subtract(1, 'days'),
			},
			date: {
				startDate: new Date(),
				endDate: new Date()
			}
		}
	};

	var creatorsDuplicates = [],
		activityTypesDuplicates = [],
		serialNumbersDuplicates = [],
		configurationElementsDuplicates = [],
		alternativeIdsDuplicates = [],
		modelsDuplicates = [],
		territoriesDuplicates = [],
		classesDuplicates = [],
		clientsDuplicates = [];

	$scope.creatorsUnique = [];
	$scope.activityTypesUnique = [];
	$scope.serialNumbersUnique = [];
	$scope.configurationElementsUnique = [];
	$scope.alternativeIdsUnique = [];
	$scope.modelsUnique = [];
	$scope.territoriesUnique = [];
	$scope.classesUnique = [];
	$scope.clientsUnique = [];

	var createdAtRange = [],
		limitDateRange = [],
		finishedAtRange = [],
		i = 0,
		j = 0,
		k = 0,
		reports = [],
		reportsIncluded = [];

	var getReports = function(e) {
		if (!e.success) {
			$log.error(e.detail);
			return;
		}

		Reports.query({
			include: 'creator,report_type,equipment,activity_type,assigned_user',
			'fields[users]': 'full_name,email',
			all: true
		}, function(success) {

			reports = success.data;
			reportsIncluded = success.included;

			if (!success.data || !success.included) {
				$log.error(success);
				return;
			}

			// $log.info(success);

			angular.forEach(success.included, function(value, key) {

				if (value.type === 'users') {
					creatorsDuplicates.push({
						id: parseInt(value.id),
						email: value.attributes.email,
						name: value.attributes.full_name
					});
				}
				if (value.type === 'activity_types') {
					activityTypesDuplicates.push({
						id: parseInt(value.id),
						name: value.attributes.name
					});
				}
				if (value.type === 'equipments') {
					if (value.attributes.serial_number) {
						serialNumbersDuplicates.push(value.attributes.serial_number);
					}
					if (value.attributes.configuration_element) {
						configurationElementsDuplicates.push(value.attributes.configuration_element);
					}
					if (value.attributes.alternative_id) {
						alternativeIdsDuplicates.push(value.attributes.alternative_id);
					}
					if (value.attributes.equipment_model) {
						modelsDuplicates.push(value.attributes.equipment_model);
					}
					if (value.attributes.territory) {
						territoriesDuplicates.push(value.attributes.territory);
					}
					if (value.attributes.equipment_class) {
						classesDuplicates.push(value.attributes.equipment_class);
					}
					if (value.attributes.client) {
						clientsDuplicates.push(value.attributes.client);
					}
				}

			});

			if (success.data[0].attributes.created_at) {
				createdAtRange = [success.data[0].attributes.created_at, success.data[0].attributes.created_at];
			}
			if (success.data[0].attributes.limit_date) {
				limitDateRange = [success.data[0].attributes.limit_date, success.data[0].attributes.limit_date];
			}
			if (success.data[0].attributes.finished_at) {
				finishedAtRange = [success.data[0].attributes.finished_at, success.data[0].attributes.finished_at];
			}

			angular.forEach(success.data, function(value, key) {
				if (value.attributes.created_at) {
					if ($moment(value.attributes.created_at).diff($moment(createdAtRange[0])) < 0) {
						createdAtRange[0] = value.attributes.created_at;
					}
					if ($moment(value.attributes.created_at).diff($moment(createdAtRange[1])) > 0) {
						createdAtRange[1] = value.attributes.created_at;
					}
				}
				if (value.attributes.limit_date) {
					if ($moment(value.attributes.limit_date).diff($moment(limitDateRange[0])) < 0) {
						limitDateRange[0] = value.attributes.limit_date;
					}
					if ($moment(value.attributes.limit_date).diff($moment(limitDateRange[1])) > 0) {
						limitDateRange[1] = value.attributes.limit_date;
					}
				}
				if (value.attributes.finished_at) {
					if ($moment(value.attributes.finished_at).diff($moment(finishedAtRange[0])) < 0) {
						finishedAtRange[0] = value.attributes.finished_at;
					}
					if ($moment(value.attributes.finished_at).diff($moment(finishedAtRange[1])) > 0) {
						finishedAtRange[1] = value.attributes.finished_at;
					}
				}
			});

			$scope.modal.dateRange.date.startDate = createdAtRange[0];
			$scope.modal.dateRange.date.endDate = new Date();

			$scope.modal.executers.list = _.uniq(creatorsDuplicates, function(item, key, id) {
				return item.id;
			});

			$scope.activityTypesUnique = _.uniq(activityTypesDuplicates, function(item, key, id) {
				return item.id;
			});
			$scope.activityTypeSelected = $scope.activityTypesUnique[0];

			$scope.serialNumbersUnique = _.uniq(serialNumbersDuplicates);
			$scope.configurationElementsUnique = _.uniq(configurationElementsDuplicates);
			$scope.alternativeIdsUnique = _.uniq(alternativeIdsDuplicates);
			$scope.modelsUnique = _.uniq(modelsDuplicates);
			$scope.territoriesUnique = _.uniq(territoriesDuplicates);
			$scope.classesUnique = _.uniq(classesDuplicates);
			$scope.clientsUnique = _.uniq(clientsDuplicates);

			$scope.modal.equipments.selected = $scope.modal.equipments.list[0];

			for (var i = 0; i < $scope.clientsUnique.length; i++) {
				$scope.modal.clients.list.push({
					id: i,
					name: $scope.clientsUnique[i]
				});
			}
			$scope.modal.clients.selected = $scope.modal.clients.list[0];

			for (i = 0; i < $scope.classesUnique.length; i++) {
				$scope.modal.classes.list.push({
					id: i,
					name: $scope.classesUnique[i]
				});
			}
			$scope.modal.classes.selected = $scope.modal.classes.list[0];


			for (i = 0; i < $scope.territoriesUnique.length; i++) {
				$scope.modal.territories.list.push({
					id: i,
					name: $scope.territoriesUnique[i]
				});

			}
			for (i = 0; i < $scope.modal.territories.list.length; i++) {
				$scope.modal.territories.selected.push($scope.modal.territories.list[i]);
			}

			// $scope.modal.territories.selected = $scope.modal.territories.list;

			// $log.log($scope.creatorsUnique);
			// $log.log($scope.activityTypesUnique);
			// $log.log($scope.serialNumbersUnique);
			// $log.log($scope.configurationElementsUnique);
			// $log.log($scope.alternativeIdsUnique);
			// $log.log($scope.modelsUnique);
			// $log.log($scope.territoriesUnique);
			// $log.log($scope.classesUnique);
			// $log.log($scope.clientsUnique);

			// $log.log('menor, mayor: created at');
			// $log.log(createdAtRange);
			// $log.log('menor, mayor: limit');
			// $log.log(limitDateRange);
			// $log.log('menor, mayor: finidhed');
			// $log.log(finishedAtRange);

			// $log.log(success);
		}, function(error) {
			$log.log(error);
			if (error.status === 401) {
				Utils.refreshToken(getReports);
			}
		});
	};

	$scope.downloadZip = function() {

		var equipmentsSelected = [];

		// [{
		// 	"id": "33",
		// 	"type": "equipments",
		// 	"attributes": {
		// 		"serial_number": "AW BCI Miraflores",
		// 		"configuration_element": "AW BCI Miraflores",
		// 		"alternative_id": null,
		// 		"equipment_model": "TDD-4100",
		// 		"location": "BCI of. Miraflores",
		// 		"address": "Agustinas N° 615",
		// 		"city": "Santiago",
		// 		"territory": "CL13A",
		// 		"equipment_class": "AW",
		// 		"client": "BANCO CREDITO INVERSIONES",
		// 		"country": "Chile"
		// 	}
		// }]

		// [{
		// 	id: 0,
		// 	name: 'CL13A'
		// },{
		// 	id: 1,
		// 	name: 'CL13B'
		// }]

		$log.log($scope.modal.clients.selected.name);
		$log.log($scope.modal.classes.selected.name);

		for (i = 0; i < reportsIncluded.length; i++) {
			for (j = 0; j < $scope.modal.territories.selected.length; j++) {

				if (reportsIncluded[i].type === 'equipments' &&
					reportsIncluded[i].attributes.client === $scope.modal.clients.selected.name &&
					reportsIncluded[i].attributes.equipment_class === $scope.modal.classes.selected.name &&
					reportsIncluded[i].attributes.territory === $scope.modal.territories.selected[j].name
				) {

					equipmentsSelected.push(parseInt(reportsIncluded[i].id));

				}

			}
		}

		// $log.log('equipmentsSelected');
		// $log.log(equipmentsSelected);

		var reportsIds = [];

		for (i = 0; i < reports.length; i++) {

			for (j = 0; j < equipmentsSelected.length; j++) {
				for (k = 0; k < $scope.modal.executers.selected.length; k++) {

					if (reports[i].attributes.state_name === 'Ejecutado' &&
						$moment(Date.parse(reports[i].attributes.created_at)).isAfter(Date.parse($scope.modal.dateRange.date.startDate)) &&
						$moment(Date.parse(reports[i].attributes.created_at)).isBefore(Date.parse($scope.modal.dateRange.date.endDate)) &&
						parseInt(reports[i].attributes.equipment_id) === parseInt(equipmentsSelected[j]) &&
						parseInt(reports[i].attributes.creator_id) === parseInt($scope.modal.executers.selected[k].id) &&
						parseInt(reports[i].attributes.activity_type_id) === parseInt($scope.activityTypeSelected.id)

					) {

						reportsIds.push(reports[i].id);
					}
				}
			}
		}

		// $log.log('$scope.modal.executers.selected');
		// $log.log($scope.modal.executers.selected);
		// $log.log('$scope.modal.territories.selected');
		// $log.log($scope.modal.territories.selected);
		// $log.log('$scope.activityTypeSelected');
		// $log.log($scope.activityTypeSelected);
		// $log.log('$scope.modal.clients.selected');
		// $log.log($scope.modal.clients.selected);
		// $log.log('$scope.modal.classes.selected');
		// $log.log($scope.modal.classes.selected);

		$log.info('reportsIds');
		$log.info(reportsIds);

		if (reportsIds.length > 0) {
			$scope.zipBtnDisabled = true;
			GetPdfsZip.getFile('#zipBtn', reportsIds);
			$timeout(function() {
				$scope.zipBtnDisabled = false;
			}, 2000);
		} else {
			$scope.modal.alert.color = 'warning';
			$scope.modal.alert.title = 'No se encontraron reportes que cumplan con los filtros';
			$scope.modal.alert.text = '';
			$scope.modal.alert.show = true;
		}


	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.removeMessage = function() {
		$scope.modal.alert.show = false;
	};

	getReports({
		success: true,
		detail: 'OK'
	});

});