/**
 * @namespace com.lox.CommonJS
 */

(function() {
	/**
	 * @private
	 */
	
	var importFunction,
	globalContext;
	
	/**
	 * @see http://requirejs.org/docs/start.html
	 */
	function commonJsRequire(moduleIDs, callback){
		var modules = [],
		moduleID;
		
		if(moduleIDs instanceof Array){
			for(var x = 0, y = moduleIDs.length; x < y; x++){
				moduleID = moduleIDs[x];
				
				if(moduleID.indexOf('.js') == (moduleID.length - 3))
					include(moduleID);
				else
					modules.push(importFunction(moduleIDs[x]));
			}
		}else
			modules.push(importFunction(String(moduleIDs)));
			
		if(typeof callback == 'function')
			callback.apply(globalContext, modules);
		
		if(modules.length > 0)
			return modules[0];
		else
			return null;
	}
	
	/*
	 * @see: http://requirejs.org/docs/api.html
	 */
	function commonJsDefine(){
		//TODO: implement
	}
	
	/**
	 * @see http://wiki.commonjs.org/wiki/Console#log.28object.5B.2C_object.2C_....5D.29
	 */
	function Console(){
		/**
		 * @public
		 */
		
		this.log = this.info = function(){
			Ti.API.info(arguments.join(' '));
		};
		
		this.debug = function(){
			Ti.API.debug(arguments.join(' '));
		};
		
		this.warn = function(){
			Ti.API.warn(arguments.join(' '));
		};
		
		this.error = function(){
			Ti.API.error(arguments.join(' '));
		};
		
		this.assert = function(expression){
			if(expression != true){
				this.error('Error asserting ' + expression);
				throw 'Assertion failed';
			}
		}
	}
	 
	 /**
	 * @public
	 */
	 
	this.init = function(context){
		globalContext = context;
		importFunction = context.require;
		context.require = commonJsRequire;
		context.console = new this.Console();
	};
}).apply(exports);