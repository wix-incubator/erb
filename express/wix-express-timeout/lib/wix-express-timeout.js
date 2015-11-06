'use strict';
module.exports.get = timeoutInMillis => {
  const timeoutMessage = `request timeout after ${timeoutInMillis} mSec`;
  return (req, res, next) => {
    clearTimeoutIfAny(req);
    createAndAttachTimer(req, res);
    attachClearTimerOnSocketDestroy(req);

    next();
  };

  function clearTimeoutIfAny(req) {
    req.timedout = false;
    if (req._timeoutTimer) {
      clearTimeout(req._timeoutTimer);
    }
  }

  function createAndAttachTimer(req, res) {
    req._timeoutTimer = setTimeout(() => {
      req.timedout = true;
      res.emit('x-timeout', timeoutMessage);
    }, timeoutInMillis);
  }

  function attachClearTimerOnSocketDestroy(req) {
    const destroy = req.socket.destroy;
    req.socket.destroy = function () {
      clearTimeoutIfAny(req);
      destroy.call(this);
    };
  }
};





