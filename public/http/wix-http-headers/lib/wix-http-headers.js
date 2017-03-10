const testkit = require('wix-session-crypto-testkit').v2,
  reqOpts = require('wix-req-options');

module.exports = () => new WixHeaders();
module.exports.defaults = opts => new WixHeaders().withWixDefaults(opts);

class WixHeaders {

  constructor() {
    this._headersBuilder = reqOpts.builder(false);
  }

  withWixDefaults(props) {
    const properties = props || {};
    this._headersBuilder.withDefaultHeaders();
    this.withHeader('x-wix-language', properties['language'] || 'en');
    this.withHeader('x-wix-country-code', properties['country-code'] || 'US');
    return this;
  };

  withBi() {
    this._headersBuilder.withBi(); // TODO can we return immediately?
    return this;
  };

  withCookie(name, value) {
    this._headersBuilder.withCookie(name, value);
    return this;
  }

  cookies() {
    return this._headersBuilder.cookies;
  }

  withSession(props) { // TODO should we move out properties to wix-req-options module ??
    const opts = Object.assign({}, props, { wxs: props ? props.isWixStaff : undefined });
    const bundle = testkit.aValidBundle({ session: opts });
    this._headersBuilder.withSession(bundle);

    return this;
  };

  session() {
    return this._headersBuilder.wixSession;
  }

  withHeader(name, value) {
    this._headersBuilder.withHeader(name, value);
    return this;
  }

  headers() {
    return this._options().headers;
  }

  withPetriOverride() {
    this._headersBuilder.withPetriOverride.apply(this._headersBuilder, arguments);
    return this;
  }

  _options() { //TODO rename
    return this._headersBuilder.options();
  }
}
