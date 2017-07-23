/*
 * V2.0
 */
(function () {
    'use strict';

    angular.module('spNgModule', ['ng'])
        .value('$spNgModuleConfig', {
            'isAppWeb': false
        });
})();
    

(function () {
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
})();

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

(function () {
  'use strict';
  /**
   * @ngdoc object
   * @name $spConvert
   *
   * @description The `$spConvert` service exposes functions
   *  that convert (arrays of) EDM datatypes to javascript
   *  values or objects and the search results containing them.
   */
  angular.module('spNgModule')
    .factory('$spConvertService', function () {

      var assertType = function (type, obj) {
        if (!angular.isObject(obj.__metadata) || obj.__metadata.type !== type) {
          throw $spConvertMinErr('badargs', 'expected argument to be of type {0}.', type);
        }
      };

      var $spConvertMinErr = angular.$$minErr('$spConvert');
      var $spConvert = {
        /**
         * @ngdoc method
         * @name $spConvert#spKeyValue
         * @methodOf $spConvert
         *
         * @description Convert a SP.KeyValue object to a their native
         *   Javascript value.
         *
         * @param {Object} keyValue SP.KeyValue instance
         *
         * @return {*} converted value
         */
        spKeyValue: function (keyValue) {
          assertType('SP.KeyValue', keyValue);
          var value = keyValue.Value;

          switch (keyValue.ValueType) {
            case 'Edm.Double':
            case 'Edm.Float':
              return parseFloat(value);
            case 'Edm.Int16':
            case 'Edm.Int32':
            case 'Edm.Int64':
            case 'Edm.Byte':
              return parseInt(value, 10);
            case 'Edm.Boolean':
              return value === 'true';
            default:
              return value;
          }
        },

        /**
         * @ngdoc method
         * @name $spConvert#spKeyValueArray
         * @methodOf $spConvert
         *
         * @description Convert an array of SP.KeyValue objects to an array
         *   of native Javascript values.
         *
         * @param {Array.<SP.KeyValue>} keyValues Array of SP.KeyValue objects
         *
         * @return {Array} Array of converted values
         */
        spKeyValueArray: function (keyValues) {
          var result = {};

          for (var i = 0, l = keyValues.length; i < l; i += 1) {
            var keyValue = keyValues[i];
            var key = keyValue.Key;
            result[key] = $spConvert.spKeyValue(keyValue);
          }

          return result;
        },

        /**
         * @ngdoc method
         * @name $spConvert#spSimpleDateRow
         * @methodOf $spConvert
         *
         * @description Convert an SP.SimpleDateRow object to an array
         *   of native Javascript values.
         *
         * @param {Object} row SP.SimpleDataRow object
         *
         * @return {Array} Array of cell values
         */
        spSimpleDataRow: function (row) {
          assertType('SP.SimpleDataRow', row);
          var cells = row.Cells.results || [];

          return $spConvert.spKeyValueArray(cells);
        },

        /**
         * @ngdoc method
         * @name $spConvert#spSimpleDateTable
         * @methodOf $spConvert
         *
         * @description Convert an SP.SimpleDateTable object to an array (rows)
         *   of arrays (cells).
         *
         * @param {Object} row SP.SimpleDataTable object
         *
         * @return {Array.<Array>} Array of arrays of converted values
         */
        spSimpleDataTable: function (table) {
          assertType('SP.SimpleDataTable', table);
          var result = [];
          var rows = table.Rows.results || [];

          for (var i = 0, l = rows.length; i < l; i += 1) {
            var row = rows[i];
            result.push($spConvert.spSimpleDataRow(row));
          }

          return result;
        },

        /**
         * @ngdoc method
         * @name $spConvert#searchResult
         * @methodOf $spConvert
         *
         * @description Convert a complete Microsoft.Office.Server.Search.REST.SearchResult
         *   to a  more usable data structure.
         *
         *    - camelCase all properties
         *    - convert arrays of SP.KeyValue objects
         *    - convert SP.SimpleDataTable objects
         *
         * @param {Object} searchResult REST Search result
         *
         * @return {Object} Converted search result
         */
        searchResult: function (searchResult) {
          assertType('Microsoft.Office.Server.Search.REST.SearchResult', searchResult);
          var primaryQueryResult = searchResult.PrimaryQueryResult;

          var result = {
            elapsedTime: searchResult.ElapsedTime,
            spellingSuggestion: searchResult.SpellingSuggestion,
            properties: $spConvert.spKeyValueArray(searchResult.Properties.results),
            primaryQueryResult: {
              queryId: primaryQueryResult.QueryId,
              queryRuleId: primaryQueryResult.QueryRuleId,
              relevantResults: $spConvert.spSimpleDataTable(primaryQueryResult.RelevantResults.Table),
              customResults: primaryQueryResult.CustomResults,
              refinementResults: primaryQueryResult.RefinementResults,
              specialTermResults: primaryQueryResult.SpecialTermResults
            }
          };

          return result;
        },

        /**
         * @ngdoc method
         * @name $spConvert#suggestResult
         * @methodOf $spConvert
         *
         * @description **NYI**
         *
         * @param {Object} suggestResult REST Search Suggest result
         *
         * @return {Object} REST Search Suggest result
         */
        suggestResult: function (suggestResult) {
          // TODO implement
          return suggestResult;
        },

        /**
         * @ngdoc method
         * @name $spConvert#userResult
         * @methodOf $spConvert
         *
         * @description Convert a SP.UserProfiles.PersonProperties object
         *   to a more usable data structure.
         *
         *    - camelCase all properties
         *    - convert arrays of SP.KeyValue objects
         *
         * @param {Object} userResult REST User Profiles result
         *
         * @return {Object} Converted user profile
         */
        userResult: function (userResult) {
          assertType('SP.UserProfiles.PersonProperties', userResult);

          var result = {
            accountName: userResult.AccountName,
            displayName: userResult.DisplayName,
            email: userResult.Email,
            isFollowed: userResult.IsFollowed,
            personalUrl: userResult.PersonalUrl,
            pictureUrl: userResult.PictureUrl,
            profileProperties: $spConvert.spKeyValueArray(userResult.UserProfileProperties.results),
            title: userResult.Title,
            userUrl: userResult.UserUrl
          };

          return result;
        },

        /**
         * @ngdoc method
         * @name $spConvert#capitalize
         * @methodOf $spConvert
         *
         * @description Capitalize a string
         *
         * @param {string} str string
         *
         * @return {string} capitalied string
         */
        capitalize: function (str) {
          if (angular.isUndefined(str) || str === null) {
            return null;
          }
          return str.charAt(0).toUpperCase() + str.slice(1);
        }
      };

      return $spConvert;
    });

})();

