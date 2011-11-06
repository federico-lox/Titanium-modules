define(
	['modules/com.test.one', 'modules/com.test.two'],
	function(modOne, modTwo){
		var c = 'com.test.one.a should equal 2: a=' + modOne.a;
		
		return {
			value: c,
			value2: modTwo.d
		};
	},
	exports
);
