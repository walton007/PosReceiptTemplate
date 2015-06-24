'use strict';

//Articles service used for articles REST endpoint
angular.module('posReceiptTemplateApp').factory('templateService', ['$http',
  function($http) {  	 
    var localTemplate = null;
    var config = {
      "titleImage": {
        "enable": true,
        "dataurl": null
      },
      "titleLabel": {
        "enable": false,
        "text": null
      },
      "storeName": {
        "enable": false
      },
      "Date": {
        "enable": false
      },
      "employer": {
        "enable": false
      },
      "customerName": {
        "enable": false
      },
      "productLine": {
        "productId": {
          "enable": false
        },
        "itemName": {
          "enable": false
        },
        "standPrice": {
          "enable": false
        },
        "price": {
          "enable": false
        },
        "quantity": {
          "enable": false
        },
        "lineTotal": {
          "enable": false
        }
      },
      "subTotal": {
        "enable": false
      },
      "discountPercentage": {
        "enable": false
      },
      "discountSum": {
        "enable": false
      },
      "preTaxSum": {
        "enable": false
      },
      "tax": {
        "enable": false
      },
      "finalSum": {
        "enable": false
      },
      "paymentMethod": {
        "enable": false
      },
      "annotation": {
        "enable": false,
        "content": []
      }
    };
  	return {
        getConfig: function () {
          return config;
        },
        
        getTemplate: function() {
          if (localTemplate) {
            return localTemplate;
          };
            return $http.get('./receiptTemplate_v1.1.xml', {
                mimeType: "text/plain;charset=utf-8"
            });
        }
    };
  }
]);