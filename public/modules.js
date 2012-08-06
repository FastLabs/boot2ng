angular.module('zorg.service', []).value(
    'greeter', {
        salutation: 'Hello',
        localize: function(localization) {
            this.salutation = localization.salutation;
        },
        greet: function(name) {
            console.log(this.salutation + " " + name)
        }
    }
);
//how to use it: var injector = angular.injector(['zorg.service'])
//injector.invoke(function(greeter) {greeter.greet('oleg');})

var firstModule = angular.module('zorg.factory',[]);
firstModule.factory('myService', function() {
    var myService = function () {
        console.log('hello from my service');
    }
    return myService;
});
//var injector = angular.injector(['zorg.factory'])
//injector.invoke(function(myService) {myService()})

var secondModule = angular.module('zorg.provider', [], function($provide) {
    $provide.factory('secondService', function() {
        var myService = function() {
            console.log('hello from second service');
        };
        return myService;
    });
});
//var injector = angular.injector(['zorg.provider'])
//injector.invoke(function(secondService) {secondService()})
// pay attention to the way the dependencies are passed to the factory
var thirdModule = angular.module('zorg.dependent', ['zorg.provider', 'zorg.factory'], function($provide) {
    $provide.factory('combined', ['secondService', 'myService',function(secondService, myService) {
        var combined = function () {
          myService();
          secondService();
          console.log('dependent');
        };
        return combined;
    }]);
});

//the provider instance can be injected only in modules,
// defines a module the module registers
angular.module('provideModule', [], ['$provide', function($provide) {
    $provide.value('greet', 'Hello world');
}]);


function client(greet) {
    console.log(greet + ' to client');
}
//var injector = angular.inject(['provideModule'])
//injector.invoke(client);
//--------------------------------------------------

angular.module('myApp', [], function() {
    console.log('my app boot    strapped');
});

function firstController($scope) {
    console.log('controller initialized');
    $scope.hello = 'Hello from controller';
}

angular.module('fact', []).factory('factory', function() {
    console.log('fact module initialised');
    return {hello: function (){
        console.log('hello');
    }}
}).value('val', {
        val: 'abc'
    });