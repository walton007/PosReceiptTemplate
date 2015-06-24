'use strict';

//Articles service used for articles REST endpoint
angular.module('posReceiptTemplateApp').factory('SalesOrder',['$http', '$q',
  function($http, $q) {
    return {
      getData: function  (argument) {
        var self = this;
        var deferred = $q.defer();
        $http.get('./POSData.json', {
              // mimeType: "text/plain;charset=utf-8"
          })
        .then(function(resp) {
          var sampleJson = resp.data;
          sampleJson.headfooter.docDate = new Date();
          deferred.resolve(self.buildPrintData(sampleJson));
        });

        return deferred.promise;
        
      },

      buildPrintData: function(data) {
        var head = {
                'sectionid': 'header-template',
                'keyValues': data.headfooter
              },
              items = [],
              footer = {
                'sectionid': 'foot-template',
                'keyValues': data.headfooter
              };

            $.each(data.productLines, function(index, documentLine) {
              items.push({
                'sectionid': 'item-template',
                'keyValues': documentLine 
              });
            });

            return [head].concat(items).concat([footer]);
      }
    }
  }]);