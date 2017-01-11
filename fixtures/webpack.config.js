module.exports = {
	module: {
		loaders: [
			{ test: /\.css$/, loader: "style?insertAt=top&attrs[]=data-x:[name]\\:[ext],attrs[]=attrName:someAttr!css?sourceMap" }
		]
	}
}