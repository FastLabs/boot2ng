var fs = require("fs"),
    EventEmitter = require('events').EventEmitter,
    path = require("path"),
    fileEmitter = new EventEmitter(),
    toBeScanned = "./data",
    outputDir = "./data/output"
enrichment = {
    "paymentScheme":function (attribute, instance) {
        instance[attribute] = "1";
    },

    "amount":function (attribute, instance) {
        instance[attribute] = "10099.0";
        instance['currency'] = "GBP"
    },

    "methodOfCapture":function (attribute, instance) {
        if (instance[attribute] === undefined) {
            instance[attribute] = "Mock";
        }
    },
    "mailOrder":function (attribute, instance) {
        if (instance[attribute] === undefined) {
            instance[attribute] = "false";
        }
    },
    "dataLevel":function (attribute, instance) {
        if (instance[attribute] === undefined) {
            instance[attribute] = "0";
        }
    },
    "refund":function (attribute, instance) {
        if (instance[attribute] === undefined) {
            instance[attribute] = "false";
        }
    },

    "merchant/company":function (attribute, instance) {
        if (instance[attribute] === undefined) {
            instance[attribute] = "ANY";
        }
    },

    "merchant/cardHolderPresent":function (attribute, instance) {
        instance[attribute] = "2";
    },

    "issuer/debitCardIndicator":function (attribute, instance) {
        if (instance[attribute] === undefined) {
            instance[attribute] = "false";
        }
    },
    "issuer/productCode":function (attribute, instance) {
        if (instance[attribute] === undefined) {
            instance[attribute] = "MOCK";
        }
    },

    "authorisation/authorised":function (attribute, instance) {
        if (instance[attribute] === undefined) {
            instance[attribute] = "false";
        }
    }
};

function lookupInstance(path, instance) {
    var elements = path.split("/"),
        i = 0,
        pathElementCount = elements.length - 1,
        currentInstance = instance;
    while (i < pathElementCount) {
        var selected = currentInstance[elements[i]];
        if (!selected) {
            selected = {};
            currentInstance[elements[i]] = selected;
        }
        currentInstance = selected;
        i++;
    }

    return {
        element:elements[i],
        instance:currentInstance
    };
}

function save(fileName, instance) {
    var data = JSON.stringify(instance);
    fs.writeFile(outputDir + "/" + fileName, data, function (err) {
        if (err) {
            console.log("error saving the file");
        }
    })
}

function process(instance) {
    var keys = Object.keys(enrichment);

    keys.forEach(function (key) {

        var transformer = enrichment[key],
            toBeTransformed = lookupInstance(key, instance);
        console.log(toBeTransformed);
        if (transformer) {
            transformer(toBeTransformed.element, toBeTransformed.instance);
        }
    });
}

//loads a particular file content
fileEmitter.on('file', function (fileName) {
    fs.readFile(toBeScanned + "/" + fileName, "ascii", function (err, data) {
        if (err) {
            console.log("error loading files");
        }
        var values = JSON.parse(data);
        values.forEach(function (instance) {
            process(instance);
        });
        save(fileName, values);
    });
});
//scans the input folder
fs.readdir(toBeScanned, function (err, files) {
    if (err) {
        console.log("Error loading the directory");
    }

    files.forEach(function (fileName) {
        if (fileName.match("\\.json")) {
            fileEmitter.emit("file", fileName);
        }
    });
});