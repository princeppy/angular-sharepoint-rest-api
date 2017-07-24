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

        // Public 'instance' methods for models
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

        listFactoryObject.prototype.editItem = function (item) {

            if (!(angular.isObject(item))) {
                throw $spListMinErr('badargs', 'item must be a List instance.');
            }

            if (!item.Id) {
                throw $spListMinErr('badargs', 'item id must be valid.');
            }

            var id = item.Id;
            var editItemUrl = this.Url + '/Items(' + id + ')';
            var listHeader = {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'X-RequestDigest': $('#__REQUESTDIGEST').val(),
                'X-HTTP-Method': 'MERGE',
                'IF-MATCH': '*'
            };

            if (!_.contains(this.Items, { 'Id': item.Id })) {
                throw $spListMinErr('badargs', 'item dosen\'t exist in the list.');
            }

            var data = angular.extend({}, item);
            if (!(data.__metadata)) { data.__metadata = this.__metadata; }
            if (!(data.__metadata.type)) { data.__metadata.type = this.__metadata.type; }

            return $http({
                url: editItemUrl,
                data: JSON.stringify(data),
                method: 'PATCH',
                headers: listHeader
            });
        };

        listFactoryObject.prototype.deleteItem = function (id) {

            if (!id) {
                throw $spListMinErr('badargs', 'item id must be valid.');
            }

            var deleteItemUrl = this.Url + '/Items(' + id + ')';
            var listHeader = {
                'Accept': 'application/json;odata=verbose',
                'X-RequestDigest': $('#__REQUESTDIGEST').val(),
                'X-HTTP-Method': 'DELETE',
                'IF-MATCH': '*'
            };


            if (!_.contains(this.Items, { 'Id': id })) {
                throw $spListMinErr('badargs', 'item dosen\'t exist in the list.');
            }

            var data = angular.extend({}, {'Id':id});
            if (!(data.__metadata)) { data.__metadata = this.__metadata; }
            if (!(data.__metadata.type)) { data.__metadata.type = this.__metadata.type; }

            return $http({
                url: deleteItemUrl,
                data: JSON.stringify(data),
                method: 'DELETE',
                headers: listHeader
            });
        };
        return listFactoryObject;
    }
})();
