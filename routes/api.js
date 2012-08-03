var data = require('../data/data.js').schema;

var structs = function (req, res) {
	console.log('request');
	res.send(data);
};

var demoRules =  [
    {
        name:'check the account number',
        attributes:{id:'Rule2'},
        conditions:['transaction is ok'],
        actions:[]

    }
    ,
    {
        name:'check the issuer bin',
        attributes:{id:'Rule1'},
        conditions:[],
        actions:[]
    },
    {
        name:'check the issuer bin1',
        attributes:{id:'Rule3'},
        conditions:[],
        actions:[]
    }
];

var rules = function (req, res) {
    console.log('rule requested');
    res.send(demoRules);
}


exports.api = {
	abc: '234',
	structures: structs,
    rules: rules
};