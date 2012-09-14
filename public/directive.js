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
            " <ul class='typeahead dropdown-menu' style='display:block'>" +
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
            var style = "display: block;top:" + inputElement[0].offsetTop + "px; left:"+ inputElement[0].offsetLeft+"px;" ;
            listElement[0].setAttribute("style", style);//inputElement[0].offsetTop + 10;
            //listElement.
            scope.$watch("query", function(value) {
                scope.filteredItems = filter(scope.source, value);
                console.log(scope.filteredItems);

                //console.log($scope.query);
                //console.log($scope.source);
            });
        },
        controller: function($scope) {

        }
    }
}]);

angular.module("entry", ['list'])
    .config(function () {
        console.log("app configured");
    });

function listController ($scope) {
    $scope.onDelete = function(val) {
        console.log("delete" + val);
    }
    $scope.dataSource = ["a","b", "c", "d"];
    $scope.handle = function () {
        console.log('handled');
    }
    $scope.onUpdate = function (val) {
        console.log("update" + val);
    }
}
