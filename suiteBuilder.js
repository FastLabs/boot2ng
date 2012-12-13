var interchange = require("./interchange.js"),
    cardScheme = "Visa",
    scheme = "Purchase",
    catCode = "Intra Regional",
    merchantCountry = undefined;

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
                    bin: "123",
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

var mccCombinations = [],
    methodOfCaptureCollection = [];

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
function collectMethodOfCapture (valueCollection) {
    var key = JSON.stringify(valueCollection);
    if(methodOfCaptureCollection.indexOf(key) === -1) {
        methodOfCaptureCollection.push(key)
    }

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

interchange.loadRules(cardScheme, function(aggregated) {

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
                                collectMethodOfCapture(testValue.original);
                            }
                            putIn(testValue, result);
                        }
                           //console.log(JSON.stringify(testValue));
                    } else {
                        console.log("Err! cannot extract value for" + condition );
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
        }
        putIn({fieldName: "ruleId", value: rule.itemId +""+ rule.schemeId}, result);
        putIn({fieldName: "fee", value: fee}, result);
        if(merchantCountry !== undefined) {
            if(result.merchant.country !== undefined && result.merchant.country === merchantCountry) {
                console.log(JSON.stringify(result) +",");
            }
        } else {
            console.log(JSON.stringify(result) + ",");
        }

    //console.log("---------------------------------------------------------------------------------");
    });
    /*console.log("------------------extracted MCC combinations");
    for(var i in mccCombinations) {
        console.log(mccCombinations[i]);
    }*/

    console.log("method of capture combinations");
    methodOfCaptureCollection.forEach(function (item){
        console.log(item);
    })



    //console.log(JSON.stringify(structure));
}, "test");
