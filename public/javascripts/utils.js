angular.module('utils', []).config(
    function () {

    }
).factory('parser', function () {
        //splits the attributes name and value from a string representation
        // attribute_name: attribute value
        //take in consideration that in the future the value could be validated
        var splitAttribute = function (value) {
            if (value) {
                var separator = value.indexOf(':');
                var attributeName = value.substring(0, separator).trim();
                var attributeValue = value.substring(separator + 1, value.length);
                return {'name':attributeName, 'value':attributeValue };
            }
        }

        return {
            splitAttribute:splitAttribute
        };

    });
angular.module('hop.directives', [])
    .directive('hop', function () {
        return {
            restrict:'C',
            replace:true,

            scope:{title:'@hopTitle'},
            template:'<span>hello tag {{title}}</span>',
            link:function (scope, element, attrs) {
                console.log('linking');
            }
        }
    })
    .directive('keyPress', ['$parse', function ($parse) {
    return {
        link:function (scope, element, attrs) {
            var keyPressAttribute;
            try {
                keyPressAttribute = scope.$eval(attrs.keyPress);
            } catch (error) {
                console.log('error parsing the attributes');
            }
            var eventMap = {};
            angular.forEach(keyPressAttribute, function (v, k) {
                eventMap[k] = $parse(v);
            });

            element.bind('keydown', function (event) {
                var expression = eventMap[event.keyCode];
                // console.log(expression);
                if (expression) {
                    scope.$apply(function () {
                        expression(scope, {'$event':event});
                    });
                }
            });
        }
    };
}]);

angular.module('user', []).factory('userInfo', function() {
    var currentUser = {
        initials: 'anonymous'
    };
    return {
        getCurrentUser : function() {
            return currentUser;
        }
    };
});

function barController($scope, userInfo, $route, $location) {
    $scope.active = "active"
    $scope.login = function () {
        console.log('try to authenticate'+ $scope.user  + ' ' + $scope.password);
    }

    $scope.getBarStatus = function () {
        return
    }

    $scope.changeUser = function() {
        userInfo.getCurrentUser().initials = $scope.user;
        console.log($scope.user);
    }
}

