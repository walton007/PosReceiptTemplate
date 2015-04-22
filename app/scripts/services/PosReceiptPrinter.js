'use strict';

//Articles service used for articles REST endpoint
angular.module('posReceiptTemplateApp').factory('POSReceiptPrinter', ['$timeout',
  function($timeout) {
  	//////////////////////////////////////////////////////////////////////////////////////////
    ///ImageBuilder Definision
    function ImageBuilder(templateStore, canvas, imageType) {
        var domParser = new DOMParser();
        // this.templateStore = domParser.parseFromString(templateStore, "image/svg+xml");
        this.templateStore = domParser.parseFromString(templateStore, "application/xml");
        this.serializer = new XMLSerializer();
        this.imageType = imageType || "image/png";
        this.canvas = canvas;

        this.workAroundDiv = undefined;
    };

    function evalInContext(ctx, expr) {
        try  {
          return  eval(expr);
        }
        catch(exception) {
         return expr;
        }
    };

    ImageBuilder.prototype.formatContent = function(template, keyValues) {
        var origDoc = this.templateStore.getElementById(template);
        if (origDoc == null) {
            console.warn("Can't find template:", template);
            return null;
        };
        var itemDoc = origDoc.cloneNode(true);

        //replace all text
        var origContent = null,
            ar, expr;
        var deltaX, deltaY, newX, newY, prevTextElement = null;
        var removeTextEleArray = [];
        $.each(itemDoc.getElementsByTagName('text'), function(index, textElement) {
            if (textElement.getAttribute('removeCond')) { 
                expr = textElement.getAttribute('removeCond');
                if (evalInContext(keyValues, expr)) {
                    removeTextEleArray.push(textElement);
                   return true;
                }
            }

            /* iterate through array or object */
            origContent = textElement.textContent.trim();
            if (origContent) {
                // var regexp = /{{([0-9a-zA-Z.]+)}}/g;
                var regexp = /{{(.+)}}/g;
                ar = regexp.exec(origContent);
                // console.log('origContent:', origContent, ' ar:', ar);
                if (ar) {
                    expr = ar[1].trim();
                    //evalInContext
                    var replacedStr = evalInContext(keyValues, expr);
                    textElement.textContent = unescape(encodeURIComponent(replacedStr));
                } else {
                    textElement.textContent = unescape(encodeURIComponent(origContent));
                }
            };
            if (textElement.getAttribute('relative') && !!prevTextElement) {  
                deltaX = textElement.getAttribute('deltaX');
                deltaY = textElement.getAttribute('deltaY');
                newX = parseInt(prevTextElement.getAttribute('x'))+parseInt(!!deltaX ? deltaX: 0);
                newY = parseInt(prevTextElement.getAttribute('y'))+ parseInt(!!deltaY ? deltaY: 0);
                textElement.setAttribute('x', newX);
                textElement.setAttribute('y', newY);
            };

            prevTextElement = textElement;
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

        $.each(removeTextEleArray, function(index, textElement) {
            textElement.remove();
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
                $.when(that.__printReceipt(request.data, request.printer, request.otherArgs))
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
                return that.__printData(printer, templateDataArray);
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

    POSReceiptPrinter.prototype.__printData = function(printer, templateDataArray) {
        var dtd = $.Deferred();

        this.cacheCanvas = this.cacheCanvas || document.createElement("canvas");

        var templateStore = this.cachetemplate || this.localDefaultTemplate;
        var imageBuilder = new ImageBuilder(templateStore, this.cacheCanvas, "image/png");

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