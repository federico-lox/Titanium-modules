/**
 * DART Server-side tagging for Titanium Mobile
 * @version 1.0
 * @author Federico "Lox" Lucignano <federico(at)wikia-inc.com>
 * 
 * @namespace com.wikia.ad.dart
 *
 * @see https://internal.wikia-inc.com/img_auth.php/2/23/DoubleClick_for_Mobile_tagging.pdf
 * @see https://internal.wikia-inc.com/img_auth.php/c/ca/DFM_Mobile_params.pdf
 */

(function(){
	/**
	 * @private
	 */
	
	var ns = this,
	
	/**
	 * @const
	 */
	NS_NAME = 'com.wikia.ad.dart',
	BASE_URL = 'http://ad.mo.doubleclick.net/DARTProxy/mobile.handler';
	
	function checkStringParameter(value){
		return (value && typeof value == 'string' && value != '');
	}
	
	function getEventString(/* ... */){
		var tokens = ['DART'];
		
		for(var x = 0, y = arguments.length; x < y; x++){
			tokens.push(arguments[x]);
		}
		
		return tokens.join(':');
	}
	
	function debug(prefix, data){
		Ti.API.debug('[' + NS_NAME + '.' + prefix + '] ' + data);
	}
	
	/**
	 * @public
	 */
	
	ns.TagTypes = {
		IMAGE: 'i',
		TEXT: 't'
	};
	
	
	/**
	 * @example
	 * var dart = require('com.wikia.ad.dart');
	 * try{
	 * 	var tag = new dart.Tag(dart.TagTypes.IMAGE, {
	 * 		k: 'mysite.com;sz=200x30',
	 * 		forecast: 1
	 * 	});
	 * 	
	 * 	tag.addEventListener('success', function(data){
	 * 		var tag = data.source;
	 * 		Ti.API.info('Tag Data: ' + data.value + ' (' + data.target + ')');
	 * 	});
	 * 	
	 * 	tag.addEventListener('error', function(data){
	 * 		var tag = data.source;
	 * 		Ti.API.error('DART Error (' + data.code + '): ' + data.message);
	 * 	});
	 * 	
	 * 	tag.request();
	 * }catch(e){
	 * 	Ti.API.error(String(e));
	 * }
	 */
	ns.Tag = function(tagType, params){
		/**
		 * @private
		 */
		
		var that = this;//used in the xhr event handlers
		this.__guid = Ti.Platform.createUUID();
		this.__data = params;
		this.__xhr = null;
		this.__target = null;
		this.__value = null;
		
		this.__getEventString = function(eventName){
			return getEventString('tag', eventName, this.__guid);
		}
		
		this.__xhrOnLoad = function(){
			//in this function "this" is an HTTPClient instance
			if(this.status == 200){
				//DART always returns 200 OK, the actual error is in the response headers
				var errorCode = this.getResponseHeader('Error_code'),
				errorMessage = this.getResponseHeader('Error_message'),
				targetMatches,
				valueMatches;
				
				if(!errorCode || errorCode == 'success'){
					targetMatches = this.responseText.match(/<a href="([^>"]+)">/mi);
					
					switch(that.getType()){
						case ns.TagTypes.IMAGE:
							valueMatches = this.responseText.match(/<img src="([^">]+)"/mi);
							break;
						case ns.TagTypes.TEXT:
							valueMatches = this.responseText.match(/>([^<]+)<\/a>/mi);
							break;
					}
					
					if(targetMatches && targetMatches.length > 0 && valueMatches && valueMatches.length > 0){
						that.__target = targetMatches[1];
						that.__value = valueMatches[1];
						errorCode = null;
						errorMessage = null;
						
						that.__debug('successfully downloaded data from the server: ' + that.__value + '(' + that.__target + ')');
						that.fireEvent('success', {source: that, target: that.__target, value: that.__value});
					}else{
						errorCode = 'incomplete_data';
						errorMessage = 'Server returned incomplete data';
					}
				}
			}else{
				errorCode = 'status_' + this.status;
				errorMessage = 'Server error';
			}
			
			if(errorCode || errorMessage){
				that.__debug('error: ' + errorMessage + ' (' + errorCode + ')');
				that.fireEvent('error', {source: that, code: errorCode, message: errorMessage});
			}
		};
		
		this.__xhrOnError = function(){
			//in this function "this" is an HTTPClient instance
			that.fireEvent('error', {source: that, code: this.status, message: 'Server error'});
		};
		
		this.__debug = function(data){
			debug('Tag:' + this.__guid, data);
		};
		
		/**
		 * @public
		 */
		
		this.toString = function(){
			var strData = BASE_URL + '?',
			count = 0,
			paramName;
			
			for(paramName in this.__data){
				strData += ((count) ? '&' : '') + paramName + '=' + this.__data[paramName];
				count++;
			}
			
			return strData;
		};
		
		this.getType = function(){
			return this.getParameter('t');
		};
		
		this.setType = function(tagType){
			this.setParameter('t', tagType);
		};
		
		this.getTarget = function(){
			return this.__target;
		};
		
		this.getValue = function(){
			return this.__value;
		};
		
		this.getParameter = function(name){
			return this.__data[name];
		};
		
		this.setParameter = function(name, value){
			switch(name){
				case 't':
					//missing or wrong type
					if(value != ns.TagTypes.IMAGE && value != ns.TagTypes.TEXT)
						throw new ns.paramsError('Tag type (t)', value);
					break;
				
				case 'k':
					//missing target
					if(!checkStringParameter(value))
						throw new ns.paramsError(name, value);
					
					//missing size
					if(!/sz=[^;]/.test(value))
						throw new ns.paramsError('sz', undefined);
					
					break;
			}
			
			if(value === null || String(value) === '')
				return;
			
			this.__data[name] = value;
		};
		
		this.addEventListener = function(eventName, callback){
			if(eventName && typeof eventName == 'string' && typeof callback == 'function'){
				Ti.Network.addEventListener(this.__getEventString(eventName), callback);
			}
		};
		
		this.removeEventListener = function(eventName, callback){
			if(eventName && typeof eventName == 'string' && typeof callback == 'function'){
				Ti.Network.removeEventListener(this.__getEventString(eventName), callback);
			}
		};
		
		this.fireEvent = function(eventName, data){
			if(eventName && typeof eventName == 'string'){
				Ti.Network.fireEvent(this.__getEventString(eventName), data||{});
			}
		};
		
		this.isBusy = function(){
			return (this.__xhr) ? (this.__xhr.readyState > 0 && this.__xhr.readyState < 4) : false;
		}
		
		this.request = function(){
			if(!this.__xhr){
				this.__xhr = Ti.Network.createHTTPClient({
					onload: this.__xhrOnLoad,
					onerror: this.__xhrOnError
				});
			}
			
			if(!this.isBusy()){
				var url = this.toString();
				
				this.__debug('sending request to ' + url);
				
				//due to a bug in Titanium 1.7.2/3 HTTPClient.send is not pushing request parameters for GET requests on iOS
				//falling back to using a full URL with querystring data in the open method for now
				this.__xhr.open('GET', url);
				this.__xhr.send();
			}else
				this.__debug('Request canceled, one is already running.');
		};
		
		/**
		 * @init
		 */
		
		params = params || {};
		//mandatory
		params.k = params.k || null
		params.t = tagType;
		
		//optional
		params.r = 'h';//XHTML format
		params.sdh = 0;//Do not include document headers in the response markup
		params.u = Ti.Platform.id;//user identifier for frequency capping
		
		for(var name in params){
			this.setParameter(name, params[name]);
		}
	};
	
	ns.createImageView = function(options){
		options = options || {};
		options.dartTag = options.dartTag || new ns.Tag(ns.TagTypes.IMAGE, options.tagParameters);
		options.autoload = options.autoload || true;
		options.load= function(){
			this.dartTag.request();
		};
		
		var img = Ti.UI.createImageView(options);
		
		img.dartTag.addEventListener('success', function(data){
			img.image = data.value;
			
			img.addEventListener('click', function(){
				Ti.Platform.openURL(data.target);
			});
			
			img.fireEvent('success', data);
		});
		
		img.dartTag.addEventListener('error', function(data){
			if(img.defaultAsset){
				img.image = img.defaultAsset;
			
				if(img.defaultTarget){
					img.addEventListener('click', function(){
						Ti.Platform.openURL(img.defaultTarget);
					});
				}
			}
			
			img.fireEvent('error', data);
		});
		
		if(options.autoload && Ti.Network.online)
			img.load();
		else if(!Ti.Network.online)
			img.dartTag.fireEvent('error', {source: img.dartTag, code: 'offline', message: 'No internet connection'});
		
		return img;
	};
	
	ns.createTextView = function(options){
		options = options || {};
		options.dartTag = options.dartTag || new ns.Tag(ns.TagTypes.TEXT, options.tagParameters);
		options.autoload = options.autoload || true;
		options.load= function(){
			this.dartTag.request();
		};
		
		var lbl = Ti.UI.createLabel(options);
		
		lbl.dartTag.addEventListener('success', function(data){
			lbl.text = data.value;
			
			lbl.addEventListener('click', function(){
				Ti.Platform.openURL(data.target);
			});
			
			lbl.fireEvent('success', data);
		});
		
		lbl.dartTag.addEventListener('error', function(data){
			if(lbl.defaultText){
				lbl.text = lbl.defaultText;
				
				if(lbl.defaultTarget){
					lbl.addEventListener('click', function(){
						Ti.Platform.openURL(lbl.defaultTarget);
					});
				}
			}
			
			lbl.fireEvent('error', data);
		});
		
		if(options.autoload && Ti.Network.online)
			lbl.load();
		else if(!Ti.Network.online)
			lbl.dartTag.fireEvent('error', {source: lbl.dartTag, code: 'offline', message: 'No internet connection'});
		
		return lbl;
	};
	
	ns.paramsError = function(paramName, paramValue){
		/**
		 * @public
		 */
		this.message = 'The "' + paramName + '" prameter was passed with an unexpected value: "' + paramValue + '".';
		
		this.toString = function(){
			return this.message;
		};
	};
}).apply(exports);