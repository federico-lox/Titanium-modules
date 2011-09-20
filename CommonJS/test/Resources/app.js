require('lib/com.lox.CommonJS').initialize(this);

var one = require(['modules/com.test.one', 'modules/com.test.two', 'includes/test.js'], function(modOne, modTwo){
	console.log('from callback');
	console.log(modOne.a);
	console.log(modOne.b());
	console.log(modTwo.c);
	console.log(modTwo.d);
});

console.log('from context');
console.log(one.a);
console.log(one.b());


var three = require('modules/com.test.three');

console.log(three.a1);
console.log(three.b2);

var four = require('modules/com.test.four');

console.log(four.value);

var five = require('modules/com.test.five');

console.log(five.value);

var six = require('modules/com.test.six');

console.log(six.value);
console.log(six.value2);

(function(){
	var window = Ti.UI.createWindow({
		backgroundColor: 'green',
		navBarHidden: false,
		fullscreen: false,
		exitOnClose: true
	});
	
	window.open();
	
	console.log('created', window);
})();
