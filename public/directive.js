angular.module("list", [])
    .directive("item", ['$parse', function ($parse) {
    return {
        transclude: true,
        restrict:'EC',
        replace:true,
        scope:{itemTitle:"@", onDelete:"&", onUpdate:"&"},
        template:"<li class='removable thumbnail'>{{itemTitle}}" +
            "<a ng-click='onUpdate()'><i class='icon-edit'></i></a>" +
            "<a ng-click='onDelete()'><i class='icon-remove'></i></a></li>",
        hello:function () {
            console.log("");
        }
    }
}])
    .directive("typeahead", ["$parse","$filter", function($parse, $filter) {
        var filter = $filter("filter"),
            updateLocation = function($scope, ownerElement) {

            }
    return {
        restrict: "E",
        replace: true,
        scope: {source: "=typeaheadSource",
            enterHandler: "=typeaheadHandler"
        },
        template: "<div><input ng-model='query' type='text'/>" +
            " <ul class='typeahead dropdown-menu'>" +
            "<li ng-repeat='item in filteredItems'> <a>{{item}} </a></li></ul></div>",

        link: function(scope, element, attr, contr) {
            var inputElement = angular.element( element.children()[0]),
                listElement = angular.element(element.children()[1]);
            inputElement.bind("keypress", function(ev) {
                switch(ev.which) {
                    case 13:
                        scope.enterHandler();
                        break;
                }
                //console.log(event);
            });


            inputElement.bind("keyup", function(ev) {
                switch(ev.keyCode) {
                    case 27: //escape
                        hide();
                        break;
                    case 40: //down arrow
                        break;
                    case 38: //up arrow
                        break;
                }
                ev.stopPropagation();
                ev.preventDefault();
            });

            var show = function () {
                var style = "display: block;top:" + (inputElement[0].offsetTop  + inputElement[0].offsetHeight) + "px; left:"+ inputElement[0].offsetLeft+"px;" ;
                    listElement[0].setAttribute("style", style);//inputElement[0].offsetTop + 10;
                },
                hide = function() {
                  listElement[0].setAttribute("style", "display:none");
                },
                up = function() {

                };

            //listElement.
            scope.$watch("query", function(value) {
                if(value && value.length > 0) {
                    scope.filteredItems = filter(scope.source, value);
                    show();
                } else {
                    hide();
                }

                //console.log($scope.query);
                //console.log($scope.source);
            });
        },
        controller: function($scope) {

        }
    }
}]);

angular.module("entry", ['list', 'ngResource'])
    .config(function () {
        console.log("app configured");
    });

function listController ($scope, $resource) {
    $scope.onDelete = function(val) {
        console.log("delete" + val);
    };

    $scope.dataSource = ["Oleg","Luca", "Ioana", "Lina"];

    $scope.handle = function () {
        console.log('handled');
    };

    $scope.onUpdate = function (val) {
        console.log("update" + val);
    };


    var RuleResource = $resource("/rule");

    $scope.current = {
        id: 1,
        name: "my first rule"
    };

    $scope.available = [
        {
            id: 1,
            name: "first rule"
        }, {
            id: 2,
            name: "second rule"
        }
    ];

    $scope.send = function() {
        var resource = new RuleResource($scope.current);
        resource.$save();
        $scope.current = resource;
        //watching the scope property for changes
        // the watch function will be called twice
        $scope.$watch('current', function (changed) {
            console.log(changed);
            for(var i in $scope.available){
                if(changed.id === $scope.available[i].id) {
                    console.log('---');
                    $scope.available[i] = changed;
                }
            }
        });
    }
    // this will change the name of the current
    // and the name of the particular element in the array
    $scope.name = function () {
        $scope.current.name = "changed name";
    }
}
