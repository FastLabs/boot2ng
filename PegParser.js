var parser = require('./parser.js'),
    fs = require('fs')
    ;

var filesToProcess = ["./Visa Rules.txt", "./Mastercard Rules.txt"];

fs.readFile('./rules.txt', function (err, data) {
    if (err) {
        console.log('error reading the data');
    } else {
        process(new String(data));
    }
});

function getDescription(rule) {
    var name = rule.categoryCode.description;
    if (rule.scheme) {
        name += " " + rule.scheme.description;
    }
    return name;
}

var aggregated = {};
function aggregate () {

}

function process(toParse) {
    var data = parser.parse(toParse);
    console.log("Extracted rules " + data.length);
    var len = data.length;
    for (var i = 0; i < len; i++) {

        var rule = data[i],
            description = i + ". " + getDescription(rule);
        if (rule.description && rule.description.trim() === "CONS PREMIUM STANDARD (INTRA SAMEA)") {
            if (rule.qualification) {
                description += "->" + rule.qualification.length;
            }
            console.log(description);
            console.log(JSON.stringify(rule));
        }

    }
}
