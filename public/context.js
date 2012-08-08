angular.module('context', []).value('editable', {
        EditableBase:function () {
            this.applyChanges = function () {
                this.original.text = this.text;
            };

            var discardChanges = function () {
                console.log('discard changes');
            };
        }
    }
).factory('simpleEditContext', function(editable){
        return {
           newSimpleEditContext: function(original) {
               var context = new editable.EditableBase();
               context.original = original;
               original.text = original.text;
               return context;
           }
        }
    });