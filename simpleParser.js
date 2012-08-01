var parser = require('./parser.js');
var toParse = 'abcdefghi';

console.log('try to parse ' + toParse);
var x = parser.parse(toParse);
console.log(x);


