'use strict';

/**
 * @ngdoc function
 * @name posReceiptTemplateApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the posReceiptTemplateApp
 */
angular.module('posReceiptTemplateApp')
	.controller('MainCtrl', ['$rootScope', '$scope', 'POSReceiptPrinter', 'templateService', 'SalesOrder',
		function($rootScope, $scope, POSReceiptPrinter, templateService, SalesOrder) {
			$scope.config = templateService.getConfig();
			$scope.$watch('config', function(newVal, oldVal){
		        console.log('changed');
		        $rootScope.Reload();
		    }, true);

			$scope.images = [];
			$scope.zhImages = [];
			
			var Previewer = function(images) {
				this.images = images;
			};
			Previewer.prototype = {
				open: function() {
					return;
				},
				printImage: function(imageData) {
					this.images.push(imageData);
				},
				close: function() {
					return;
				}
			};

			$rootScope.refresh = function(template) {
				function doPrint(templateContent) {
					POSReceiptPrinter.setTemplateContent(templateContent);
					SalesOrder.getData()
					.then(function(data) {
						POSReceiptPrinter.print(data, new Previewer($scope.images), {locale: 'zh'});
						POSReceiptPrinter.print(data, new Previewer($scope.zhImages), {locale: 'en'});
					});
				}
				if (template) {
					doPrint(template);
				} else {
					templateService.getConfigMergedTemplate().then(function(templateContent) {
						doPrint(templateContent);
					});
				}
			}; 
			$rootScope.clear = function() {
				$scope.images = [];
				$scope.zhImages = [];
				$rootScope.localFilename = '';
			}; 
			$rootScope.Reload = function(template) {
				$rootScope.clear();
				$rootScope.refresh(template);
			};
			$rootScope.localFilename = '';

			$rootScope.ToggleLang = function(template) {
				lang = lang === 'zh' ? 'en' : 'zh';
				$rootScope.clear();
				$rootScope.refresh();
			};

			$rootScope.SaveConfig = function () {
				templateService.getConfigMergedTemplate().then(function(templateContent) {
					console.log(templateContent);
					var blob = new Blob([templateContent], {type: "application/xml"});
					saveAs(blob, "sampleTemplate.xml");
				});
				
			};
			
		}
	])
.controller('HeadCtrl', ['$rootScope', '$scope',  
		function($rootScope, $scope) {
			$scope.$on('fileAdded', function (evt, file) {
				var reader = new FileReader();
				reader.onload = function(event) {
				    $rootScope.Reload(event.target.result);
				    $rootScope.localFilename = file.name;
				 }
				 reader.readAsText(file, 'utf-8');
			    // alert('opening dialog');
		    });
		}
	]);