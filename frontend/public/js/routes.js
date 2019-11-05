// public/js/routes.js
angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        .when('/',{
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        })
        // home page
        .when('/manage/:enablerid', {
            templateUrl: 'views/manage.html',
            controller: 'ManageController'
        })
        .when('/config/v2/:enablerid', {
            templateUrl: 'views/config2.html',
            controller: 'SecondVersion'
        })
        .when('/config/:enablerid', {
            templateUrl: 'views/config.html',
            controller: 'MainController'
        });

        // nerds page that will use the NerdController
        /*.when('/nerds', {
            templateUrl: 'views/nerd.html',
            controller: 'NerdController'
        });*/

    $locationProvider.html5Mode(true);

}]);