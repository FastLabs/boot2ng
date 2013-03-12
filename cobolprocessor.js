var fs = require('fs')
    Emitter = require('events').EventEmitter;

var inStream = fs.createReadStream("./validation.cobol", {
    flags: 'r',
    encoding: "ascii",
    bufferSize: 1024
});

var outStream = fs.createWriteStream("properties.txt",
        { flags: 'w',
          encoding: "ascii",
          mode: 666 });
var extracted = {},
    remainder = '';

var exp = /VTPT-([0-9a-z'\-'])*/igm,
    lineEmitter = new Emitter();

lineEmitter.on('line', function(line) {
    var matched = line.match(exp);
    if(matched) {

        matched.forEach(function (element){

            var name = element.trim(),
                exist = extracted [name];
            if(exist) {
                exist.count = exist.count+1
            } else {
                extracted[name] = {count: 1};
            }
        });
    }
});


inStream.on('data', function(data) {
    var value = remainder + data,
        endLineIndex;
    do{
        //value = remainder + value;
        endLineIndex = value.indexOf('\n');
    var line = value.substring(0, endLineIndex);
    if(line !== undefined) {
        lineEmitter.emit('line', line);
        //startLineIndex = endLineIndex;
        value = value.slice(endLineIndex+1);
        line = undefined;
    }}
    while(endLineIndex >=0);
    remainder = value;
});

inStream.on('end', function() {
    console.log("->" + "File loaded");
    for(var key in extracted) {
        console.log(key /*+ ": " + extracted[key  ].count*/);
    }
});

inStream.resume();
