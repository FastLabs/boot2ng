var interchange = require("./interchange.js"),
    cardScheme = "Visa",
    //scheme = "Purchase",
    //catCode = "Intra Regional",
    merchantCountry = undefined,
    asXML = require("./XmlSuite.js").asXML,
    EventEmitter = require("events").EventEmitter;

var eventBus = new EventEmitter();
var templates = {
    Visa: {
        Cash: {
            data: {
                scheme: "Cash"
            },
            "UK Domestic" : {
                issuer: {
                    country: "UK",
                    region: "3"
                },
                merchant: {
                    country: "UK",
                    region: "3"
                },
                acquirer: {
                    country: "UK",
                    region: "3"
                }
            },
            "Inter Regional" : {
                "issuer":{
                    "country":"IND",
                    "region":"2"
                },
                "merchant":{
                    "country":"AUS",
                    "region":"4"
                },
                "acquirer":{
                    "country":"DE",
                    "region":"3"
                }
            },
            "Intra Regional" : {
                issuer: {
                    country: "UK",
                    region: "3"
                },
                merchant: {
                    country: "UK",
                    region: "3"
                },
                acquirer: {
                    country: "DE",
                    region: "3"
                }
            }

        },
        Funding: {
            data: {
                scheme: "Funding"
            },
            "UK Domestic" : {
                issuer: {
                    country: "UK",
                    region: "3"
                },
                merchant: {
                    country: "UK",
                    region: "3"
                },
                acquirer: {
                    country: "UK",
                    region: "3"
                }
            },
            "Inter Regional" : {
                "issuer":{
                    "country":"IND",
                    "region":"2"
                },
                "merchant":{
                    "country":"AUS",
                    "region":"4"
                },
                "acquirer":{
                    "country":"DE",
                    "region":"3"
                }
            },
            "Intra Regional" : {
                issuer: {
                    country: "UK",
                    region: "3"
                },
                merchant: {
                    country: "UK",
                    region: "3"
                },
                acquirer: {
                    country: "DE",
                    region: "3"
                }
            }
        },
        Purchase: {
            data: {
                scheme: "Purchase"
            },
            "UK Domestic" : {
                issuer: {
                    country: "UK",
                    region: "3"
                },
                merchant: {
                    country: "UK",
                    region: "3"
                },
                acquirer: {
                    country: "UK",
                    region: "3"
                }
            },
            "Non UK Domestic" : {
                issuer: {
                    country: "UK",
                    region: "3"
                },
                merchant: {
                    country: "UK",
                    region: "3"
                },
                acquirer: {
                    country: "UK",
                    region: "3"
                }
            },
            "Exported Domestic" : {
                issuer: {
                    country: "UK",
                    //bin: "123",
                    region: "3"
                },
                merchant: {
                    country: "UK",
                    region: "3"
                },
                acquirer: {
                    country: "UK",
                    region: "3"
                }
            },
            "Intra Regional" : {
                issuer: {
                    country: "UK",
                    region: "3",
                    subRegion:"J"
                },
                merchant: {
                    country: "UK",
                    region: "3",
                    subRegion: "b"
                },
                acquirer: {
                    country: "DE",
                    region: "3",
                    subRegion:"a"
                }
            }
        }
    }
}

var mccCombinations = [];

function mccRangeToString(mccRange) {
    if(mccRange.low === mccRange.top) {
        return mccRange.low;
    }
    return mccRange.low +"->"+ mccRange.top;
}

function collectMcc(mccCollection) {
    var mccUID = "";
    for(var i in mccCollection) {
        mccUID = mccUID + mccRangeToString(mccCollection[i]) + ((i< mccCollection.length-1)?" or ":"");
    }
    if(mccCombinations.indexOf(mccUID) === -1) {
        mccCombinations.push(mccUID);
    }
}
var programGroups = {};
function collectMethodOfCapture (valueCollection, program) {
    var key = JSON.stringify(valueCollection.sort()),
        programs = programGroups[key];
    if(!programs) {
        programs = [];
        programGroups[key] = programs;
    }

    programs.push(program);

}
function fromTemplates(templateList){
    var result = {};
    templateList.forEach(function(template) {
        for(var field in template) {
            if(typeof template[field] === "string") {
                result[field] = template[field];
            } else {
                result[field] = fromTemplates([template[field]]);
            }
        }
    });
    return result;
}

function copyAttributes(source, destination) {
   for(var i  in source) {
       destination[i] = source[i];
   }
}

function putIn(source, destination) {
   var group = source.destination,
       instance = destination;
    if(group) {
       instance = destination[group] || {};
       destination[group] = instance;
    }
    instance[source.fieldName] = source.value;
}

eventBus.on("ruleset", function (ruleset) {
    processRuleSet(ruleset.scheme, ruleset.catCode, ruleset.aggregated)
});

eventBus.on("result", function(result) {

     if(result.issuer && result.issuer.country === "SGP") {
           console.log(JSON.stringify(result));
     }
});

eventBus.on("programGroup", function(groups) {
    console.log("method of capture combinations");
    var methods = Object.keys(groups);
    methods.forEach(function (item){
        var items = groups[item];
        console.log("=================" + item);
        items.forEach(function(program) {
            console.log(program);
        })
    });
});

