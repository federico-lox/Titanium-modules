var exports = exports || {};

define.call(exports, ['modules/com.test.one', 'modules/com.test.two'], function(modOne, modTwo){
	var c = 'a=' + modOne.a;
	
	return {
		value: c,
		value2: modTwo.d
	};
});
