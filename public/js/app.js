var App = angular.module('App', [
    'ngRoute', 'ngAnimate', 'mcCtrls', 'mcFilters',
    'mcServices', 'mcDirectives','netServices',
]);

App.config(function($routeProvider) {
    $routeProvider.when('/login', {
        templateUrl : 'tpls/loginin.html',
        controller : 'UserInfoCtrl'
    }).when('/lf', {
        templateUrl : 'tpls/fl.html',
        controller :  'UserInfoCtrl'
    }).otherwise({
        redirectTo :  '/login'
    })
});