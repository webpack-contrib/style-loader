
/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css, currentUrl) {

	// get current url
	currentUrl = currentUrl || (typeof window !== "undefined" && window.location && window.location.href) || null;
	if (typeof currentUrl != "string") {
		throw new Error("fixUrls requires a current url");
	}

	//blank or null?
	if (!css || typeof css !== "string")
	  return css;

	//base url
	var baseUrl = currentUrl.match(/^([a-z]+:)?(\/\/)?[^\/]+/)[0];
	var protocol = baseUrl.split(":")[0];
	var currentUrlPath = baseUrl + (currentUrl.replace(baseUrl, "")).replace(/\/[^\/]+$/, "") + "/";

	//convert each url(...)
	var fixedCss = css.replace(/url *\( *(.+?) *\)/g, function(fullMatch, origUrl){
		//strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.replace(/^"(.*)"$/, function(o,$1){ return $1; })
			.replace(/^'(.*)'$/, function(o,$1){ return $1; });

		//already a full url? no change
		if (/^(data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl))
		  return fullMatch;

		//convert the url to a full url
		var newUrl = unquotedOrigUrl;
		if (newUrl.indexOf("//") === 0) {
		  //add protocol
			newUrl = protocol + ":" +newUrl;
		}else if (newUrl.indexOf("/") === 0){
			//path should be relative to the base url
			newUrl = baseUrl + newUrl;
		}else{
			//path should be relative to the current directory
			newUrl = currentUrlPath + newUrl.replace(/^\.\//, "");
		}

		//send back the fixed url(...)
		return "url("+JSON.stringify(newUrl)+")";
	});

	//send back the fixed css
	return fixedCss;
};
