angular.module('rules', [], function() {
    console.log('rules module created');
})
    .factory('hello', function() {
        return function(text) {
            console.log('->' + text);
        };
    })
    .value('updateContext', {hello : 'Hello World'});

function Rule() {
    this.actions = [];
    this.conditions = [];
    this.attributes = {};
    this.comments = [];
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

    this.lastComment = function () {
        var commentCount = this.comments.length();
        if(commentCount > 0) {
            return this.comments[commentCount - 1];
        }
    };
    this.addComment = function(comment) {
        if(!this.comments) {
            this.comments = [];
        }

        this.comments.unshift(comment);
    };

    this.addAttribute = function (attrName, attrValue) {
        modified = true;
        this.attributes [attrName] = attrValue;
    };

    this.removeAttribute = function (attrName) {
        modified = true;
        delete this.attributes[attrName];
    };

    this.isModified = function() {
        return modified;
    };
    this.setModified = function(value) {
        modified = value;
    }
}
Rule.prototype = new RuleBase();
var demoRules =  [
    {
        name:'check the account number',
        attributes:{id:'Rule2'},
        conditions:['transaction is ok'],
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

angular.module('rulesContext', ['artifact', 'utils'])
    .config(function () {

    }).factory('rule', function (artifact, parser) {
        var getRules = function () {
            var result = [];
           for(var i in demoRules) {
               var rule = new Rule();
               var ruleData = demoRules[i];
               rule.actions =  ruleData.actions;
               rule.attributes = ruleData.attributes;
               rule.name = ruleData.name;
               rule.comments = ruleData.comments;
               rule.conditions = ruleData.conditions;
               result.push(rule);
           }
            return result;
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
                        } else if(startElement === '-'){
                            $scope.currentRule.addComment(value);
                        } else {
                            $scope.currentRule.name = $scope.text;
                        }
                    }

                }
            }
            $scope.text = '';
        };

        var newInstance = function() {
            var newInstance = new Rule();
            return newInstance;
        }
        return {
            getData: getRules,
            updateScope: updateScope,
            removeArtifact: artifact.removeArtifact,
            newInstance: newInstance


        }
    });