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
