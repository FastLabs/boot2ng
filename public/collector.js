//Defines the rule context
'use strict'
angular.module('collector', ['hopModule', 'rules', 'rulesContext'])
    .config(function ($routeProvider) {
        $routeProvider.when('/', { templateUrl:'rulelist.html'});
        $routeProvider.when('/:context', { templateUrl:'rulelist.html'});
    });

//Defines the entity model context
angular.module('entityContext', [])
    .config(function () {

    }).factory('entity', function () {
        var getEntities = function () {
            return [
                {
                    name:'first entity'
                }
                ,
                {
                    name:'second entity'
                }
            ];
        };

        return {
            getData:getEntities
        }
    });

function GroupBox() {
    var selectedItem = '';

    this.isSelected = function (item) {
        return this.selectedItem === item ? 'active' : '';
    };

    this.selectItem = function (item) {
        console.log(item);
        this.selectedItem = item;
    };
}


function listController($scope) {
    $scope.removeArtifact = function (artifact) {
        $scope.rules.removeValue(artifact);
    };
}

function appController($scope, rule, rulesRepo) {
    $scope.rules = rulesRepo.repository;


    $scope.updateArtifact = function (artifact) {
        var clone = angular.copy(artifact);
        artifact.dirty = true;
        $scope.currentRule = clone;
    };

    $scope.addRule = function () {
        $scope.rules.addValue($scope.currentRule);
        $scope.currentRule = undefined;
    }

    $scope.newRule = function () {
        $scope.currentRule = rule.newInstance();
    }

}

function ruleController($scope, rule) {

    $scope.commentsDetailBtnVisible = false;
    $scope.limit = 1;
    $scope.commentsDetailBtn = 'More';

    $scope.showAllComments = function () {
        if ($scope.limit == 1) {
            $scope.limit = $scope.currentRule.comments.length;
            $scope.commentsDetailBtn = 'Less';
        } else {
            $scope.limit = 1;
            $scope.commentsDetailBtn = 'More';
        }
    };

    $scope.switchRuleMode = function (newMode) {
        if ($scope.mode === newMode) {
            $scope.mode = undefined;
        } else {
            $scope.mode = newMode;
        }
    };
    $scope.activeForMode = function (mode) {
        if ($scope.mode === mode) {
            return 'active';
        }
    };

    $scope.updateRule = function () {
        rule.updateScope($scope);
    }
}