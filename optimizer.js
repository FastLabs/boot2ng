var interchange = require('./interchange.js'),
    cardScheme = "Visa",
    programGenerator = require("./feeProgramGenerator.js"),
    feeStructureGenerator = require("./feeStructureGenerator.js");

var secondaryQualifications = ["accountFundingSource", "country"]
    , x = [
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
    ,'productCode'
    ,'country'
    ,'MCC'
    //,'authorised'
    //, 'mailOrder'
    //, 'authCharInd'
    , 'isRecurring'
    , 'catCode'
    ,'cardValidationRespCode'//
   // , 'authorisationCode'
    , 'cardScheme'
  //  , 'isRefund'
  //  ,'isChipCardRange'
   , 'commodityCode'
    ,'premiumMerchant'
   // , 'authVerificationValue'
  //  , 'chipQualified'
];

var ignore = ["CT"];

function include(field) {
    if(secondaryQualifications.indexOf(field.fieldName) <0 ) {
        return true;
    }
    return false;
}
var collected = {},
    feeStructure = {}
    programCount = 0;

function collect(hash, conditions) {
   var container = collected[hash];

   if(container === undefined) {
       var name = ("QualProg" + programCount++);
       container = {count: 1, name: name , qualification: conditions};
       collected[hash] = container;
       return name;
   } else {
       container.count = container.count + 1;
      return container.name;
   }
}

function isIgnored(code) {
    return ignore.indexOf(code) >= 0;
}
/*var country = "BGR";
function isRuleVisible(rule) {
    if(country === undefined) return true;
    var countryCode = rule.getQualificationByCode("CT");
    if(countryCode) {
        if(countryCode.country === country) {
            return true;
        } else {
            return false;
        }
    }
    return true;
};*/

function isRuleVisible(rule, filters) {
    var countryCode = rule.getQualificationByCode("CT"),
        region = rule.getQualificationByCode("RE"),
        includeCountry = false,
        includeRegion = false;

    /*if(moc) {

        if (moc.op.indexOf("not one of")< 0) {
            console.log("moc one of " + rule.description);
        } else {
            console.log("moc not one of " + rule.description);
        }
    }*/
    if(filters.country === undefined && countryCode === undefined) {
        includeCountry = true;
    } else if(countryCode) {
        if(countryCode.country === filters.country) {
            includeCountry = true;
        } else {
            includeCountry = false;
        }
    }
    if(filters.region === undefined && region === undefined) {
        includeRegion = false;
    }else if(region) {
        var data = region.payload.data;
        if(data.indexOf(filters.region) >= 0) {
            includeRegion = true;
        } else {
            includeRegion = false;
        }
    }
    return includeRegion && includeCountry;
};

function collectRule(path, qualificationProgram, structure, feeSetup) {
    var feePath = path.scheme + "/" +  path.catCode
    var feeStructureTable = feeStructure[feePath];
    if(feeStructureTable === undefined) {
        feeStructureTable = {structure:structure, rules: []};
        feeStructure[feePath] = feeStructureTable;
    }
    feeStructureTable.rules.push({program: qualificationProgram, rule: feeSetup });
}

function getQualification (qualification) {
    var result = undefined;
    if(this.conditions) {
        this.conditions.forEach(function (condition) {
            if(condition.fieldCode === qualification) {
                result = condition;
                return;
            }
        });
        return result;
    }
}

function handleRuleList(scheme, catCode, rules, structure) {

    rules.forEach(function (rule) {
        if (structure.isFieldVisible("reimbursementAttribute")) {
            //console.log(rule.reimbursementAttribute);
        //not required
        }
        if(true/*isRuleVisible(rule, {region: "EU"})*/)  {

        var hash = "",
            qualification = undefined,
            conditions = [],
            additionalConditions = [];
        structure.conditions.forEach(
            function (condition) {
                if(structure.isFieldVisible(condition) && !isIgnored(condition)) {
                    qualification = rule.getQualificationByCode(condition)
                    if(qualification) {
                        var field = structure.getValue(cardScheme, condition, qualification),
                            cond = structure.getCondition(cardScheme, condition, qualification);

                        if(field !== undefined && include(field)) {
                            if(cond) {
                                conditions.push(cond);
                            }
                            hash = hash + "|" +field.hash;
                        } else {
                            if(field !== undefined /*&& condition !== undefined*/) { //this is additional qualification
                                additionalConditions.push(qualification);

                            }
                        }
                    }
                }

            }
        );

      //  if( hash.length >0) {
            var feeSetup = {conditions: additionalConditions, id: rule.itemId
                , catCode: rule.categoryCode, flatFee: rule.flatFee,
                    feePercentage: rule.feePercentage,
                    reimbursementAttribute: rule.reimbursementAttribute,
                    feeDescriptor: rule.description,
                    maxFee: rule.maxFee,
                    minFee: rule.minFee,
                    itemId: rule.itemId,
                    ra: rule.reimbursementAttribute, scheme: rule.scheme.description,
                getQualification: getQualification},
                programName = "";
            if(hash.length > 0) {
                programName = collect(hash, conditions);
                collected[hash].documentation = collected[hash].documentation || '';
                collected[hash].documentation += ( ((collected[hash].documentation === '')?"": ", ") + rule.description);
            }

                collectRule({scheme: scheme, catCode: catCode}, programName, structure, feeSetup)
    //};
        }
    }
    );


}



interchange.loadRules(cardScheme, function (aggregated) {
    var allSchemes = Object.keys(aggregated),
        catCodes;
    allSchemes.forEach(function (scheme) {
        catCodes = aggregated[scheme];
        Object.keys(catCodes).forEach(function (catCode) {
            if (scheme === "Purchase" && catCode === "Inter Regional") {
                var rules = aggregated[scheme][catCode].collection,
                   structure = aggregated[scheme][catCode].structure;
                handleRuleList(scheme, catCode, rules, structure);
            }
        });
        Object.keys(collected).forEach(function (hash) {
            programGenerator.qualificationProgram(hash, collected[hash]);
       });
        Object.keys(feeStructure).forEach(function (path) {
           feeStructureGenerator.generateFeeTable(path, feeStructure[path]);
        });
console.log( "--------" + Object.keys(collected).length);
});

}, "optimize");

