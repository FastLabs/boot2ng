var parser = require('./parser.js'),
    fs = require('fs')
    ;


fs.readFile('./rules.txt', function(err, data) {
   if(err) {
       console.log('error reading the data');
   } else {
       process(new String(data));
   }
});

function process(toParse) {
    var x = parser.parse(toParse);
    //console.log(x);
}
