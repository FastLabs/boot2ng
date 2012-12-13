var columns = require("./generator.js").columns;

var keys = Object.keys(columns["Visa"]);
var i = 0;
keys.forEach(function (field) {
    console.log((i++) +". " + field);
});