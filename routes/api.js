var data = require('../data/data.js').schema,
    fs = require('fs');


var structs = function (req, res) {
	console.log('request');
	res.send(data);
};


var rulesCollection;
var loadRules = function() {
    fs.readFile('./rules.json', function(err, data) {
      if(err) {
          console.log('Error loading data');
      } else {
          rulesCollection = JSON.parse(data);
      }
    });
};

var rules = function (req, res) {
    console.log('rule requested');
    res.send(rulesCollection);
};

var saveRule = function(req, res) {
    rulesCollection.push(req.body.payload);
    dumpRules();
};

var deleteRule = function(req, res) {
    var ruleId = req.params.id,
        ruleCount = rulesCollection.length;
    for(var i = 0; i < ruleCount; i++) {
        if(rulesCollection[i].attributes.id === ruleId) {
            rulesCollection.splice(i, 1);
            dumpRules();
            break;
        }
    }
    res.end();
}

var updateRule = function(req, res) {
    var ruleId = req.params.id,
        rule = req.body.payload;

    for(var i in rulesCollection) {
        var currentRule = rulesCollection[i];
        if(currentRule.attributes.id === ruleId) {
            rulesCollection.splice(i, 1);
            rulesCollection.push(rule);
            dumpRules();
            break;
        }
    }
    res.end();
}

var dumpRules = function() {
    var data = JSON.stringify(rulesCollection);
    fs.writeFile('./rules.json', data, function(err) {
        if(err) {
            console.log('Error saving to the rule repository');
        } else {
            console.log('data saved');
        }
    });
};


exports.api = {
    structures: structs,
    rules: rules,
    saveRule: saveRule,
    loadRules: loadRules,
    deleteRule: deleteRule,
    updateRule: updateRule
};