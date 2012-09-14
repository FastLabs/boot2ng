var FirstPresentmentStructure = {
	'Primary Account Number' : {
		DE: 2,
		org: 'M',
		sys: '*',
		dst: 'M'
	}
};


var ISOTransaction = function(messageTypeId, functionCode) {
	this.messageType = messageTypeId;
	this.functionCode = functionCode;
};

var FirstPresentmentTransaction = function() {
	
};

FirstPresentmentTransaction.prototype = new ISOTransaction('1240', '200');

var currentTransaction = new FirstPresentmentTransaction();


if(currentTransaction instanceof FirstPresentmentTransaction) {
	console.log("first presentment transaction");
}