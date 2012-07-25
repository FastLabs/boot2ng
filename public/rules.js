angular.module('rules', [], function() {
    console.log('rules module created');
})
    .factory('hello', function() {
        return function(text) {
            console.log('->' + text);
        }
    });