/**
 * Module dependencies.
 */

var express = require('express'),
    api = require('./routes/api.js').api,
    http = require('http')
    interchange = require('./interchange.js');

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

app.get("/interchange/rules",interchange.load);

app.post('/api/rule', api.saveRule);

app.post('/login', function (req, res) {
    console.log('authentication attempt'  );
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port %d", app.get('port'));
});