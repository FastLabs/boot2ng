//Defines the rule context
'use strict'
angular.module('rulesContext', ['artifact','utils'])
    .config(function () {

    }).factory('rule', function (artifact, parser) {
        var getRules = function () {
            return [
                {
                    name:'check the account number',
                    attributes: {id: 'Rule2'}

                }
                ,
                {
                    name:'check the issuer bin',
                    attributes: {id: 'Rule1'}
                }
            ];
        };
        var saveRule = function ($scope) {
            artifact.addArtifact($scope.rules, $scope.currentRule);
            $scope.currentRule = undefined;
        };

        var commandsMap = {
            "save":saveRule
        };

        var dispatchCommand = function (command, ruleContext) {
            var command = commandsMap[command];
            command(ruleContext);
        };

        var registerAttribute = function (context, attribute) {
            context.attributes[attribute.name] = attribute.value;
        };

        var updateScope = function ($scope) {
            if ($scope.currentRule === undefined) {
                $scope.currentRule = new Rule();
                $scope.currentRule.name = $scope.text;
                console.log('new rule created');
            } else {
                if ($scope.text !== undefined) {
                    var startElement = $scope.text.charAt(0);
                    var value = $scope.text.substring(1, $scope.text.length);
                    if (value !== undefined && value.length > 0) {
                        if (startElement === '!') {
                            $scope.currentRule.actions.push(value);
                        } else if (startElement === '?') {
                            $scope.currentRule.conditions.push(value);
                        } else if (startElement === '$') {
                            dispatchCommand(value, $scope);
                        } else if (startElement === '@') {
                            var separated = parser.splitAttribute(value);
                            if (separated !== undefined) {
                                $scope.currentRule.attributes [separated.name] = separated.value;
                            }
                        } else {
                            $scope.currentRule.comment = $scope.text;
                        }
                    }

                }
            }
            $scope.text = '';
        };

        return {
            getData: getRules,
            updateScope: updateScope,
            removeArtifact: artifact.removeArtifact
        }
    });

angular.module('collector', ['rules', 'rulesContext'])
    .config(function ($routeProvider) {
        $routeProvider.when('/', {controller:ruleController, templateUrl:'rulelist.html'});
        $routeProvider.when('/:context', {controller:ruleController, templateUrl:'rulelist.html'});
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

function Rule() {
    this.actions = [];
    this.name = 'simple rule';
    this.conditions = [];
    this.attributes = {};
}

function GroupBox () {
    var selectedItem = '';

    this.isSelected = function (item) {
        return this.selectedItem === item?'active':'';
    };

    this.selectItem = function (item) {
        console.log(item);
        this.selectedItem = item;
    };
}

function ruleController($scope, rule) {
    $scope.rules = rule.getData();
    $scope.commandBox = new GroupBox();
    $scope.commandBox.selectItem('search');

    $scope.enterSearchMode = function () {
        $scope.commandBox.selectItem('search');
    };

    $scope.enterInputMode = function() {
        $scope.commandBox.selectItem('enter');
    };

    $scope.removeArtifact = function(artifact) {
      rule.removeArtifact($scope.rules, artifact);
    };

    $scope.isInputMode = function () {
        return $scope.commandBox.isSelected("enter");
    };

    $scope.isSearchMode = function () {
        return $scope.commandBox.isSelected("search");
    }

    $scope.updateRule = function () {
        rule.updateScope( $scope);
    }
}