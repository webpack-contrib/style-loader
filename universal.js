/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Istvan Jano janoist1@gmail.com
 */

/**
 * Add styles - used by the loader
 *
 * @param list
 * @param options
 */
module.exports.addStyles = function (list, options) {
    global.__styles__ = global.__styles__ || []
    var newStyles = {}

    for (var i = 0; i < list.length; i++) {
        var item = list[i]
        var id = item[0]
        var css = item[1]
        var media = item[2]
        var sourceMap = item[3]
        var part = {css: css, media: media, sourceMap: sourceMap}

        if (!newStyles[id]){
            global.__styles__.push(newStyles[id] = {id: id, parts: [part]})
        } else {
            newStyles[id].parts.push(part)
        }
    }
}

/**
 * Return the styles that have been collected so far
 *
 * @returns {*}
 */
module.exports.getStyles = function () {
    return global.__styles__
}
