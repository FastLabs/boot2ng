var fs = require('fs');

var inStream = fs.createReadStream("./validation.cobol", {
    flags: 'r',
    encoding: "ascii",
    bufferSize: 1024
});

var outStream = fs.createWriteStream("properties.txt",
        { flags: 'w',
          encoding: "ascii",
          mode: 666 });

var pattern = new RegExp("REF-30-(.)+ =");
var exp = /REF-([1-9a-z'\-'])*/igm;

inStream.on('data', function(data) {
    console.log(data);
});

inStream.on('end', function() {
    console.log("->" + "File loaded");
});

inStream.resume();
