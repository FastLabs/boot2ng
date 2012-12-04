var fs = require("fs"),
    EventEmitter = require('events').EventEmitter,
    path = require("path"),
    fileEmitter = new EventEmitter(),
    toBeScanned = "./data",
    outputDir = "./data/output"
    enrichment = {
        "reimbursementAttribute": function(attribute, instance) {
            if (instance[attribute] === undefined) {
                instance[attribute] = "RA_NEW";
            }
            else {
                instance[attribute] = "RA_OVERIDDEN";
            }
        },
        "issuer/region": function(attribute, instance) {
            instance[attribute] = "3";
        }
    };

function lookupInstance(path, instance) {
    var elements = path.split("/"),
        i = 0,
        pathElementCount = elements.length - 1,
        currentInstance = instance;
    while(i< pathElementCount) {
        currentInstance = currentInstance[elements[i++]];
    }

    return {
        element: elements[i] ,
        instance: currentInstance
    };
}

function save (fileName, instance) {
    var data = JSON.stringify(instance);
    fs.writeFile(outputDir + "/" + fileName, data, function (err) {
        if(err) {
            console.log("error saving the file");
        }
    })
}

function process( instance) {
    var keys = Object.keys(enrichment);

    keys.forEach(function(key) {

        var transformer = enrichment[key],
            toBeTransformed = lookupInstance(key, instance);
        console.log(toBeTransformed);
        if (transformer) {
            transformer(toBeTransformed.element, toBeTransformed.instance);
        }
    });

}

fileEmitter.on('file', function(fileName) {

    fs.readFile(toBeScanned + "/" + fileName, "ascii", function(err, data) {
        if (err) {
            console.log("error loading files");
        }
        var values = JSON.parse(data);
        values.forEach(function(instance) {
            process( instance);
        });
        save(fileName, values);
    });
});

fs.readdir(toBeScanned, function(err, files) {
    if (err) {
        console.log("Error loading the directory");
    }

    files.forEach(function(fileName) {
        if (fileName.match("\\.json")) {
            fileEmitter.emit("file", fileName);
        }
    });
});
