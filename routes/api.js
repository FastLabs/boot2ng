var data = require('../data/data.js').schema;

var structs = function (req, res) {
	console.log('request');
	res.send(data);
};

exports.api = {
	abc: '234',
	structures: structs
};