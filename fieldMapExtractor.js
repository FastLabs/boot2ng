var columns = require("./generator.js").columns;


// not required by the application
var keys = Object.keys(columns["Visa"]);
var i = 0;
keys.forEach(function (field) {
    console.log((i++) +". " + field);
});