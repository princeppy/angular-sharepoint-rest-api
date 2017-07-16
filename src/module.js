(function (angular) {
    'use strict';

    angular.module('spNgModule', ['ng'])
        .value('$spNgModuleConfig', {
            'isAppWeb': false
        });
})(window, angular);