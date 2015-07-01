'use strict';

//Articles service used for articles REST endpoint
angular.module('posReceiptTemplateApp').factory('templateService', ['$http', '$q',
  function($http, $q) {  	 
    var localTemplate = null,
    serializer = new XMLSerializer(),
    cacheDocument = null ;
    var headContent = ["storeName", "Date", "employer", "customerName"],
    headHeight = [0, -40,  -40*2,  -40*3, -40*4];
    var config = {
            "titleImage": {
              "enable": false,
              "dataurl": null
            },
            "titleLabel": {
              "enable": true,
              "text": 'hello'
            },
            "address": {
              "enable": false,
              "text": null
            },
            "orderID": {
              "enable": true
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

            "productLine_productId": {
              "enable": true
            },
            "productLine_itemName": {
              "enable": true
            },
            "productLine_standPrice": {
              "enable": true
            },
            "productLine_price": {
              "enable": true
            },
            "productLine_quantity": {
              "enable": true
            },
            "productLine_lineDiscountPercentage": {
              "enable": true
            },

            "productLine_lineDiscount": {
              "enable": true
            },
            "productLine_lineTotal": {
              "enable": true
            },
       
            "subTotal": {
              "enable": true
            },
            "discountPercentage": {
              "enable": true
            },
            "discountSum": {
              "enable": true
            },
            "preTaxSum": {
              "enable": true
            },
            "tax": {
              "enable": true
            },
            "finalSum": {
              "enable": false
            },
            "paymentMethod": {
              "enable": false
            },
            "annotation": {
              "enable": true,
              "content": ['a', 'b', 'c']
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
              if (headContent.indexOf(key) >= 0 && findEle && value.enable === false) {
                headDisableCnt = headDisableCnt+1;
              };
            })

            //Set height change
            var baseHeight = _cacheDocument.querySelector('#header-template').getAttribute('baseHeight');
            _cacheDocument.querySelector('#header-template').setAttribute('height', baseHeight+headHeight[headDisableCnt]);
            
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