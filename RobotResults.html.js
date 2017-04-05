(function () {
    'use strict';

    angular.module('angie').controller('RobotResultsController', RobotResultsController);

    RobotResultsController.$inject = ['localStorage', 'balanceValueStorageName'];

    function RobotResultsController(localStorage, balanceValueStorageName) {
        var vm = this;

        var resultsString = localStorage.getItem(balanceValueStorageName);
        vm.humanness = Number(resultsString);
    }
})();