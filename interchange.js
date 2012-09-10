var fs = require('fs'),
    parser = require('./parser.js'),
    processor = require('./processor.js');

function loadData(file, callback) {
    fs.readFile(file, function (err, data) {
        if(err) {
            console.log("error loading the rule file");
        } else {
            var rules = parser.parse(new String(data));
            if(callback) {
                callback(rules);
            }
        }
    });
}

function contains(array, value) {
    for(var i in array) {
        var val = array[i];
        if(val === value) {
            return true;
        }
    }
    return false;
}
function getQualificationByCode(code) {
    if(this.qualification) {
        for(var i in this.qualification) {
            var q = this.qualification[i].qualification;
            if(q.fieldCode === code) {
                return q;
            }
        }
    }
}
function getStructure(inherited, rule) {
    if(inherited.init === true) {
        inherited.actions = ["flatFee", "minFee", "maxFee"];
        inherited.conditions = [];
        inherited.init = false;
    }

    if(rule.qualification) {
        var qualifications = rule.qualification;
        qualifications.forEach(function(qualification) {
            var q = qualification.qualification;
            if(q.fieldCode === undefined) {
                console.log("->" + q.sentence);
            }
            if(!contains(inherited.conditions, q.fieldCode)) {
                inherited.conditions.push(q.fieldCode);
            }
        })
    }
    return inherited;
}

function getAggregated(rules) {
    var aggregated = {};
    rules.forEach(function (rule) {
        rule.getQualificationByCode = getQualificationByCode;
        var scheme = processor.scheme[rule.scheme.code],
            catCode = processor.catCodes[rule.categoryCode.code];
        var schemeGroup = aggregated[scheme];
        if(schemeGroup) {
            var catCodeGroupCollection = schemeGroup[catCode];
            if(catCodeGroupCollection) {
                catCodeGroupCollection.collection.push(rule);
                catCodeGroupCollection.structure = getStructure(catCodeGroupCollection.structure, rule);
            } else {
                catCodeGroupCollection = [rule];
                schemeGroup[catCode] = {collection: catCodeGroupCollection,
                    structure: getStructure({init:true}, rule)
                };
            }
        }else {
            var catCodeCollection = [rule];
            schemeGroup = { };
            schemeGroup[catCode] = { collection: catCodeCollection,
                structure: getStructure({init: true}, rule)
            };
            aggregated[scheme] = schemeGroup;
        }
    });
    return aggregated;
}

function loadRules (req, res) {
    loadData("./rules.txt", function (rules) {
        var ag = getAggregated(rules);
        res.render("interchange", {title: "MasterCard interchange",
            count: rules.length,
            aggregated: ag});
    });
}

module.exports = {
load: loadRules
}