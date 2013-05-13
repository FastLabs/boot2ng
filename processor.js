var util = require('util');
/*
var VisaFields = {

};
*/

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

var SchemeType = {
    C: 'Cash',
    F: "Funding",
    P: "Purchase"
}

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
      6: "CEMEA",
      7: "7"
  }
};

var CommonFields = {
    AC: "Authorisation Characteristics",
    AI: "Airline",
    AB: "Acquirer BIN",
    AR: "Authorisation Response", //common
    AU: "Authorized", //common
    AV: "Auth Verification Value", //common
    BS: "Business Service Agreement", //MC only
    BT: "Business Service Agreement Type",// MC only
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
    TK: "transaction amount converted to %s is %s less than %s",
    LV: "Data Level",
    PI: "Premium Merchant"
};

var VisaFields = {
    C1061: "Short name ends EXEMPT",
    C1064: "Short name ends ZZ1",
    C2002: "ISSUER BIN 448448",
    C2092: "Not a refund",
    C2041: "Company is 686747",
    C2310: "Chip card range",
    C2201: "regulated value flag set",
    C2072: "Trans Ref not spaces",
    C2311: "Trace ID not spaces",
    C2202: "Visa Product ID G1",
    C2204: "Issuer Comm Service Id E or K",
    LI028: "Unit Cost not zeros",
    LI047: "Product Code not spaces",
    LI105: "Commodity Code not spaces",
    C2326: "validation code",
    C2464: "funding source"
};

var MasterCardFields = {
    BS: "Business Service Agreement",
    BT: "Business Service Agreement type",
    C2390: "Brand is Maestro",
    C1061: "Short name ends EXEMPT",
    C1215: "MC Ass ID not '0'",
    C2463: "PayPass card indicator set to Y",
    LI028: "Unit Price not zero",
    LI062: "Item Description Not Spaces",
    LI088: "Quantity not zero",
    C2119: "Auth code ends S",
    C2315: "Trace ID is MasterCard",
    C2201: "ENHANCED VALUE FLAG SET TO Y",
    C2072: "Trans ref not spaces",
    LI105: "Product Code not spaces",
    IT021: "Ticket Number not spaces",
    IT037: "Passenger Name not spaces",
    IT057: "Orig Airport not spaces",
    IT118: "At least one trip leg",
    IT120: "Carrier Code not spaces",
    IT124: "Dest Airport not spaces",
    IT133: "Travel Date not zero",
    LI095: "VAT Rate not zero",
    C2311: "Trace ID not spaces",
    C2202: "Rate ind = B for Base",
    LI017: "Tax amount not zero",
    PA021: "Tax amount not zero",
    IT122: "Service Class not spaces",
    LO022: "Arrival date not zero",
    LO133: "Departure date not zero",
    LO139: "Folio Number not spaces",
    LI035: "Unit of Measure not spaces"
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
var extractedFields = {};
function getField(fieldCode) {
    var result = CommonFields[fieldCode];
    if(!result) {
        result = VisaFields[fieldCode];
    }
    if(!result) {
        result = MasterCardFields[fieldCode];
    }
    extractedFields[fieldCode] = result;
    return result;
}


//{FIELD_NAME} is one of [_, _, _]
//{FIELD_NAME} is not one of [_, _, _]
function handleCollection(structure) {
    var fieldCode = structure.code,
        operator = " one of",
        prefix =  (structure.op === 'Y')?"":" not";

    var x =  {
        original: structure.original,
        fieldCode: fieldCode,
        fieldName: CommonFields[structure.code],
        sentence: getField(fieldCode) + prefix + ((structure.data.length >1)? operator:""),
        data: structure.data,
        op: prefix + ((structure.data.length >1)? operator:"")
    }
        return x;
}
// is {FIELD_NAME}
function handleBooleanCheck(structure) {
    var operator = (structure.op === 'Y')?"is": "is not",
        value = (structure.op === 'Y')?"true": "false";

    return {
        value: value,
        fieldCode: structure.code,
        fieldName: CommonFields[structure.code],
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
        fieldCode: structure.code,
        fieldName: CommonFields[structure.code]
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
        fieldName: CommonFields[structure.code],
        sentence: sentence,
        payload: structure
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
        fieldName: CommonFields[structure.code],
        data: ranges,
        original: structure.data,
        op: operator
    };
}
function handleCondition(structure) {
    return {
        sentence: getField(structure.code) + " " + structure.op + " " + structure.value,
        fieldCode: structure.code,
        fieldName: CommonFields[structure.code]
    };
}

function presentAndNotEmpty (value) {
    var result = (value !== undefined)?value.trim():undefined;
    if(result !== undefined && result.length > 0) {
        return result;
    }
}


module.exports = {
    FieldDescMap: CommonFields,
    VisaFields: VisaFields,
    MasterCardFields: MasterCardFields,
    MemberMap: MemberMap,
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
    handleCondition: handleCondition,
    extractedFields: extractedFields,
    getField: getField

}

