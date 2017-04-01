module.exports = function(originalCss) {
    return originalCss.replace('.required', '.transformed');
}