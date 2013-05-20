var fs = require('fs'),
    parser = require('./parser.js'),
    aggregator = require('./aggregator.js'),
    processor = require('./processor.js');



var cardSchemeFiles = {
  MasterCard: "./jan_mc_rules.txt",
  Visa: "./jan_vi_rules.txt"
};


function loadData(file, callback) {
    fs.readFile(file, function (err, data) {
        if(err) {
            console.log("error loading the rule file " + file);
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
        //lists all extracted fields
        /*for(var key in processor.extractedFields) {
            console.log(key + "-" + processor.extractedFields[key]);
        }*/
        res.render("interchange", {
            cardScheme: schemeName ,
            count: rules.length,
            aggregated: ag});
    });

}
function renderPurchaseDomestic(req, res) {
    var schemeName = "Visa",
        file = cardSchemeFiles[schemeName];
    loadData(file, function(rules) {
        var ag = aggregator.getAggregated(schemeName, rules);
        res.render("Purchase UK Domestic" ,{aggregated: ag});
    });

}

function aggregate(schemeName, callback, selector) {
    var schemeName = schemeName || "MasterCard",
        file = cardSchemeFiles[schemeName];
    loadData(file, function(rules) {
        callback(aggregator.getAggregated(schemeName, rules, selector));
    })
}

module.exports = {
    renderDecisionTable: renderDecisionTable,
    loadRules: aggregate,
    renderPurchaseDomestic : renderPurchaseDomestic
}