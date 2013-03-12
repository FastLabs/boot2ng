function getTitle(columnCode, title) {
    return "<Data Name=\"Definitions(" + columnCode+ ")#HeaderText\"><![CDATA[" + title +"]]></Data>";
}
var domains = {
    PR: {
        Description: "Product Code",
        values: {
            A :"A - ATM",
            G: "G - Visa Travel/Money Card",
            M: "M - MasterCard/EuroCard",
            Q: "Q - Proprietary Card",
            H : "H - Infinite",
            P: "P - Premier",
            B: "B - Business",
            R: "R - Corporate",
            S: "S - Purchase",
            D: "D - Commercial",
            O: "O - Signature Business",
            J: "J - Platinum",
            K: "K - Signature",
            Z: "Z",// this is not listed in the document
            E: "E",
            V: "V",
            S1:"S1",
            S2:"S2",
            S3:"S3",
            K1:"K1",
            G1:"G1",
            I:"I",
            N:"N",
            C: "C",
            G3: "G3",
            L:"L"
        }
    },
    CP: { Description: "method of capture",
        values: {PA: "PA",
        FA: "FA",
        CH: "CH",
        PI: "PI",
        ST: "ST",
        LO: "LO",
        LP: "LP",
        PK: "PK"
        , EG: "EG"
        , EH: "EH"
        , EJ: "EJ"
        , CL: "CL"
        , EK: "EK   "
        }
    },
    DD: {
        description: "Day Indicators",
        values: {
            S: "Saturdays",
            B: "Bank Holidays",
            T: "T",
            P: "P"
        }
    },
    RT: {
        Description: "Recurring transaction allowed or not",
        values: {
           Y: "Allowed",
           N: "Not Allowed"
        }
    },
    RAttr: {
      description: "Reimbursement Attribute",
      values: {
          A: "A",
          B: "B",
          D: "D",
          I: "I",
          J: "J",
          C: "C",
          F: "F",
          0: "0",
          7: "7",
          5: "5",
          6: "6"
      }
    },
    RE: {
        description: "Region",
        values: {
            EU : "Europe",
            7: "7"
        }

    },
    C2464 :{
        description: "account funding source",
        values: {
            C: "Credit",
            D: "Debit",
            P: "Prepaid",
            H: "Charge"
        }
    }
};

MemberMap = {
    A: "Acquirer",
    I: "Issuer",
    M: "Merchant"
};

function getDomain(fieldCode, value, isInt) {
    var domain = domains[fieldCode]
    if(domain) {
        var domainValue = domain.values[value];
        if(domainValue) {
            return domainValue;
        }
    }
    if(isInt) {
        return value ;
    }
    return '"' + value + '"';
}
function getDomainCollection(fieldCode, values, isInt) {
    var result = ""
    for(var i in values) {
        var domainValue = getDomain(fieldCode, values[i], isInt);
        result += domainValue + ((i< values.length-1)?", ":"");
    }
    return result;
}

function getCollection(columnCode, collection, settings) {
    settings = settings ||{}
    if(collection.length == 1) {
        return "<Param><![CDATA["+ getDomain(columnCode, collection[0], settings.isInt) + "]]></Param>"
    } else {
        var prefix = "";
        if(settings.negated !== undefined && settings.negated) {
            prefix = "not";
        }
        var expression = "<Text><![CDATA[<an object> is "+ prefix + " one of <objects>]]></Text>",
            params = "<Param><![CDATA[{" + getDomainCollection(columnCode, collection, settings.isInt) +"}]]></Param>";
        return expression + params;
    }
    return "";
}

