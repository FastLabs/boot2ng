var dtHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<ilog.rules.studio.model.dt:DecisionTable xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:ilog.rules.studio.model.dt="http://ilog.rules.studio/model/dt.ecore">'
uuid = require('node-uuid'),
    events = require('events'),
    eventBus = new events.EventEmitter(),
    cardScheme = 'Visa',
    outputPath = "./data/generated/fees/",
    fs = require("fs");

function generateFeeStructure(scheme, path, content) {
    cardScheme = scheme;
    eventBus.emit("save", getTableBody(path.replace('/', ' '), content));
}

function getTableBody(name, content) {
    var dtName = '<name>' + name + '</name>',
        id = '<uuid>' + uuid.v4() + '</uuid>',
        locale = "<locale>en_GB</locale>",
        endTable = "</DT></definition></ilog.rules.studio.model.dt:DecisionTable>",
        content = dtHeader + "\n" + dtName + "\n" + id + "\n" + getDefinition(content.structure) + "\n" + getContent(content) + "\n </Body>"
            + getColumnProperties(content.structure)  + endTable ;
    return {fileName:name + '.dta', content:content};
}

function getContent(content) {
    var start = '<Contents><Partition DefId="C0">',
        rules = content.rules,
        structure = content.structure,
        rulesText = "",
        end = "</Partition></Contents>";
    rules.forEach(function (rule) {
        var partitionId = 1,
            conditions = getProgram(rule);

        structure.conditions.forEach(function (condition) {
            if (structure.isFieldVisible(condition)) {
                var qualification = rule.rule.getQualification(condition),
                    sentence = structure.getCellSentence(cardScheme, condition, qualification);
                conditions += getCondition(partitionId++, sentence);
            }
        });
        rulesText += (conditions + "\n" + getFeeActionSet(structure, rule.rule) + getCloseTags(structure)) + "</Condition>";

    });

    return start + "\n" + rulesText + "\n" + end;
}


function getProgram(rule) {
    if (rule.program === undefined) {
        return "<Condition> <Expression/>";
    }
    return "<Condition> <Expression><Param> <![CDATA[" + rule.program + "]]> </Param></Expression>";
}


function getCloseTags(structure) {
    var result = "";

    structure.conditions.forEach(function (condition) {
        if (structure.isFieldVisible(condition)) {
            result += "</Condition> </Partition>";
        }
    });
    return result;
}
function getCondition(id, sentence) {
    return "<Partition DefId='C" + id + "'>" + "<Condition><Expression>" + ((sentence === undefined) ? "" : sentence) + "</Expression>";
}
function getFeeActionSet(structure, rule) {
    var result = "<ActionSet>"
        + getAction("A0", structure.getCellSentence(cardScheme, "RAttr", rule))
        + getAction("A1", structure.getCellSentence(cardScheme, "flatFee", rule))
        + getAction("A2", structure.getCellSentence(cardScheme, "feePercentage", rule))
        + getAction("A3", structure.getCellSentence(cardScheme, "maxFee", rule))
        + getAction("A4", structure.getCellSentence(cardScheme, "minFee", rule))
        + getAction("A5", structure.getCellSentence(cardScheme, "feeDescriptor", rule))
        + getAction("A6", structure.getCellSentence(cardScheme, "ruleId", rule))

        + "</ActionSet>";
    return result;
}

function getAction(id, sentence) {
    return '<Action DefId="' + id + '"> <Expression>' + sentence + '</Expression> </Action>';
}

function getDefinition(structure) {
    var definitionHeader = '<definition>' +
        '\n<DT Version="7.0" xmlns="http://schemas.ilog.com/Rules/7.0/DecisionTable">' +
        '\n<Body>' +
        '\n <Properties>' +
        '\n<Property Name="Check.Gap" Type="xs:boolean"><![CDATA[false]]></Property>' +
        '\n<Property Name="UI.AutoResizeTable" Type="xs:boolean"><![CDATA[false]]></Property>' +
        '\n<Property Name="UI.RenderBoolean" Type="xs:boolean"><![CDATA[true]]></Property>' +
        '\n</Properties>\n';

    return definitionHeader + getTableStructure(structure);
}

