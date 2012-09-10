var parser = require('./parser.js'),
    fs = require('fs')
    util = require('util')
    processor = require('./processor.js');

var filesToProcess = ["./Visa Rules.txt", "./Mastercard Rules.txt"];

fs.readFile('./rules.txt', function (err, data) {
    if (err) {
        console.log('error reading the data');
    } else {
        process(new String(data));
    }
});

function getDescription(rule) {
    var name = rule.categoryCode.description;
    if (rule.scheme) {
        name += " " + rule.scheme.description;
    }
    return name;
}

var aggregated = {};
// first aggregation order:
// categoryCode -> scheme
function aggregate (rule) {
    var scheme = processor.scheme[rule.scheme.code],
        catCode = processor.catCodes[rule.categoryCode.code];
    var schemeGroup = aggregated[scheme];
    if(schemeGroup) {
        var catCodeGroupCollection = schemeGroup[catCode];
        if(catCodeGroupCollection) {
            catCodeGroupCollection.push(rule);
        } else {
            catCodeGroupCollection = [rule];
            schemeGroup[catCode] = catCodeGroupCollection;
        }
    }else {
        var catCodeCollection = [rule];
        schemeGroup = { };
        schemeGroup[catCode] = catCodeCollection;
        aggregated[scheme] = schemeGroup;
    }
}

function toInlineRule(rule) {
    var qualifications = rule.qualification,
        desc = "";

    if(qualifications) {
       var qualificationCount = qualifications.length,
           count = 0;
       qualifications.forEach(function(qualification) {
           var data = "";
           if(qualification.qualification.data) {
               data = qualification.qualification.data;
           }
          desc = desc + ( qualification.qualification.sentence + " " + data) +( (count < qualificationCount -1)?" and ":"" );
          count++;
       });
       return ((desc !== undefined && desc !== "")?" if " +desc + " then ":"") + "set Flat Rate:" + rule.flatFee.sign + rule.flatFee.rate + ((rule.flatFee.currency !== undefined)?rule.flatFee.currency:"")  +"; Min Fee:"+ rule.minFee
           + "; Max Fee:" + rule.maxFee + "; Comment: " + rule.description;
    }
}

function process(toParse) {
    var data = parser.parse(toParse);
    data.forEach(function(rule) {
        aggregate(rule);
    });
    console.log("Total extracted %s", data.length);
    var schemes = Object.keys(aggregated);
    /*-------------------------------------*/
    schemes.forEach(function (schemeGroup) {
        //console.log(schemeGroup);
        var scheme = aggregated[schemeGroup];
        var catCodes = Object.keys(scheme);
        catCodes.forEach(function(catCode) {
            console.log(util.format("Scheme: %s CatCode: %s", schemeGroup, catCode));
            var rules = scheme[catCode];
            rules.forEach(function(rule) {
                console.log("-" + toInlineRule(rule));
            });

        });
    });
}
