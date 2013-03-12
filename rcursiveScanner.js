var EventEmmitter = require("events").EventEmitter,
    fs = require("fs"),
    eventBus = new EventEmmitter(),
    scanPath = process.cwd()+'/data'
    ;

console.log("let's work " + scanPath);

eventBus.on("read-folder", function (instructions) {
    //console.log("--" + instructions.path);
    fs.readdir(instructions.path, function(err, files) {
        if(err) {
            console.log("Eroor Loading directory content: " + instructions.path);
            return;
        }

        if(!files.length) {
            console.log("no files to be listed in: " + instructions.path);
        }
        files.forEach(function(file) {
            var fullPath = instructions.path+ "/" +file;
            console.log(fullPath);
            fs.stat(fullPath, function(err, stat) {
                if(err) {
                    console.log("cannot extract file stats");
                    return;
                }
                if(stat.isDirectory()) {
                    eventBus.emit("read-folder", { path: fullPath, filter: instructions.filter });
                } else {
                    if(file.match(instructions.filter)) {
                        eventBus.emit("process-file", { path: fullPath });
                    }
                }

            });
        }) ;

    });

});

eventBus.on("process-file", function(processInstructions) {
    console.log("@@" + processInstructions.path);
    fs.readFile(processInstructions.path,"ascii", function(err, data) {
        if(err) {
            console.log("error loading data from: " + processInstructions.path);
            return;
        }
        eventBus.emit("");
    });
});

eventBus.on("process-data", function (processDataEvent) {

});

eventBus.emit("read-folder", { path: scanPath, filter: "\\.json"});





