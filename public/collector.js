//Defines the rule context
'use strict'
angular.module('collector', ['hop.directives', 'rules', 'rulesContext'])
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

function listController($scope) {
    $scope.removeArtifact = function (artifact) {
        $scope.rules.removeValue(artifact);
    };
}

function appController($scope, rulesRepo, ruleContext) {
    $scope.rules = rulesRepo.repository;
}

function ruleController($scope, ruleFactory, ruleContext, comment, condition, action) {
    $scope.commentsDetailBtnVisible = false;
    $scope.limit = 1;
    $scope.commentsDetailBtn = 'More';

    var resetEditContext = function () {
        $scope.currentContext = ruleContext.newEditScope($scope.currentRule);
    };

    $scope.addRule = function () {
        $scope.rules.addValue($scope.currentRule);
        $scope.currentRule = undefined;
        $scope.currentContext = undefined;
    };

    $scope.newRule = function () {
        $scope.currentRule = ruleFactory.newInstance();
        $scope.currentContext = ruleContext.newEditScope($scope.currentRule);
    };

    //TODO: probably is a good idea to get rid of currentRule instance
    $scope.updateArtifact = function (artifact) {
        var clone = angular.copy(artifact);
        artifact.dirty = true;
        $scope.currentRule = clone;
        $scope.currentContext = ruleContext.newEditScope($scope.currentRule);
    };

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

    $scope.editComment = function (updateable) {
        $scope.currentContext = comment.newEditContext(updateable);
    };

    $scope.editCondition = function (selected) {
        $scope.currentContext = condition.newEditContext(selected);
    };

    $scope.editAction = function(selected) {
      $scope.currentContext = action.newEditContext(selected);
    }

    $scope.activeForMode = function (mode) {
        if ($scope.mode === mode) {
            return 'active';
        }
    };

    $scope.applyEditContext = function () {
        $scope.currentContext.applyChanges();
        resetEditContext();
    };

    $scope.discardContext = function () {
        resetEditContext();
    };
}