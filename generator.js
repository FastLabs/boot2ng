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
            Z: "Z"// this is not listed in the document
        }
    },
    DD: {
        description: "Day Indicators",
        values: {
            S: "Saturdays",
            B: "Bank Holidays"
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
          B: "B",
          D: "D",
          I: "I",
          C: "C",
          F: "F",
          0: "0"
      }
    }

}
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

function getCollection(columnCode, collection, isInt) {
    if(collection.length == 1) {
        return "<Param><![CDATA["+ getDomain(columnCode, collection[0], isInt) + "]]></Param>"
    } else {
        var expression = "<Text><![CDATA[<an object> is one of <objects>]]></Text>",
            params = "<Param><![CDATA[{" + getDomainCollection(columnCode, collection, isInt) +"}]]></Param>";
        return expression + params;
    }
    return "";
}

var columns = {
    Visa:{
        "RAttr" : {
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Reimbursement Attribute");
            },
            getSentence: function(rule) {
                return getDomain("RAttr", rule.reimbursementAttribute);
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
        "MC": {column: "the mcc of the mcc of the merchant of the acquirer of 'the transaction' is <a number>",
            getSentence: function(data) {
                return "";
            },
            getTitle: function(columnCode) {
                return getTitle(columnCode, "MCC");
            }
        },
        "C2002": { column: "the bin of the issuer of 'the transaction' is <a string>",
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
        "DC": {column: "the card details of the issuer of 'the transaction' is debit is <a boolean>",
            getSentence: function(data){
                if(data) {
                    return "<Param><![CDATA["+ data.value + "]]></Param>"
                }
            },
            getTitle: function (columnCode) {
                return getTitle(columnCode, "Is Debit Card")
            }
        },
        "PR": {column: "the product code of the issuer of 'the transaction' is <a product code>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Product Code");
            },
            getSentence: function(data) {
                if(data) {
                    return getCollection("PR", data.data);
                }
            }
        },
        "CP": {column: "the capture method of 'the transaction' is <a string>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Capture Method")
            },
            getSentence : function (data) {
                if(data) {
                    return getCollection("CP", data.data)
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
        "CA": {column: "the cat code of the terminal of the merchant of the acquirer of 'the transaction' is <a string>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "CAT code");
            },
            getSentence: function (data) {
                if(data) {
                    return "<Param><![CDATA[\""+ data.data +"\"]]></Param>";
                }
            }
        },
        "CS": {column: "the scheme of the card details of the issuer of 'the transaction' is <a number>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Card Scheme");
            },
            getSentence: function(data) {
                if(data) {
                    return getCollection("CS", data.data, true);
                }
            }
        },
        "MO": {column: "the flags of 'the transaction' is moto is <an object>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "MOTO transaction");
            },
            getSentence: function(data) {
                if(data) {
                    return "<Param><![CDATA["+ data.value +"]]></Param>";
                }
            }
        },
        "CV": {column: "the card validation response code of the card details of the issuer of 'the transaction' is <a string>",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Card Validation Code");
            },
            getSentence: function(data) {
                if(data) {
                    return getCollection("CV", data.data);
                }
            }
        },
        "RT": {column: "recurring transaction is <an allowed or not> for the merchant of the acquirer of 'the transaction'",
            getTitle: function(columnCode) {
                return getTitle(columnCode, "Is Recurring Transaction");
            },
            getSentence: function(data) {
                if(data) {
                    return "<Param><![CDATA[" + getDomain("RT", data.op) + "]]></Param>"
                }
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
        "flatFee": {
            getSentence: function (rule) {
                if(!rule.flatFee.currency ) {
                    return "";
                }
                var flatFee = "<Param><![CDATA["+ rule.flatFee.rate +"]]></Param>",
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
    },
    MasterCard:{

    }

};

module.exports = {
    columns:columns
}