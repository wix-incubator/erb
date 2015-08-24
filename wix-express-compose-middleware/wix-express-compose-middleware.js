/**
 * Created by yoava on 8/24/15.
 */
module.exports = function(middlewares) {
  if (!(middlewares instanceof Array))
    middlewares = Array.prototype.slice.call(arguments);

  return function(req, res, next) {
    var pos = 0;
    function internalNext() {
      pos += 1;
      if (pos >= middlewares.length)
        return next();
      else
        return middlewares[pos](req, res, internalNext);
    }
    return middlewares[pos](req, res, internalNext);
  }
};