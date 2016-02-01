'use strict';
const jsonSchema = require('jsonschema'),
  _ = require('lodash'),
  join = require('path').join,
  fs = require('fs');

module.exports.validate = conf => {
  if (_.isEmpty(conf)) {
    throw new ValidationError('\'config is mandatory\'');
  }

  const result = jsonSchema.validate(conf, loadSchema(), {propertyName: 'config'});

  if(result.errors && !_.isEmpty(result.errors)) {
    throw new ValidationError(result.errors.map(el => `'${el.property}  ${el.message}'`).join(', '));
  } else {
    return conf;
  }
};

function loadSchema() {
  return JSON.parse(fs.readFileSync(join(__dirname, '../schema/wix-bootstrap.json')));
}

function ValidationError(errors) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = `Validation failed with errors: [ ${errors} ]`;
}

require('util').inherits(ValidationError, Error);