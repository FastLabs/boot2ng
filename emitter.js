var http = require("http");

var post_data = JSON.stringify([{
    'reimbursementAttribute':'2'
}]);

var config = {
    host:"localhost",
    port:9000,
    path:"/engine",
    method:"POST",
    headers:{
        'Content-Type':'application/json'
    }
};

function callRuleEngine(transaction, callback) {
    var req = http.request(config,
        function (res) {
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            var content = "";
            res.setEncoding('utf8');
            res.on("data", function (chunk) {
                content += chunk;
            });
            res.on("end", function () {
                callback(content);
            });
        });
    req.write(JSON.stringify([transaction]));
    req.end();
}

module.exports = {
    callRuleEngine: callRuleEngine
}



