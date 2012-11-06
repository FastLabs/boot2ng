var processor = require('./processor.js'),
    dtGenerator = require('./generator.js'),
    testing = require('./testing.js');

var SchemeFields = {
    Common:  ["AC",
        "AB",
        "AR",
        "AU",
        "AV",
        "BS",
        "BT",
        "CA",
        "CC",
        "CP",
        "CQ",
        "CR",
        "CS",
        "CT",
        "CV",
        "DA",
        "DB",
        "DD",
        "EH",
        "FL",
        "HT",
        "DC",
        "MO",
        "MC",
        "PR",
        "RC",
        "RE",
        "RP",
        "RT",
        "TK",
        "LV"],
    Visa: [
        "C1061", // Short name ends EXEMPT
        "C1064", // Short name ends ZZ1
        "C2002", // ISSUER BIN 448448
        "C2092", // Not a refund
        "C2041", // Company is 686747
        "C2310", // Chip card range
        "C2201", // regulated value flag set
        "C2072", // Trans Ref not spaces
        "C2311", // Trace ID not spaces
        "C2202", // Visa Product ID G1
        "C2204", // Issuer Comm Service Id E or K
        "LI028", // Unit Cost not zeros
        "LI047", // Product Code not spaces
        "LI105", // Commodity Code not spaces
        "reimbursementAttribute", "feePercentage", "minFee" , "maxFee", "flatFee"],
    MasterCard: ["C2390", // Brand is Maestro
        "C1061", // Short name ends EXEMPT
        "C1215", // MC Ass ID not '0'
        "C2463", // PayPass card indicator set to Y
        "LI028", // Unit Price not zero
        "LI062", // Item Description Not Spaces
        "LI088", // Quantity not zero
        "C2119", // Auth code ends S
        "C2315", // Trace ID is MasterCard
        "C2201", // ENHANCED VALUE FLAG SET TO Y
        "C2072", // Trans ref not spaces
        "LI105", // Product Code not spaces
        "IT021", // Ticket Number not spaces
        "IT037", // Passenger Name not spaces
        "IT057", // Orig Airport not spaces
        "IT118", // At least one trip leg
        "IT120", // Carrier Code not spaces
        "IT124", // Dest Airport not spaces
        "IT133", // Travel Date not zero
        "LI095", // VAT Rate not zero
        "C2311", // Trace ID not spaces
        "C2202", // Rate ind = B for Base
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
    var result = dtGenerator.columns[scheme][fieldCode];
    if(result === undefined) {
        console.log(">>> " + fieldCode);
    }
    return (result && result.column !== undefined)?result.column:"";
}

function getCellSentence(scheme, fieldCode, qualification) {
    var sentenceBuilder = dtGenerator.columns[scheme][fieldCode];
    if(sentenceBuilder && sentenceBuilder.getSentence) {
        return sentenceBuilder.getSentence(qualification);
    }
    return "";
}

function getColumnHeader(scheme, fieldCode, columnCode) {
    var headerBuilder = dtGenerator.columns[scheme][fieldCode];
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