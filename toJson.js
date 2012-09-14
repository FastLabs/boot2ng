var interchange = require('./interchange.js')
    util = require("util");

interchange.loadRules('Visa', function(aggregated) {
        var schemes = Object.keys(aggregated),
            result = [];
        schemes.forEach(function(schemeName) {
            var catCodes = aggregated[schemeName],
                catKeys = Object.keys(catCodes);
            catKeys.forEach(function(catCode) {
                var rules = aggregated[schemeName][catCode].collection,
                    structure = aggregated[schemeName][catCode].structure;

                rules.forEach(function (rule) {
                    var instance = {};
                    instance.name = rule.sequence + " " +rule.description;
                    instance.conditions = [];
                    instance.actions = [];
                    if(structure.isFieldVisible("reimbursementAttribute")) {
                        instance.conditions.push("reimbursement attribute is" + rule.reimbursementAttribute);
                    }
                    structure.conditions.forEach(function(condition){
                            if(structure.isFieldVisible(condition)) {
                                var qual = rule.getQualificationByCode(condition);
                                if(qual) {
                                    instance.conditions.push(qual.sentence + " " + qual.data);
                                }
                            }
                        }
                    );
                    if(structure.isFieldVisible("interchangeRateDesignator")) {
                        instance.actions.push("set interchange rate designator to" + rule.interchangeRateDesignator);
                    }
                    if(structure.isFieldVisible("feePercentage")) {
                        instance.actions.push("set fee percentage " + rule.feePercentage);
                    }
                    if(structure.isFieldVisible("flatFee")) {
                        instance.actions.push(util.format("set flat rate %s %s %s", rule.flatFee.sign, rule.flatFee.rate, (rule.flatFee.currency || "") ));
                    }
                    result.push(instance);
                });

            });

        });
        console.log(JSON.stringify(result));
    }
);
