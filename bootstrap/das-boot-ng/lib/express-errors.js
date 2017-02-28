const {wixSystemError} = require('wix-errors');

module.exports = (app, config) => {

  app.get('/api/errors/error-async', () => process.nextTick(() => {
    throw new AsyncError('async error');
  }));
  app.get('/api/errors/error-sync', () => {
    throw new SyncError('sync error');
  });

  app.get('/api/errors/error-next', (req, res, next) => {
    next(new NextError('next error'))
  });

  app.get('/api/timeout', () => console.log(config.env));

  return app;
};

class AsyncError extends wixSystemError(10002) {
  constructor(msg) {
    super(msg);
    this.name = this.constructor.name;
  }
}

class SyncError extends wixSystemError(10000) {
  constructor(msg) {
    super(msg);
    this.name = this.constructor.name;
  }
}

class NextError extends wixSystemError(10001) {
  constructor(msg) {
    super(msg);
    this.name = this.constructor.name;
  }
}
