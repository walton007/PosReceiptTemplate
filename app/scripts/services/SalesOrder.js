'use strict';

//Articles service used for articles REST endpoint
angular.module('posReceiptTemplateApp').factory('SalesOrder',
  function() {
    return {
      getData: function() {
          var productLines = [{
            discountPercentage: "0",
            displayOriginal: "true",
            eTag: "9894f60d9a567de6",
            grossLineTotal: "520",
            grossUnitPrice: "520",
            lineCalcBase: "byDefault",
            originalTotal: "720",
            originalUnitPrice: "720",
            priceSource: "BY_USER",
            quantity: 1,
            sku: {
              code: "P_123389",
              mainImage: "filesystem:http://127.0.0.1:8078/temporary/productImages/4",
              name: "P_123389",
              product_id: 4,
              salesPrice: "520",
              skuVariantValues: [],
              standardPrice: "720",
              status: 1
            },
            skuId: 9,
            total: "520",
            unitPrice: "520",
            warehouse: {
              eTag: "93c7790c16744711",
              id: 1,
              isCreated: "false",
              isDeleted: "false",
              isNew: "false",
              isPending: "false",
              isUpdated: "false",
              whsName: "WH01"
            }
          }, {
            discountPercentage: "0",
            displayOriginal: "true",
            eTag: "621a2871e55d24e9",
            grossLineTotal: "800",
            grossUnitPrice: "800",
            lineCalcBase: "byDefault",
            originalTotal: "900",
            originalUnitPrice: "900",
            priceSource: "BY_USER",
            quantity: 1,
            sku:  {
              code: "product1001_Dressed_L",
              eTag: "5f8aa07d3c1dc0b5",
              mainImage: "filesystem:http://127.0.0.1:8078/temporary/productImages/5",
              name: "我的温泉”泡浴珠宝盒（7款松露羊脂球、3款小心肝炸弹、5款草本菁华岩床浴盐、松木抽拉盖中礼盒）",
              product_id: 5,
              salesPrice: "800",
              skuVariantValues: [{
                sku_id: 16,
                variantValue: {
                  code: "L",
                  eTag: "48b37802801ab81a",
                  value: "L",
                  variant: {
                    eTag: "97be082da57c82f2",
                    name: "Size"
                  }
                }
              }, {
                sku_id: 16,
                variantValue: {
                  code: "Dressed",
                  eTag: "48b37802801ab81a",
                  value: "Dressed",
                  variant: {
                    eTag: "97be082da57c82f2",
                    name: "Style"
                  }
                }
              }],
              standardPrice: "900",
              status: 1
            },
            skuId: 16,
            total: "800",
            unitPrice: "800",
            warehouse: {
              whsName: "WH01"
            }
          }];


          var mockSalesOrder = {
            productLines: productLines,
            autoDeliver: "true",
            autoInvoiceAndPay: "true",
            calcBase: "byDefault",
            changeSetId: "03d40db834ab4f56",
            channel: {
              address: {
                displayName: "Jackie-ma",
                eTag: "78138da352f9ea93",
                recipientName: "Jackie-ma"
              },
              catalogId: 4,
              channelTypeId: 6,
              code: "taobao",
              creationTime: "3/25/2015, 10:32:21 AM",
              currency: {
                code: "RMB",
                decimals: "DEFAULT",
                description: "人民币",
                eTag: "2387ea8ed1b45727",
                id: 1,
                symbol: "￥"
              },
              currencyId: 1,
              customerId: 1,
              eTag: "fa2d9e6c6658c533",
              enableCustomerPL: "false",
              id: 4,
              language: "en_US",
              name: "taobao",
              paymentAccounts: [{
                paymentAccount: {
                  acctName: "Cash"
                }
              }, {
                paymentAccount: {
                  acctName: "Credit Card/Debit Card"
                }
              }],
              priceMethod: "GROSS_PRICE",
              salesPriceListId: 2,
              standardPriceListId: 1,
              status: "ACTIVE",
              templateId: 700
            },
            channelId: 4,
            customer: {
              customerCode: "1",
              customerName: "customer29",
              customerType: "CORPORATE_CUSTOMER",
              displayName: "customer29"
            },
            customerCode: "1",
            customerId: 1,
            customerName: "customer29",
            deliveryDate: "3/31/2015, 11:21:25 AM",
            discountPercentage: "9",
            discountSum: "118.8",
            docCurrencyCode: "RMB",
            docCurrencyId: 1,
            docDate: new Date(),
            docTotal: "1201.2",
            eTag: "7451181f07f3c16b",
            grossDocTotal: "1201.2",
            id: 4139288575,
            isRecalcNeed: "true",
            ownerCode: 1,
            ownerDisplayName: "ERP SUITE",
            paymentAccount: {
              acctName: "Cash"
            },
            paymentMethod: "Cash",
            paymentStatus: "tPaid",
            priceMethod: "GROSS_PRICE",
            shippingAddr: {
              displayName: "Jackie-ma",
              recipientName: "Jackie-ma"
            },
            subTotal: "1320",
            taxRate: "10",
            uiChange: "48.8",
            uiPaid: "1250"
          };
 
          return mockSalesOrder;
        },

      buildPrintData: function(salesOrder) {
            var orderModel = 'propertyValues' in salesOrder ?
              this.__dataConvertor.convertTo(salesOrder.entityType, salesOrder, null, {
              encode: false,
              keepReferences:true,
              datetimeFormatter: function(val) {
                var date = new Date(val);
                return date.toLocaleString();
              }
            }) : salesOrder;
            var productLines = orderModel.productLines;
            delete orderModel['productLines'];

            var globalOrderModel = $.extend(orderModel, {
              currentEmployee: {
                ackupEmail: "test@sap.com",
                displayLanguage: "zh_CN",
                displayName: "SUITE ERP",
                email: "test@sap.com"
              },
              companySetting: {
                address: null,
                calculateTaxRateBy: "ShippingAddress",
                companyName: "ERPSUITE",
                defaultLengthUnit: 1,
                defaultWeightUnit: 2,
                displayCurrencyOnTheRight: false,
                exchangeRateQuotationMethod: "Direct",
                localCurrency: {
                  code: "RMB"
                },
                locale: "zh_CN",
                logo: null,
                multiCurrencyEnabled: true,
                netSalesOnly: false,
                 
                priceMethod: "NET_GROSS_PRICE",
                salesTargetSalesOrderOptionEnum: "SIGNED",
                zipCode: null
              }
            });

            var head = {
                'sectionid': 'header-template',
                'keyValues': globalOrderModel
              },
              items = [],
              footer = {
                'sectionid': 'foot-template',
                'keyValues': globalOrderModel
              };

            $.each(productLines, function(index, documentLine) {
              items.push({
                'sectionid': 'item-template',
                'keyValues': documentLine 
              });
            });

            return [head].concat(items).concat([footer]);
      }
    }
  });