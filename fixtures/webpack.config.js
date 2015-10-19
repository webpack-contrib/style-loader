module.exports = {
	module: {
		loaders: [
			{ test: /\.css$/, loader: "style?insertAt=top!css?sourceMap" }
		]
	}
}