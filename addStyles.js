/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isIE9 = memoize(function() {
		return /msie 9\b/.test(window.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null;

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}
	var styles = listToStyles(list);
	options = options || {};
	// Force single-tag solution on IE9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	options.singleton = options.singleton || isIE9();
	addStylesToDom(styles, options);
	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		// var sourceMap = item[3];
		var part = {css: css, media: media/*, sourceMap: sourceMap*/};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function createStyleElement() {
	var styleElement = document.createElement("style");
	var head = getHeadElement();
	styleElement.type = "text/css";
	head.appendChild(styleElement);
	return styleElement;
}

function addStyle(obj, options) {
	var styleElement;
	var singleton = options.singleton;

	if (singleton) {
		if (!singletonElement) singletonElement = createStyleElement();
		styleElement = singletonElement;
		if (styleElement.styleSheet) {
			obj.index = styleElement.styleSheet.cssText.length;
			obj.length = obj.css.length;
		} else {
			obj.index = styleElement.childNodes.length;
		}
	} else {
		styleElement = createStyleElement();
	}

	applyToTag(styleElement, obj);

	return function(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media /*&& newObj.sourceMap === obj.sourceMap*/)
				return;
			applyToTag(styleElement, obj = newObj);
		} else {
			if (singleton) {
				applyToTag(styleElement, {
					css: null,
					index: obj.index,
					length: obj.length
				});
			} else {
				getHeadElement().removeChild(styleElement);
			}
		}
	};
};

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;
	var index = obj.index;
	// var sourceMap = obj.sourceMap;

	// No browser support
	// if(sourceMap && typeof btoa === "function") {
		// try {
			// css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(JSON.stringify(sourceMap)) + " */";
		// } catch(e) {}
	// }

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		var styleSheet = styleElement.styleSheet;
		var length = obj.length;
		if(index) {
			styleSheet.cssText = styleSheet.cssText.slice(0, index)
				+ (css ? css : new Array(length + 1).join(' '))
				+ styleSheet.cssText.slice(index + length);
		} else {
			styleSheet.cssText = css;
		}
	} else {
		var cssNode = document.createTextNode(css);
		if(index) {
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styelElement.appendChild(cssNode);
			}
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(cssNode);
		}
	}

}
