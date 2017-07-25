(function () {
    'use strict';

    // var title, listOptions;
    angular.module('spNgModule')
        .factory('$spListService', SPListService);

    SPListService.$inject = ['$q', '$http', '$spNgModuleConfig', '$document', '$spConvertService', '$timeout'];
    function SPListService($q, $http, $spNgModuleConfig, $document, $spConvert, $timeout) {

        String.prototype.trimStart = function (c) { if (c === undefined) { c = '\s'; } return this.replace(new RegExp('^[' + c + ']+'), ''); };
        String.prototype.trimEnd = function (c) { if (c === undefined) { c = '\s'; } return this.replace(new RegExp('[' + c + ']+$'), ''); };
        String.prototype.trim = function (c) { return this.trimStart(c).trimEnd(c); };

        var $spListMinErr = angular.$$minErr('$spList');
        var baseUrl = _spPageContextInfo.webAbsoluteUrl;
        var baseAPIUrl = baseUrl.trimEnd('/') + '/_api/web/lists/';
        var listHeader = {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-RequestDigest': $('#__REQUESTDIGEST').val(),
            'X-HTTP-Method': 'GET'
        };

        /**
         * Constructor, with class name
         */
        var listFactoryObject = function (title, listOptions) {
            // Public properties, assigned to the instance ('this')
            if (!angular.isString(title) || title === '') {
                throw $spListMinErr('badargs', 'title must be a nen-empty string.');
            }

            var thisList = Object.create(this);

            thisList.baseUrl = baseUrl;
            thisList.baseAPIUrl = baseAPIUrl;

            thisList.title = title;
            thisList.listOptions = angular.extend({}, listOptions || {});

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
            thisList.Url = baseAPIUrl + 'GetByTitle(\'' + thisList.title + '\')';
            thisList.Exist = false;
            var httpPromise = $http({
                url: thisList.Url,
                method: 'GET',
                headers: angular.extend({}, listHeader, { 'X-HTTP-Method': 'GET' })
            });
            var derivedPromise = httpPromise.then(function (response) {
                thisList.Exist = true;
                // console.log('2.0', JSON.stringify(thisList, null, 2));
                return thisList.init();
            }, function (error) {
                thisList.Exist = false;
                // console.log('2.1', JSON.stringify(thisList, null, 2));
                throw $spListMinErr('badargs', 'List with title \'' + thisList.title + '\' dosent exit.!!!');
            });
            // thisList.$promise = derivedPromise;
            // console.log('1', JSON.stringify(thisList, null, 2));
            return thisList;
        };

        /**
         * Public method, assigned to prototype
        */
        listFactoryObject.prototype.init = function () {
            var thisList = this;
            // console.log('listFactoryObject.prototype.init');

            var listUrl = this.Url + '?$expand=ContentTypes';
            listUrl += ',Fields';
            listUrl += ',Items,Items/AttachmentFiles';
            this.listUrl = listUrl;

            var httpPromise = $http({
                url: listUrl,
                method: 'GET',
                headers: angular.extend({}, listHeader, { 'X-HTTP-Method': 'GET' })
            });

            //transform response
            var defer = $q.defer();

            httpPromise.then(function (response) {
                // // console.log('3.1', JSON.stringify(thisList, null, 2));
                // console.log('3.1', thisList);
                // console.log('results from => ', listUrl);
                // console.log('3.0', JSON.stringify(thisList, null, 2));
                thisList.Url = response.data.d.__metadata.uri;
                thisList.etag = response.data.d.__metadata.etag.toString();
                thisList.AllowContentTypes = response.data.d.AllowContentTypes;
                thisList.BaseTemplate = response.data.d.BaseTemplate;
                thisList.ContentTypesEnabled = response.data.d.ContentTypesEnabled;
                thisList.EnableAttachments = response.data.d.EnableAttachments;
                thisList.EnableFolderCreation = response.data.d.EnableFolderCreation;
                thisList.EnableMinorVersions = response.data.d.EnableMinorVersions;
                thisList.EnableModeration = response.data.d.EnableModeration;
                thisList.EnableVersioning = response.data.d.EnableVersioning;
                thisList.EntityTypeName = response.data.d.EntityTypeName;
                thisList.Hidden = response.data.d.Hidden;
                thisList.Id = response.data.d.Id;
                thisList.ItemCount = response.data.d.ItemCount;
                thisList.ParentWebUrl = response.data.d.ParentWebUrl;
                thisList.Title = response.data.d.Title;
                thisList.ListItemEntityTypeFullName = response.data.d.ListItemEntityTypeFullName;
                thisList.ContentTypes = response.data.d.ContentTypes.results.map(function (item) {
                    return {
                        'Id': item.Id.StringValue,
                        'Name': item.Name
                    };
                });
                thisList.Fields = response.data.d.Fields.results
                    .filter(function (item) { return item.ReadOnlyField === false; })
                    .map(function (item) {
                        return {
                            'Title': item.Title,
                            'StaticName': item.StaticName,
                            'InternalName': item.InternalName,
                            'Type': item.__metadata.type
                        };
                    });
                thisList.Items = [];
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
                }, thisList.Items);
                defer.resolve(thisList);
            });
            return defer.promise;
        };
        listFactoryObject.prototype.createItem = function (item) {
            var thisList = this;
            if (!(angular.isObject(item))) {
                throw $spListMinErr('badargs', 'item must be a List instance.');
            }

            var addNewItemUrl = thisList.Url + '/Items';
            // console.log('addNewItemUrl => ', addNewItemUrl);
            var data = angular.extend({}, item);
            if (!(data.__metadata)) { data.__metadata = thisList.__metadata; }
            if (!(data.__metadata.type)) { data.__metadata.type = thisList.__metadata.type; }
            // console.log('addNewItemData => ', JSON.stringify(data));

            var defer = $q.defer();
            $http({
                url: addNewItemUrl,
                data: JSON.stringify(data),
                method: 'POST',
                headers: angular.extend({}, listHeader, { 'X-HTTP-Method': 'POST' })
            }).then(function (response) {
                // console.log(response);
                var itm = response.data.d;
                itm.metadatatype = itm.__metadata.type;
                itm.uri = itm.__metadata.uri;
                itm.etag = itm.__metadata.etag.toString();
                var newItem = _.omit(itm, ['__metadata', 'ID', 'FirstUniqueAncestorSecurableObject', 'RoleAssignments', 'AttachmentFiles', 'ContentType', 'GetDlpPolicyTip', 'FieldValuesAsHtml', 'FieldValuesAsText', 'FieldValuesForEdit', 'File', 'Folder', 'ParentList', 'FileSystemObjectType', 'OData__UIVersionString', 'AuthorId', 'EditorId']);
                newItem.Attachments = [];
                if (newItem.Attachments) {
                    var attachmentUrl = thisList.Url + '/Items(' + newItem.Id + ')/?$expand=AttachmentFiles';
                    var _attachments = [];
                    $http({
                        url: attachmentUrl,
                        method: 'GET',
                        headers: angular.extend({}, listHeader, { 'X-HTTP-Method': 'GET' })
                    }).then(function (response) {
                        _attachments = response.data.d.AttachmentFiles.results.map(function (fl) {
                            return {
                                'FileName': fl.FileName,
                                'FileUrl': _spPageContextInfo.webAbsoluteUrl + '/' + fl.ServerRelativeUrl
                            };
                        });
                        newItem.Attachments = _attachments;

                        defer.resolve(newItem);
                    }, function (error) {
                        defer.resolve(newItem);
                    });
                } else {
                    defer.resolve(newItem);
                }
                //thisList.Items.push(newItem);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        };
        listFactoryObject.prototype.editItem = function (item) {
            if (!(angular.isObject(item))) {
                throw $spListMinErr('badargs', 'item must be a List instance.');
            }
            var addNewItemUrl = this.Url + '/Items';
            var data = angular.extend({}, item);
            if (!(data.__metadata)) { data.__metadata = this.__metadata; }
            if (!(data.__metadata.type)) { data.__metadata.type = this.__metadata.type; }

            return $http({
                url: addNewItemUrl,
                data: JSON.stringify(data),
                method: 'POST',
                headers: angular.extend({}, listHeader, { 'X-HTTP-Method': 'MERGE' })
            });
        };
        listFactoryObject.prototype.deleteItem = function (id) {

            if (!id) {
                throw $spListMinErr('badargs', 'item id must be valid.');
            }

            var editItemUrl = this.Url + '/Items(' + id + ')';

            if (!_.contains(this.Items, { 'Id': id })) {
                throw $spListMinErr('badargs', 'item dosen\'t exist in the list.');
            }

            var data = angular.extend({}, { 'Id': id });
            if (!(data.__metadata)) { data.__metadata = this.__metadata; }
            if (!(data.__metadata.type)) { data.__metadata.type = this.__metadata.type; }

            return $http({
                url: editItemUrl,
                data: JSON.stringify(data),
                method: 'DELETE',
                headers: angular.extend({}, listHeader, { 'X-HTTP-Method': 'DELETE', 'IF-MATCH': '*' })
            });
        };

        return listFactoryObject;
        // return function (title, listOptions) {
        //     return function () {
        //         console.log(title, listOptions);
        //     };
        // };
    }
})();