//Defines the rule context
'use strict'
angular.module('rulesContext', ['artifact', 'utils'])
    .config(function () {

    }).factory('rule', function (artifact, parser) {
        var getRules = function () {
            return [
                {
                    name:'check the account number',
                    attributes:{id:'Rule2'},
                    conditions:[],
                    actions:[]

                }
                ,
                {
                    name:'check the issuer bin',
                    attributes:{id:'Rule1'},
                    conditions:[],
                    actions:[]
                },
                {
                    name:'check the issuer bin1',
                    attributes:{id:'Rule3'},
                    conditions:[],
                    actions:[]
                }
            ];
        };
        var saveRule = function ($scope) {
            $scope.rules.addValue($scope.currentRule);
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
                            $scope.currentRule.addAction(value);
                        } else if (startElement === '?') {
                            $scope.currentRule.addCondition(value);
                        } else if (startElement === '$') {
                            dispatchCommand(value, $scope);
                        } else if (startElement === '@') {
                            var separated = parser.splitAttribute(value);
                            if (separated !== undefined) {
                                $scope.currentRule.addAttribute(separated.name, separated.value)
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
            getData:getRules,
            updateScope:updateScope,
            removeArtifact:artifact.removeArtifact
        }
    });

angular.module('collector', ['hopModule', 'rules', 'rulesContext'])
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

function RuleBase () {
    var modified = false;
    this.dirty = false;
    this.addCondition = function(condition) {
        modified = true;
        this.conditions.push(condition);
    }

    this.addAction = function (action) {
        modified = true;
        this.actions.push(action);
    }
    this.removeCondition = function (condition) {
        if(this.conditions && condition) {
            for(var i in this.conditions) {
                if(this.conditions[i] === condition) {
                    this.conditions.splice(i,1);
                }
            }
        }
    }

    this.addAttribute = function (attrName, attrValue) {
        modified = true;
        this.attributes [attrName] = attrValue;
    }

    this.removeAttribute = function (attrName) {
        modified = true;
        delete this.attributes[attrName];
    }

    this.isModified = function() {
        return modified;
    }
}
Rule.prototype = new RuleBase();

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

function ruleController($scope, rule) {
    $scope.rules = new CollectionRepository(rule.getData());
    $scope.title = '123';
    $scope.commandBox = new GroupBox();
    $scope.commandBox.selectItem('search');

    $scope.enterSearchMode = function () {
        $scope.commandBox.selectItem('search');
    };

    $scope.enterInputMode = function () {
        $scope.commandBox.selectItem('enter');
    };

    $scope.removeArtifact = function (artifact) {
        $scope.rules.removeValue(artifact);
    };

    $scope.isInputMode = function () {
        return $scope.commandBox.isSelected("enter");
    };

    $scope.isSearchMode = function () {
        return $scope.commandBox.isSelected("search");
    }

    $scope.updateArtifact = function (rule) {
        $scope.enterInputMode();
        var ruleClone = angular.copy(rule);
        rule.dirty = true;
        $scope.currentRule = ruleClone;

    };

    $scope.updateRule = function () {
        rule.updateScope($scope);
    }
}