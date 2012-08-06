angular.module('context', []).value('editable', {
        'EditableBase':function () {
            this.applyChanges = function () {
                console.log('apply changes default implementation: no action takens');
            }

            var discardChanges = function () {
                console.log('discard changes');
            }
        }
    }
);