function collectTestElement(rule, result, testValue) {
    if(testValue) {
        if(testValue.fieldName === "shortName"
            || testValue.fieldName === "MCC"
            || testValue.fieldName === "bin"
            || testValue.fieldName === "debitCardIndicator"
            || testValue.fieldName === "reimbursementAttribute"
            || testValue.fieldName === "productCode"
            || testValue.fieldName === "methodOfCapture"
            || testValue.fieldName === "refund"
            || testValue.fieldName === "amount"
            || testValue.fieldName === "authorisationCode"
            || testValue.fieldName === "authorised"
            || testValue.fieldName === "catCode"
            || testValue.fieldName === "cardScheme"
            || testValue.fieldName === "mailOrder"
            || testValue.fieldName === "cardValidationRespCode"
            || testValue.fieldName === "isRecurring"
            || testValue.fieldName === "isRefund"
            || testValue.fieldName === "dataLevel"
            || testValue.fieldName === "country"
            || testValue.fieldName === "isChipCardRange"
            || testValue.fieldName === "regulatedValueFlag"
            || testValue.fieldName === "transactionRef"
            || testValue.fieldName === "traceId"
            || testValue.fieldName === "visaProductId"
            || testValue.fieldName === "commercialServiceId"
            || testValue.fieldName === "unitCost"
            || testValue.fieldName === "commodityCode"
            || testValue.fieldName === "productCode"
            || testValue.fieldName === "authVerificationValue"
            || testValue.fieldName === "company"
            || testValue.fieldName === "authCharInd"
            || testValue.fieldName === "region"
            || testValue.fieldName === "chipQualified"
            ) {
            if(testValue.fieldName === "MCC") {
                collectMcc(testValue.original);
            }
            if(testValue.fieldName === "methodOfCapture") {
                collectMethodOfCapture(testValue.original, rule.description);
            }
            putIn(testValue, result);
        }
        //console.log(JSON.stringify(testValue));
    } else {
        console.log("Err! cannot extract value for, please debug"  );
    }
}

function processRuleSet(scheme, catCode, aggregated) {
    var rules = aggregated[scheme][catCode].collection,
        structure = aggregated[scheme][catCode].structure,
        schemeTemplate = templates[cardScheme][scheme],
        catCodeTemplate = schemeTemplate[catCode];
    rules.forEach(function(rule) {
        var result = fromTemplates([schemeTemplate.data, catCodeTemplate]);
        if(structure.isFieldVisible("reimbursementAttribute")) {
            putIn({fieldName: "reimbursementAttribute", value: rule.reimbursementAttribute}, result);
        }
        structure.conditions.forEach(function(condition) {
            if(structure.isFieldVisible(condition)) {
                var qualification = rule.getQualificationByCode(condition);
                if(qualification) {
                    var testValue = structure.getValue(cardScheme, condition, qualification);
                    if(Array.isArray(testValue)) {
                        testValue.forEach(function (val) {
                            collectTestElement(rule, result, val);
                        })
                    } else {
                        collectTestElement(rule, result, testValue);
                    }

                } else {
                    //   console.log("Err! Qualification not found: " + condition);
                }
            }
        });
        var fee = {};
        if(structure.isFieldVisible("feePercentage")) {
            fee.feePercentage = rule.feePercentage;
        }
        if(structure.isFieldVisible("flatFee")){
            fee.flatFeeAmount = parseFloat( rule.flatFee.numeric);
            if(rule.flatFee.currency!== undefined) {
                fee.flatFeeCurrency = rule.flatFee.currency;
            }
        }
        if(structure.isFieldVisible("minFee")) {
            if(rule.minFee) {
                fee.minFee = rule.minFee;
            }
        }
        if(structure.isFieldVisible("maxFee")) {
            if(rule.maxFee) {
                fee.maxFee = rule.maxFee;
            }
            fee.descriptor = rule.description;
        }
        putIn({fieldName: "ruleId", value: rule.itemId +""+ rule.schemeId}, result);
        putIn({fieldName: "fee", value: fee}, result);
        //eventBus.emit("result", result)
        /*if(merchantCountry !== undefined) {
         if(result.merchant.country !== undefined && result.merchant.country === merchantCountry) {
         asXML(result);

         //console.log(JSON.stringify(result) +",");
         }
         } else {
         asXML(result);
         //console.log(JSON.stringify(result) + ",");
         }*/

        //console.log("---------------------------------------------------------------------------------");
    });
    /*console.log("------------------extracted MCC combinations");
     for(var i in mccCombinations) {
     console.log(mccCombinations[i]);
     }*/
}

interchange.loadRules(cardScheme, function(aggregated) {
 var catCodes = undefined,
     schemes = Object.keys(aggregated);
    schemes.forEach(function (scheme) {
        catCodes = Object.keys (aggregated[scheme])
        if(catCodes) {
        catCodes.forEach(function (catcode) {
             eventBus.emit("ruleset", {catCode: catcode, scheme: scheme, aggregated: aggregated});
            });
        }
    });
     eventBus.emit("programGroup", programGroups);


}, "test");
