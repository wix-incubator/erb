module.exports.GatekeeperAccessDenied = class GatekeeperAccessDenied extends Error {
  constructor(underlyingError) {
    super();
    this.name = this.constructor.name;
    this.underlyingError = underlyingError;
  }

  get message() {
    return this.underlyingError.message;
  }

  get metadata() {
    return this.underlyingError.metadata;
  }
};
