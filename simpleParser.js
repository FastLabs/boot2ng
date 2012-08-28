//var parser = require('./parser.js');
var toParse = '** ';

var content = [
    '** first comment',
    'MCDOMC0001DT00004004CASH CHIP (DOM)                     DC75 750000 0000000GBP0000      000000    ',
    'MCDOMC0001QU01CPYPICHCLLO                                                                         '
];

var SCHEME = {
    'MC' : 'MasterCard',
    'VI' : 'Visa'
};

var SchemeExtractor = function() {
    this.extract = function() {

    }
}

var handleDetailRecord = function() {

};

var commentPattern = new RegExp('\\*{2}[\\s]+(.)*','ig');
var detailRecordPattern = new RegExp('.{9}DT(.)*$');
var qualificationRecordPattern = new RegExp('.{9}QU(.)*$');

for(var i in content){
    var result,
        element = content[i];
        if(element.match(commentPattern)) {
            console.log('comments');
            continue;
        }
        if(result = element.match(detailRecordPattern)){
           handleDetailRecord(result.input);
            continue;
        }
    if(result = element.match(qualificationRecordPattern)) {
        console.log('qualification');
    }

}

//var result = detailRecordPattern.exec(content[1]);
//console.log(content[1].match(detailRecordPattern));
//console.log(result);
//var x = parser.parse(toParse);
//console.log(x);


