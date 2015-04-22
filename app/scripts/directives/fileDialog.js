angular.module('posReceiptTemplateApp')
.directive('fileDialog', [function() {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attr) {
            element.bind('change', function (evt) {
                scope.$emit('fileAdded', evt.target.files[0]);
            });
        }
    };
}]);