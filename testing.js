function getNegation(data, value) {
    var found = false;
    for(i in data) {
        found = false;
        for(j in value) {
            if(data[i] == value[j]) {
                found = true;
                break;

            }
        }
        if(!found) {
            return data[i];
        }
    }
}

var memberCodes = {
        "I": "issuer",
        "A" : "acquirer",
        "M": "merchant"
    },
    columns = {
    Visa: {
        "reimbursementAttribute":{
            getValue: function(value) {
                return value;
            }
        },
        "C1061": {
            getValue: function(qualification) {
                return {fieldName: "shortName", value: "_" + qualification.value};
            }
        },
        "AB": {
            getValue: function(qualification) {
                if(qualification.data && qualification.data.length) {
                    return {fieldName: "bin", value: qualification.data[0], destination: "acquirer"};
                }
            }
        },
        "AC": {
            getValue: function(qualification) {
                if(qualification.data) {
                    return {fieldName: "authCharInd", value: qualification.data[0], destination:"authorisation"};
                }
            }
        },
        "MC": {
            getValue: function(qualification) {
                return {fieldName: "MCC", value: qualification.original[0].low, destination: "merchant", original: qualification.original};
            }
        },
        "C1064": {
            getValue: function(qualification) {
                return {fieldName: "shortName", value: "_" + qualification.value};
            }
        },
        "C2002": {
            getValue: function(qualification) {
                return {fieldName: "bin", value: qualification.value, destination:"issuer"};
            }
        },
        "DC": {
            getValue: function(qualification) {
                return {fieldName: "debitCardIndicator", value: qualification.value, destination: "issuer" };
            }
        },
        "PR": {
            getValue: function(qualification) {
                if(qualification.data && qualification.data.length >0) {
                    return {fieldName: "productCode", value: qualification.data[0], destination: "issuer" };
                }
            }
        },
        "CP": {
            getValue: function(qualification) {
                if(qualification.data && qualification.data.length >0 ) {
                    var negated = false;
                    if(qualification.op.trim() === "not one of") {
                        negated = true;
                    }

                    return {fieldName: "methodOfCapture",original: qualification.data, value: (negated)?getNegation(["EG", "EH", "EK", "ST", "CH", "PI", "CL"], qualification.data):qualification.data[0]};
                }
            }
        },
        "DB": {
          getValue: function(qualification) {
             return {fieldName: "refund", value: qualification.value };
          }
        },
        "TK": {
            getValue: function(qualification) {
                if(qualification.payload) {
                    return {fieldName: "amount", value: parseFloat(qualification.payload.amount)};
                }

            }
        },
        "DD": {//Not yet required in the test as is stubbed, to be implemented later
            getValue: function(value) {
                return value;
            }
        },
        "AR": {
            getValue: function(qualification) {
                if(qualification.data && qualification.data.length >0) {
                    return {fieldName: "authorisationCode", value: qualification.data[0], destination:"authorisation"};
                }
            }
        },
        "AU": {
            getValue: function(qualification) {
                return {fieldName: "authorised", value: qualification.value, destination: "authorisation" };
            }
        },
        "CA": {
            getValue: function(qualification) {
                return {fieldName: "catCode", destination:"merchant", value: qualification.data};
            }
        },
        "CS": {
            getValue: function(qualification) {
                if(qualification.data && qualification.data.length > 0) {
                    return {fieldName: "cardScheme", destination: "issuer", value: qualification.data[0] }
                }
            }
        },
        "MO": {
            getValue: function(qualification) {
                return {fieldName: "mailOrder", value: qualification.value};
            }
        },
        "CV": {
            getValue: function(qualification) {
                if(qualification.data && qualification.data.length > 0) {
                return {fieldName:"cardValidationRespCode", destination: "issuer", value: qualification.data[0]};
                }

            }
        },
        "RT": {
            getValue: function(qualification) {
                return {fieldName: "isRecurring", value: qualification.value, destination: "merchant"};
            }
        },
        "C2092": {
            getValue: function(qualification) {
                return {fieldName: "isRefund", value:( qualification.value === "R"?true:false)}
            }
        },
        "LV" : {
            getValue: function(qualification) {
                return {fieldName: "dataLevel", value: qualification.param};
            }
        },
        "CT": {
            getValue: function(qualification) {
                var result = [];
                if(qualification.members) {
                     qualification.members.forEach(function (member) {
                         if(memberCodes[member]) {
                            result.push({fieldName:"country", destination:memberCodes[member], value: qualification.country});
                         } else {
                             console.log("****Error finding the member code !!!!!");
                         }
                     });
                };
                return result;
                //return {fieldName:"country", destination:"merchant", value: qualification.country};
            }
        },
        "C2041" : {
            getValue: function(qualification) {
                return {fieldName: "company", value: qualification.value, destination: "merchant"};
            }
        },
        "C2310" : {
            getValue: function(qualification) {
                var v = qualification.operator === 'Y'? true:false;
                return {fieldName: "isChipCardRange", value:v, destination: "issuer" };
            }
        },
        "C2201" : {
            getValue: function(qualification) {
                return {fieldName: "regulatedValueFlag", value : true };
            }
        },
        "C2072" : {
            getValue: function(qualification) {
                return {fieldName: "transactionRef", value: qualification.value };
            }
        },
        "C2311" : {
            getValue: function(qualification) {
                return {fieldName: "traceId", value:"TRACE_ID"}
            }
        },
        "C2202": {
            getValue: function(qualification) {
                return {fieldName: "visaProductId", value: qualification.value};
            }
        },
        "C2204": {
            getValue: function(qualification) {
                return {fieldName: "commercialServiceId", value: qualification.value, destination: "issuer"};
            }
        },
        "LI028": {
            getValue: function(qualification) {
                return {fieldName: "unitCost", value: 10.0, destination: "invoice"};
            }
        },
        "LI047": {
            getValue: function(qualification) {
                return {fieldName: "productCode", value: "ANY", destination: "invoice"};
            }
        },
        "LI105" : {
            getValue: function(qualification) {
               return {fieldName: "commodityCode", value: "ANY", destination: "invoice"};
            }
        },
        "AV": {
            getValue: function(qualification) {
                var value = qualification.value;
                if(qualification.op.trim() === "not") {
                    value = "X";
                }
                return {fieldName: "authVerificationValue", value: value};
            }
        },
        "RE" : {
            getValue: function(qualification) {
                    return {fieldName: "region", destination: memberCodes[qualification.payload.member], value: qualification.payload.original[0].value};
            }
        },
        "CQ": {
            getValue: function(qualification) {
                return {fieldName: "chipQualified", destination: "issuer", value: qualification.value};
            }
        }/*,
        "CC" : {
            getValue: function(qualification) {
                return {fieldName:"mm"}
            }
        }*/

    },
    MasterCard: {

    }
}

var getValue = function (scheme, fieldName, value){
    var builder= columns[scheme][fieldName];
    if(builder) {
        return builder.getValue(value);
    }
}
module.exports = {
    getValue: getValue
}