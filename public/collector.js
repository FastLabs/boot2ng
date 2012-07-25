angular.module('collector', ['rules', 'artifactRepo'])
    .config(function ($routeProvider) {
        $routeProvider.when('/', {controller:commandController, templateUrl:'rulelist.html'});
        $routeProvider.when('/:context',{controller:commandController, templateUrl: 'rulelist.html'} );
    });
//Defines the rule context
angular.module('rulesContext', [])
    .config(function() {

    }).factory('rule', function() {
        var getRules = function() {
            return [ {
                name:'check the account number'
            }
                ,
                {
                    name:'check the issuer bin'
                }
            ];
        };

        return {
            getData : getRules
        }
    });
//Defines the entity model context
angular.module('entityContext', [])
    .config(function() {

    }).factory('entity', function () {
        var getEntities = function() {
            return [ {
                name:'first rule'
            }
                ,
                {
                    name:'second rule'
                }
            ];
        };

        return {
            getData : getEntities
        }
    });

angular.module('artifactRepo', ['rulesContext', 'entityContext'])
    .config(function ($provide) {

        $provide.factory('artifactRepoService', function ($injector) {
            var addArtifact = function (artifactCollection, currentArtifact) {
                artifactCollection.push(currentArtifact);
            };

            var getArtifacts = function (context) {
                var extractor = $injector.get(context);
                return extractor.getData();
            };


            return {
                addArtifact:addArtifact,
                getArtifacts:getArtifacts
            }
        });
    });

//TODO: move this in rule context
function Rule() {
    this.actions = [];
    this.name = 'simple rule';
    this.conditions = [];
    this.attributes = {};
}

function commandController($scope, $routeParams, artifactRepoService) {
    $scope.rules = artifactRepoService.getArtifacts($routeParams.context);

    var addRule = function (artifact) {
        if (artifact !== undefined) {
            artifactRepoService.addArtifact($scope.rules, artifact);

        }
    };

    var saveRule = function (rule) {
        console.log('->save ' + rule.name);
        addRule(rule);
        $scope.currentRule = undefined;
    };

    var commandsMap = {
        "save":saveRule
    };

    var dispatchCommand = function (command, ruleContext) {
        var command = commandsMap[command];
        command(ruleContext);
    };

    var splitAttribute = function (value) {
        if (value !== undefined) {
            var separator = value.indexOf(':');
            var attributeName = value.substring(0, separator).trim();
            var attributeValue = value.substring(separator + 1, value.length);

            return {
                'name':attributeName,
                'value':attributeValue
            }

        }
    };

    $scope.hasRule = function () {
        if ($scope.currentRule === undefined) {

            return 'display:none';
        }
        return 'dislplay:block';
    }

    $scope.updateRule = function () {
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
                        dispatchCommand(value, $scope.currentRule);
                    } else if (startElement === '@') {
                        var separated = splitAttribute(value);
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
    }
}