// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var dart = require('lib/com.wikia.ad.dart');

(function(){
	try{
		//raw tag
		var tag = new dart.Tag(dart.TagTypes.TEXT, {
			k: 'wka.gaming/_wowwiki/app;s0=gaming;s1=_wowwiki;s2=app;app=gameguides;sz=5x5',
			sp: 'xl',
			forecast: 1
		});
		
		tag.addEventListener('success', function(data){
			Ti.API.info('Tag Data: ' + data.value + ' (' + data.target + ')');
		});
		
		tag.addEventListener('error', function(data){
			Ti.API.error('DART Error (' + data.code + '): ' + data.message);
		});
		
		tag.request();
		
		var win = Ti.UI.createWindow({
			navBarHidden: false,
			exitOnClose: true
		});
		
		//com.wikia.ad.dart.ImageView
		var dartImage = dart.createImageView({
			autoload: true,
			defaultAsset: 'image.png',
			defaultTarget: 'http://www.wikia.com',
			width: 320,
			height: 50,
			top: 0,
			tagParameters: {
				k: 'wka.gaming/_wowwiki/app;s0=gaming;s1=_wowwiki;s2=app;app=gameguides;sz=5x5',
				sp: 'xl',
				forecast: 1
			}
		});
		
		win.add(dartImage);
		
		//com.wikia.ad.dart.TextView
		var dartText = dart.createTextView({
			autoload: true,
			defaultText: 'Click me',
			defaultTarget: 'http://www.google.com',
			color: 'white',
			backgroundColor: '#444444',
			width: '100%',
			height: 50,
			bottom: 0,
			textAlign: 'center',
			borderWidth: 3,
			borderRadius: 10,
			borderColor: 'white',
			tagParameters: {
				k: 'wka.gaming/_wowwiki/app;s0=gaming;s1=_wowwiki;s2=app;app=gameguides;sz=5x5',
				sp: 'xl',
				forecast: 1
			}
		});
		
		win.add(dartText);
		win.open();
	}catch(e){
		Ti.API.error(String(e));
	}
})();
