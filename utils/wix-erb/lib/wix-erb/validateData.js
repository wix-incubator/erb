'use strict';

var maxArguments = 60056;

function validateData(data) {
  if (typeof data.values !== 'object') {
    throw new Error('data.values must be an object');
  }
  if (data.values === null) {
    throw new Error('data.values must not be null');
  }
  if (typeof data.functions !== 'object') {
    throw new Error('data.functions must be an object');
  }
  if (data.functions === null) {
    throw new Error('data.functions must not be null');
  }
  Object.keys(data.values).forEach(function (name) {
    var type = typeof data.values[name];
    if (type !== 'number' && type !== 'string' && type !== 'boolean' && type !== 'object') {
      throw new Error('type of value ' + name + ' is ' + type + ', but only number, string, boolean and object types are supported');
    }
  });
  Object.keys(data.functions).forEach(function (name) {
    var definition = data.functions[name];
    if (!Array.isArray(definition)) {
      throw new Error('function ' + name + ' definition must be an array');
    }
    definition.forEach(function (branch) {
      var currentArguments = branch.length - 1;
      var returnType = typeof branch[branch.length - 1];
      for (var i = 0; i < branch.length - 1; i++) {
        var argumentType = typeof branch[i];
        if (branch[i] !== null && argumentType !== 'number' && argumentType !== 'string' && argumentType !== 'boolean') {
          throw new Error('function ' + name + ' has arguments with type ' + argumentType + ', but only number, string and boolean types are supported');
        }
      }
      if (returnType !== 'number' && returnType !== 'string' && returnType !== 'boolean' && returnType !== 'object') {
        throw new Error('return type of function ' + name + ' is ' + returnType + ', but only number, string, boolean and object return types are supported');
      }
      if (currentArguments > maxArguments) {
        throw new Error('function ' + name + ' has ' + currentArguments + ' arguments, but only a maximum of ' + maxArguments + ' is supported');
      }
    });
  });
}

module.exports = validateData;
