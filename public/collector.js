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

function CollectionRepository (initial) {
    var values = [];
    if(initial) {
        values = initial;
    }

    this.addValue = function(value) {
        console.log('add new value to repository');
        for(var i in values) {
            var current = values[i]
            if(current.dirty === true) {
                if(current.id === value.id) {
                   values.splice(i, 1);
                }
            }
        }
        values.push(value);
        value.setModified(false);//TODO: understand how this will affect server side synchronization
    };

    this.removeValue = function(value) {
       if(value) {
           var artifactId = value.attributes.id
           for(var i in values) {
               if(values[i].attributes.id === artifactId) {
                   values.splice(i, 1);
               }
           }
       }
    };

    //if used in UI binding cache the value so this function
    //will be called once
    this.values = function() {
        return values;
    }
}

function listController ($scope) {
    $scope.removeArtifact = function (artifact) {
        $scope.rules.removeValue(artifact);
    };
}

function appController($scope, rule) {
    $scope.rules = new CollectionRepository(rule.getData());


    $scope.updateArtifact = function(artifact) {
        var clone = angular.copy(artifact);
        artifact.dirty = true;
        $scope.currentRule = clone;
    };

    $scope.addRule = function() {
        $scope.rules.addValue($scope.currentRule);
        $scope.currentRule = undefined;
    }

    $scope.newRule = function() {
        $scope.currentRule = rule.newInstance();
    }

}

function ruleController($scope, rule) {

    $scope.commentsDetailBtnVisible = false;
    $scope.limit = 1;
    $scope.commentsDetailBtn = 'More';

    $scope.showAllComments = function() {
      if($scope.limit == 1) {
        $scope.limit = $scope.currentRule.comments.length;
        $scope.commentsDetailBtn = 'Less';
      } else {
          $scope.limit = 1;
          $scope.commentsDetailBtn = 'More';
      }
    };

    $scope.updateRule = function () {
        rule.updateScope($scope);
    }
}