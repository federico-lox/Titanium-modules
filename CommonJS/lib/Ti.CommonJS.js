/**
 * Enhanced CommonJS support for Titanium Mobile SDK
 *
 * @module Ti.CommonJS
 * @version 0.1
 * @author Federico "Lox" Lucignano <federico.lox(at)gmail.com>
 * @see https://github.com/federico-lox/Titanium-modules
 */
(function() {
	/**
	 * @private
	 */
	
	var moduleContext = this,
	importFunction,
	globalContext;
	
	function appendModuleTo(moduleID, modulesArray){
		if(moduleID.indexOf('.js') == (moduleID.length - 3))
			Ti.include(moduleID);
		else
			modulesArray.push(importFunction(moduleID));
	}
	
	/**
	 * @see http://wiki.commonjs.org/wiki/Console#log.28object.5B.2C_object.2C_....5D.29
	 */
	function Console(){
		/**
		 * @private
		 */
		
		function argsToArray(objArgs){
			var items = [];
			
			for(var x = 0, y = objArgs.length; x < y; x++){
				items.push(objArgs[x]);
			}
			
			return items;
		}
		
		/**
		 * @public
		 */
		
		this.log = this.info = function(){
			Ti.API.info(argsToArray(arguments).join(' '));
		};
		
		this.debug = function(){
			Ti.API.debug(argsToArray(arguments).join(' '));
		};
		
		this.warn = function(){
			Ti.API.warn(argsToArray(arguments).join(' '));
		};
		
		this.error = function(){
			Ti.API.error(argsToArray(arguments).join(' '));
		};
		
		this.assert = function(expression){
			if(expression != true){
				this.error('Error asserting ' + expression);
				throw new moduleContext.AssertException(expression);
			}
		}
	}
	
	/**
	 * @public
	 */
	
	moduleContext.console = new Console();
	
	/**
	 * @see http://requirejs.org/docs/start.html
	 */
	moduleContext.require = function(moduleIDs, callback){
		var modules = [],
		moduleID,
		x;
		
		if(moduleIDs instanceof Array){
			for(x = 0, y = moduleIDs.length; x < y; x++)
				appendModuleTo(moduleIDs[x], modules);
		}else
			appendModuleTo(moduleIDs, modules);
		
		if(typeof callback == 'function')
			callback.apply({}, modules);
		
		if(modules.length > 0)
			return modules[0];
		else
			return null;
	}
	
	/*
	 * @see: http://requirejs.org/docs/api.html
	 */
	moduleContext.define = function(){
		 if(arguments[0] instanceof Array && typeof arguments[1] == 'function'){
			var deps = arguments[0],
			moduleInit = arguments[1],
			that = this;
			
			moduleContext.require(deps, function(){
				var module = moduleInit.apply({}, arguments);
				
				for(var prop in module)
					that[prop] = module[prop];
			});
		}else if(typeof arguments[0] == 'function'){
			var module = arguments[0].call({}, moduleContext.require, this, {exports: this});
			
			if(!module) module = this;
			
			for(var prop in module)
				this[prop] = module[prop];
		}else if(typeof arguments[0] == 'object'){
			for(var prop in arguments[0])
				this[prop] = arguments[0][prop];
		}else
			throw new moduleContext.DefineException('Missing or wrong parameters.');
	};
	
	moduleContext.initialize = function(context){
		globalContext = context;
		importFunction = context.require;
		context.require = moduleContext.require;
		context.define = moduleContext.define;
		context.console = moduleContext.console;
	};
	
	moduleContext.DefineException = function(msg){
		var message = msg;
		
		this.toString = function(){
			return message;
		}
	};
	
	moduleContext.AssertException = function(expr){
		var message = 'Failed asserting: ' + expression;
		
		this.toString = function(){
			return message;
		}
	};
}).apply(exports);