var generator = require("./generator.js");

function getCollection(columnCode, collection, settings) {
    settings = settings ||{}
    if(collection.length == 1) {
        return  " is " + generator.getDomain(columnCode, collection[0], settings.isInt) ;
    } else {
        var prefix = "";
        if(settings.negated !== undefined && settings.negated) {
            prefix = "not";
        }
        var expression = " is "+ prefix + " one of {",
            params = generator.getDomainCollection(columnCode, collection, settings.isInt) +"}";
        return expression + params;
    }
    return "";
}
function flatArray(array) {
    var result = "";
    array.forEach(function (element) {
        result += element +","
    })
    return result;
}

var columns = {
    Visa:{
        "reimbursementAttribute":{
            getValue:function (value) {
                return value;
            }
        },
        "C1061": {
            getValue: function(qualification) {
                return {fieldName: "shortName", value: qualification.value, hash: "sn:" + qualification.value};
            }
        },
        "AB": {
            getValue: function(qualification) {
                if(qualification.data && qualification.data.length) {
                    return {fieldName: "bin", value: qualification.data[0], destination: "acquirer", hash:"acqbin:"+ qualification.data[0]};
                }
            }
        },
        "AC": {
            getValue: function(qualification) {
                if(qualification.data) {
                    return {fieldName: "authCharInd", value: qualification.data[0], destination:"authorisation", hash: "aci:" + qualification.data[0]};
                }
            },
            getCondition: function(qualification) {
                return "authorisation char indicator is";
            }
        },
        "MC": {
            getValue: function(qualification) {
                var hash = "mcc:";
                if(qualification.original) {
                   qualification.original.forEach(
                       function (pair) {
                           hash = hash + pair.low + "-" + pair.top+ ", ";
                       }
                   );
                }
                return {fieldName: "MCC", value: qualification.original[0].low, destination: "merchant", original: qualification.original, hash:hash};
            },
            getCondition: function(data) {
                var prefix = "the mcc of 'the merchant' is";

                var oneOfOperator = [],
                    inRangesOperator = [];
                if(data && data.original) {
                    var ranges = data.original;
                    ranges.forEach(function(range) {
                        if(range.low == range.top) {
                            oneOfOperator.push(range);
                        } else {
                            inRangesOperator.push(range);
                        }
                    });
                    var list = "";
                    if(inRangesOperator.length > 0) {
                        for(var i in inRangesOperator) {
                            var range = inRangesOperator[i];
                            list += (range.low + " to " + range.top) + (i < inRangesOperator.length - 1?",":"");
                        }

                        for (var j in oneOfOperator) {
                            list += (", " + oneOfOperator[j].low + " to "+ oneOfOperator[j].top);
                        }
                        return prefix + " in ranges {" + list + "}";
                    } else {
                        for(var i in oneOfOperator) {
                            var range = oneOfOperator[i];
                            list += (range.low ) + (i < oneOfOperator.length - 1?",":"");
                        }
                        return prefix  + " is one of {" + list +"}";
                    }
                }
        }
        },
        "C1064": {
            getValue: function(qualification) {
                return {fieldName: "shortName", value: "_" + qualification.value, hash: "sn:"+ qualification.value};
            }
        },
        "C2002": {
            getValue: function(qualification) {
                return {fieldName: "bin", value: qualification.value, destination:"issuer", hash: "issbin:" + qualification.value};
            }
        },
        "DC": {
            getValue: function(qualification) {
                return {fieldName: "debitCardIndicator", value: qualification.value, destination: "issuer", hash: "dci:" + qualification.value };
            }
        },
        "PR": {
            getValue: function(qualification) {
                var hash = "issProdCode:"
                if(qualification.data) {
                    qualification.data.forEach(function (code) {
                       hash = hash + code +",";
                    });
                }
                if(qualification.data && qualification.data.length >0) {
                    return {fieldName: "productCode", value: qualification.data[0], destination: "issuer", hash: hash };
                }
            },
            getCondition: function (data) {
                if(data) {
                    return "the product code of 'the issuer'" + getCollection("PR", data.data);
                }
            }
        },
        "CP": {
            getValue: function(qualification) {
                var hash = "captMeth:";
                if(qualification.data  ) {
                    qualification.data.forEach(function (method) {
                        hash = hash + method +","
                    })
                    return {fieldName: "methodOfCapture",original: qualification.data, value: qualification.data, hash: hash};
                }
            },
            getCondition: function (data) {
                if(data){
                    var negated = false;
                    if(data.op.trim() === "not one of") {
                        negated = true;
                    }
                    return "the  method of capture of 'the transaction'" + getCollection("CP", data.data, {negated: negated});
                }
            }
        },
            "DB": {
                getValue: function(qualification) {
                    return {fieldName: "refund", value: qualification.value , hash: "refund:" + qualification.value};
                }
            },
            "TK": {//TODO: amount I think should be excluded
                getValue: function(qualification) {
                    if(qualification.payload) {
                        return {fieldName: "amount", value: parseFloat(qualification.payload.amount)};
                    }

                }
            },
            "DD": {//TODO: I think this should be excluded from qualification
                getValue: function(qualification) {
                    return {fieldName: "date"};
                }
            },
            "AR": {
                getValue: function(qualification) {
                    if(qualification.data && qualification.data.length >0) {
                        return {fieldName: "authorisationCode", value: qualification.data[0], destination:"authorisation", hash: "authCode:" + qualification.data[0]};
                    }
                }
            },
            "AU": {
                getValue: function(qualification) {
                    return {fieldName: "authorised", value: qualification.value, destination: "authorisation", hash: "authorised:"+ qualification.value };
                },
                getCondition: function(qualification) {
                    if(qualification.value !== undefined && qualification.value === "true") {
                        return "the authorisation of 'the transaction' is authorised";
                    }
                    if(qualification.value !== undefined && qualification.value === "false"){
                        return "it is not true that the authorisation of 'the transaction' is authorised";
                    }
                }
            },
            "CA": {
                getValue: function(qualification) {
                    return {fieldName: "catCode", destination:"merchant", value: qualification.data, hash:"catCode:"+ qualification.data};
                },
                getCondition: function (data) {
                    if(data.data) {
                        return "the cat code of the terminal of 'the merchant' is \"" + data.data +"\"";
                    }
                }
            },
            "CS": {
                getValue: function(qualification) {
                    if(qualification.data && qualification.data.length > 0) {
                        var hash = "cardSch:";
                        if(qualification.data) {
                            qualification.data.forEach(function (element) {
                                hash = hash + element +",";
                            });
                        }

                        return {fieldName: "cardScheme", destination: "issuer", value: qualification.data[0], hash: hash }
                    }
                },
                getCondition: function (data) {
                    if(data) {
                        return  "the scheme of the card details of 'the transaction' " + getCollection("CS", data.data, {isInt:true});
                    }
                }
            },
            "MO": {
                getValue: function(qualification) {
                    return {fieldName: "mailOrder", value: qualification.value, hash: "mo:"+ qualification.value};
                },
                getCondition: function(data) {
                    if(data.op === "N" ) {
                        return "it is not true that the merchant of 'the transaction' is MOTO";
                    }
                    return "the merchant of 'the transaction' is MOTO"
                }
            },
            "CV": {
                getValue: function(qualification) {
                    if(qualification.data && qualification.data.length > 0) {
                        var hash = "cardValidRespCode:" + flatArray(qualification.data);
                        return {fieldName:"cardValidationRespCode", destination: "issuer", value: qualification.data[0], hash: hash};
                    }

                },
                getCondition: function(data) {
                   return  "the card validation response code of the card details of 'the transaction'" + getCollection("CV", data.data);
                }
            },
            "RT": {
                getValue: function(qualification) {
                    return {fieldName: "isRecurring", value: qualification.value, destination: "merchant", hash: "recurr:" + qualification.value};
                },
                getCondition: function(data) {

                    return "recurring transaction is " + generator.getDomain("RT", data.op) + " for 'the merchant'"
                }
            },
            "C2092": {
                getValue: function(qualification) {
                    return {fieldName: "isRefund", value:( qualification.value === "R"?true:false), hash: "refund:" + qualification.value}
                },
                getCondition: function (data) {
                   if( data.value==='R') {
                    return "'the transaction' is refund";
                   }
                    return "it is not true that 'the transaction' is refund";
                }

            },
            "LV" : {
                getValue: function(qualification) {
                    return {fieldName: "dataLevel", value: qualification.param, hash:"lv:"+ qualification.param};
                }
            },
            "CT": {
                getValue: function(qualification){
                    return {fieldName:"country", destination:"merchant", value: qualification.country, hash: "merchCounry:" + qualification.country};
                }
            },
            "C2041" : {
                getValue: function(qualification) {
                    return {fieldName: "company", value: qualification.value, destination: "merchant", hash: "company:" + qualification.value};
                }
            },
            "C2310" : {
                getValue: function(qualification) {
                    var v = qualification.operator === 'Y'? true:false;
                    return {fieldName: "isChipCardRange", value:v, destination: "issuer", hash: "chipRange:" + v};
                },
                getCondition: function(data) {
                    if(data && data.value) {
                        if(data.operator === "Y") {
                            return "the card details of 'the transaction' in chip card range";
                        }
                        return "it is not true that the card details of 'the transaction' in chip card range";
                    }
                }
            },
            "C2201" : {//not qualification program
                getValue: function(qualification) {
                    return {fieldName: "regulatedValueFlag", value : true , hash: "regulatedValueFlag:true"};
                }
            },
            "C2072" : { // not in qualification program
                getValue: function(qualification) {
                    return {fieldName: "transactionRef", value: qualification.value , hash: "tranRef:" +qualification.value};
                }
            },
            "C2311" : {// not in qualification program
                getValue: function(qualification) {
                    return {fieldName: "traceId", value:"TRACE_ID", hash: "traceId:notempty"}
                }
            },
            "C2202": {// not in qualification program
                getValue: function(qualification) {
                    return {fieldName: "visaProductId", value: qualification.value, hash: "visaProdId:"+ qualification.value};
                }
            },
            "C2204": { //not in qualification program
                getValue: function(qualification) {
                    return {fieldName: "commercialServiceId", value: qualification.value, destination: "issuer", hash: "comServid:" + qualification.value};
                }
            },
            "LI028": { // not used in qualification programs
                getValue: function(qualification) {
                    return {fieldName: "unitCost", value: 10.0, destination: "invoice"};
                }
            },
            "LI047": {// not used in qualification programs
                getValue: function(qualification) {
                    return {fieldName: "productCode", value: "ANY", destination: "invoice", hash: "prodCode:hasInfo"};
                },
                getCondition: function(qualification) {
                    var text = " the product code of the issuer of 'the transaction' is"
                }
            },
            "LI105" : {
                getValue: function(qualification) {
                    return {fieldName: "commodityCode", value: "ANY", destination: "invoice", hash: "commCode:hasInfo"};
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
                    var destination = "merchant"
                    if(qualification.payload) {
                        if (qualification.payload.member === "I") {
                            destination = "issuer";
                        } else if(qualification.payload.member === "A") {
                            destination = "acquirer";
                        }
                        return {fieldName: "region", destination: destination, value: qualification.payload.original[0].value};
                    }
                }
            },
            "CQ": {
                getValue: function(qualification) {
                    return {fieldName: "chipQualified", destination: "issuer", value: qualification.value, hash: "chipQualified:" + qualification.value};
                }
            }

    }
}
function getValue(scheme, fieldName, value) {
    var builder = columns[scheme][fieldName];
    if (builder) {
        return builder.getValue(value);
    }
}
function getCondition(scheme, fieldName, value) {
    var builder = columns[scheme][fieldName];
    if (builder && builder.getCondition) {
        return builder.getCondition(value);
    }
}
module.exports = {
    getValue:getValue,
    getCondition: getCondition
}