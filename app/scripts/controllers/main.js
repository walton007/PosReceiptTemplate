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

			$scope.images = [];
			var Previewer = {
				open: function() {
					return;
				},
				printImage: function(imageData) {
					$scope.images.push(imageData);
				},
				close: function() {
					return;
				}
			};

			var lang = 'zh';

			$rootScope.refresh = function(template) {
				function doPrint(templateContent) {
					POSReceiptPrinter.setTemplateContent(templateContent);
					var data = SalesOrder.buildPrintData(SalesOrder.getData());
					var printer = POSReceiptPrinter.print(data, Previewer, {locale: lang})
				}
				if (template) {
					doPrint(template);
				} else {
					templateService.getTemplate().success(function(templateContent) {
						doPrint(templateContent);
					});
				}
			}; 
			$rootScope.clear = function() {
				$scope.images = [];
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