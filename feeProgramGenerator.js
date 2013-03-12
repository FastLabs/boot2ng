

var uuid = require("node-uuid"),
    events = require("events"),
    fs = require("fs"),
    outputPath = "./data/generated/programs/",
    balHeader ='<?xml version="1.0" encoding="UTF-8"?> \n <ilog.rules.studio.model.brl:ActionRule xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:ilog.rules.studio.model.brl="http://ilog.rules.studio/model/brl.ecore">',
    balFooter = '</ilog.rules.studio.model.brl:ActionRule>',
    iterator = 0,
    eventBus = new events.EventEmitter();

function buildRule(order, qualifications,  doc) {
    var name = '<name>QualificationProgram'+ order +'</name>',
        documentation = '<documentation><![CDATA[' + doc +']]></documentation>',
        id = '<uuid>' + uuid.v4() +' </uuid>',
        locale = '<locale>en_GB</locale>',
        body = '<definition><![CDATA[' + getConditions(qualifications) + '\nthen select QualProg' + order +' as fee program;]]></definition>',
        fileName = doc.replace(">", " GREATER THAN ");
    fileName = fileName.replace("<",  " LESS THAN ");
    fileName = fileName.replace(/\//g,  " ");
    return {fileName:  fileName, content:  balHeader +"\n" + name +"\n" + id +"\n"+ documentation + "\n" + locale + "\n" + body +"\n" +balFooter};

}

function getConditions(qualifications) {
    var result = "if all of the following conditions are true : \n";
    qualifications.forEach(function(qualification) {
        result += "- " + qualification + "\n";
    });
    return result;
}

/*function getDocumentation(rules) {
    var doc = "";
    rules.forEach(function(rule) {
        doc+= rule.description +", "
    });
    return doc;
}*/
function generateQualificationProgram (hash, program) {
    eventBus.emit('save', buildRule(iterator++, program.qualification, program.documentation));
}

eventBus.on("save", function (item) {
    var file = outputPath + item.fileName.trim() +".brl";
    console.log("saving: " + file);
    fs.writeFile(file, item.content, function(err) {
        if(err) {
            console.log("error saving the file: " + item.fileName);
        }
    });
});



module.exports = {
    qualificationProgram: generateQualificationProgram
}