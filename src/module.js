(function () {
    'use strict';

    angular.module('spNgModule', ['ng'])
        .value('$spNgModuleConfig', {
            'isAppWeb': false
        });
})();