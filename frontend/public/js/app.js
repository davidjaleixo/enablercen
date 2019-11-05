//http interceptor
function vfosInterceptor() {
    return {
        request: function (config) {
            if (config.url.includes("api")) {
                config.url = "/configurationenabler" + config.url;
                console.log("updating api http request to vfos platform...");
                console.log(config);
            }
            return config;
        },

        requestError: function (config) {
            return config;
        },

        response: function (res) {
            return res;
        },

        responseError: function (res) {
            return res;
        }
    }
}

// public/js/app.js
angular.module('configApp', ['ngRoute', 'ui.bootstrap', 'appRoutes', 'ui-notification'])
    .factory('vfosInterceptor', vfosInterceptor)
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('vfosInterceptor');
    })
