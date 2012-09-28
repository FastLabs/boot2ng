function transactionController($scope, $resource) {
    $scope.regions = [
        {
            name:"US",
            value:"1"
        },
        {
            name:"Canada",
            value:"2"
        },
        {
            name:"EU",
            value:"3"
        }
    ];

    $scope.countries = {
        "1":["US"],
        "2":["Canada"],
        "3":["GB", "GER", "SPA"]
    }
    var TransactionResource = $resource("transaction");

    $scope.getRegion = function (code) {
        for (var i in $scope.regions) {
            if ($scope.regions[i].value === code) {
                return $scope.regions[i].name;
            }
        }
    };

    $scope.transactions = TransactionResource.query();
    $scope.submit = function (transaction) {
        console.log(transaction.reimbursementAttribute);
        transaction.$save();
        $scope.result = transaction;
    }

    $scope.editTransaction = function (transaction) {
        $scope.selectedTransaction = transaction;
    }
}