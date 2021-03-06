angular.module('comments', ['context']).factory('comment', function (editable) {
        var Comment = function (text, author) {
            this.text = text;
            this.author = author;
            this.date = new Date();
        };

        var EditCommentContext = function (original) {
            this.text = original.text;
            this.original = original;
        };
        EditCommentContext.prototype = new editable.EditableBase();
        return {
            newInstance:function (text, author) {
                return new Comment(text, author);
            },
            newEditContext:function (context) {
                return new EditCommentContext(context);
            }
        };
    }
);

angular.module('conditions', ['context']).factory('condition', function (editable) {
    var Condition = function (text) {
        this.text = text;
    };
    var EditConditionContext = function (original) {
        this.text = original.text;
        this.original = original;
    };
    EditConditionContext.prototype = new editable.EditableBase();
    return {
        newInstance:function (text) {
            return new Condition(text);
        },
        newEditContext:function (context) {
            return new EditConditionContext(context);
        }
    }
});

angular.module('actions', ['context']).factory('action', function (editable) {
    var Action = function (text) {
        this.text = text;
    };
    var EditActionContext = function(original) {
        this.text = original.text;
        this.original = original;
    };
    EditActionContext.prototype = new editable.EditableBase();
    return {
        newInstance:function (text) {
            return new Action(text);
        },
        newEditContext:function (context) {
            return new EditActionContext(context);
        }
    }
});

angular.module('rules', ['comments', 'conditions', 'actions', 'user'])
    .factory('ruleFactory', function (editable, comment, condition, action, userInfo) {
        var RuleBase = function () {
            var modified = false;
            this.dirty = false;

            this.addCondition = function (text) {
                modified = true;
                var condInst = condition.newInstance(text);
                this.conditions.push(condInst);
            };

            var removeFromArray = function (collection, value) {
                if (collection && value) {
                    for (var i in collection) {
                        if (collection[i] === value) {
                            collection.splice(i, 1);
                        }
                    }
                }
            };
            this.removeCondition = function (condition) {
                removeFromArray(this.conditions, condition);
            };

            this.addAction = function (text) {
                modified = true;
                this.actions.push(action.newInstance(text));
            };

            this.removeAction = function(deleteable) {
                removeFromArray(this.actions, deleteable);
            };

            this.lastComment = function () {
                var commentCount = this.comments.length();
                if (commentCount > 0) {
                    return this.comments[commentCount - 1];
                }
            };
            this.addComment = function (text) {
                if (!this.comments) {
                    this.comments = [];
                }
                var user = userInfo.getCurrentUser();
                var commentStructure = comment.newInstance(text, user.initials)
                this.comments.unshift(commentStructure);
            };

            this.removeComment = function(deleteable) {
               removeFromArray(this.comments, deleteable)
            };

            this.addAttribute = function (attrName, attrValue) {
                modified = true;
                this.attributes [attrName] = attrValue;
            };

            this.removeAttribute = function (attrName) {
                modified = true;
                delete this.attributes[attrName];
            };

            this.isModified = function () {
                return modified;
            };
            this.setModified = function (value) {
                modified = value;
            };
        };
        //TODO: investigate this
        //RuleBase.prototype = editable.EditableBase;
        var Rule = function () {
            this.actions = [];
            this.conditions = [];
            this.attributes = {};
            this.comments = [];
        };
        Rule.prototype = new RuleBase();
        return {
            newInstance:function () {
                return new Rule();
            }
        }
    });

angular.module('repository', ['ngResource'])
    .factory('repository',function ($resource) {
        var CollectionRepository = function (initial) {
            var values = [];
            var RuleResource = $resource('/api/rule/:id', {id: "@id"}, {
                update: {method: 'PUT', params: {id: "@id"}}
            });
            if (initial) {
                values = initial;
            }

            var save = function (value) {
                var x = new RuleResource({payload: value});
                x.$save();

            };

            this.addValue = function (value, sync) {
                var update = false;
                for (var i in values) {
                    var current = values[i]
                    if (current.dirty === true) {
                        if (current.id === value.id) {
                            values.splice(i, 1);
                            update = true;
                            break;
                        }
                    }
                }
                values.push(value);
                value.setModified(false);//TODO: understand how this will affect server side synchronization
                if(sync === true) {
                    var resource = new RuleResource({payload: value, id: value.attributes.id});
                    if(update === true) {
                        resource.$update();
                    } else {
                        save(value);
                    }

                }
            };
            this.removeValue = function (value) {
                if (value) {
                    var artifactId = value.attributes.id;
                    for (var i in values) {
                        if (values[i].attributes.id === artifactId) {
                            values.splice(i, 1);
                            break;
                        }
                    }
                    var x = new RuleResource({id: value.attributes.id});
                    x.$delete();
                }
            };
            //if used in UI binding cache the value so this function
            //will be called once
            this.values = function () {
                return values;
            }
        };
        return {
            Collection: CollectionRepository
        }
    });

angular.module('rulesContext', ['artifact', 'utils', 'ngResource', 'rules', 'repository'])
    .config(function () {

    })
    .value('saveCmd', function (rule) {
        console.log('save ' + rule.name);
    })
    .factory('ruleContext',function (artifact, parser, ruleFactory, editable, repository) {
        var injector = angular.injector(['rulesContext']);
        var dispatchCommand = function (command, ruleContext) {
            var cmd = injector.get(command + 'Cmd');
            injector.invoke(cmd, this, {rule:ruleContext});
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
                    } else if (startElement === '-') {
                        this.context.addComment(value);
                    } else {
                        this.context.name = this.text;
                    }
                }
            }
            //this.text = '';
        };
        var EditRuleContext = function (context, ruleName) {
            this.context = context;
            this.text = ruleName;
            this.applyChanges = updateScope;

        }
        EditRuleContext.prototype = new editable.EditableBase();
        return {
            newEditScope:function (rule, ruleName) {
                return new EditRuleContext(rule, ruleName);
            },
            updateScope:updateScope,
            removeArtifact:artifact.removeArtifact
        }
    }).factory('rulesRepo', function ($resource, ruleFactory, repository) {
        var repository = new repository.Collection();
        var resource = $resource('/api/rules');
        repository.$resource = $resource;
        var rules = resource.query(function () {
            for (var i in rules) {
                var rule = rules[i];
                var instance = ruleFactory.newInstance();
                instance.actions = rule.actions;
                instance.conditions = rule.conditions;
                instance.name = rule.name;
                instance.attributes = rule.attributes;
                instance.comments = rule.comments;
                //__proto__ didn't work in ie9
                repository.addValue(instance, false);
            }
        });
        return {repository:repository};
    });