const TestkitBase = require('wix-testkit-base').TestkitBase,
  intercept = require('intercept-stdout');

module.exports.interceptor = () => new WixStdOutErrTestkit();

class WixStdOutErrTestkit extends TestkitBase {
  constructor() {
    super();
    this._reset();
  }

  get stdout() {
    return this._stdout;
  }

  get stderr() {
    return this._stderr;
  }

  get output() {
    return this._stdout + this._stderr;
  }


  doStart() {
    return Promise.resolve().then(() => {
      this._reset();
      this._detach = intercept(
        stdout => this._stdout += stdout,
        stderr => this._stderr += stderr
      )
    });
  }

  doStop() {
    return Promise.resolve()
      .then(() => this._detach());
  }

  _reset() {
    this._stdout = '';
    this._stderr = '';
    this._detach = () => {};
  }
}
