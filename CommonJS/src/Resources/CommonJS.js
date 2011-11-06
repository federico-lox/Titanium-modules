/**
 * Enhanced CommonJS support for Appcelerator's Titanium Mobile SDK
 *
 * @module CommonJS
 * @version 0.3
 * @author Federico "Lox" Lucignano <federico.lox(at)gmail.com>
 * @see https://github.com/federico-lox/Titanium-modules
 */
(function(ns) {
	/**
	 * @private
	 */
	
	var loadedModules = {},
	queuedModules = {},
	importFunction;
	
	/**
	 * Initializes the enhanced CommonJS support by grabbing the global context,
	 * replacing the implementation of require, and adding define and console
	 * 
	 * @param context Object a reference to the global scope
	 * 
	 * @example require('CommonJS').initialize(this);
	 */
	ns.initialize = function(context){
		importFunction = context.require;
		context.require = ns.require;
		context.define = ns.define;
		context.console = ns.console;
	};
	
	/**
	 * Exceptions
	 */
	
	ns.DefineException = function(msg){
		var message = msg;
		
		this.toString = function(){
			return message;
		};
	};
	
	ns.AssertException = function(expression){
		var message = 'Error asserting' + expression + '(' + (typeof expression) + ') is true';
		
		this.toString = function(){
			return message;
		};
	};
	
	ns.AddDependencyException = function(moduleId){
		var message = "Missing or wrong parameters";
		
		this.toString = function(){
			return message;
		};
	};
	
	/**
	 * An implementation of CommonJS' spec for the console logger
	 * @see http://wiki.commonjs.org/wiki/Console#log.28object.5B.2C_object.2C_....5D.29
	 */
	function Console(){
		/**
		 * @private
		 */
		
		function argsToString(objArgs){
			var items = [];
			
			for(var x = 0, y = objArgs.length; x < y; x++){
				items.push(objArgs[x]);
			}
			
			return items.join(' ');
		}
		
		/**
		 * @public
		 */
		
		this.log = this.info = function(){
			Ti.API.info(argsToString(arguments));
		};
		
		this.debug = function(){
			Ti.API.debug(argsToString(arguments));
		};
		
		this.warn = function(){
			Ti.API.warn(argsToString(arguments));
		};
		
		this.error = function(){
			Ti.API.error(argsToString(arguments));
		};
		
		this.assert = function(expression){
			if(expression != true){
				var exception = new ns.AssertException(expression);
				
				this.error(exception.toString());
				throw exception;
			}
		};
	}
	
	/**
	 * @public
	 */
	
	ns.console = new Console();
	
	/**
	 * @see http://requirejs.org/docs/start.html
	 */
	ns.require = function(moduleId, callback){
		var modules = [],
		module,
		isJsInclude,
		x,
		y;
		if(!(moduleId instanceof Array))
			moduleId = [moduleId];
		
		for(x = 0, y = moduleId.length; x < y; x++){
			//avoid circular dependencies
			if(!(moduleId[x] in queuedModules)){
				queuedModules[moduleId[x]] = null;
				module = loadedModules[moduleId[x]];
				
				if(!module){
					if(moduleId[x].indexOf('.js') == (moduleId[x].length - 3)){
						Ti.include(moduleId[x]);
						module = moduleId[x];
						isJsInclude = true;
					}
					else{
						module = importFunction(moduleId[x]);
						isJsInclude = false;
					}
					
					loadedModules[moduleId[x]] = module;
				}
				
				if(module && !isJsInclude)
					modules.push(module);
				
				delete queuedModules[moduleId[x]];
			}
		}
		
		if(typeof callback == 'function')
			callback.apply({}, modules);
		
		if(modules.length > 0)
			return modules[0];
		else
			return null;
	};
	
	/*
	 * @see: http://requirejs.org/docs/api.html
	 */
	ns.define = function(){
		var moduleContext = arguments[arguments.length - 1];
		
		 if(arguments[0] instanceof Array && typeof arguments[1] == 'function'){
			var deps = arguments[0],
			moduleInit = arguments[1];
			
			ns.require(deps, function(){
				var module = moduleInit.apply({}, arguments);
				
				for(var prop in module)
					moduleContext[prop] = module[prop];
			});
		}else if(typeof arguments[0] == 'function'){
			var module = arguments[0].call({}, ns.require, moduleContext, {id: null, uri:null, exports: moduleContext});
			
			if(module){
				for(var prop in module)
					moduleContext[prop] = module[prop];
			}
		}else if(typeof arguments[0] == 'object'){
			for(var prop in arguments[0])
				moduleContext[prop] = arguments[0][prop];
		}else
			throw new ns.DefineException('Missing or wrong parameters.');
	};
})(exports);