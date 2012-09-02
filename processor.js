var VisaFields = {

}

//{FIELD_NAME} is one of [_, _, _]
//{FIELD_NAME} is not one of [_, _, _]
function handleCollection(fieldMap, structure) {
    var fieldCode = structure.code,
        operator = " one of",
        prefix =  (structure.op === 'Y')?" is":" is not";

    return {
        sentence: fieldMap[fieldCode] + prefix + operator,
        data: structure.data
    }
}
//{FIELD_NAME} is _
//{FIELD_NAME} is not _
function propertyCheck(fieldMap, structure) {
    var operator = (structure.op === 'Y')?" is ": " is not ";
    return {
        sentence: fieldMap[structure.code] + operator,
        data: structure.data
    };
}

function functionCall(fieldMap, structure) {
    return {

    };
}

module.exports = {
    visa: VisaFields,
    handleCollection: handleCollection,
    handleProperty: propertyCheck,
    handleFunction: functionCall
}

