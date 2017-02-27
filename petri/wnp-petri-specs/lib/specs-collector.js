const assert = require('assert'),
  schemaValidate = require('jsonschema').validate;

module.exports = class SpecsCollector {
  constructor() {
    this._specs = {};
  }
  
  addSpecs(specs) {
    validate(specs);
    this._specs = Object.assign(this._specs, specs);
  }
  
  get nonEmpty() {
    return Object.keys(this._specs).length > 0;
  }
  
  get specs() {
    return this._specs;
  }
};

const schema = {
  'title': 'specs',
  'type': 'object',
  'additionalProperties': {
    'type': {
      '$ref': '#/definitions/spec'
    }
  },
  'definitions': {
    'spec': {
      'title': 'spec',
      'type': 'object',
      'properties': {
        'owner': {     
          'description': 'owner',
          'type': 'string'
        },
        'scope': {
          'description': 'scope',
          'type': 'string'
        },
        'onlyForLoggedInUsers': {
          'type': 'boolean'
        },
        'persistent': {
          'type': 'boolean'
        },
        'allowedForBots': {
          'type': 'boolean'
        },
        'testGroups': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        }
      },
      'required': ['owner', 'scope', 'onlyForLoggedInUsers'],
      'additionalProperties': false
    }
  }
};

function validate(specs) {
  assert(specs && typeof specs === 'object', 'specs is not a valid object');
  schemaValidate(specs, schema, {throwError: true, propertyName: 'specs'});
}

