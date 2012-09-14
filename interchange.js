var fs = require('fs'),
    parser = require('./parser.js'),
    aggregator = require('./aggregator.js');



var cardSchemeFiles = {
  MasterCard: "./MasterCard Rules.txt",
  Visa: "./Visa Rules.txt"
};


function loadData(file, callback) {
    fs.readFile(file, function (err, data) {
        if(err) {
            console.log("error loading the rule file" + file);
        } else {
            var rules = parser.parse(new String(data));
            if(callback) {
                callback(rules);
            }
        }
    });
}

function renderDecisionTable (req, res) {
    var schemeName = (req.params.scheme !== undefined)? req.params.scheme:"MasterCard",
        file = cardSchemeFiles[schemeName];
    loadData(file, function (rules) {
        var ag = aggregator.getAggregated(schemeName, rules);
        res.render("interchange", {
            cardScheme: schemeName ,
            count: rules.length,
            aggregated: ag});
    });
}

function aggregate(schemeName, callback) {
    var schemeName = schemeName || "MasterCard",
        file = cardSchemeFiles[schemeName];
    loadData(file, function(rules) {
        callback(aggregator.getAggregated(schemeName, rules));
    })
}

module.exports = {
    renderDecisionTable: renderDecisionTable,
    loadRules: aggregate
}