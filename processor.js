var util = require('util');

var VisaFields = {

};

var CatCodes =  McCategoryCodes = {
    BIL: 'Bi-Lateral Settlement',
    DOM: 'Domestic',
    SUB: 'Sub-Regional',
    TER: 'Inter-Regional',
    TRA: 'Intra-Regional',
    DMB: 'UK Domestic',
    DMN: 'Non UK Domestic',
    EXP: 'Exported Domestic',
    TER: 'Inter Regional',
    TRA: 'Intra Regional'
};


MemberMap = {
    A: "Acquirer",
    I: "Issuer",
    M: "Merchant"
};
RegionMap = {
  MC: {
      1: "United States",
      A: "Canada",
      B: "Latin America and the Caribbean",
      C: "Asia/Pacific",
      D: "Europe",
      E: "South Asia/Middle East/Africa"
  },
  VI : {
      1: "United States",
      2: "Canada",
      3: "EU",
      4: "Asia Pacific",
      5: "Latin America",
      6: "CEMEA"
  }
};

var CommonFields = {
    AC: "Authorisation Characteristics",
    AI: "Airline",
    AB: "Acquirer BIN",
    AR: "Authorisation Response",
    AU: "Authorized",
    AV: "Auth Verification Value",
    BS: "Business Service Agreement",
    BT: "Business Service Agreement Type",
    CA: "CAT code (Customer Activated Terminal Type)",
    CC: "Country Code of the %s are %s equal",
    CP: "Method of Capture",
    CQ: "Chip Qualified Issuer",
    CR: "Car Rental",
    CS: "Cardscheme",
    CT: "Country Code",
    CV: "Cardholder Validation",
    DA: "Data Attribute", //this is a complex call that depends on the file structure
    DB: "Refund Transaction",
    DD: "processed in %s days %s: ",
    EH: "Electronic Hot Card File",
    FL: "Floor Limit",
    HT: "Hotel",
    DC: "Debit Card Indicator",
    MO: "Mail Order",
    MC: "MCC",
    PR: "Product Code",
    RC: "Region Code Comparison",
    RE: "Region Code of the %s is %s one of ",
    RP: "Requested Payment Service",
    RT: "Requiring Transactions",
    TK: "transaction amount converted to %s is %s less than %s"
};
var TemplateGenerators = {
  DD: function(template, structure) {
      return util.format(template, structure.days, structure.op, structure.data );
  },
  TK: function(template, structure) {
      return util.format(template,  structure.currency,structure.op, structure.amount);
  },
  RE: function(template, structure) {
      return util.format(template, MemberMap[structure.member], structure.op, structure.data);
  },
  CC: function (template, structure) {
      var members = []
          memberCount = structure.data.length;
      for(var i = 0; i<memberCount; i++) {
          members.push(MemberMap[structure.data[i]]);
      }
      return util.format(template,members, structure.op);
    }
};

var SchemeType = {
    C: 'Cash',
    F: "Funding",
    P: "Purchase"
}

MasterCardFields = {

};

function getField(fieldCode) {
    var result = CommonFields[fieldCode];
    if(!result) {
        result = VisaFields[fieldCode];
    }
    if(!result) {
        result = MasterCardFields[fieldCode];
    }
    return result;
}


//{FIELD_NAME} is one of [_, _, _]
//{FIELD_NAME} is not one of [_, _, _]
function handleCollection(structure) {
    var fieldCode = structure.code,
        operator = " one of",
        prefix =  (structure.op === 'Y')?"":" not";

    return {
        fieldCode: fieldCode,
        sentence: getField(fieldCode) + prefix + ((structure.data.length >1)? operator:""),
        data: structure.data,
        op: prefix + ((structure.data.length >1)? operator:"")
    }
}
// is {FIELD_NAME}
function handleBooleanCheck(structure) {
    var operator = (structure.op === 'Y')?"is": "is not";
    return {
        fieldCode: structure.code,
        sentence: operator + " " + getField(structure.code),
        op: structure.op,
        data: ""
    };
}
//{FIELD_NAME} is _
//{FIELD_NAME} is not _
function propertyCheck(fieldMap, structure) {
    var operator = (structure.op === 'Y')?" is ": " is not ";
    return {
        sentence: getField(structure.code) + operator,
        data: structure.data,
        fieldCode: structure.code
    };
}

function handleFunctionCall(structure) {
    var sentenceTmpl = getField(structure.code),
        fnGenerator = TemplateGenerators[structure.code],
        sentence;
    if(fnGenerator) {
        sentence = fnGenerator(sentenceTmpl, structure);
    }
    return {
        fieldCode:structure.code,
        sentence: sentence
    };
}

function handleRangeCheck(structure) {
    var operator = ((structure.op === 'Y')? "": "not ") + "in the ranges";
    var ranges = "";
    if(structure.data) {
        structure.data.forEach(function(range) {
           ranges = ranges + range.low + "-" + range.top +", ";
        });
    }
    return {
        sentence: getField(structure.code) + " " + operator,
        fieldCode: structure.code,
        data: ranges,
        op: operator
    };
}
function handleCondition(structure) {
    return {
        sentence: getField(structure.code) + " " + structure.op + " " + structure.value,
        fieldCode: structure.code
    };
}

function presentAndNotEmpty (value) {
    var result = (value !== undefined)?value.trim():undefined;
    if(result !== undefined && result.length > 0) {
        return result;
    }
}


module.exports = {
    catCodes: CatCodes,
    scheme: SchemeType,
    visa: VisaFields,
    regions: RegionMap,
    handleRange: handleRangeCheck,
    handleBoolean: handleBooleanCheck,
    handleCollection: handleCollection,
    handleProperty: propertyCheck,
    handleFunction: handleFunctionCall,
    valuePresent: presentAndNotEmpty,
    handleCondition: handleCondition
}

