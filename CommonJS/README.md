CommonJS module
===============
A pure Javascript module for Appcelerator's Titanium Mobile SDK that enhances the built-in support for CommonJS modules.

Code
----
The latest version of the code for this module can be found [here](https://github.com/federico-lox/Titanium-modules/blob/master/CommonJS/src/Resources/CommonJS.js)

Overview
--------
This module updates Titanium's support to CommonJS by introducing a working implementation of the Console object and by updating the require implementation to v1.1.1 according to the Transport C proposal (AMD) and introducing an implementation of the define function.

A fix for the [mutliple execution of imported modules's code](http://jira.appcelerator.org/browse/TIMOB-4845) is also included, this means that a reference to a module is global and shared across define and require calls in an execution context.

Goal
----
The reason behind this module is to ma the creation of CommonJS modules that work across multiple environments easier, the syntax enabled by this module works for the following:

* Web browsers (via Require.js)
* Node.js (using the simplified define wrapper)
* Appcelerator's Titanium Mobile

Usage
-----
1. In your app.js add:
		require('CommonJS').initialize(this);
2. In your modules' files you can now use the following syntaxes (please notice the last parameter fo each define call is exports, this is required and won't generate errors in platforms different from Titanium):
		define({a:1, b:2}, exports);
		
		//OR
		
		define(function(){ function F(){}; return new F(); }, exports);
		
		//OR
		
		define(['module1', 'module2', function(module1, module2){ return {x: module1.x(), y: module2.y()} }, exports);
		
		//OR
		
		define(function(require, exports, module){ exports.name = 'Jhon'; }, exports);
3. Whenever importing a module you can use the following syntaxes:
		var myMod = require('myMod');
		
		//OR
		
		require(['myMod', 'myMod2'], function(myMod, myMod2){ /*code that depends on both modules*/ });
4. An implementation of the console object that maps to the logging methods in the Titanium.API namespaceis also
   part of this module:
		console.log('test');
		console.info('test');
		console.debug('test');
		console.warn('test');
		console.error('test');
		console.assert(false);

Author
------
* [Federico "Lox" Lucignano](http://plus.google.com/117046182016070432246) <federico.lox(at)gmail.com>
