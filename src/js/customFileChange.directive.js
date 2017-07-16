(function (angular) {
    'use strict';

    angular.module('spNgModule')
        .directive('customFileChange', CustomFileChange)

    function CustomFileChange($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.customFileChange);
                var modelSetter = model.assign;
                element.bind('change', function () {
                    scope.$apply(function () {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var fileModel = {
                                fileName: element[0].files[0].name,
                                fileAsBuffer: e.target.result
                            };
                            modelSetter(scope, fileModel);
                        }
                        reader.onerror = function (e) {
                            alert(e.target.error);
                        }
                        reader.readAsArrayBuffer(element[0].files[0]);
                    });
                });
            }
        };
    }
})(window, angular);