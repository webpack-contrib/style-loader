// Detects the life cycle of npm for determination of whether it's production distribution
var NPM_PREPUBLISH_EVENT_REGEX = /^prepublish(Only)?$/gi;

/**
 * Parse `options.hmr` value depends on the following condition:
 *   1. If `options.hmr` is a set value, return itself
 *   2. If `options.hmr` is missing with value `undefined`, try to parse the npm command used to
 *     invoke webpack via npm lifecycle event, to determine the default value:
 *       a) If invoked via npm `prepublish` or `prepublishOnly`, this is production distribution and
 *         default value for `options.hmr` to be false.
 *       b) If invoked via other npm scripts or non-npm commands, assuming this is local or dev env,
 *         default value for `options.hmr` to be true.
 * @param {Boolean|undefined} hmr - The original `options.hmr`
 * @returns {Boolean}
 */
module.exports = function(hmr) {
  if (typeof hmr !== 'undefined') {
    return hmr;
  }

  var npmLifeCycleEvent = '';
  var isProductionDistribution = false;
  NPM_PREPUBLISH_EVENT_REGEX.lastIndex = 0;

  try {
    npmLifeCycleEvent = process.env.npm_lifecycle_event.trim();
  } catch (e) {
    // Not able to get the env object, no-op
  }

  if (npmLifeCycleEvent && NPM_PREPUBLISH_EVENT_REGEX.test(npmLifeCycleEvent)) {
    isProductionDistribution = true;
  }

  return !isProductionDistribution;
};
