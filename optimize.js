var generator = require("./generator.js");

function getCollection(columnCode, collection, settings) {
    settings = settings || {}
    if (collection.length == 1) {
        return  " is " + generator.getDomain(columnCode, collection[0], settings.isInt);
    } else {
        var prefix = "";
        if (settings.negated !== undefined && settings.negated) {
            prefix = "not";
        }
        var expression = " is " + prefix + " one of {",
            params = generator.getDomainCollection(columnCode, collection, settings.isInt) + "}";
        return expression + params;
    }
    return "";
}
function flatArray(array) {
    var result = "";
    array.forEach(function (element) {
        result += element + ","
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
        "C1061":{
            getValue:function (qualification) {
                return {fieldName:"shortName", value:qualification.value, hash:"sn:" + qualification.value};
            },
            getCondition:function (qualification) {
                if (qualification && qualification.value) {
                    return "the company of 'the merchant' ends with \"" + qualification.value + "\""
                }
                return  "";
            }
        },
        "AB":{
            getValue:function (qualification) {
                if (qualification.data && qualification.data.length) {
                    return {fieldName:"bin", value:qualification.data[0], destination:"acquirer", hash:"acqbin:" + qualification.data[0]};
                }
            },
            getCondition:function (qualification) {
                if (qualification.data) {
                    var result = "";
                    qualification.data.forEach(function (element) {
                        result += element + ", ";
                    })
                    return "the bin of the acquirer one of {" + result + "}";
                }
            }
        },
        "AC":{
            getValue:function (qualification) {
                if (qualification.data) {
                    return {fieldName:"authCharInd", value:qualification.data[0], destination:"authorisation", hash:"aci:" + qualification.data[0]};
                }
            },
            getCondition:function (qualification) {
                if (qualification.data) {
                    return "the characteristics of 'the authorisation' " + getCollection("AC", qualification.data);
                }

            }
        },
        "MC":{
            getValue:function (qualification) {
                var hash = "mcc:";
                if (qualification.original) {
                    qualification.original.forEach(
                        function (pair) {
                            hash = hash + pair.low + "-" + pair.top + ", ";
                        }
                    );
                }
                return {fieldName:"MCC", value:qualification.original[0].low, destination:"merchant", original:qualification.original, hash:hash};
            },
            getCondition:function (data) {
                var prefix = "the mcc of 'the merchant' is";

                var oneOfOperator = [],
                    inRangesOperator = [];
                if (data && data.original) {
                    var ranges = data.original;
                    ranges.forEach(function (range) {
                        if (range.low == range.top) {
                            oneOfOperator.push(range);
                        } else {
                            inRangesOperator.push(range);
                        }
                    });
                    var list = "";
                    if (inRangesOperator.length > 0) {
                        for (var i in inRangesOperator) {
                            var range = inRangesOperator[i];
                            list += (range.low + " to " + range.top) + (i < inRangesOperator.length - 1 ? "," : "");
                        }

                        for (var j in oneOfOperator) {
                            list += (", " + oneOfOperator[j].low + " to " + oneOfOperator[j].top);
                        }
                        return prefix + " in ranges {" + list + "}";
                    } else {
                        for (var i in oneOfOperator) {
                            var range = oneOfOperator[i];
                            list += (range.low ) + (i < oneOfOperator.length - 1 ? "," : "");
                        }
                        return prefix + " one of {" + list + "}";
                    }
                }
            }
        },
        "C1064":{
            getValue:function (qualification) {
                return {fieldName:"shortName", value:"_" + qualification.value, hash:"sn:" + qualification.value};
            },
            getCondition:function (data) {
                if (data) {
                    return "the short name of 'the merchant' ends with \"" + data.value + "\"";
                }
                return "";
            }
        },
        "C2002":{
            getValue:function (qualification) {
                return {fieldName:"bin", value:qualification.value, destination:"issuer", hash:"issbin:" + qualification.value};
            },
            getCondition:function (data) {
                if (data) {
                    console.log(data.value);
                    return "the bin of 'the issuer' is \"" + data.value + "\"";
                }
            }
        },
        "DC":{
            getValue:function (qualification) {
                var result = "Debit";
                if (qualification) {
                    if (qualification.value === "false") {
                        result = "Credit";
                    }
                }

                return {fieldName:"accountFundingSource", value:qualification.value, hash:"fundSource:" + result };
            },
            getCondition:function (data) {
                if (data) {
                    if (data.value === "false") {
                        return "the account funding source of 'the transaction' is Credit";
                    }
                    return  "the account funding source of 'the transaction' is Debit";
                }
            }
        },
        "PR":{
            getValue:function (qualification) {
                var hash = "issProdCode:"
                if (qualification.data) {
                    qualification.data.forEach(function (code) {
                        hash = hash + code + ",";
                    });
                }
                if (qualification.data && qualification.data.length > 0) {
                    return {fieldName:"productCode", value:qualification.data[0], destination:"issuer", hash:hash };
                }
            },
            getCondition:function (data) {
                if (data) {
                    return "the product code of 'the issuer'" + getCollection("PR", data.data);
                }
            }
        },
        "CP":{
            getValue:function (qualification) {
                var hash = "captMeth:" + qualification.op;
                if (qualification.data) {
                    qualification.data.forEach(function (method) {
                        hash = hash + method + ","
                    });
                    return {fieldName:"methodOfCapture", original:qualification.data, value:qualification.data, hash:hash};
                }
            },
            getCondition:function (data) {
                var operator = " one of ";
                if(data.op !== undefined && data.op !== "") {
                    operator = data.op;
                }
                return "the  method of capture of 'the transaction' is " + operator + " { " + generator.getDomainCollection("CP", data.data) + "}";
            }
        },
        "DB":{
            getValue:function (qualification) {
                return {fieldName:"refund", value:qualification.value, hash:"refund:" + qualification.value};
            },
            getCondition:function (qualification) {
                return " 'the transaction' is Refund";
            }
        },
        "TK":{//TODO: amount I think should be excluded
            getValue:function (qualification) {
                if (qualification.payload) {
                    return {fieldName:"amount", value:parseFloat(qualification.payload.amount), hash:"amount:" + qualification.payload.amount};
                }
            },
            getCondition:function (data) {
                if (data && data.payload.amount) {
                    var result = "the amount of 'the transaction' converted to GBP is at most " + data.payload.amount
                    return result;
                }
            }
        },
        "DD":{//TODO: I think this should be excluded from qualification
            getValue:function (qualification) {
                return {fieldName:"date", hash:generator.getDomainCollection("DD", qualification.payload.data)};
            }, getCondition:function (data) {
                if (data && data.payload) {
                    // var result = "<Param><![CDATA[" +data.payload.days + "]]></Param>";
                    //result += "<Param><![CDATA[{"+ generator.getDomainCollection("DD", data.payload.data) +"}]]></Param>";
                    return "processed in " + data.payload.days + " days including {" + generator.getDomainCollection("DD", data.payload.data) + "}";

                }
            }
        },
        "AR":{
            getValue:function (qualification) {
                if (qualification.data && qualification.data.length > 0) {
                    return {fieldName:"authorisationCode", value:qualification.data[0], destination:"authorisation", hash:"authCode:" + qualification.data[0]};
                }
            },
            getCondition:function (qualification) {
                if (qualification.data.join("").indexOf("Y") >= 0) {
                    return "'the transaction' is marked as Offline Approved";
                }
                return "'the transaction' is marked as Online Authorised";
                // return "the response of the authorisation of 'the transaction' " +getCollection("AR", qualification.data) ;
            }
        },
        "AU":{
            getValue:function (qualification) {
                return {fieldName:"authorised", value:qualification.value, destination:"authorisation", hash:"authorised:" + qualification.value };
            },
            getCondition:function (qualification) {
                if (qualification.value !== undefined && qualification.value === "true") {
                    return "'the transaction' is Authorised";
                }
                if (qualification.value !== undefined && qualification.value === "false") {
                    return "it is not true that 'the transaction' is Authorised";
                }
            }
        },
        "CA":{
            getValue:function (qualification) {
                return {fieldName:"catCode", destination:"merchant", value:qualification.data, hash:"catCode:" + qualification.data};
            },
            getCondition:function (data) {
                if (data.data) {
                    return "the cat code of the terminal of 'the merchant' is \"" + data.data + "\"";
                }
            }
        },
        "CS":{
            getValue:function (qualification) {
                if (qualification.data && qualification.data.length > 0) {
                    var hash = "cardSch:" + qualification.op;
                    if (qualification.data) {
                        qualification.data.forEach(function (element) {
                            hash = hash + element + ",";
                        });
                    }
                    return {fieldName:"cardScheme", destination:"issuer", value:qualification.data[0], hash:hash }
                }
            },
            getCondition:function (data) {
                if (data) {
                    if (data) {
                        var negated = false;

                        if (data.op.trim() === "not one of") {
                            negated = true;
                        }
                        return  "the scheme of the card details of 'the transaction' " + getCollection("CS", data.data, {isInt:true, negated:negated});
                    }
                }
            }
        },
        "MO":{
            getValue:function (qualification) {
                return {fieldName:"mailOrder", value:qualification.value, hash:"mo:" + qualification.value};
            },
            getCondition:function (data) {
                if (data.op === "N") {
                    return "it is not true that 'the merchant' is MOTO";
                }
                return "'the merchant' is MOTO"
            }
        },
        "CV":{
            getValue:function (qualification) {
                if (qualification.data && qualification.data.length > 0) {
                    var hash = "cardValidRespCode:" + flatArray(qualification.data);
                    return {fieldName:"cardValidationRespCode", destination:"issuer", value:qualification.data[0], hash:hash};
                }

            },
            getCondition:function (data) {
                return  "the card validation response code of the card details of 'the transaction'" + getCollection("CV", data.data);
            }
        },
        "RT":{
            getValue:function (qualification) {
                return {fieldName:"isRecurring", value:qualification.value, destination:"merchant", hash:"recurr:" + qualification.value};
            },
            getCondition:function (data) {
                if (data.op === 'Y') {
                    return " 'the transaction' is marked as Recurring ";
                } else {
                    return "it is not true that 'the transaction' is marked as Recurring";
                }
            }
        },
        "C2092":{
            getValue:function (qualification) {
                return {fieldName:"isRefund", value:( qualification.value === "R" ? true : false), hash:"refund:" + qualification.value}
            },
            getCondition:function (data) {
                if (data.value === 'R') {
                    return "'the transaction' is Refund";
                }
                return "it is not true that 'the transaction' is Refund";
            }

        },
        "LV":{
            getValue:function (qualification) {
                return {fieldName:"dataLevel", value:qualification.param, hash:"lv:" + qualification.param};
            },
            getCondition:function (data) {
                if (data && data.param) {
                    return "data level of 'the transaction' is " + data.param;
                }
            }

        },
        "CT":{
            getValue:function (qualification) {
                return {fieldName:"country", destination:"merchant", value:qualification.country, hash:"merchCounry:" + qualification.country};
            },
            getCondition:function (data) {
                if (data && data.country) {
                    return "the country of 'the merchant' is " + generator.getDomain("CT", data.country);
                }
            }
        },
        "C2041":{
            getValue:function (qualification) {
                return {fieldName:"company", value:qualification.value, destination:"merchant", hash:"company:" + qualification.value};
            },
            getCondition:function (data) {
                if (data && data.value) {
                    return "the company of 'the merchant' is " + generator.getDomain("C2041", data.value);
                }
                return "";
            }
        },
        "C2310":{
            getValue:function (qualification) {
                var v = qualification.operator === 'Y' ? true : false;
                return {fieldName:"isChipCardRange", value:v, destination:"issuer", hash:"chipRange:" + v};
            },
            getCondition:function (data) {
                if (data && data.value) {
                    if (data.operator === "Y") {
                        return "the card details of 'the transaction' in chip card range";
                    }
                    return "it is not true that the card details of 'the transaction' in chip card range";
                }
            }
        },
        "C2201":{//not qualification program
            getValue:function (qualification) {
                return {fieldName:"regulatedValueFlag", value:true, hash:"regulatedValueFlag:true"};
            },
            getCondition:function (data) {
                if (data) {
                    return "'the transaction' is Regulated";
                }
            }
        },
        "C2072":{ // not in qualification program
            getValue:function (qualification) {
                return {fieldName:"transactionRef", value:qualification.value, hash:"tranRef:" + qualification.value};
            },
            getCondition:function (data) {
                if (data && data.value) {
                    return "the reference of 'the transaction' is not empty ";
                }
            }
        },
        "C2311":{// not in qualification program
            getValue:function (qualification) {
                return {fieldName:"traceId", value:"TRACE_ID", hash:"traceId:notempty"}
            },
            getCondition:function (data) {
                if (data) {
                    return "the trace id of 'the transaction' is not empty";
                }
            }
        },
        "C2202":{// not in qualification program
            getValue:function (qualification) {
                return {fieldName:"visaProductId", value:qualification.value, hash:"visaProdId:" + qualification.value};
            }, getCondition:function (data) {
                if (data && data.value) {
                    return "the product code of 'the issuer' is " + generator.getDomain("PR", data.value);
                }
            }
        },
        "C2204":{ // large ticket
            getValue:function (qualification) {
                return {fieldName:"commercialServiceId", value:qualification.value, destination:"issuer", hash:"comServid:" + qualification.value};
            }, getCondition:function (data) {
                if (data && data.value) {
                    return "the commercial service id of 'the issuer' is " + generator.getDomain("C2204", data.value);
                }
            }
        },
        "LI028":{ // not used in qualification programs
            getValue:function (qualification) {
                return {fieldName:"unitCost", value:10.0, destination:"invoice"};
            },
            getCondition:function (data) {
                if (data) {
                    return  "the unit price of the invoice of the corporate summary of 'the transaction' is not 0";
                }
            }
        },
        "LI047":{// not used in qualification programs
            getValue:function (qualification) {
                return {fieldName:"productCode", value:"ANY", destination:"invoice", hash:"prodCode:hasInfo"};
            },
            getCondition:function (qualification) {
                var text = "the product code of the issuer of 'the transaction' is"
            }
        },
        "LI105":{
            getValue:function (qualification) {
                return {fieldName:"commodityCode", value:"ANY", destination:"invoice", hash:"commCode:hasInfo"};
            },
            getCondition:function (data) {
                if (data) {
                    return "it is not true that the commodity code of the invoice of the corporate summary of 'the transaction' is empty";
                }
            }
        },
        "AV":{
            getValue:function (qualification) {
                var value = qualification.value;
                if (qualification.op.trim() === "not") {
                    value = "X";
                }
                return {fieldName:"authVerificationValue", value:value, hash:"authVerValue:" + value};
            },
            getCondition:function (data) {
                if (data && data.data) {
                    var result = "";
                    if (data.op.trim() === "not") {
                        return "it is not true that the avs response code of 'the authorisation' is \"" + data.data + '"';
                    }


                    return "the avs response code of 'the authorisation' is \"" + data.data + '"';
                    ;
                }
            }
        },
        "RE":{
            getValue:function (qualification) {
                var destination = "merchant"
                if (qualification.payload) {
                    if (qualification.payload.member === "I") {
                        destination = "issuer";
                    } else if (qualification.payload.member === "A") {
                        destination = "acquirer";
                    }
                    var member = "{" + generator.MemberMap[qualification.payload.member] + "}",
                        region = "{" + generator.getDomainCollection("RE", qualification.payload.data) + "}";
                    return {fieldName:"region", destination:destination, value:qualification.payload.original[0].value, hash:"re:" + member + region};
                }
            },
            getCondition:function (data) {
                if (data && data.payload) {
                    var member = "{" + generator.MemberMap[data.payload.member] + "}",
                        region = "{" + generator.getDomainCollection("RE", data.payload.data) + "}";
                    return member + "of 'the transaction' have the same Region and is" + region;
                }
            }
        },
        "CQ":{
            getValue:function (qualification) {
                return {fieldName:"chipQualified", destination:"issuer", value:qualification.value, hash:"chipQualified:" + qualification.value};
            },

            getCondition:function (data) {
                if (data) {
                    if (data.op.trim() !== "Y") {
                        return "it is not true that 'the issuer' is chip qualified";
                    } else {
                        return "'the issuer' is chip qualified";
                    }
                }
            }
        },
        "PI":{
            getValue:function (qualification) {
                return {fieldName:"premiumMerchant", destination:"merchant", value:qualification.value, hash:"premiumMerchant:"};
            },
            getCondition:function () {
                return "'the merchant' is marked as Premium";
            }
        },
        "AI":{
            getValue:function (qualification) {
                return {fieldName:"airlineMerchant"}
            },
            getCondition:function () {
                return "'the merchant' is marked as Airline";
            }
        },
        "C2326":{
            getValue:function (qualification) {
                return {fieldName:"validationCode", hash:"authValCode:" + qualification.value};
            },
            getCondition:function (qualification) {
                return "the validation code of 'the authorisation' is present";
            }

        },
        "C2464":{
            getValue:function (qualification) {
                if (qualification !== undefined) {
                    return {fieldName:"accountFundingSource", hash:"fundSource:" + qualification.value};
                }

            },
            getCondition:function (qualification) {
                return "the account funding source of 'the transaction' is  " + generator.getDomain("C2464", qualification.value);
            }
        },
        "C2205":{
            getValue:function (qualification) {
                return {fieldName:"visaAgentId", hash:"agentId:" + qualification.value}
            },
            getCondition:function (qualification) {
                return "the agent id of 'the transaction' is \"" + qualification.value + "\"";
            }

        }


    }
}
    function getValue(scheme, fieldName, value)
{
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
    getCondition:getCondition
}