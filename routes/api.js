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
    loadRules: loadRules
};