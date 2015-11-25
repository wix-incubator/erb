'use strict';
module.exports.get = timeoutInMillis => {
  const timeoutMessage = `request timed out after ${timeoutInMillis} mSec`;
  return (req, res, next) => {
    clearTimeoutIfAny(req);
    createAndAttachTimer(req, res);
    attachClearTimerOnSocketDestroy(req, res);

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

  function attachClearTimerOnSocketDestroy(req, res) {
    res.on('finish', function() {
      clearTimeoutIfAny(req);
    });
  }
};





