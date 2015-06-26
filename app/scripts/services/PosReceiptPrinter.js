'use strict';

//Articles service used for articles REST endpoint
angular.module('posReceiptTemplateApp').factory('POSReceiptPrinter', ['$timeout',
  function($timeout) {
  	//////////////////////////////////////////////////////////////////////////////////////////
    ///ImageBuilder Definision
    function ImageBuilder(templateStore, canvas, imageType, locale) {
        var domParser = new DOMParser();
        // this.templateStore = domParser.parseFromString(templateStore, "image/svg+xml");
        this.templateStore = domParser.parseFromString(templateStore, "application/xml");
        this.serializer = new XMLSerializer();
        this.imageType = imageType || "image/png";
        this.canvas = canvas;

        this.workAroundDiv = undefined;

        //find locale
        if (locale) {
            var store = this.templateStore.querySelector('[locale=$$]'.replace('$$', locale));
            if (store) {
              this.templateStore = store;
            }
        };

    };

    function evalInContext(ctx, expr) {
        var formatDate = function(localTm) {
          var t = localTm instanceof Date ? localTm : new Date(localTm);
          console.log('evalInContext localTm:', t);
            
          // 2015-04-29 04:57 PM
          var sep1 = "-", 
              sep2 = ":",
              year = t.getFullYear(),
              month = t.getMonth() + 1,
              date = t.getDate(),
              hour = t.getHours(),
              minute = t.getMinutes(),
              second = t.getSeconds();
          //AM or PM
          var ampm = 'AM';
          if (hour >= 12) {
            hour = hour-12;
            ampm = 'PM';
          };

          month = month >= 10 ? ''+month :'0'+month;
          date = date >= 10 ? ''+date : '0'+date;
          hour = hour >= 10 ? ''+hour : '0'+hour;
          minute = minute >= 10 ? ''+minute : '0'+minute;
          second = second >= 10 ? ''+second : '0'+second;
       
          var retDate = year + sep1 + month + sep1 + date
                  + " " + hour + sep2 + minute + sep2 + second + ' '+ampm;
          return retDate;

        };
        try {
            return eval(expr);
        } catch (exception) {
            return expr;
        }
    };

    ImageBuilder.prototype.formatContent = function(template, keyValues) {
        var origDoc = this.templateStore.querySelector('#$$'.replace('$$', template) );
        if (origDoc == null) {
            console.warn("Can't find template:", template);
            return null;
        };
        var itemDoc = origDoc.cloneNode(true);

        //replace all text
        var origContent = null,
            ar, expr;
        var deltaX, deltaY, newX, newY, prevElement = null;

        console.log('before handle repeat text length', itemDoc.querySelectorAll('text').length);

        //process repeat
        $.each(itemDoc.querySelectorAll('repeat'), function(index, repeatElement) {
            
            if (repeatElement.childElementCount < 1) {
                return;
            }
            var modelName = repeatElement.getAttribute('model');
            var lengExpr = 'ctx.'+modelName+'.length';
            var length = evalInContext(keyValues, lengExpr);
            var templateArr = repeatElement.children;
            for (var i = 0; i < length; i++) {
                for (var j = 0; j < templateArr.length; j++) {
                    var template = templateArr[j];
                    var newNode = template.cloneNode();
                    newNode.textContent = template.textContent.replace(/(model.)/g, 'ctx.'+modelName+'['.concat(i).concat('].'));
                    repeatElement.parentNode.insertBefore(newNode, repeatElement);
                }
            };

            repeatElement.remove();
        });

        console.log('template: ',template,  'repeat length', itemDoc.querySelectorAll('repeat').length);
        console.log('after handle repeat text length', itemDoc.querySelectorAll('text').length);

        var removeElementArray = [];
        $.each(itemDoc.querySelectorAll('text,line, image'), function(index, element) {
            if (element.getAttribute('removeCond')) { 
                expr = element.getAttribute('removeCond');
                if (evalInContext(keyValues, expr)) {
                    removeElementArray.push(element);
                   return true;
                }
            }

            /* iterate through array or object */
            origContent = element.textContent.trim();
            if (origContent) {
                // var regexp = /{{([0-9a-zA-Z.]+)}}/g;
                var regexp = /{{(.+)}}/g;
                ar = regexp.exec(origContent);
                // console.log('origContent:', origContent, ' ar:', ar);
                if (ar) {
                    expr = ar[1].trim();
                    //evalInContext
                    var replacedStr = evalInContext(keyValues, expr);
                    element.textContent = unescape(encodeURIComponent(replacedStr));
                } else {
                    element.textContent = unescape(encodeURIComponent(origContent));
                }
            };

            if (element.getAttribute('relative')) {
                element.setAttribute('relativeX', 1);
                element.setAttribute('relativeY', 1);
            }
           
            if (element.nodeName !== 'line' && element.getAttribute('relativeX') && !!prevElement) {  
                deltaX = element.getAttribute('deltaX');
                newX = parseInt(prevElement.getAttribute('x'))+parseInt(!!deltaX ? deltaX: 0);
                element.setAttribute('x', newX);
            };
            if (element.getAttribute('relativeY') && !!prevElement) {  
                deltaY = element.getAttribute('deltaY');
                newY = parseInt(prevElement.getAttribute('y'))+ parseInt(!!deltaY ? deltaY: 0);
                element.setAttribute('y1', newY);
                element.setAttribute('y2', newY);
                element.setAttribute('y', newY);
                if (!newY) {
                    console.log(11111);
                };
            };

            if (element.nodeName === 'text') {
                prevElement = element;
            }
        });

        $.each(itemDoc.getElementsByTagName('image'), function(index, imageElement) {
            /* iterate through array or object */
            origContent = imageElement.textContent.trim();
            if (origContent) {
                ar = /^{{([0-9a-zA-Z.]+)}}$/g.exec(origContent);
                if (ar) {
                    key = ar[1];
                    if (keyValues.hasOwnProperty(key)) {
                        imageElement.setAttribute('xlink:href', keyValues[key]);
                    }
                }
            } else {
                imageElement.setAttribute('xlink:href', imageElement.getAttribute('href'));
            };
        });

        $.each(removeElementArray, function(index, element) {
            element.remove();
        });

        var width = itemDoc.getAttribute("width") || "574";
        var height = parseInt(itemDoc.getAttribute("height"));
        if (isNaN(height)) {
            height = evalInContext(keyValues, itemDoc.getAttribute("height"));
            if (isNaN(parseInt(height))) {
                height = 100;
            }
        };
        itemDoc.setAttribute('height', height);
        
        console.log('height:', height);
        var svgString = '<?xml version="1.0" encoding="utf8"?> <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + width + '" height="' + height + '">' +
            this.serializer.serializeToString(itemDoc) + '</svg>';

        return {
            "width": width,
            "height": height,
            "svg": svgString
        };
    };

    ImageBuilder.prototype.buildImage = function(template, keyValues) {
        var that = this;

        function buildImageFromSVG(svgString, width, height) {
            var dtd = $.Deferred();

            var imageObj = new Image();
            imageObj.onload = function() {

                that.canvas.width = width;
                that.canvas.height = height;
                var context = that.canvas.getContext('2d');
                context.clearRect(0, 0, that.canvas.width, that.canvas.height);
                context.fillStyle = 'white';
                context.fillRect(0, 0, width, height);
                context.drawImage(imageObj, 0, 0);

                var imageData = that.canvas.toDataURL(that.imageType);

                dtd.resolve(imageData);
            };
            imageObj.onerror = function() {
                //alert('imageObj.onerror ');
                console.error('failed to buildImage err: ' + svgString);
                dtd.reject('BuildImageErr');
                return;
            };

            if (!that.workAroundDiv) {
                that.workAroundDiv = $('<div style="display: none;"></div>');
            }
            that.workAroundDiv.html(svgString);

            imageObj.src = "data:image/svg+xml;base64," + btoa(svgString); //unescape(encodeURIComponent(svgString)); //btoa(svgString);

            return dtd.promise();
        }

        var svgInfo = this.formatContent(template, keyValues);
        if (svgInfo == null) {
            var dtd = $.Deferred();
            dtd.reject('TemplateErr');
            return dtd.promise();
        };
        return buildImageFromSVG(svgInfo.svg, svgInfo.width, svgInfo.height);
    };

    //////////////////////////////////////////////////////////////////////////////////////////
    ///printSDKAction Definision
    function POSReceiptPrinter() {
        this.localDefaultTemplate = ''; //ns.html.sap.sbo.core.util.ReceiptTemplate;

        this.cachetemplate = null;
        this.cacheCanvas = null;
         

        this.__printRequestQueue = [];
        this.__printIsWorking = false;
    };

    POSReceiptPrinter.prototype.print = function(templateDataArray, printer, otherArgs) {
        console.log('=== print ===');
        var request = {
            "dtd": $.Deferred(),
            "data": templateDataArray,
            "printer": printer,
            "otherArgs": otherArgs
        };
        this.__printRequestQueue.push(request);

        // try to wake up printer
        this.__wakeUpPrinter();

        return request.dtd.promise();
    };

  

    POSReceiptPrinter.prototype.setTemplateContent = function(content) {
        console.log("### sap.sbo.core.util.POSReceiptPrinter setTemplateContent:", content);
        if (content) {
            this.cachetemplate = content;
        }
    };

    POSReceiptPrinter.prototype.__wakeUpPrinter = function() {
        console.log('__wakeUpPrinter === this.__printIsWorking:', this.__printIsWorking);
        var that = this;

        if (this.__printIsWorking) {
            console.log('early return for print is working');
            return;
        }

        function printJobLoop() {
            console.log('printJobLoop:', that.__printRequestQueue.length);
            if (that.__printRequestQueue.length <= 0) {
                that.__printIsWorking = false;
            } else {
                var request = that.__printRequestQueue.pop();
                $.when(that.__printReceipt(request.data, request.printer, request.otherArgs ? request.otherArgs : undefined))
                    .then(function() {
                        console.log('after print one request: going to start another printJobLoop');
                        request.dtd.resolve();
                    }, function(err) {
                        console.warn('printJobLoop error:',err); 
                        request.dtd.reject(err);
                    }).always(function() {
                        $timeout(function() {
                            printJobLoop();
                        }, 0);
                    });
            }
        }
        this.__printIsWorking = true;
        printJobLoop();
    };

    POSReceiptPrinter.prototype.__printReceipt = function(templateDataArray, printer, otherArgs) {
        console.log('=== __printReceipt ===');
        var dtd = $.Deferred(),
            that = this;

        $.when(printer.open(otherArgs))
            .then(function() {
                console.log('====after open');
                return that.__printData(printer, templateDataArray, otherArgs.locale);
            })
            .then(function() {
                console.log('====after printData');
                return printer.close();
            })
            .then(function() {
                console.log('====after close');
                dtd.resolve();
            }).fail(function(internalErrCode) {
                console.warn('__printReceipt error:', internalErrCode);
                dtd.reject(internalErrCode);
            });

        return dtd.promise();
    };

    POSReceiptPrinter.prototype.__printData = function(printer, templateDataArray, locale) {
        var dtd = $.Deferred();

        this.cacheCanvas = this.cacheCanvas || document.createElement("canvas");

        var templateStore = this.cachetemplate || this.localDefaultTemplate;
        var imageBuilder = new ImageBuilder(templateStore, this.cacheCanvas, "image/png", locale);

        function printItemLoop(index) {
            if (index >= templateDataArray.length) {
                dtd.resolve();
            } else {
                $.when(imageBuilder.buildImage(templateDataArray[index].sectionid, templateDataArray[index].keyValues))
                    .then(function(imageData) {
                        if (!!imageData) {
                            return printer.printImage(imageData);
                        }
                    })
                    .then(function() {
                        setTimeout(function() {
                            printItemLoop(index + 1);
                        }, 0);
                    }, function(internalErrCode) {
                        dtd.reject(internalErrCode);
                    });
            }
        }

        // start to print
        printItemLoop(0);

        return dtd.promise();
    };

    var gPOSReceiptPrinter = new POSReceiptPrinter();
    console.log('construct gPOSReceiptPrinter');

  	return gPOSReceiptPrinter;
  }
]);