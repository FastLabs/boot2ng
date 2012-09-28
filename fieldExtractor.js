var interchange = require("./interchange.js")
util = require("util"),
    processor = require("./processor.js"),
    aggregator = require("./aggregator.js"),
    EventEmiter = require("events").EventEmitter;

function contains(array, field) {
    var fieldCount = array.length;
    for (var i = 0; i < fieldCount; i++) {
        if (field.code === array[i].code) {
            return true;
        }
    }
    return false;
}

var eventBus = new EventEmiter();

function getSchemeFields(cardScheme) {
    var result = [];
    interchange.loadRules(cardScheme, function (aggregated) {
        var schemes = Object.keys(aggregated);
        schemes.forEach(function (schemeName) {
            var catCodes = aggregated[schemeName],
                catKeys = Object.keys(catCodes);
            catKeys.forEach(function (catCode) {
                var conditions = aggregated[schemeName][catCode].structure.conditions,
                    structure = aggregated[schemeName][catCode].structure;
                conditions.forEach(function (condition) {
                    var field = {code:condition, fieldName:structure.getFieldDesc(cardScheme, condition)};
                    if (!contains(result, field)) {
                        result.push(field);
                    }
                });
            });

        });
        eventBus.emit(cardScheme, result);
    });
}

var visaFields;
var masterFields;
eventBus.on("Visa", function (result) {
    visaFields = result;
    if (masterFields !== undefined) {
        compare();
    }

});
eventBus.on("MasterCard", function (result) {
    masterFields = result;
    if (visaFields !== undefined) {
        compare();
    }

})


getSchemeFields("Visa");
getSchemeFields("MasterCard");

var commonFields = [];
function compare() {
    visaFields.forEach(function (visaField) {
        masterFields.forEach(function (masterCardField) {
            if (masterCardField.code === visaField.code) {
                commonFields.push(visaField);
            }
        });
    });
    commonFields.forEach(function (field) {
        console.log(field.code + " " + field.fieldName);
    })
}

