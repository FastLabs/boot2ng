var EventEmmitter = require("events").EventEmitter,
    fs = require("fs"),
    eventBus = new EventEmmitter(),
    scanPath ="C:\\Users\\obulavitchi\\Documents\\scheme1\\VisaInterchangeRules\\rules\\interchange\\domestic\\USA",// process.cwd()+'/data/scan/input',
    outputPath = process.cwd()  +"/data/scan/output"
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
                        eventBus.emit("process-file", { path: fullPath, file: file });
                    }
                }

            });
        }) ;

    });

});
var replaces = [
    {
        find: "'the transaction' is Regulated",
        replace: "'the transaction' is marked as Regulated"
    },{
        find: "processed in 15 days including {Saturdays, Bank Holidays}",
        replace: "the timeliness of 'the transaction' is at most 15"
    },{
        find: "processed in 04 days including {Saturdays, Bank Holidays}",
        replace: "the timeliness of 'the transaction' is at most 4"
    }, {
        find: "processed in 03 days including {Saturdays, Bank Holidays}",
        replace: "the timeliness of 'the transaction' is at most 3"
    }, {
        find: "the amount of 'the transaction' converted to GBP is at most 000015",
        replace: "the authorised amount of the payment service data of 'the transaction' is at most 15"
    },{
        find: "the amount of 'the transaction' converted to GBP is at most 000020",
        replace: "the authorised amount of the payment service data of 'the transaction' is at most 20"
    },{
        find: "the amount of 'the transaction' converted to GBP is at most 025000",
        replace: "the authorised amount of the payment service data of 'the transaction' converted from the authorisation currency code of the payment service data of 'the transaction' to USD is at least 25000"
    },{
        find: "the amount of 'the transaction' converted to GBP is at most 010000",
        replace: "the authorised amount of the payment service data of 'the transaction' converted from the authorisation currency code of the payment service data of 'the transaction' to USD is at least 10000"
    },{
        find: "the amount of 'the transaction' converted to GBP is at most 002500",
        replace: "the authorised amount of the payment service data of 'the transaction' converted from the authorisation currency code of the payment service data of 'the transaction' to USD is at least 2500"
    },{
        find: "the amount of 'the transaction' converted to GBP is at most 000002",
        replace: "the authorised amount of the payment service data of 'the transaction' is at most 2"
    },{
        find: "the amount of 'the transaction' converted to GBP is at most 100000",
        replace: "the authorised amount of the payment service data of 'the transaction' converted from the authorisation currency code of the payment service data of 'the transaction' to USD is at most 100000"
    }, {
        find: "the method of capture of 'the transaction' is one of { PI , CH , CL , LO , ST }",
        replace: "'the transaction' captured as Electronic"
    }, {
        find: "the  method of capture of 'the transaction' is one of{ PI, CH, CL, LO}",
        replace: "'the transaction' captured as Electronic"
    },{
        find: "the  method of capture of 'the transaction' is  one of { CH, CL}",
        replace: "'the transaction' captured as Electronic"
    },{
        find: "the  method of capture of 'the transaction' is  one of { PI, CH, CL, LO}",
        replace: "'the transaction' captured as Electronic"
    },{
        find: "the  method of capture of 'the transaction' is  one of  { LO}",
        replace: "'the transaction' captured as Electronic"
    },{
        find: "the  method of capture of 'the transaction' is  one of { PK, LP}",
        replace: "'the transaction' captured as Electronic"
    },  {
        find: "the  method of capture of 'the transaction' is one of{ PI, CH, CL, LO, ST, PK, LP}",
        replace: "'the transaction' captured as Electronic"
    },  {
        find: "the  method of capture of 'the transaction' is one of{ CL, LO, ST}",
        replace: "'the transaction' captured as Electronic"
    },  {
        find: "the  method of capture of 'the transaction' is  one of { LO, ST}",
        replace: "'the transaction' captured as Electronic"
    }, {
        find: "the  method of capture of 'the transaction' is  one of { PI, CH, LO}",
        replace: "'the transaction' captured as Electronic"
    }, {
        find: "the  method of capture of 'the transaction' is one of{ PI, CH, CL, LO, ST, PK, LP, EH}",
        replace: "'the transaction' captured as Electronic"
    },{
        find: "the  method of capture of 'the transaction' is one of{ PK, LP}",
        replace: "'the transaction' captured as Electronic"
    },{
        find: "the  method of capture of 'the transaction' is one of{ PI, CH, CL, LO, ST}",
        replace: "'the transaction' captured as Electronic"
    },{
        find: "the method of capture of 'the transaction' is one of { PI , CH , CL , LO }",
        replace: "'the transaction' captured as EIRF"
    },,{
        find: "the  method of capture of 'the transaction' is  one of { CH, CL, LO}",
        replace: "'the transaction' captured as EIRF"
    },{
        find: "the method of capture of 'the transaction' is one of { PI , CH , CL , ST }",
        replace: "'the transaction' captured as Electronic"
    }, {
        find: "the method of capture of 'the transaction' is EH",
        replace: "'the transaction' captured as Merchant ECOM"
    }, {
        find: "the  method of capture of 'the transaction' is one of{ EJ, EK   }",
        replace: "'the transaction' captured as Merchant ECOM"
    },{
        find: "the  method of capture of 'the transaction' is  one of  { EH}",
        replace: "'the transaction' captured as Merchant ECOM"
    }, {
        find: "the  method of capture of 'the transaction' is one of{ EJ}",
        replace: "'the transaction' captured as Merchant ECOM"
    },{
        find: "the method of capture of 'the transaction' is ST",
        replace: "'the transaction' captured as CHIP_ISS"
    },{
        find: "the  method of capture of 'the transaction' is  one of { PI, CH, CL, LO, ST}",
        replace: "'the transaction' captured as CHIP_ISS"
    },{
        find: "the method of capture of 'the transaction' is LO",
        replace: "'the transaction' captured as CHIP_ACQ"
    },
    {
        find: "the  method of capture of 'the transaction' is  one of { LO, ST, CL}",
        replace: "'the transaction' captured as EA"
    }, {
        find: "the  method of capture of 'the transaction' is one of{ LO, ST}",
        replace: "'the transaction' captured as EA"
    },{
        find: "the  method of capture of 'the transaction' is  one of  { CL}",
        replace: "'the transaction' captured as CONTACTLESS"
    },{
        find: "the  method of capture of 'the transaction' is  one of { EG, EH}",
        replace: "'the transaction' captured as ECOM"
    },,{
        find: "the  method of capture of 'the transaction' is one of{ EG, EH}",
        replace: "'the transaction' captured as ECOM"
    },{
        find: "the method of capture of 'the transaction' is one of { EG , EH }",
        replace: "'the transaction' captured as ECOM"
    },{
        find: "the  method of capture of 'the transaction' is one of{ EG, EH, EJ}",
        replace: "'the transaction' captured as ECOM"
    },{
        find: "the  method of capture of 'the transaction' is one of{ EG}",
        replace: "'the transaction' captured as ECOM"
    },{
        find: "the  method of capture of 'the transaction' is  one of  { EG}",
        replace: "'the transaction' captured as ECOM"
    },
    {
        find: "the  method of capture of 'the transaction' is  one of { CH, PI, CL}",
        replace: "'the transaction' captured as EMV_TERMINAL"
    }, {
        find: "the  method of capture of 'the transaction' is  one of { PI, CH, CL}",
        replace: "'the transaction' captured as EMV_TERMINAL"
    }, {
        find: "the  method of capture of 'the transaction' is one of{ PI, CH, CL}",
        replace: "'the transaction' captured as EMV_TERMINAL"
    },{
        find: "the  method of capture of 'the transaction' is  one of  { PI}",
        replace: "'the transaction' captured as CHIP_ACQ"
    },/*{
        find: "the  method of capture of 'the transaction' is  one of  { LO}",
        replace: "'the transaction' captured as EMV_TERMINAL"
    },*/{
        find: "the  method of capture of 'the transaction' is  not one of { EG, EH, EJ, EK   }",
        replace: "'the transaction' captured as CNP_CARD_NOTPRESENT"
    },{
        find: "the  method of capture of 'the transaction' is  not one of { EG, EH, EJ, EK  }",
        replace: "'the transaction' captured as CNP_CARD_NOTPRESENT"
    },{
        find: "the  method of capture of 'the transaction' is one of{ EG, EH, EJ, EK   }",
        replace: "'the transaction' captured as CNP_CARD_NOTPRESENT"
    },{
        find: "the  method of capture of 'the transaction' is  not one of { EG, EH, EK   }",
        replace: "'the transaction' captured as CVV2_CARD_NOT_PRESENT"
    },{
        find: "the method of capture of 'the transaction' is one of { EJ , EK }",
        replace: "'the transaction' captured as ECOM"
    },,{
        find: "the  method of capture of 'the transaction' is  one of { ST, LO}",
        replace: "'the transaction' captured as EA"
    },
    {
        find: "the  method of capture of 'the transaction' is  one of  { ST}",
        replace: {
            "EA": "'the transaction' captured as EA",
            "EDC": "'the transaction' captured as EDC",
            "default": "'the transaction' captured as EDC"
        }
    },
    {
        find: "the method of capture of 'the transaction' is EG",
        replace: "'the transaction' captured as Full Sec ECOM"
    },{
        find: "the mcc of 'the merchant' is in ranges {5962 to 5967}",
        replace: "it is not true that the mcc of 'the merchant' is in ranges {5962 to 5967}"
    },{
        find: "the avs response code of 'the authorisation' is \"GINU\"",
        replace: "the avs response code of the additional data of 'the transaction' is one of { G, I, N, U}"
    },{
        find: "it is not true that the avs response code of 'the authorisation' is \"N\"",
        replace: "it is not true that the avs response code of the additional data of 'the transaction' is N"
    },
    {
        find: "'the transaction' is marked as Recurring",
        replace: "the pos environment of the additional data of 'the transaction' is Recurring"
    },{
        find: "the card validation response code of the card details of 'the transaction' is  one of {\"N\", \"P\", \"U\", \"Y\"}",
        replace: "the cvv2 result code of the payment service data of 'the transaction' is one of { M - CVV2 match ,N - CVV2 no match , P - Not Processed , U - Issuer Not Certified }"
    },
    {
        find: "- the cat code of the terminal of 'the transaction' is \"0\"",
        replace: ""
    },{
        find: "- the cat code of the terminal of 'the merchant' is \"0\"",
        replace: ""
    },
    {
        find: "the product code of 'the issuer' is one of { N , C , I }",
        replace: "the product of 'payment scheme' is one of { N - Platinum , C - Visa Signature , I - Visa Comerce }"
    },{
        find: "the product code of 'the issuer' is  one of {N, C, I}",
        replace: "the product of 'payment scheme' is one of { N - Platinum , C - Visa Signature , I - Visa Comerce }"
    },{
        find: "the product code of 'the issuer' is  one of {N, C, I, G - Visa Travel/Money Card}",
        replace: "the product of 'payment scheme' is one of { N - Platinum , C - Visa Signature , I - Visa Comerce , G - Visa Business }"
    },{
        find: "the product code of 'the issuer' is L",
        replace: "the product of 'payment scheme' is L - Electron"
    },{
        find: "the product code of 'the issuer' is K - Signature",
        replace: "the product of 'payment scheme' is K - Visa Corporate"
    },{
        find: "the product code of 'the issuer' is  one of {C, I}",
        replace: "the product of 'payment scheme' is one of { C - Visa Signature , I - Visa Comerce }"
    },{
        find: "the product code of 'the issuer' is  one of {I, C}",
        replace: "the product of 'payment scheme' is one of { I - Visa Comerce , C - Visa Signature }"
    },{
        find: "the product code of 'the issuer' is B - Business",
        replace: "the product of 'payment scheme' is B - Visa Traditional Reward"
    }, {
        find: "the product code of 'the issuer' is  one of {K - Signature, K1, S - Purchase, S1, S2, S3}",
        replace: "the product of 'payment scheme' is one of { K - Visa Corporate , K1 - Visa GSA Corporate, S - Visa Purchasing , S1 - Visa Purchasing With Fleet ,  S2 - Visa GSA Purchasing , S3 - Visa GSA Purchasing With Fleet }"
    },{
        find: "the product code of 'the issuer' is  one of {K - Signature, K1}",
        replace: "the product of 'payment scheme' is one of { K - Visa Corporate , K1 - Visa GSA Corporate }"
    },
    {
        find: "the product code of 'the issuer' is one of { N , C , I , G - Visa Travel/Money Card }",
        replace: "the product of 'payment scheme' is one of { N - Platinum , C - Visa Signature , I - Visa Comerce , G - Visa Business }"
    }, {
        find: "the product code of 'the issuer' is one of { I , P - Premier }",
        replace: "the product of 'payment scheme' is one of { I - Visa Comerce , P - Visa Gold }"
    }, {
        find: "the product code of 'the issuer' is  one of {G - Visa Travel/Money Card, G3, G1}",
        replace: "the product of 'payment scheme' is one of { G - Visa Business , G1 - Visa Signature Business , G3 - Visa Business Enhanced }"
    },{
        find: "the product code of 'the issuer' is C",
        replace: "the product of 'payment scheme' is C - Visa Signature"
    },{
        find: "the product code of 'the issuer' is N",
        replace: "the product of 'payment scheme' is N - Platinum"
    },{
        find: "the product code of 'the issuer' is I",
        replace: "the product of 'payment scheme' is I - Visa Comerce"
    },
    {
        find: "the product code of 'the issuer' is P - Premier",
        replace: "the product of 'payment scheme' is P - Visa Gold"
    },
    {
        find: "the product code of 'the issuer' is G - Visa Travel/Money Card",
        replace: "the product of 'payment scheme' is G - Visa Business"
    },
    {
        find: "the product code of 'the issuer' is G1",
        replace: "the product of 'payment scheme' is G1 - Visa Signature Business"
    },{
        find: "the product code of 'the issuer' is  one of {S - Purchase, S1, S2, S3}",
        replace: "the product of 'payment scheme' is one of {S - Visa Purchasing , S1 - Visa Purchasing With Fleet , S2 - Visa GSA Purchasing }"
    },{
        find: "the product code of 'the issuer' is  one of {G - Visa Travel/Money Card, G3}",
        replace: "the product of 'payment scheme' is one of {G - Visa Business, G3 - Visa Business Enhanced }"
    },{
        find: "the product code of 'the issuer' is S - Purchase",
        replace: "the product of 'payment scheme' is S - Visa Purchasing"
    },{
        find: "the product code of 'the issuer' is D - Commercial",
        replace: "the product of 'payment scheme' is D - Visa Signature Preferred"
    },{
        find: "it is not true that the card details of 'the transaction' in chip card range",
        replace: "'the issuer' is marked as Chip"
    },
    {
        find: "the scheme of the card details of 'the transaction'  is one of { 40 , 79 }",
        replace: "the product type of 'payment scheme' is Corporate"
    },
    {
        find: "the scheme of the card details of 'the transaction'  is not one of {40, 79}",
        replace: "the product type of 'payment scheme' is not Corporate"
    }
    ,{
        find: "the scheme of the card details of 'the transaction'  is  one of {40, 79}",
        replace: "the product type of 'payment scheme' is Corporate"
    },{
        find: "the trace id of 'the transaction' is not empty",
        replace: "the transaction identifier of the payment service data of 'the transaction' is not empty"
    }
    ,{
        find: "the validation code of 'the authorisation' is present",
        replace: "the validation code of the payment service data of 'the transaction' is present"
    },{
        find: "the characteristics of 'the authorisation'  is  one of {\"A\", \"E\"}",
        replace: "the authorisation characteristics indicator of the payment service data of 'the transaction' is one of {A, E}"
    },{
        find: "the characteristics of 'the authorisation'  is \"E\"",
        replace: "the authorisation characteristics indicator of the payment service data of 'the transaction' is E"
    },{
        find: "the characteristics of 'the authorisation'  is  one of {\"V\", \"P\", \"W\"}",
        replace: "the authorisation characteristics indicator of the payment service data of 'the transaction' is one of {V, P, W}"
    },{
        find: "the characteristics of 'the authorisation'  is \"K\"",
        replace: "the authorisation characteristics indicator of the payment service data of 'the transaction' is K"
    },{
        find: "the characteristics of 'the authorisation'  is  one of {\"A\", \"E\", \"V\", \"R\", \"W\"}",
        replace: "the authorisation characteristics indicator of the payment service data of 'the transaction' is one of {A, E, V, R, W}"
    }
    ,{
        find: "the characteristics of 'the authorisation'  is  one of {\"U\", \"S\"}",
        replace: "the authorisation characteristics indicator of the payment service data of 'the transaction' is one of { U, S}"
    }
    ,{
        find: "the characteristics of 'the authorisation'  is \"W\"",
        replace: "the authorisation characteristics indicator of the payment service data of 'the transaction' is W"
    },{
        find: "the characteristics of 'the authorisation'  is \"V\"",
        replace: "the authorisation characteristics indicator of the payment service data of 'the transaction' is V"
    },{
        find: "the characteristics of 'the authorisation'  is  one of {\"V\", \"R\"}",
        replace: "the authorisation characteristics indicator of the payment service data of 'the transaction' is one of {V, R}"
    },{
        find: "the characteristics of 'the authorisation'  is  one of {\"A\", \"E\", \"V\", \"P\"}",
        replace: "the authorisation characteristics indicator of the payment service data of 'the transaction' is one of {A, E, V, P}"
    },{
        find: "the characteristics of 'the authorisation'  is \"U\"",
        replace: "the authorisation characteristics indicator of the payment service data of 'the transaction' is U"
    }
    ,{
        find: "the characteristics of 'the authorisation'  is  one of {\"U\", \"S\"}",
        replace: "the authorisation characteristics indicator of the payment service data of 'the transaction' is one of { U, S}"
    },{
        find: "the characteristics of 'the authorisation'  is \"S\"",
        replace: "the authorisation characteristics indicator of the payment service data of 'the transaction' is S"
    }
    , {
        find: "'the issuer' is chip qualified",
        replace: "'the issuer' is marked as Chip"
    }
    , {find: "'the merchant' is MOTO",
        replace: "'the transaction' is marked as Moto "}
    , {find: "'the transaction' is Authorised",
        replace: "'the transaction' is marked as Authorised"}
    , {find:"the country of 'the merchant' is \"GBR\"",
        replace: "the country of 'the merchant' is GBR"
    },
    {find:"the country of 'the merchant' is \"IRL\"",
        replace: "the country of 'the merchant' is IRL"
    },
    {find:"the country of 'the merchant' is \"JPN\"",
        replace: "the country of 'the merchant' is JPN"
    },
    {find:"the country of 'the merchant' is \"NZL\"",
        replace: "the country of 'the merchant' is NZL"
    },
    {find:"the country of 'the merchant' is \"SGP\"",
        replace: "the country of 'the merchant' is SGP"
    },
    {find:"the country of 'the merchant' is \"USA\"",
        replace: "the country of 'the merchant' is USA"
    },
    {find:"the country of 'the merchant' is \"HKG\"",
        replace: "the country of 'the merchant' is HKG"
    }
    ,{
        find: "'the transaction' is marked as <a product markers enum>",
        replace: "the product of 'payment scheme' is <a product marker>"
    },
    ,{

        find: " the selected hierachy of 'the fee' ",
        replace: " the selected hierarchy of 'the fee' "
    },
    ,{

        find: " the selected hierachy of 'the fee'  ",
        replace: " the selected hierarchy of 'the fee' "
    },{

        find: "<a reimbursement attribute>",
        replace: "<a reimbursement attribute enum>"
    },{

        find: "<a number> as flat rate of 'the fee' in <an ISOCurrency code>",
        replace: "<a number> as flat rate of 'the fee' in <an ISOCurrency code>"
    }



]

