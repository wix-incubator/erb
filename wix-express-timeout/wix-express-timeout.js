
module.exports.middleware = function(timeoutInMillis) {
  var timeoutMessage = "request timeout after " + timeoutInMillis + " mSec";
  return function(req, res, next) {
    if (req._timeoutTimer)
      clearTimeout(req._timeoutTimer);

    var timer = setTimeout(function(){
      req.timedout = true;
      res.emit('x-timeout', timeoutMessage);
    }, timeoutInMillis);

    req._timeoutTimer = timer;

    var destroy = req.socket.destroy;
    req.socket.destroy = function(){
      clearTimeout(timer);
      destroy.call(this);
    };

    req.timedout = false;

    next();
  }
};

