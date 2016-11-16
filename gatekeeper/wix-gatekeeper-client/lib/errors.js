module.exports.GatekeeperAccessDenied = class GatekeeperAccessDenied extends Error {
  constructor(underlyingError) {
    super(underlyingError.message);
    this.name = this.constructor.name;
    this.underlyingError = underlyingError;
  }

  get metadata() {
    return this.underlyingError.metadata;
  }
};