eventBus.on("process-file", function(processInstructions) {
    console.log("@@" + processInstructions.path);
    var option = undefined;
    fs.readFile(processInstructions.path,"ascii", function(err, data) {
        if(err) {
            console.log("error loading data from: " + processInstructions.path);
            return;
        }

        replaces.forEach (function (replace) {
            if(data) {
                if(processInstructions.file.indexOf(" EA") >=0) {
                   option = "EA";
                } else if(processInstructions.file.indexOf(" EDC") >=0) {
                    option = "EDC";
                }
                if(typeof replace.replace !== "string" && option == undefined) {
                    option = "default";
                }

                if(option !== undefined && replace.replace[option] !== undefined ) {
                    data = data.replace(replace.find, replace.replace[option]);
                } else {
                    data = data.replace(replace.find, replace.replace);
                }
            }
        });

        eventBus.emit("save-data",{path:/*outputPath + "/"+ processInstructions.file*/processInstructions.path, data:data});
    });
});

eventBus.on("save-data", function (processDataEvent) {
    var newFileName = processDataEvent.path.replace("Exported ", "").replace(" EXP", "");
    fs.writeFile(newFileName, processDataEvent.data, function (err) {
        if (err) {
            console.log("error saving the file: " + processDataEvent.path);
        }
    });
});

eventBus.emit("read-folder", { path: scanPath, filter: "\\.brl"});





