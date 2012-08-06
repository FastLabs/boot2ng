
angular.module('comments', ['context']).factory('comment', function (editable) {
        var Comment = function(text, author) {
            this.text = text;
            this.author = author;
            this.date = new Date();
        };

        var EditCommentContext = function (original) {
            this.text = original.text;
            this.applyChanges = function() {
                console.log('update the comment scope');
            }
        };
        EditCommentContext.prototype = new editable.EditableBase();
       // Comment.prototype = new editable.EditableBase();
        return {
            newInstance : function(text, author) {
                return new Comment(text, author);
            },
            newEditContext: function (context) {
                return new EditCommentContext(context);
            }
        };
    }
);

angular.module('rules', ['comments'])
    .factory('ruleFactory', function(editable, comment) {
        var RuleBase = function () {
            var modified = false;
            this.dirty = false;
            this.addCondition = function(condition) {
                modified = true;
                this.conditions.push(condition);
            };

            this.addAction = function (action) {
                modified = true;
                this.actions.push(action);
            };
            this.removeCondition = function (condition) {
                if(this.conditions && condition) {
                    for(var i in this.conditions) {
                        if(this.conditions[i] === condition) {
                            this.conditions.splice(i,1);
                        }
                    }
                }
            };
            this.lastComment = function () {
                var commentCount = this.comments.length();
                if(commentCount > 0) {
                    return this.comments[commentCount - 1];
                }
            };
            this.addComment = function(text) {
                if(!this.comments) {
                    this.comments = [];
                }
                var commentStructure = comment.newInstance(text, 'oleg')
                this.comments.unshift(commentStructure);
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
            };
        };
        //TODO: investigate this
        //RuleBase.prototype = editable.EditableBase;
        var Rule =  function() {
            this.actions = [];
            this.conditions = [];
            this.attributes = {};
            this.comments = [];
        };
        Rule.prototype = new RuleBase();
        return {
            newInstance : function () {
                return new Rule();
            }
        }
    });

function CollectionRepository(initial) {
    var values = [];
    if (initial) {
        values = initial;
    }

    this.addValue = function (value) {
        for (var i in values) {
            var current = values[i]
            if (current.dirty === true) {
                if (current.id === value.id) {
                    values.splice(i, 1);
                }
            }
        }
        values.push(value);
        value.setModified(false);//TODO: understand how this will affect server side synchronization
    };

    this.removeValue = function (value) {
        if (value) {
            var artifactId = value.attributes.id
            for (var i in values) {
                if (values[i].attributes.id === artifactId) {
                    values.splice(i, 1);
                }
            }
        }
    };

    //if used in UI binding cache the value so this function
    //will be called once
    this.values = function () {
        return values;
    }
};



angular.module('rulesContext', ['artifact', 'utils', 'ngResource', 'rules'])
    .config(function () {

    })
    .value('saveCmd', function (rule){
        console.log('save ' + rule.name);
    })
    .factory('ruleContext', function (artifact, parser, ruleFactory, editable) {
        var injector = angular.injector(['rulesContext']);
        var dispatchCommand = function (command, ruleContext) {
            var cmd = injector.get(command + 'Cmd');
            injector.invoke(cmd, this, {rule: ruleContext});
        };
        var updateScope = function () {
                if (this.text !== undefined) {
                    var startElement = this.text.charAt(0);
                    var value = this.text.substring(1, this.text.length);
                    if (value !== undefined && value.length > 0) {
                        if (startElement === '!') {
                            this.context.addAction(value);
                        } else if (startElement === '?') {
                            this.context.addCondition(value);
                        } else if (startElement === '$') {
                            dispatchCommand(value, this.context);
                        } else if (startElement === '@') {
                            var separated = parser.splitAttribute(value);
                            if (separated !== undefined) {
                                this.context.addAttribute(separated.name, separated.value)
                            }
                        } else if(startElement === '-'){
                            this.context.addComment(value);
                        } else {
                            this.context.name = this.text;
                        }
                    }
                }
            this.text = '';
        };
        var EditRuleContext = function (context) {
            this.context = context;
            this.applyChanges = updateScope;

        }
        EditRuleContext.prototype = new editable.EditableBase();
        return {
            newEditScope: function (rule) {
                return new EditRuleContext(rule);
            },
            updateScope: updateScope,
            removeArtifact: artifact.removeArtifact
        }
    }).factory('rulesRepo', function($resource, ruleFactory) {
        var repository = new CollectionRepository();
        var resource = $resource('/api/rules');
        var rules = resource.query(function() {
            for(var i in rules ) {
                var rule = rules[i];
                var instance = ruleFactory.newInstance();
                instance.actions = rule.actions;
                instance.conditions = rule.conditions;
                instance.name = rule.name;
                instance.atrributes = rule.atrributes;
                instance.comments = rule.comments;
                //__proto__ didn't work in ie9
                repository.addValue(instance);
            }
        } );
        return {repository: repository};
    });