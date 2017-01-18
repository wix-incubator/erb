module.exports = timeoutInMillis => {
  return function wixExpressTimeout(req, res, next) {
    clearTimeoutIfAny(req);
    createAndAttachTimer(req, res, next);
    attachClearTimerOnSocketDestroy(req, res);

    next();
  };

  function clearTimeoutIfAny(req) {
    req.timedout = false;
    if (req._timeoutTimer) {
      clearTimeout(req._timeoutTimer);
    }
  }

  function createAndAttachTimer(req, res, next) {
    req._timeoutTimer = setTimeout(() => {
      req.timedout = true;
      const error = new TimeoutError(timeoutInMillis);
      next(error);
    }, timeoutInMillis);
  }

  function attachClearTimerOnSocketDestroy(req, res) {
    res.on('finish', () => clearTimeoutIfAny(req));
    res.on('close', () => clearTimeoutIfAny(req));
  }
};

class TimeoutError extends Error {
  constructor(timeoutInMillis) {
    super(`request timed out after ${timeoutInMillis} mSec`);
    this.name = this.constructor.name;
  }

  get _timeout() {
    return true;
  }
} 