(function () {
    'use strict';

    angular.module('spNgModule')
        .factory('$spListService', SPListService);

    SPListService.$inject = ['$q', '$http', '$spNgModuleConfig', '$document', '$spConvertService'];
    function SPListService($q, $http, $spNgModuleConfig, $document, $spConvert) {
        var $spListMinErr = angular.$$minErr('$spList');

        String.prototype.trimStart = function (c) { if (c === undefined) { c = '\s'; } return this.replace(new RegExp('^[' + c + ']+'), ''); };
        String.prototype.trimEnd = function (c) { if (c === undefined) { c = '\s'; } return this.replace(new RegExp('[' + c + ']+$'), ''); };
        String.prototype.trim = function (c) { return this.trimStart(c).trimEnd(c); };

        // Constructor function for models
        function listFactoryObject(title, listOptions) {
            if (!angular.isString(title) || title === '') {
                throw $spListMinErr('badargs', 'title must be a nen-empty string.');
            }

            // var baseUrl = $spNgModuleConfig.isAppWeb ? _spPageContextInfo.webAbsoluteUrl : _spPageContextInfo.siteAbsoluteUrl;
            var baseUrl = _spPageContextInfo.webAbsoluteUrl;
            var baseAPIUrl = baseUrl.trimEnd('/') + '/_api/web/lists/';

            var thisList = Object.create(
                {
                    title: title,
                    baseUrl: baseUrl,
                    baseAPIUrl: baseAPIUrl
                });
            // thisList.title = title;

            // console.log('SPListService,listFactoryObject', title, listOptions);
            if (!angular.isObject(listOptions)) { listOptions = {}; }
            thisList.listOptions = listOptions;
            thisList.normalizedTitle = $spConvert.capitalize(thisList.title
                .replace(/[^A-Za-z0-9 ]/g, '')      // remove invalid chars
                .replace(/\s/g, '_x0020_')          // replace whitespaces with _x0020_
            );
            thisList.className = $spConvert.capitalize(thisList.normalizedTitle
                .replace(/_x0020/g, '')             // remove _x0020_
                .replace(/^\d+/, '')                // remove leading digits
            );
            thisList.listItemType = 'SP.Data.' + thisList.normalizedTitle + 'ListItem';
            thisList.__metadata = { type: thisList.listItemType };

            var listUrl = baseAPIUrl + 'GetByTitle(\'' + title + '\')?$expand=ContentTypes';
            listUrl += ',Fields';
            listUrl += ',Items,Items/AttachmentFiles';
            thisList.listUrl = listUrl;

            console.log('returning from SPListService:', title, JSON.stringify(thisList, null, 4));
            return thisList; //.get();
        }

        // Public "instance" methods for models
        listFactoryObject.prototype.get = function () {

            var listHeader = {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'X-RequestDigest': $('#__REQUESTDIGEST').val(),
                'X-HTTP-Method': 'GET'
            };

            var httpPromise = $http({ url: listUrl, method: 'GET', headers: listHeader });

            //transform response
            var derivedPromise = httpPromise.then(function (response) {
                console.log('calling ', listUrl);
                this.Url = response.data.d.__metadata.uri;
                this.etag = response.data.d.__metadata.etag.toString();
                this.AllowContentTypes = response.data.d.AllowContentTypes;
                this.BaseTemplate = response.data.d.BaseTemplate;
                this.ContentTypesEnabled = response.data.d.ContentTypesEnabled;
                this.EnableAttachments = response.data.d.EnableAttachments;
                this.EnableFolderCreation = response.data.d.EnableFolderCreation;
                this.EnableMinorVersions = response.data.d.EnableMinorVersions;
                this.EnableModeration = response.data.d.EnableModeration;
                this.EnableVersioning = response.data.d.EnableVersioning;
                this.EntityTypeName = response.data.d.EntityTypeName;
                this.Hidden = response.data.d.Hidden;
                this.Id = response.data.d.Id;
                this.ItemCount = response.data.d.ItemCount;
                this.ParentWebUrl = response.data.d.ParentWebUrl;
                this.Title = response.data.d.Title;
                this.ListItemEntityTypeFullName = response.data.d.ListItemEntityTypeFullName;
                this.ContentTypes = response.data.d.ContentTypes.results.map(function (item) {
                    return {
                        'Id': item.Id.StringValue,
                        'Name': item.Name
                    };
                });
                this.Fields = response.data.d.Fields.results
                    .filter(function (item) { return item.ReadOnlyField === false; })
                    .map(function (item) {
                        return {
                            'Title': item.Title,
                            'StaticName': item.StaticName,
                            'InternalName': item.InternalName,
                            'Type': item.__metadata.type
                        };
                    });
                this.Items = [];
                angular.forEach(response.data.d.Items.results, function (value, key) {
                    value.metadatatype = value.__metadata.type;
                    value.uri = value.__metadata.uri;
                    value.etag = value.__metadata.etag.toString();
                    if (value.Attachments) {
                        var _attachments = [];
                        _attachments = value.AttachmentFiles.results.map(function (fl) {
                            // console.log('fl',fl);
                            return {
                                'FileName': fl.FileName,
                                'FileUrl': _spPageContextInfo.webAbsoluteUrl + '/' + fl.ServerRelativeUrl
                            };
                        });
                        value.Attachments = _attachments;
                    }
                    this.push(_.omit(value, ['__metadata', 'ID', 'FirstUniqueAncestorSecurableObject', 'RoleAssignments', 'AttachmentFiles', 'ContentType', 'GetDlpPolicyTip', 'FieldValuesAsHtml', 'FieldValuesAsText', 'FieldValuesForEdit', 'File', 'Folder', 'ParentList', 'FileSystemObjectType', 'OData__UIVersionString', 'AuthorId', 'EditorId']));
                }, this.Items);

                console.log('returning from SPListService.$http call:', listUrl, JSON.stringify(thisList, null, 4));
                return thisList;
            });

            //attach promise to object
            this.$promise = derivedPromise;

            console.log('returning from SPListService.get():', title, JSON.stringify(thisList, null, 4));
            return this;
        };

        listFactoryObject.prototype.createItem = function (item) {
            if (!(angular.isObject(item))) {
                throw $spListMinErr('badargs', 'item must be a List instance.');
            }
            var addNewItemUrl = this.Url + '/Items';

            var listHeader = {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'X-RequestDigest': $('#__REQUESTDIGEST').val(),
                'X-HTTP-Method': 'POST'
            };

            var data = angular.extend({}, item);
            if (!(data.__metadata)) { data.__metadata = this.__metadata; }
            if (!(data.__metadata.type)) { data.__metadata.type = this.__metadata.type; }

            return $http({
                url: addNewItemUrl,
                data: JSON.stringify(data),
                method: 'POST',
                headers: listHeader
            });

        };

        listFactoryObject.prototype.removeItem = function (id) {
            // ...
        };
        return listFactoryObject;
    }
})();
