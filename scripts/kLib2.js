/*
To do:
- element.is() function
- dates
- integrate timer
- fire custom events ie7
- $k(this) handling //make it $(these)
- ready event
- docs!!!
*/

kLib={
	basicInfo: {
		version: '1.0',
		build: '16',
		stage: 'onWork',
		buildDate: '2012-11-19',
		getFullVersionInfo: function () {
			return kLib.basicInfo.version+'.'+kLib.basicInfo.build+' '+kLib.basicInfo.stage;
		}
	},
	regExp: {
		trimLeft: /^\s\s*/,
		trimRight: /\s\s*$/,
		simpleTag: /^[a-zA-Z]*$/,
		simpleId: /^#[a-zA-Z0-9\-\_]*$/,
		simpleClass: /^\.[a-zA-Z0-9\-\_]*$/,
		bindToWindow: function () {
			for (var regExp in kLib.regExp) {
				window[regExp]=kLib.regExp[regExp];
			}
			return true;
		}
	},
	UA: {
		name: '',
		short: '',
		version: 0,
		OS: '',
		getUAInfo: function () {
			kLib.UA.name=(function () {
				if (window.ActiveXObject) {
					return 'Internet Explorer';
				}
				if (window.opera) {
					return 'Opera';
				}
				if (window.chrome) {
					return 'Chrome';
				}
				if (window.WebKitAnimationEvent) {
					return 'Safari';
				}
				if (window.clientInformation) {
					return 'Konqueror';
				}
				if (window.mozRequestAnimationFrame) {
					if (window.navigator.userAgent.indexOf('SeaMonkey')!=-1) {
						return 'SeaMonkey';
					}
					if (window.navigator.userAgent.indexOf('Firefox')!=-1) {
						return 'Firefox';
					}
				}
				if (window.XPCSafeJSObjectWrapper) {
					return 'Camino';
				}
				return 'Unknown';
			})();
			kLib.UA.short=(function () {
				switch (kLib.UA.name) {
					case 'Internet Explorer':
						return 'IE';
					case 'Opera':
						return 'O';
					case 'Chrome':
						return 'CH';
					case 'Safari':
						return 'S';
					case 'Konqueror':
						return 'K';
					case 'SeaMonkey':
						return 'SM';
					case 'Firefox':
						return 'FF';
					case 'Camino':
						return 'C';
					default:
						return 'UK';
				}
			})();
			kLib.UA.version=(function () {
				switch (kLib.UA.name) {
					case 'Internet Explorer':
						return parseFloat(navigator.appVersion.split("MSIE")[1]);
					case 'Opera':
						return 0;
					case 'Chrome':
						return 0;
					case 'Safari':
						return 0;
					case 'Konqueror':
						return 0;
					case 'SeaMonkey':
						return 0;
					case 'Firefox':
						return 0;
					case 'Camino':
						return 0;
					default:
						return 0;
				}
			})();
		}
	},
	extendDefaultObjectMethods: function () {
		Array.prototype.remove=function (element, all) {
			var found=false, _len, _i;
			if (all) {
				for (_i=0, _len=this.length; _i<_len; _i++) {
					if (this[_i]===element) {
						this.splice(_i, 1);
						found=true;
					}
				}
			}
			else {
				for (_i=0, _len=this.length; _i<_len; _i++) {
					if (this[_i]===element) {
						this.splice(_i, 1);
						return true;
					}
				}
			}
			return found;
		};
		Array.prototype.find=function (element) {
			return (this.indexOf(element)!==-1);
		};
		String.prototype.firstChar=function () {
			return this.charAt(0)
		};
		String.prototype.lastChar=function () {
			return this.charAt(this.length-1)
		};
		String.prototype.count=function (char) {
			var i, count, len=this.length;
			for (i=0, count=0; i<len; i++) {
				count+= +(char===this[i]);
			}
			return count;
		};
		String.prototype.find=function () {
			for (_i=0; _i<arguments.length; _i++) {
				if (this.match(arguments[_i])) {
					return true;
				}
			}
			return false;
		};
		String.prototype.trimSpaces=function () {
			return this.replace(kLib.regExp.trimLeft, '').replace(kLib.regExp.trimRight, '');
		};
		String.prototype.toCamelCase=function () {
			return this.replace(/((\s|-|_)+[^(\s|-|_)])/g, function ($1) {return $1.toUpperCase().replace(/(\s|-|_)+/,'')});
		};
		String.prototype.toDashCase=function () {
			return this.replace(/((\s|-|_)+[^(\s|-|_)])/g, function ($1) {return $1.replace(/(\s|-|_)+/, '-')});
		};
		String.prototype.toUnderscoreCase=function () {
			return this.replace(/((\s|-|_)+[^(\s|-|_)])/g, function ($1) {return $1.replace(/(\s|-|_)+/, '_')});
		};
		String.prototype.toJSONCase=function () {
			return this.replace(/[^(\w|$)]+/g, '').replace(/\b[0-9]+/, '');
		};
		Number.prototype.leadingZeroes=function (digits) {
			var str=this.toString();
			while (str.length<digits) {
				str='0'+str;
			}
			return str;
		};
		kLib.QuerySelection.prototype=kLib.dom;
	},
	dom: {
		ieGetUniqueID: function() {
			var _len, _i, idArray=[];
			for (_i=0, _len=this.length; _i<_len; _i++) {
				if (this[_i]===window) {
					idArray[_i]='window';
				}
				else if (this[_i]===document) {
					idArray[_i]='document';
				}
				else {
					idArray[_i]=this[_i].uniqueID;
				}
			}
			return idArray;
		},
		css: function (obj, val) {
			var camelized, _len, _i, _prop, currentStyle, cachedDisplay, arr='';
			if (typeof obj==='string' && typeof val==='string') {
				camelized=obj.toCamelCase();
				for (_i=0, _len=this.length; _i<_len; _i++) {
					this[_i].style[camelized]=val;
				}
			}
			else if (typeof obj==='object') {
				for (_prop in obj) {
					arr+=_prop+':'+obj[_prop]+';';
				}
				for (_i=0, _len=this.length; _i<_len; _i++) {
					this[_i].setAttribute('style', arr);
				}
			}
			else {
				throw new TypeError('Unexpected parameters in function.');
			}
			return this;
		},
		on: function (eventName, handler, capture, args) {
			var _len, _i, _key, _fn, _elm;
			if (typeof eventName==='string' && typeof handler==='function') {
				capture=(capture instanceof Array) ? false : !!capture;
				args=(capture instanceof Array) ? capture : args;
				args=(args instanceof Array) ? args : false;
				if (window.addEventListener) {
					if (args) {
						_fn=function (event) {
							handler.apply(this, args);
						}
						for (_i=0, _len=this.length; _i<_len; _i++) {
							this[_i].addEventListener(eventName, _fn, capture);
						}
					}
					else {
						for (_i=0, _len=this.length; _i<_len; _i++) {
							this[_i].addEventListener(eventName, handler, capture);
						}
					}
				}
				else {
					idArray=kLib(this).ieGetUniqueID();
					eventName='on'+eventName;
					for (_i=0, _len=this.length; _i<_len; _i++) {
						_key='functionKey::objectId_'+idArray[_i]+'::eventName_'+eventName+'::function_'+handler+'::arguments'+args;
						_fn=kLib.auxVars.handlers[_key];
						if (!_fn) {
							if (args) {
								_fn=function (event) {
									handler.apply(event.srcElement, args)
								}
							}
							else {
								_fn=function (event) {
									handler.call(event.srcElement, event)
								}
							}
							kLib.auxVars.handlers[_key]=_fn;
							_elm=this[_i];
							_elm.attachEvent(eventName, _fn);
							window.attachEvent('onunload', function () {
								_elm.detachEvent(eventName, _fn);
							});
						}
					}
				}
			}
			else {
				throw new TypeError('Unexpected parameters in function.');
			}
			return this;
		},
		off: function (eventName, handler, capture, args) {
			var _len, _i;
			if (typeof eventName==='string' && typeof handler==='function') {
				capture=(capture instanceof Array) ? false : !!capture;
				args=(capture instanceof Array) ? capture : args;
				args=(args instanceof Array) ? args : false;
				if (window.removeEventListener) {
					if (args) {
						_fn=function (event) {
							handler.apply(this, args);
						}
						for (_i=0, _len=this.length; _i<_len; _i++) {
							this[_i].addEventListener(eventName, _fn, capture);
						}
					}
					else {
						for (_i=0, _len=this.length; _i<_len; _i++) {
							this[_i].removeEventListener(eventName, handler, capture);
						}
					}
				}
				else {
					idArray=kLib(this).ieGetUniqueID();
					eventName='on'+eventName;
					for (_i=0, _len=this.length; _i<_len; _i++) {
						_key='functionKey::objectId_'+idArray[_i]+'::eventName_'+eventName+'::function_'+handler+'::arguments'+args;
						_fn=kLib.auxVars.handlers[_key];
						if (_fn) {
							this[_i].detachEvent(eventName, _fn);
							delete kLib.auxVars.handlers[_key];
						}
					}
				}
			}
			else {
				throw new TypeError('Unexpected parameters in function.');
			}
			return this;
		},
		trigger: function (event, properties, bubbles, cancelable) {
			var _i, _len, _str, _prop;			
			if (window.dispatchEvent) {
				if (typeof event==='string') {
					_str=event;
					event=document.createEvent('Event');
					bubbles=bubbles ? true : false;
					cancelable=cancelable ? true : false;
					event.initEvent(_str, bubbles, cancelable);
				}
				if (typeof properties==='object') {
					for (_prop in properties) {
						if (!event[_prop]) {
							event[_prop]=properties[_prop];
						}
					}
				}
				for (_i=0, _len=this.length; _i<_len; _i++) {
					this[_i].dispatchEvent(event);
				}
			}
			else {
				if (typeof event==='object' && event.type) {
					_str='on'+event.type;
				}
				else if (typeof event==='string') {
					_str='on'+event;
				}
				for (_i=0, _len=this.length; _i<_len; _i++) {
					if (this[_i]!==window) {
						this[_i].fireEvent(_str);
					}
				}
			}
			return this;
		},
		remove: function () {
			for (_i=0; _i<this.el.length; _i++) {
				this.el[_i].style.display='none';
			}
			return this;
		},
		forEach: function (code) {
			if (code) {
				for (_i=0; _i<this.length; _i++) {
					code.call(this[_i]);
				}
			}
			return this;
		},
		toggle: function (string, obj) {
			if (string=='style' || string=='css') {
				this.toggleCss(obj);
			}
			return this;
		},
		toggleCss: function (obj) {
			for (_i=0; _i<this.el.length; _i++) {
				for (prop in obj) {
					if (obj[prop] instanceof Array) {
						if (this.el[_i].style[prop.toCamelCase()]==obj[prop][0]) {
							this.el[_i].style[prop.toCamelCase()]=obj[prop][1];
						}
						else {
							this.el[_i].style[prop.toCamelCase()]=obj[prop][0];
						}
					}
				}
			}
			return this;
		}
	},
	debug: {
		writeToConsole: function (newText, overWriting) {
			consoleDisplay=document.getElementById('consoleDisplay');
			if (consoleDisplay) {
				consoleDisplay.style.visibility='visible';
				consoleDisplay.style.display='block';
				if (overWriting) {
					consoleDisplay.innerHTML=newText+'<br />';
				}
				else {
					consoleDisplay.innerHTML+=newText+'<br />';
				}
			}
			else {
				consoleDisplay=document.createElement('pre');
				consoleDisplay.id='consoleDisplay';
				consoleDisplay.style.position='fixed';
				consoleDisplay.style.top=kLib.firefoxOnAndroid ? '0px' : 'auto';
				consoleDisplay.style.left=kLib.firefoxOnAndroid ? '400px' : 'auto';
				consoleDisplay.style.bottom=kLib.firefoxOnAndroid ? 'auto' : '0px';
				consoleDisplay.style.right=kLib.firefoxOnAndroid ? 'auto' : '0px';
				consoleDisplay.style.width='250px';
				consoleDisplay.style.height='100px';
				consoleDisplay.style.backgroundColor=(kLib.UA.name==='Internet Explorer') ? '#212121' : 'rgba(33,33,33,0.9)';
				consoleDisplay.style.color='#ffffff';
				consoleDisplay.style.zIndex='9999';
				consoleDisplay.style.overflowY='auto';
				consoleDisplay.style.wordWrap='break-word';
				consoleDisplay.style.borderRadius='5px';
				consoleDisplay.style.paddingLeft='7px';
				consoleDisplay.style.margin='0px';
				consoleDisplay.ondblclick='kLib.debug.closeConsole()';
				document.getElementsByTagName('body')[0].appendChild(consoleDisplay);
				kLib.debug.writeToConsole(newText, overWriting);
			}
		},
		closeConsole: function (clearConsole) {
			if (window.consoleDisplay) {
				consoleDisplay.style.display='none';
				if (clearConsole) {
					consoleDisplay.innerHTML='';
				}
			}
		}
	},
	auxVars: {
		handlers: {}
	},
	select: function (string, context) {
		return new kLib.QuerySelection(string, context);
	},
	QuerySelection: function (string, context) {
		if (!context) {
			context=window.document;
		}
		if (typeof string=='string') {
			var _aux, _len, _i, trimmedString=string.trimSpaces();
			if (simpleId.test(trimmedString)) {
				_aux=document.getElementById(trimmedString.slice(1));
				if (_aux) {
					this[0]=_aux;
					this.length=1;
				}
				else {
					this.length=0;
				}
			}
			else if (simpleClass.test(trimmedString)) {
				_aux=context.getElementsByClassName(trimmedString.slice(1));
				this.length=_len=_aux.length;
				for (_i=0; _i<_len; _i++) {
					this[_i]=_aux[_i];
				}
			}
			else if (simpleTag.test(trimmedString)) {
				_aux=context.getElementsByTagName(string);
				this.length=_len=_aux.length;
				for (_i=0; _i<_len; _i++) {
					this[_i]=_aux[_i];
				}
			}
			else {
				_aux=context.querySelectorAll(string);
				this.length=_len=_aux.length;
				for (_i=0; _i<_len; _i++) {
					this[_i]=_aux[_i];
				}
			}
		}
		else {
			if (string instanceof Array || string instanceof kLib.QuerySelection) {
				this.length=_len=string.length;
				for (_i=0; _i<_len; _i++) {
					this[_i]=string[_i];
				}
			}
			else {
				this[0]=string;
				this.length=1;
			}
		}
		this.query=string;
	},
	bindFunctions: function () {
		window.cWrite=kLib.debug.writeToConsole,
		window.cClose=kLib.debug.closeConsole
	},
	copyProps: function () {
		var _prop;
		window.$k=kLib.select;
		for (_prop in kLib) {
			window.$k[_prop]=kLib[_prop];
		}
		window.kLib=$k.select;
		for (_prop in $k) {
			window.kLib[_prop]=$k[_prop];
		}
	},
	directInit: function () {
		kLib.UA.getUAInfo();
		kLib.extendDefaultObjectMethods();
		kLib.copyProps();
		kLib.bindFunctions();
		kLib.regExp.bindToWindow();
		kLib(document).on('DOMContentLoaded', kLib.onloadInit, false);
	},
	onloadInit: function () {
	}
}
kLib.directInit();

firefoxRegExp=/firefox/i;
androidRegExp=/android/i;
if (firefoxRegExp.test(navigator.userAgent) && androidRegExp.test(navigator.userAgent)) {
	kLib.firefoxOnAndroid=1;
}