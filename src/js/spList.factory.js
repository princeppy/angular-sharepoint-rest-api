(function () {
    'use strict';

    angular.module('spNgModule')
        .factory('$spListService', SPListService);

    SPListService.$inject = ['$q', '$http', '$spNgModuleConfig', '$document', '$spConvertService'];
    function SPListService($q, $http, $spNgModuleConfig, $document, $spConvert) {
        var $spListMinErr = angular.$$minErr('$spList');
        var baseUrl = _spPageContextInfo.webAbsoluteUrl;
        var baseAPIUrl = baseUrl.trimEnd('/') + '/_api/web/lists/';

        String.prototype.trimStart = function (c) { if (c === undefined) { c = '\s'; } return this.replace(new RegExp('^[' + c + ']+'), ''); };
        String.prototype.trimEnd = function (c) { if (c === undefined) { c = '\s'; } return this.replace(new RegExp('[' + c + ']+$'), ''); };
        String.prototype.trim = function (c) { return this.trimStart(c).trimEnd(c); };

        /*
        * Constructor function
        */
        var listFactoryObject = function (title, listOptions) {
            if (!angular.isString(title) || title === '') {
                throw $spListMinErr('badargs', 'title must be a nen-empty string.');
            }

            this.title = title;
            this.listOptions = angular.extend({}, listOptions || {});

            this.baseUrl = baseUrl;
            this.baseAPIUrl = baseAPIUrl;

            this.normalizedTitle = $spConvert.capitalize(this.title
                .replace(/[^A-Za-z0-9 ]/g, '')      // remove invalid chars
                .replace(/\s/g, '_x0020_')          // replace whitespaces with _x0020_
            );
            this.className = $spConvert.capitalize(this.normalizedTitle
                .replace(/_x0020/g, '')             // remove _x0020_
                .replace(/^\d+/, '')                // remove leading digits
            );
            this.listItemType = 'SP.Data.' + this.normalizedTitle + 'ListItem';
            this.__metadata = { type: this.listItemType };
            this.Url = baseAPIUrl + 'GetByTitle(\'' + this.title + '\')';
        };

        /*
        * Prototypal setup
        */
        listFactoryObject.prototype = {
            init: function () {
                var listUrl = this.Url + '?$expand=ContentTypes';
                listUrl += ',Fields';
                listUrl += ',Items,Items/AttachmentFiles';
                this.listUrl = listUrl;

                var listHeader = {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': $('#__REQUESTDIGEST').val(),
                    'X-HTTP-Method': 'GET'
                };

                var httpPromise = $http({ url: listUrl, method: 'GET', headers: listHeader });

                //transform response
                var derivedPromise = httpPromise.then(function (response) {
                    console.log('results from => ', listUrl);
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

                });

                return derivedPromise;
            },
            createItem: function (item) { },
            editItem: function (item) { },
            deleteItem: function (id) { },
        }

        return listFactoryObject;
    }
})();
