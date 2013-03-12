var processor = require('./processor.js'),
    dtGenerator = require('./generator.js'),
    testing = require('./testing.js'),
    optimize = require('./optimize.js');

var SchemeFields = {
    Common:  [
        "AB",// acquirer bin
        "AR",// authorisation response
        "AU", // is the transaction authorised
        "AV", // avs response code
       // "BS",
        //"BT",
        "CA", // Customer Activated Terminal Type, found CAN in mastercard
        "CC", // country code equality
        "CP", // method of capture
        "CQ", //CQ chip qualified issuer
        "CR", // car rental
        "CS", // card scheme
        "CT", // country code
        "CV", // cardholder validation
        "DA", //data attribute check the C**** fields
        "DB",// transaction is refund
        "DD", //timeliness
        "EH",// Electronic Hot Card File
        "FL", //Floor limit - not in use
        "HT", // Hotel
        "DC",// debit card indicator
        "MO",// mail order
        "MC", //mcc range
        "PR",// product code
        "RC",// compare region code
        "RE",// region code
        "RP", //requested payment service, not used (visa only)
        "RT",//recurring transaction
        "TK",// transaction amount
        "LV",// data level, checks industry specific
        "PI",// preferential interchange, used in bilateral rules, ignore where the company is checked
        "feeDescriptor",
        "C1061" // Short name ends EXEMPT
        ,"LI028" // Unit Cost not zeros
        ,"C2201" // regulated value flag set
        ,"C2072" // Trans Ref not spaces
        ,"LI105" // Product Code not spaces/ commodity code
        ,"C2311" // Trace ID not spaces
        , "C2202" // Visa Product ID G1
     ],
    Visa: [
        "AC", //authorisation characteristic indicator
        "C1064", // Short name ends ZZ1
        "C2002", // ISSUER BIN 448448
        "C2092", // Not a refund
        "C2041", // Company is 686747
        "C2310", // Chip card range
        "C2204", // Issuer Comm Service Id E or K
        "LI047", // Product Code not spaces
        "reimbursementAttribute", "feePercentage", "minFee" , "maxFee", "flatFee"
    , "C2205",
    "C2464"
    , "C2326"],
    MasterCard: [
        "BS", //business service agreement
        "BT", //business service agreement type
        "C2390", // Brand is Maestro
        "C1215", // MC Ass ID not '0'
        "C2463", // PayPass card indicator set to Y
        "LI062", // Item Description Not Spaces
        "LI088", // Quantity not zero
        "C2119", // Auth code ends S
        "C2315", // Trace ID is MasterCard
        "IT021", // Ticket Number not spaces
        "IT037", // Passenger Name not spaces
        "IT057", // Orig Airport not spaces
        "IT118", // At least one trip leg
        "IT120", // Carrier Code not spaces
        "IT124", // Dest Airport not spaces
        "IT133", // Travel Date not zero
        "LI095", // VAT Rate not zero
        "LI017", // Tax amount not zero
        "PA021", // Tax amount not zero
        "IT122", // Service Class not spaces
        "LO022", // Arrival date not zero
        "LO133", // Departure date not zero
        "LO139", // Folio Number not spaces
        "LI035", // Unit of Measure not spaces
        "interchangeRateDesignator"]
};

function contains(array, value) {
    for(var i in array) {
        var val = array[i];
        if(val === value) {
            return true;
        }
    }
    return false;
}
function getQualificationByCode(code) {
    if(this.qualification) {
        for(var i in this.qualification) {
            var q = this.qualification[i].qualification;
            if(q.fieldCode === code) {
                return q;
            }
        }
    }
}

function getFieldDescription(scheme, fieldCode) {
        var result = processor.FieldDescMap[fieldCode];
        if(result === undefined && scheme === "Visa") {
        result = processor.VisaFields[fieldCode];
    }
    if(result=== undefined && scheme === "MasterCard") {
        result = processor.MasterCardFields[fieldCode];
    }

    return (result !== undefined)? result:"";
}

