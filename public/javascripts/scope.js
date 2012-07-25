angular.injector(['ng']).invoke(function($rootScope) {
   var scope = $rootScope.$new();
   scope.salutation = 'Hello';
   scope.name = 'World';
 
  // expect(scope.greeting).toEqual(undefined);
 
   scope.$watch('name', function(scp) {

     scope.greeting = scope.salutation + ' ' + scope.name + '!';
     console.log(scope.greeting);
   }); // initialize the watch
 
   //expect(scope.greeting).toEqual(undefined);
   scope.name = 'Misko';
   // still old value, since watches have not been called yet
   //expect(scope.greeting).toEqual(undefined);
 
   scope.$digest(); // fire all  the watches
   //expect(scope.greeting).toEqual('Hello Misko!');
});