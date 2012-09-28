/**
 * Module dependencies.
 */

var express = require('express'),
    api = require('./routes/api.js').api,
    http = require('http')
    interchange = require('./interchange.js'),
    engine = require('./emitter.js');

var app = express();
api.loadRules();
// Configuration

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// Routes
//app.get('/', routes.index);
app.get('/api/structures', api.structures);
app.get('/api/rules', api.rules);

app.get("/interchange/:scheme",interchange.renderDecisionTable);
app.get("/p_uk_domestic", interchange.renderPurchaseDomestic )

app.post('/api/rule', api.saveRule);
app.delete('/api/rule/:id', api.deleteRule);
app.put("/api/rule/:id", api.updateRule);

app.post('/login', function (req, res) {
    console.log('authentication attempt');
});

app.post('/transaction', function(req, res) {
    var transaction = req.body;
    engine.callRuleEngine(transaction, function (result) {
        console.log("engine done" + result);
        var x = JSON.parse(result);
        res.end( JSON.stringify(x[0]));
    });
});

var transactions = [
    {
        reimbursementAttribute: "0",
        schemeType: "C",
        id: 1,
        shortName: "EXEMPT",
        issuer: {
            region: "3",
            country: "GB"
        },
        acquirer: {
            region: "3",
            country: "GB"
        },
        merchant: {
            region: "3",
            country: "GB"
        }
    },
    {
        reimbursementAttribute: "D",
        schemeType: "C",
        id: 2,
        shortName: "EXEMPT",
        issuer: {
            region: "3",
            country: "GB"
        },
        acquirer: {
            region: "3",
            country: "GER"
        },
        merchant: {
            region: "3",
            country: "GB"
        }
    },
    {
        reimbursementAttribute: "D",
        id: 3,
        schemeType: "C",
        shortName: "EXEMPT",
        issuer: {
            region: "3",
            country: "GB"
        },
        acquirer: {
            region: "3",
            country: "GB"
        },
        merchant: {
            region: "3",
            country: "GB"
        }
    }

];

app.get("/transaction", function (req, res) {
    res.end(JSON.stringify(transactions));
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port %d", app.get('port'));
});