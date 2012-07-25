describe('working on angular scope', function() {
	it('should be able to create a scope', function() {
		console.log('first jasmine test in testacular');

	angular.injector(['ng']).invoke(function($rootScope) {

		var scope = $rootScope.$new();
		scope.salutation = 'Hello';
		scope.name = 'Wolrd';
		var y = undefined;
		expect(scope.greeting).toEqual(y);

		scope.$watch('name', function() {
			console.log('---');
			scope.greeting = scope.name + ' ' + scope.salutation + '!';
			console.log(this.greeting);
		});
		scope.name = 'Oleg';
		expect(scope.greeting).toEqual(y);
		scope.$digest();
		expect(scope.greeting).toEqual('Oleg Hello!');


	
});
	})
	
})