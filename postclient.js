var http = require("http"),
    querystring = require("querystring");


var post_data = querystring.stringify({
    'your':'post',
    'data':'goes here!'
});


var config = {
    host:"localhost",
    port:"3000",
    path:"/api/engine",
    method:"POST",
    headers:{
        'Content-Type':'application/x-www-form-urlencoded',
        'Content-Length':post_data.length
    }
};


var req = http.request(config, function (res) {
    console.log("connected");
    res.on("error", function () {
        console.log("error");
    });
    res.on("end", function () {
        console.log("connection end");
    });
    res.on("data", function (chunk) {
        console.log("data received " + chunk);
    })
});
req.write(post_data);
req.end();