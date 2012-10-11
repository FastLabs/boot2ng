var fs = require('fs'),
    lineReader = require('readline');

var stream = fs.createReadStream("./validation.cobol", {
    flags: 'r',
    encoding: "ascii",
    bufferSize: 1024
});

var pattern = new RegExp("REF-30-(.)+ =");


reader = lineReader.createInterface({
    input: stream,
    output: process.stdout
});

//reader.on('line', function(line) {
//    console.log(line);
//});
/*
stream.on('data', function(data) {
    console.log(data);
    x++;
});
*/

stream.on('end', function() {
    console.log("->" + "File loaded");
    reader.close();
});
stream.resume();
