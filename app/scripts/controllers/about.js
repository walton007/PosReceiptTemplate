'use strict';

/**
 * @ngdoc function
 * @name posReceiptTemplateApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the posReceiptTemplateApp
 */
angular.module('posReceiptTemplateApp')
  .controller('AboutCtrl',['$scope',  function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }]);
