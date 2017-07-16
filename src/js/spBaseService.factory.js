(function () {
    'use strict';

    angular.module('spNgModule')
        .factory('$spBaseService', SPBaseService);

    SPBaseService.$inject = ['$q', '$http', '$spNgModuleConfig', '$document'];
    function SPBaseService($q, $http, $spNgModuleConfig, $document) {

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
                method: 'GET',
                headers: {
                    'accept': 'application/json;odata=verbose',
                    'content-Type': 'application/json;odata=verbose'
                }
            }).then(function (response) {
                deferred.resolve(response.data.d.results);
            }, function (response) {
                deferred.reject({
                    error: response.statusText,
                    status: response.status
                });
            });
            return deferred.promise;
        }

        function postRequest(data, url, endPoint) {
            var deferred = $q.defer();
            $http({
                url: endPoint || baseUrl + url,
                method: 'POST',
                headers: {
                    'accept': 'application/json;odata=verbose',
                    'X-RequestDigest': $document[0].getElementById('__REQUESTDIGEST').value,
                    //'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value,
                    'content-Type': 'application/json;odata=verbose'
                },
                data: JSON.stringify(data)
            }).then(function (response) {
                deferred.resolve(response.data.d.results);
            }, function (response) {
                deferred.reject({
                    error: response.statusText,
                    status: response.status
                });
            });
            return deferred.promise;
        }

        function updateRequest(data, url, endPoint) {
            var deferred = $q.defer();
            $http({
                url: endPoint || baseUrl + url,
                method: 'PATCH',
                headers: {
                    'accept': 'application/json;odata=verbose',										
                    'X-RequestDigest': $document[0].getElementById('__REQUESTDIGEST').value,
                    //'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value,
                    'content-Type': 'application/json;odata=verbose',
                    'X-Http-Method': 'PATCH',
                    'If-Match': '*'
                },
                data: JSON.stringify(data)
            }).then(function (response) {
                deferred.resolve(response.data.d.results);
            }, function (response) {
                deferred.reject({
                    error: response.statusText,
                    status: response.status
                });
            });
            return deferred.promise;
        }

        function deleteRequest(url, endPoint) {
            var deferred = $q.defer();
            $http({
                url: endPoint || baseUrl + url,
                method: 'DELETE',
                headers: {
                    'accept': 'application/json;odata=verbose',
                    'X-RequestDigest': $document[0].getElementById('__REQUESTDIGEST').value,
                    //'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value,
                    'IF-MATCH': '*'
                }
            }).then(function (response) {
                deferred.resolve(response.data.d.results);
            }, function (response) {
                deferred.reject({
                    error: response.statusText,
                    status: response.status
                });
            });
            return deferred.promise;
        }

        function fileUploadRequest(data, url, endPoint) {
            var deferred = $q.defer();
            $http({
                url: endPoint || baseUrl + url,
                method: 'POST',
                processData: false,
                data: data,
                transformRequest: angular.identity,
                headers: {
                    'accept': 'application/json;odata=verbose',
                    'X-RequestDigest': $document[0].getElementById('__REQUESTDIGEST').value,
                    //'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value,
                    'Content-Type': undefined
                }
            }).then(function (response) {
                deferred.resolve(response.data.d.results);
            }, function (response) {
                deferred.reject({
                    error: response.statusText,
                    status: response.status
                });
            });
            return deferred.promise;
        }
    }
})();