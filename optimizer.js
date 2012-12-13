var interchange = require('./interchange.js'),
    cardScheme = "Visa";

var secondaryQualifications = [
    "amount"
    ,"date"
    ,'dataLevel'
    ,'company'
    ,'region'
    ,'debitCardIndicator'
    ,'shortName'
    ,'bin'
    ,'transactionRef'
    ,'regulatedValueFlag'
    ,'traceId'
    ,'visaProductId'
    ,'commercialServiceId'
    ,'unitCost'
    //,'productCode'
    ,'country'];

function include(field) {
    if(secondaryQualifications.indexOf(field.fieldName) <0 ) {
        return true;
    }
    return false;
}
var collected = {};
function collect(hash, conditions, description) {
   var container = collected[hash];
   if(container === undefined) {
       collected[hash] = {count: 1, qualification: conditions, descriptions: [description]};
   } else {
       collected[hash].count = container.count + 1;
       collected[hash].descriptions.push(description);
   }
}

function handleRuleList(scheme, catCode, rules, structure) {
    /*if (scheme !== "Purchase") {
        return;
    }*/
    rules.forEach(function (rule) {
        if (structure.isFieldVisible("reimbursementAttribute")) {
            //console.log(rule.reimbursementAttribute);
        //not required
        }

        var hash = "",
            qualification = undefined,
            conditions = [];
        structure.conditions.forEach(
            function (condition) {
                if(structure.isFieldVisible(condition)) {
                    qualification = rule.getQualificationByCode(condition)
                    if(qualification) {
                        var field = structure.getValue(cardScheme, condition, qualification),
                            condition = structure.getCondition(cardScheme, condition, qualification);

                        if(field !== undefined && include(field)) {
                            if(condition) {
                                conditions.push(condition);
                            }
                            hash = hash + "|" +field.hash;
                        }
                    }
                }

            }
        );
        if( hash.length >0) {
            collect(hash, conditions, rule.description);
        }
    });


}

interchange.loadRules(cardScheme, function (aggregated) {
    var allSchemes = Object.keys(aggregated),
        catCodes;
    allSchemes.forEach(function (scheme) {
        catCodes = aggregated[scheme];
        Object.keys(catCodes).forEach(function (catCode) {
            var rules = aggregated[scheme][catCode].collection,
                structure = aggregated[scheme][catCode].structure;
            handleRuleList(scheme, catCode, rules, structure);
        });
        Object.keys(collected).forEach(function (hash) {
            //console.log(hash + "->" + collected[hash].count);
            var qualification = collected[hash].qualification;
            qualification.forEach(function(qual){
                console.log(qual);
            });

            console.log("-----------------------------------" + JSON.stringify(collected[hash].descriptions));
});
console.log( "--------" + Object.keys(collected).length);
});

}, "optimize");

