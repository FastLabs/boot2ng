function decisionTableController($scope) {


    $scope.table = {
        conditions:["c1", "c2", "c3"],
        actions: ["a1", "a2"],
        rules:[
            {
                conditions:{
                    c1:{sentence:"is one of", value:"[1,2,3,4,5]"}
                },
                actions:{
                    a1:{value:"abc"}

                }
            },
            {
                conditions:{
                    c2:{sentence:"is one of", value:"[4,5,6,7,8,9]"}
                },
                actions:{
                    a1:{value:"jopa"}

                }
            }
        ]
    };

    $scope.editRule = function (rule) {
        $scope.selected = rule;
    }

}