var columns = {
    Common:{
        "AV": { column: "the verification value of the authorisation of 'the transaction' is <a string>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Auth Verification Code");
            },
            getSentence: function(data) {
                if(data && data.data) {
                    var result = "";
                    if(data.op.trim() === "not" ) {
                        result = "<Text><![CDATA[<an object> is not <an object>]]></Text>";
                    }

                    result = result + "<Param><![CDATA[\"" + data.data +"\"]]></Param>";
                    return result;
                }
            }
        },

        "C1061":{column: "the short name of 'the transaction' is <a string>",
            getSentence: function(data) {
                if(data && data.value) {
                    return "<Text><![CDATA[<a string> ends with <a string>]]></Text><Param><![CDATA[\"EXEMPT\"]]></Param>"
                }
                return  "";
            },
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Short Name");
            }

        },
        "MC": {column: "the mcc of 'the merchant' is <a number>",
            getSentence: function(data) {
                var inRangesPrefix = "<Text><![CDATA[<a merchant category code> is in ranges <int ranges>]]></Text>",
                //  <Param><![CDATA[{ 5192 to 5192 , 5449 to 5499 , 5994 to 5944 }]]></Param>
                    oneOfPrefix = "<Text><![CDATA[<a merchant category code> is one of <numbers>]]></Text>";
                    //<Param><![CDATA[{ 1233 , 456 }]]></Param>



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
                        return inRangesPrefix + "<Param><![CDATA[{"+ list + "}]]></Param>"
                    } else {
                        for(var i in oneOfOperator) {
                            var range = oneOfOperator[i];
                            list += (range.low ) + (i < oneOfOperator.length - 1?",":"");
                        }
                        return oneOfPrefix + "<Param><![CDATA[{" + list + "}]]></Param>";
                    }
                }
            },
            getTitle: function(columnCode) {
                return getTitle(columnCode, "MCC");
            }
        },


        /*"DC": {column: "the card details of 'the transaction' is debit is <a boolean>",
            getSentence: function(data){
                if(data) {
                    return "<Param><![CDATA["+ data.value + "]]></Param>"
                }
            },
            getTitle: function (columnCode) {
                return getTitle(columnCode, "Is Debit Card")
            }
        }*/
        "DC" :{
            column: "the account funding source of 'the transaction' is <an account funding source>",
            getTitle:function (columnCode) {
                return getTitle(columnCode, "Funding Source");
            },
            getSentence: function(qualification ) {
                if(qualification !== undefined) {
                    var result = "Debit"
                    if(qualification.op === "N") {
                        result = "Credit";
                    }
                    return '<Param><![CDATA[' + result +']]></Param>'
                }
            }
        }
        ,
        "PR": {column: "the product code of 'the issuer' is <a product code>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Product Code");
            },
            getSentence: function(data) {
                if(data) {
                    return getCollection("PR", data.data);
                }
            }
        },
        "CP": {column: "the method of capture of 'the transaction' is <a string>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Capture Method")
            },
            getSentence : function (data) {
                if(data){
                    var negated = false;
                    if(data.op.trim() === "not one of") {
                        negated = true;
                    }
                    return getCollection("CP", data.data, {negated: negated});
                }
            }

        },
        "DB": {column: "'the transaction' is refund is <a boolean>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Is Refund");
            },
            getSentence: function(data) {
                if(data && data.value) {
                    return "<Param><![CDATA["+ data.value + "]]></Param>"
                }
            }

        },
        "TK": {column: "the amount of 'the transaction' converted to GBP is <a number>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "The GBP Amount");
            },
            getSentence: function (data) {
                if(data && data.payload.amount) {
                    var result = "<Text><![CDATA[<a number> is at most <a number>]]></Text>";
                        result += "<Param><![CDATA[" + data.payload.amount +"]]></Param>";
                    return result;
                }
            }

        },
        "DD": {column: "processed in <a number> days including <day differences>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Processed In");
            },
            getSentence: function(data) {
                if(data && data.payload) {
                var result = "<Param><![CDATA[" +data.payload.days + "]]></Param>";
                    result += "<Param><![CDATA[{"+ getDomainCollection("DD", data.payload.data) +"}]]></Param>";
                    return result;
                }
            }

        },
        "AR": {column: "the response of the authorisation of 'the transaction' is <a string>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Authorisation Response")
            },
            getSentence: function(data) {
                if(data) {
                        return getCollection("AR", data.data)
                }
            }
        },
        "AU": {column: "the authorisation of 'the transaction' is authorised is <a boolean>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Is Authorised");
            },
            getSentence: function(data) {
                if(data && data.value) {
                    return "<Param><![CDATA["+ data.value + "]]></Param>"
                }
            }
        },
        "CA": {column: "the cat code of the terminal of 'the merchant' is <a string>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "CAT code");
            },
            getSentence: function (data) {
                if(data) {
                    return "<Param><![CDATA[\""+ data.data +"\"]]></Param>";
                }
            }
        },
        "CS": {column: "the scheme of the card details of 'the transaction' is <a number>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Card Scheme");
            },
            getSentence: function(data) {
                if(data) {
                    var negated = false;
                    if( data.op.indexOf("not one of")< 0) {
                        negated = true;
                    }
                    return getCollection("CS", data.data, {isInt:true});
                }
            }
        },
        "MO": {column: "'the merchant' is marked as MOTO is <a boolean>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "MOTO");
            },
            getSentence: function(data) {
                if(data) {
                    return "<Param><![CDATA["+ data.value +"]]></Param>";
                }
            }
        },
        "CV": {column: "the card validation response code of the card details of 'the transaction' is <a string>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Card Validation Code");
            },
            getSentence: function(data) {
                if(data) {
                    return getCollection("CV", data.data);
                }
            }
        },
        "RT": {column: "recurring transaction is <an allowed or not> for 'the merchant'",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Is Recurring Transaction");
            },
            getSentence: function(data) {
                if(data) {
                    return "<Param><![CDATA[" + getDomain("RT", data.op) + "]]></Param>"
                }
            }

        },
        "RE" : { column: "<geo locateds> of 'the transaction'  have the same Region  and is <regions>",
            getTitle : function(columnCode) {
                return getTitle(columnCode, "Region");
            },
            getSentence: function(data) {
                if(data && data.payload) {
                    var member = "<Param><![CDATA[{" + MemberMap[data.payload.member] +"}]]></Param>",
                        region = "<Param><![CDATA[{"+ getDomainCollection("RE", data.payload.data) + "}]]></Param>";
                    return member + region;
                }
            }
        }
        ,


        "feeDescriptor": {
            getSentence: function (rule) {
                return "<Param><![CDATA[\"" + rule.feeDescriptor +"\"]]></Param>";
            },
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Fee Descriptor");
            }
        },
        "ruleId" : {
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Rule Id");
            },
            getSentence: function(rule) {
                if(rule) {
                    return "<Param><![CDATA[\"" + rule.itemId +""+ rule.schemeId +"\"]]></Param>";
                }
            }
        },
        "CT" : {column: "the country of 'the merchant' is <a string>",
            getTitle: function(columnCode ) {
                return getTitle(columnCode, "Merchant Location");
            },
            getSentence : function(data) {
                if(data && data.country) {
                    return "<Param><![CDATA["+ getDomain("CT", data.country) + "]]></Param>" ;//"<Param><![CDATA["+ data.country + "]]></Param>"
                }
            }
        },
        "LV": { column: "data level of 'the transaction' is <a number>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Data Level");
            },
            getSentence: function(data){
                if(data && data.param) {
                return "<Param><![CDATA[" +data.param + "]]></Param>";
                }
            }
        },


        "C2205": { // TODO: this is not corresponding mapping just to avoid compilation errors
            column: "the card details of 'the transaction' in chip card range is <a boolean>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Chip Card Range");
            },
            getSentence: function(data) {
                if(data && data.value) {
                    var val = ((data.operator === "Y")?true:false);
                    return "<Param><![CDATA["+ val + "]]></Param>";
                }
            }
        },
        "AC": {column: "the characteristics of the authorisation of 'the transaction' is <a string>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Auh. Char. Ind.");
            },
            getSentence: function(data) {
                if(data && data.data) {
                    return getCollection("AC", data.data);//"<Param><![CDATA["+ data.value + "]]></Param>";
                }
            }
        },
        "C2201" : { column :"the flags of 'the transaction' is regulated value is <a boolean>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Is Regulated Flag Set");
            },
            getSentence: function(data) {
                if(data) {
                    return "<Param><![CDATA[true]]></Param>";
                }
            }
        },
        "C2072" : { column: "the reference of 'the transaction' is <a string>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Transaction Reference");
            },
            getSentence: function(data) {
                if(data && data.value) {
                    return "<Param><![CDATA["+ data.value + "]]></Param>";
                }
            }
        },
        "C2311": { column: "the trace id of 'the transaction' is not empty is <a boolean>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Trace Id not spaces");
            },
            getSentence: function(data) {
                if(data) {
                    return "<Param><![CDATA[true]]></Param>";
                }
            }
        },
        "C2202": { column: "the visa product id of 'the transaction' is <a string>",
            getTitle: function (columnCode) {
                return getTitle(columnCode, "Visa Prod. Id");
            },
            getSentence: function (data) {
                if(data && data.value) {
                    return "<Param><![CDATA["+ getDomain("C2202",data.value) + "]]></Param>";
                }
            }
        },


        "LI028": { column: "the unit price of the invoice of the corporate summary of 'the transaction' is <a number>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Unit Price");
            },
            getSentence: function(data) {
                if(data) {
                    return  "<Text><![CDATA[<an object> is not <an object>]]></Text>" + "<Param><![CDATA[0]]></Param>";
                }
            }
        },

        "LI105": { column: "the invoice of the corporate summary of 'the transaction' provides product information is <a boolean>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "CommodityCode");
            },
            getSentence: function(data) {
                if(data) {
                    return "<Param><![CDATA[true]]></Param>";
                }
            }
        },
        "CC": { column: "<geo locateds> of 'the transaction'  have the same {Region}",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Same Region");
            },
            getSentence: function(data) {
                if(data && data.data) {
                    var members = data.data,
                        list = "";
                    for(var i in members) {
                        if (members[i] !== undefined) {
                            list += members[i] + ((i< members.length-1)?", ":"");
                        }
                    }
                    return "<Param><![CDATA[{"+ list +"}]]></Param>";
                }

            }
        },
        "PI": {
            column: "'the merchant' is marked as Premium is <a boolean>",

            getTitle: function(columnCode) {
                return getTitle(columnCode, "Premium Merchant");
            },
            getSentence: function(data) {
                if(data && data.data) {
                    return "<Param><![CDATA[{"+ true +"}]]></Param>";
                }
            }
        }
        ,
        "CQ": { column: "'the issuer' is chip qualified is <a boolean>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Chip Qualified Iss");
            },
            getSentence: function(data) {
                if(data) {
                    return "<Param><![CDATA[" + data.value +"]]></Param>";
                }
            }
        },
        "AI" : {
            column:"'the merchant' is marked as Airline Merchant is <a boolean>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Airline Merchant")
            },
            getSentence: function(data) {
                //TODO: this should be implemented if required
                return "";
            }
        },
        "C2464" : {
            column: "the account funding source of 'the transaction' is <an account funding source>",
            getTitle:function (columnCode) {
                return getTitle(columnCode, "Funding Source");
            },
            getSentence: function(qualification ) {
                if(qualification !== undefined) {
                    return '<Param><![CDATA[' + getDomain("C2464", qualification.value) +']]></Param>'
                }
            }
        }


    },
    MasterCard:{

    },
    Visa: {
        "C1064": { column: "the short name of 'the transaction' is <a string>",
            getSentence : function (data) {
                if(data ) {
                    return "<Text><![CDATA[<a string> ends with <a string>]]></Text><Param><![CDATA[\""+ data.value + "\"]]></Param>"
                }
                return "";
            },
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Short Name");
            }
        },
        "C2002": { column: "the bin of 'the issuer' is <a string>",
            getSentence: function(data) {

                if(data) {
                    console.log(data.value);
                    return "<Param><![CDATA[\""+ data.value +"\"]]></Param>";
                }
            },
            getTitle : function(columnCode) {
                return getTitle(columnCode, "Issuer Bin");
            }
        },
        "C2092": {column: "'the transaction' is refund is <a boolean>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Is Refund");
            },
            getSentence: function(data) {
                if(data) {
                    return "<Param><![CDATA["+ (data.value=='R'?true:false) +"]]></Param>";
                }
            }
        },
        "C2041" : { column: "the company of 'the merchant' is <a string>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Company");
            },
            getSentence: function(data) {
                if(data && data.value) {
                    return "<Param><![CDATA["+ getDomain("C2041", data.value) + "]]></Param>";
                }
                return "";
            }
        },
        "C2310" : { column: "the card details of 'the transaction' in chip card range is <a boolean>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Chip Card Range");
            },
            getSentence: function(data) {
                if(data && data.value) {
                    var val = ((data.operator === "Y")?true:false);
                    return "<Param><![CDATA["+ val + "]]></Param>";
                }
            }
        },
        "C2204": {column:"the commercial service id of 'the issuer' is <a string>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Issuer Comm Service");
            },
            getSentence: function(data) {
                if(data && data.value) {
                    return "<Param><![CDATA["+ getDomain("C2204",data.value) + "]]></Param>";
                }
            }

        },
        "LI047" : { column: "the invoice of the corporate summary of 'the transaction' provides product information is <a boolean>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Product Code Provided")
            },
            getSentence: function(data) {
                if(data) {
                    return "<Param><![CDATA[true]]></Param>";
                }
            }
        },
        "RAttr" : {
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Reimbursement Attribute");
            },
            getSentence: function(rule) {

                return '<Param><![CDATA[' + getDomain("RAttr", rule.reimbursementAttribute) + ']]></Param>';
            }
        },
        "flatFee": {
            getSentence: function (rule) {
                if(!rule.flatFee.currency ) {
                    return "";
                }
                var flatFee = "<Param><![CDATA["+ rule.flatFee.numeric +"]]></Param>",
                    currency = "<Param><![CDATA["+rule.flatFee.currency + "]]></Param>";
                return flatFee + currency;
            },
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Flat Fee")
            }
        },
        "feePercentage" : {
            getSentence: function (rule) {
                return "<Param><![CDATA["+ rule.feePercentage + "]]></Param>"
            },
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Fee %");
            }
        },
        "maxFee" : {
            getSentence: function(rule) {
                return "<Param><![CDATA["+ rule.maxFee + "]]></Param>"
            },
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Max Fee");
            }
        },
        "minFee" : {
            getSentence: function(rule) {
                return "<Param><![CDATA["+ rule.minFee + "]]></Param>"
            },
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Min Fee");
            }
        }
    }


};

function getContentBuilder(scheme, fieldCode) {
   var schemeBuilder =  columns[scheme][fieldCode]
   return schemeBuilder || columns["Common"][fieldCode];
}

module.exports = {
    getContentBuilder : getContentBuilder,
    getDomain: getDomain,
    getDomainCollection: getDomainCollection,
    MemberMap: MemberMap

}