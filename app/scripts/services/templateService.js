'use strict';

//Articles service used for articles REST endpoint
angular.module('posReceiptTemplateApp').factory('templateService', ['$http',
  function($http) {  	 
    var localTemplate = null;
  	return {
        getTemplate: function() {
          if (localTemplate) {
            return localTemplate;
          };
            return $http.get('/receiptTemplate.xml', {
                mimeType: "text/plain;charset=utf-8"
            });
        }
    };
  }
]);