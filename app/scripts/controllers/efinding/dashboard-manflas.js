'use strict';

/**
 * @ngdoc function
 * @name adminProductsApp.controller:ManflasDashboardCtrl
 * @description
 * # ManflasDashboardCtrl
 * Controller of the adminProductsApp
 */
 angular.module('adminProductsApp')
 .controller('ManflasDashboardCtrl', function($scope, $filter, $log, $timeout, $moment, Utils, NgTableParams, ReportsManflas, Dashboard, Collection, Cuarteles, NgMap) {
 	var currentDate = new Date();
 	var firstMonthDay = new Date();
 	firstMonthDay.setDate(1);
 	$scope.mostrarTabla = [];
 	var data = [],
		activityTypes = [],
		users = [],
		reportsIncluded = [],
		inspecciones = [];

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

 	$scope.page = {
 		title: 'Dashboard Manflas',
 		filters: {
 			areas: {
 				list: [],
 				selected: null
 			},
 			status: {
 				list: [],
 				selected: null,
 				disabled: false
 			},
 			cuarteles: {
 				list: [],
 				selected: null
 			},
 			month: {
 				value: new Date(),
 				isOpen: false
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
 					startDate: firstMonthDay,
 					endDate: currentDate
 				}
 			}
 		},
 		buttons: {
 			getExcel: {
 				disabled: false
 			}
 		},
 		loader: {
 			show: false
 		},
 		charts: {
			actividadVsRiesgo: {
				loaded: false,
				table: {
					headers: [],
					row1: [],
					row2: [],
					row3: []
				},
				chartConfig: Utils.setChartConfig('column', 400, {}, {}, {}, [])
			}
		},
		markers: {
			resolved: [],
			unchecked: []
		}
 	};

 	$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

 	$scope.ratioHallazgos = {
 		chartConfig:[],
 		data: []
 	}

 	var storesIncluded = [],
 	i = 0,
 	j = 0,
 	k = 0;

 	var getAreas = function() {
 		$scope.page.filters.areas.list = [];

		Collection.query({
			idCollection: 23
		}, function(success) {
			if (success.data) {
				$scope.page.filters.areas.list.push({
 					id: '',
 					name: 'Todas las Áreas'
 				});
				for (var i = 0; i < success.included.length; i++) {
					$scope.page.filters.areas.list.push({
						// AQUI VAN LOS CAMPOS DEL JSON
						name: success.included[i].attributes.name,
						id: success.included[i].id,
						padre: success.included[i].attributes.parent_item_id
					});
				}

				$scope.page.filters.areas.selected = $scope.page.filters.areas.list[0];
				$scope.page.filters.areas.loaded = true;
 				$scope.getStatus({
 					success: true,
 					detail: 'OK'
 				}, $scope.page.filters.areas.selected);

			} else {
				$log.error(success);
			}
		}, function(error) {
			$log.error(error);
			if (error.status) {
				Utils.refreshToken($scope.getCollection);
			}
		});
 	};

 	$scope.getStatus = function(e) {

 		$scope.page.filters.status.selected = [];
 		$scope.page.filters.status.list = [];

		$scope.page.filters.status.list.push({
			name: '',
			nameB: 'Todos los estados'
		});

		$scope.page.filters.status.list.push({
			name: 'reports_pending',
			nameB: 'Pendiente de envío'
		});
		$scope.page.filters.status.list.push({
			name: 'first_signature_pending',
			nameB: 'Pendiente de firma'
		});
		$scope.page.filters.status.list.push({
			name: 'first_signature_done',
			nameB: 'Firmado'
		});
		$scope.page.filters.status.list.push({
			name: 'final_signature_pending',
			nameB: 'Pendiente de firma final'
		});
		$scope.page.filters.status.list.push({
			name: 'finished',
			nameB: 'Teminado'
		});

		$scope.page.filters.status.selected = $scope.page.filters.status.list[0];
		$scope.page.filters.status.disabled = false;
		$scope.page.filters.status.loaded = true;

		$scope.getCuarteles({
			success: true,
			detail: 'OK'
		});
 	};

 	$scope.getCuarteles = function(e) {

 		$scope.page.filters.cuarteles.list = [];

 		Cuarteles.query({}, function(success) {
 			if (success.data) {
 				angular.forEach(success.data, function(value, key) {
 					$scope.page.filters.cuarteles.list.push({
 						id: value.id,
 						name: value.attributes.name + ' ' + value.attributes.variety,
 						coordenadas: value.attributes.coordinates,
 						num_reports: value.attributes.num_reports
 					});
 				});
 				$scope.page.filters.cuarteles.selected = $scope.page.filters.cuarteles.list[0];
 			} else {
 				$log.error(success);
 			}
 		}, function(error) {
 			$log.error(error);
 			if (error.status === 401) {
 				Utils.refreshToken(getAreas);
 			}
 		});
 	};

 	//EMPIEZA TABLA CON REPORTES
 	$scope.click = function(e, cuartel)
 	{
 		$scope.role_id = Utils.getInStorage('role_id');

		$scope.sort_direction = 'asc';

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
			//$scope.filter.include = _.findWhere(_.findWhere(included, { name: 'Hallazgos'}).items, { path: 'efinding.hallazgos.lista'}).included;
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
		$scope.getReports({
			success: true,
			detail: 'OK'
		}, cuartel.id);

 	};

 	$scope.getReports = function(e, cuartel) {
		if (!e.success) {
			$log.error(e.detail);
			return;
		}
		data = [];
		var test = [];

		ReportsManflas.query({
			filtro: 'filter[station_id]='+cuartel,
		}, function(success) {
			reportsIncluded = success.included;

			for (i = 0; i < success.data.length; i++) {
				test.push({});

				for (var j = 0; j < $scope.columns2.length; j++) {
					test[test.length - 1]['pdf'] 			= success.data[i].attributes.pdf;
					test[test.length - 1]['pdfUploaded'] 	= success.data[i].attributes.pdf_uploaded;
					test[test.length - 1]['state'] = success.data[i].attributes.state;
					test[test.length - 1]['id'] = success.data[i].id;
					//no tiene relacion
					if ($scope.columns2[j].relationshipName === null) 
					{
						if (success.data[i].attributes[$scope.columns2[j].field] != null) 
						{
							test[test.length - 1][$scope.columns2[j].field_a] =	success.data[i].attributes[$scope.columns2[j].field]
						}
						else
						{
							test[test.length - 1][$scope.columns2[j].field_a] =	'-';
						}
					}
					else
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
				}
			}
			inspecciones = test;

			$scope.mostrarTabla = test;
			$log.error(test);

			$scope.tableParams = new NgTableParams({
				page: 1, // show first page
				count: inspecciones.length // count per page
			}, {
				counts: [],
				total: inspecciones.length, // length of test
				dataset: inspecciones
			});

		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getReports);
			}
		});
	};

 	//TERMINA TABLA CON REPORTES

 	$scope.$watch('page.filters.areas.loaded', function() {
		if ($scope.page.filters.areas.loaded) {
			$scope.$watch('page.filters.dateRange.date', function(newValue, oldValue) {
				var startDate = new Date($scope.page.filters.dateRange.date.startDate);
				var endDate = new Date($scope.page.filters.dateRange.date.endDate);

				$scope.getDashboardInfo({
					success: true,
					detail: 'OK'
				});
			});
		}
	});

 	$scope.getDashboardInfo = function(e) {
 		if (!e.success) {
 			$log.error(e.detail);
 			return;
 		}


 		var areaIdSelected = $scope.page.filters.areas.selected ? $scope.page.filters.areas.selected.id : '';
 		var statusIdSelected = $scope.page.filters.status.selected ? $scope.page.filters.status.selected.name : '';
 		var startDate = new Date($scope.page.filters.dateRange.date.startDate);
 		var endDate = new Date($scope.page.filters.dateRange.date.endDate);

 		Dashboard.query({
 			//'filter[area][id]': areaIdSelected,
 			//'filter[state_name]': statusIdSelected,
 			//'filter[start_date]': startDate,
 			//'filter[end_date]': endDate
 		}, function(success) {
		    if (success.data) {
		    	var actividadVsRiesgo = {
					categories: [],
					riesgo: []
				},
				cumplimientoHallazgos = {
					inspeccion: [],
					datos: []
				};

				// INI grado de riesgo
				angular.forEach(success.data.attributes.grupos_actividad, function(value, key) {
					actividadVsRiesgo.categories.push($filter('capitalize')(value, true));
				});
				angular.forEach(success.data.attributes.grados_riesgo, function(value, key) {
					var aux = {name: 'Grado ' + value, data: []};
					actividadVsRiesgo.riesgo.push(aux);
				});
				for (var i = 0; i < actividadVsRiesgo.riesgo.length; i++) {
					for (var j = 0; j < success.data.attributes.grupos_actividad_vs_riesgo.length; j++) {
						actividadVsRiesgo.riesgo[i].data.push(success.data.attributes.grupos_actividad_vs_riesgo[j][i]);
					}
				}
				$scope.page.charts.actividadVsRiesgo.data = actividadVsRiesgo;

				$scope.page.charts.actividadVsRiesgo.chartConfig = Utils.setChartConfig('column', 400, {}, {
					min: 0,
					title: {
						text: null
					}
				}, {
					categories: actividadVsRiesgo.categories,
					title: {
						text: 'Grupos de actividad'
					}
				}, actividadVsRiesgo.riesgo);

				// FIN grado de riesgo

				//INI cumplimiento de hallazgos

		        angular.forEach(success.data.attributes.report_fulfillment, function(value, key) {
		        	cumplimientoHallazgos.inspeccion.push(value.inspection_id);
		        });
		        cumplimientoHallazgos.datos.push({name: "Pendientes", data:[]})
		        cumplimientoHallazgos.datos.push({name: "Resueltos", data:[]})
		        cumplimientoHallazgos.datos.push({name: "No revisados", data:[]})

		        for (var i = 0; i < success.data.attributes.report_fulfillment.length; i++) {
		        	cumplimientoHallazgos.datos[2].data.push(success.data.attributes.report_fulfillment[i].num_pending);
		        	cumplimientoHallazgos.datos[1].data.push(success.data.attributes.report_fulfillment[i].num_resolved);
		        	cumplimientoHallazgos.datos[0].data.push(success.data.attributes.report_fulfillment[i].num_unchecked);
				}

				$scope.charCumplimientoHallazgos = Utils.setChartConfig('column', 513, {
			    	column: {
			    		stacking: 'normal',
			    		dataLabels: {
			    			enabled: true,
			    			color: 'white',
			    			style: {
			    				textShadow: '0 0 3px black',
			    				fontWeight: 'normal'
			    			}
			    		}
			    	}
			    }, 
			    {
			    	min: 0,
			    	title: {
			    		text: null
			    	},
			    	stackLabels: {
			    		enabled: true,
			    		style: {
			    			fontWeight: 'normal',
			    			color: 'gray'
			    		}
			    	}
			    }, 
			    {
	    			categories: cumplimientoHallazgos.inspeccion,
	    			title: {
	    				text: 'Inspecciones'
	    			}
	    		},cumplimientoHallazgos.datos);
				$scope.charCumplimientoHallazgos.data = cumplimientoHallazgos.inspeccion;
			    //FIN cumplimiento de hallazgos

			    //INI ratio de hallazgos

			    var unchecked = success.data.attributes.report_ratios[0].num_reports;
			    var resolved = success.data.attributes.report_ratios[1].num_reports;

			    $scope.ratioHallazgosShow = false;

			    unchecked>0? $scope.ratioHallazgosShow=true:$scope.ratioHallazgosShow=false;

			    $scope.ratioHallazgos = Utils.setChartConfig('pie', 500, {
			    	pie: {
		                allowPointSelect: true,
		                cursor: 'pointer',
		                dataLabels: {
		                    enabled: false
		                },
		                showInLegend: true
		            }
			    }, 
			    {
			    	min: 0,
			    	title: {
			    		text: null
			    	},
			    	stackLabels: {
			    		enabled: true,
			    		style: {
			    			fontWeight: 'normal',
			    			color: 'gray'
			    		}
			    	}
			    }, 
			    {
	    			categories: cumplimientoHallazgos.inspeccion,
	    			title: {
	    				text: 'Zonas'
	    			}
	    		}, 
	    		[
	    			{
			        	name: 'Número Hallazgos',
			        	colorByPoint: true,
				        data: [{
				            name: 'Pendientes',
				            y: unchecked
				        }, {
				            name: 'Resueltos',
				            y: resolved
				        }]
			    	}
			    ]
			    );

			    //INI MAPA
			    $scope.page.markers.unchecked = success.data.attributes.report_locations[0].coordinates;
				$scope.page.markers.resolved = success.data.attributes.report_locations[1].coordinates;
			    //FIN MAPA
    		}
		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getDashboardInfo);
			}
		});
	};
	getAreas();
});