function getTableStructure(structure) {
    var startDef = '<Structure>\n<ConditionDefinitions>',
        conditionDefinition = "",
        id = 1;
    startDef += "<ConditionDefinition Id='C0'> <ExpressionDefinition> <Text><![CDATA[is <a standard fee program> fee program matched]]></Text> </ExpressionDefinition> </ConditionDefinition>"
    structure.conditions.forEach(function (condition) {
        conditionDefinition += getColumnDefinition(id++, structure, condition) + "\n";
    });
    return startDef + conditionDefinition + "\n" + "</ConditionDefinitions>" + "\n" + getActionDefinitions() + "</Structure>";
}
function getColumnDefinition(id, structure, condition) {
    var definition = '<ConditionDefinition Id="C' + id + '">'
        + '<ExpressionDefinition>'
        + '<Text><![CDATA[' + structure.getColumnVerbalisation(cardScheme, condition) + ']]></Text>'
        + '</ExpressionDefinition>\n</ConditionDefinition>';
    return definition;
}

function getActionDefinitions() {
    var reimbursementAttribute = getActionDefinition("A0", "set the reimbursement attribute of 'the fee'  to <a reimbursement attribute>"),
        flatFee = getActionDefinition("A1", "<a number> as flat rate of 'the fee' in <an ISOCurrency code>"),
        percentageFee = getActionDefinition("A2", "set the fee percentage of 'the fee' to <a number>"),
        minAmount = getActionDefinition("A4", "set the min amount of 'the fee' to <a number>"),
        maxAmount = getActionDefinition("A3", "set the max amount of 'the fee' to <a number>"),
        feeDescriptor = getActionDefinition("A5", "set the descriptor of 'the fee' to <a string>"),
        ruleId = getActionDefinition("A6", "set the fired rule of 'the fee' to <a string>");
    return "<ActionDefinitions>" + reimbursementAttribute+  flatFee + "\n" + percentageFee + "\n" + minAmount + "\n" + maxAmount + "\n" + feeDescriptor +"\n"+ ruleId + "</ActionDefinitions>";
}

function getActionDefinition(id, text) {
    return'<ActionDefinition Id="' + id + '">'
        + '\n<ExpressionDefinition>'
        + "\n<Text><![CDATA[" + text + "]]></Text>"
        + '\n</ExpressionDefinition> </ActionDefinition>';

}

function getColumnProperties(structure) {
    var result = '<Resources DefaultLocale="en_GB"><ResourceSet Locale="en_GB">\n'
            + getColumnMeta("C0", "Fee Program"),
        conditions = "",
        headCount = 1;
    structure.conditions.forEach(function (condition) {
        if (structure.isFieldVisible(condition)) {
            conditions += structure.getColumnHeader(cardScheme, condition, "C" + headCount++)
        }
    });
    var action = "";
    if(structure.isFieldVisible("reimbursementAttribute")) {
            action += structure.getColumnHeader(cardScheme, "RAttr", "A0")
    }
    if (structure.isFieldVisible("feePercentage")) {
        action += structure.getColumnHeader(cardScheme, "feePercentage", "A1")
    }
    if (structure.isFieldVisible("flatFee")) {
        action += structure.getColumnHeader(cardScheme, "flatFee", "A2");
    }
    if (structure.isFieldVisible("minFee")) {
        action += structure.getColumnHeader(cardScheme, "minFee", "A3");
    }
    if (structure.isFieldVisible("maxFee")) {
        action += structure.getColumnHeader(cardScheme, "maxFee", "A4");
    }
    if(structure.isFieldVisible("feeDescriptor")) {
        action += structure.getColumnHeader(cardScheme, "feeDescriptor", "A5");
    }

    action += '<Data Name="Definitions(A6)#HeaderText"><![CDATA[Rule Id]]></Data>';
    return result + conditions + action + '\n</ResourceSet></Resources>';

}

function getColumnMeta(id, title) {
    return  '<Data Name="Definitions(' + id + ')#HeaderText"><![CDATA[' + title + ']]></Data>';
}

eventBus.on('save', function (payload) {
    //console.log(payload.content);

    var file = outputPath + payload.fileName + ".xml";
    console.log("saving: " + file);
    fs.writeFile(file, payload.content, function (err) {
        if (err) {
            console.log("error saving the file: " + payload.fileName);
        }
    });
});
module.exports = {
    generateFeeTable:generateFeeStructure
}

