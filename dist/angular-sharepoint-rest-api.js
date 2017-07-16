(function () {
    'use strict';

    angular.module('spNgModule')
        .directive("customFileChange", CustomFileChange)

    function CustomFileChange($parse) {
        return {
            restrict: "A",
            link: function (scope, element, attrs) {
                var model = $parse(attrs.customFileChange);
                var modelSetter = model.assign;
                element.bind("change", function () {
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
})(window, document);
(function () {
    'use strict';

    angular.module('spNgModule')
        .factory("$spBaseService", SPBaseService);

    SPBaseService.$inject = ["$q", "$http", "$spNgModuleConfig"];

    function SPBaseService($q, $http, $spNgModuleConfig) {

        var baseUrl = $spNgModuleConfig.isAppWeb ? _spPageContextInfo.webAbsoluteUrl : _spPageContextInfo.siteAbsoluteUrl;

        return {
            getRequest: getRequest,
            postRequest: postRequest,
            updateRequest: updateRequest,
            deleteRequest: deleteRequest,
            fileUploadRequest: fileUploadRequest,
            baseUrl: baseUrl
        };

        function getRequest(query, endPoint) {
            var deferred = $q.defer();
            $http({
                url: endPoint || baseUrl + query,
                method: "GET",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-Type": "application/json;odata=verbose"
                }
            }).success(function (result) {
                deferred.resolve(result);
            }).error(function (result, status) {
                deferred.reject({
                    error: result,
                    status: status
                });
            });
            return deferred.promise;
        }

        function postRequest(data, url, endPoint) {
            var deferred = $q.defer();
            $http({
                url: endPoint || baseUrl + url,
                method: "POST",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value,
                    "content-Type": "application/json;odata=verbose"
                },
                data: JSON.stringify(data)
            }).success(function (result) {
                deferred.resolve(result);
            }).error(function (result, status) {
                deferred.reject({
                    error: result,
                    status: status
                });
            });
            return deferred.promise;
        }

        function updateRequest(data, url, endPoint) {
            var deferred = $q.defer();
            $http({
                url: endPoint || baseUrl + url,
                method: "PATCH",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value,
                    "content-Type": "application/json;odata=verbose",
                    "X-Http-Method": "PATCH",
                    "If-Match": "*"
                },
                data: JSON.stringify(data)
            }).success(function (result) {
                deferred.resolve(result);
            }).error(function (result, status) {
                deferred.reject({
                    error: result,
                    status: status
                });
            });
            return deferred.promise;
        }

        function deleteRequest(url, endPoint) {
            var deferred = $q.defer();
            $http({
                url: endPoint || baseUrl + url,
                method: "DELETE",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value,
                    "IF-MATCH": "*"
                }
            }).success(function (result) {
                deferred.resolve(result);
            }).error(function (result, status) {
                deferred.reject({
                    error: result,
                    status: status
                });
            });
            return deferred.promise;
        }

        function fileUploadRequest(data, url, endPoint) {
            var deferred = $q.defer();
            $http({
                url: endPoint || baseUrl + url,
                method: "POST",
                processData: false,
                data: data,
                transformRequest: angular.identity,
                headers: {
                    "accept": "application/json;odata=verbose",
                    "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value,
                    "Content-Type": undefined
                }
            }).success(function (result) {
                deferred.resolve(result);
            }).error(function (result, status) {
                deferred.reject({
                    error: result,
                    status: status
                });
            });
            return deferred.promise;
        }
    } 
})(window, document);