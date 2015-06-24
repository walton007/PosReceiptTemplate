'use strict';

//Articles service used for articles REST endpoint
angular.module('posReceiptTemplateApp').factory('templateService', ['$http', '$q',
  function($http, $q) {  	 
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

    var defaultConfigTemplate = null;
    function getDefaultConfigTemplate() {
      var deferred = $q.defer();
      if (defaultConfigTemplate) {
        deferred.resolve(defaultConfigTemplate);
      } else {
        $http.get('./receiptTemplate_config.xml', {
          mimeType: "text/plain;charset=utf-8"
        })
        .then(function (resp) {
          defaultConfigTemplate = resp.data;
          deferred.resolve(defaultConfigTemplate);
        });
      }
      return deferred.promise;
    } 
    getDefaultConfigTemplate();
  	return {
        getConfig: function () {
          return config;
        },

        getConfigMergedTemplate: function () {
          var deferred = $q.defer();
          getDefaultConfigTemplate()
          .then(function (_defaultConfigTemplate) {
            var regrex = new RegExp('removeCond="{{config.storeName}}"',"gi");
            var targetStr = (config.storeName.enable) ? 'removeCond="0"' : 'removeCond="1"';
            var finalTemplate = _defaultConfigTemplate.replace(regrex, targetStr);
            console.log(finalTemplate);
            deferred.resolve(finalTemplate);
          })
          return deferred.promise;
        },

        getTemplate: function() {
          if (localTemplate) {
            var deferred = $q.defer();
            deferred.resolve(localTemplate);
            return deferred.promise;
          };
          return $http.get('./receiptTemplate.xml', {
              mimeType: "text/plain;charset=utf-8"
          });
        }
    };
  }
]);