function getColumnVerbalisation( scheme, fieldCode) {
    var result = dtGenerator.getContentBuilder(scheme, fieldCode);
    if(result === undefined) {
        console.log("cannot find content builder for >>> " + fieldCode);
    }
    return (result && result.column !== undefined)?result.column:"";
}

function getCellSentence(scheme, fieldCode, qualification) {
    var sentenceBuilder = dtGenerator.getContentBuilder(scheme, fieldCode);
    if(sentenceBuilder && sentenceBuilder.getSentence) {
        return sentenceBuilder.getSentence(qualification);
    }
    return "";
}

function getColumnHeader(scheme, fieldCode, columnCode) {
    var headerBuilder = dtGenerator.getContentBuilder(scheme, fieldCode);
    if(headerBuilder && headerBuilder.getTitle) {
        return headerBuilder.getTitle(columnCode)
    }
    return "";
}

function isFieldVisible(fieldName) {
    var fieldCount = this.fields.length;
    for(var i = 0; i< fieldCount;i++) {
        if(this.fields[i] === fieldName) {
            return true;
        }
    }
    return false;
}

var patchMap = {
    code: {
        isFieldVisible: isFieldVisible,
        getFieldDesc: getFieldDescription,
        getColumnVerbalisation: getColumnVerbalisation,
        getCellSentence: getCellSentence,
        getColumnHeader:getColumnHeader
    },
    test: {
        isFieldVisible: isFieldVisible,
        getValue: testing.getValue
    },
    optimize: {
        isFieldVisible: isFieldVisible,
        getValue: optimize.getValue,
        getCondition: optimize.getCondition,
        getColumnVerbalisation: getColumnVerbalisation,
        getCellSentence: getCellSentence,
        getColumnHeader:getColumnHeader
    }
};

function copyProperties(source, destination) {
    for(var i in source){
        destination[i] = source[i];
    }
}

function getStructure(inherited, rule, selector) {
    if(inherited.init === true) {
        inherited.conditions = [];
        inherited.fields = [].concat(SchemeFields.Common, SchemeFields[inherited.schemeName]);
        var patch = patchMap[selector];
        if(patch) {
            //inherited.isFieldVisible = patch.isFieldVisible;
            //inherited.getFieldDesc = patch.getFieldDesc;
            //inherited.getColumnVerbalisation = patch.getColumnVerbalisation;
            //inherited.getCellSentence = patch.getCellSentence;
            //inherited.getColumnHeader = patch.getColumnHeader;
            copyProperties(patch, inherited);
        }
        inherited.init = false;

    }

    if(rule.qualification) {
        var qualifications = rule.qualification;
        qualifications.forEach(function(qualification) {
            var q = qualification.qualification;
            if(q.fieldCode === undefined) {
                console.log("->" + q.sentence);
            }
            if(!contains(inherited.conditions, q.fieldCode)) {
                inherited.conditions.push(q.fieldCode);
            }
        })
    }
    return inherited;
}


function getAggregated(schemeName, rules, selector) {

    var aggregated = {},
        sel = selector || "code"
    rules.forEach(function (rule) {
        rule.getQualificationByCode = getQualificationByCode;
        var scheme = processor.scheme[rule.scheme.code],
            catCode = processor.catCodes[rule.categoryCode.code];
        var schemeGroup = aggregated[scheme];
        if(schemeGroup) {
            var catCodeGroupCollection = schemeGroup[catCode];
            if(catCodeGroupCollection) {
                catCodeGroupCollection.collection.push(rule);
                catCodeGroupCollection.structure = getStructure(catCodeGroupCollection.structure, rule, sel);
            } else {
                catCodeGroupCollection = [rule];
                schemeGroup[catCode] = {collection: catCodeGroupCollection,
                    structure: getStructure({init:true, schemeName: schemeName}, rule, sel)
                };
            }
        }else {
            var catCodeCollection = [rule];
            schemeGroup = { };
            schemeGroup[catCode] = { collection: catCodeCollection,
                structure: getStructure({init: true, schemeName: schemeName}, rule, sel)
            };
            aggregated[scheme] = schemeGroup;
        }
    });
    return aggregated;
}

module.exports = {
    getAggregated: getAggregated,
    contains: contains
};