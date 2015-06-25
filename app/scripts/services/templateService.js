'use strict';

//Articles service used for articles REST endpoint
angular.module('posReceiptTemplateApp').factory('templateService', ['$http', '$q',
  function($http, $q) {  	 
    var localTemplate = null,
    serializer = new XMLSerializer(),
    cacheDocument = null ;
    var headContent = ["storeName", "Date", "employer", "customerName"],
    headHeight = [360, 360-40,  360-40*2,  360-40*3, 360-40*4];
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
        "enable": true
      },
      "Date": {
        "enable": true
      },
      "employer": {
        "enable": true
      },
      "customerName": {
        "enable": true
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
      if (defaultConfigTemplate != null) {
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

    function getCacheDocument() {
      var deferred = $q.defer();
      if (cacheDocument) {
        deferred.resolve(cacheDocument);
      } else {
        getDefaultConfigTemplate()
        .then(function (_defaultConfigTemplate) {
          cacheDocument = new DOMParser().parseFromString(_defaultConfigTemplate, "application/xml");
          deferred.resolve(cacheDocument);
        });
      }

      return deferred.promise;
    }
     
  	return {
        getConfig: function () {
          return config;
        },

        getConfigMergedTemplate: function () {
          var deferred = $q.defer();
          var findEle = false;
          getCacheDocument()
          .then(function (_cacheDocument) {
            var headDisableCnt = 0;
            angular.forEach(config, function (value, key) {
              if (key === 'productLine') {
                return;
              };
              
              findEle = false;
              angular.forEach(_cacheDocument.getElementsByClassName(key),
              function(ele) {
                  findEle = true;
                  ele.setAttribute('removeCond', value.enable ? 0 : 1);
              });
              if (findEle && value.enable === false) {
                headDisableCnt = headDisableCnt+1;
              };
            })

            //Set height change
            _cacheDocument.querySelector('#header-template').setAttribute('height', headHeight[headDisableCnt]);
            
            var finalTemplate = serializer.serializeToString(_cacheDocument);
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