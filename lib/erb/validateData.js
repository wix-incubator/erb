var maxArguments = 39017

function validateObject (data, key) {
  if (typeof data[key] !== 'object') {
    throw new Error('data.' + key + ' must be an object')
  }
  if (data[key] === null) {
    throw new Error('data.' + key + ' must not be null')
  }
}

function validatePrimitives (object, what) {
  Object.keys(object).forEach(function (name) {
    var type = typeof object[name]
    if (type !== 'number' && type !== 'string' && type !== 'boolean' && type !== 'object') {
      throw new Error('type of ' + what + ' ' + name + ' is ' + type + ', but only number, string, boolean and object types are supported')
    }
  })
}

function validateData (data) {
  validateObject(data, 'values')
  validateObject(data, 'functions')
  validateObject(data, 'fields')
  validatePrimitives(data.values, 'value')
  validatePrimitives(data.fields, 'field')
  Object.keys(data.functions).forEach(function (name) {
    var definition = data.functions[name]
    if (!Array.isArray(definition)) {
      throw new Error('function ' + name + ' definition must be an array')
    }
    definition.forEach(function (branch) {
      var currentArguments = branch.length - 1
      var returnType = typeof branch[branch.length - 1]
      for (var i = 0; i < branch.length - 1; i++) {
        var argumentType = typeof branch[i]
        if (branch[i] !== null && argumentType !== 'number' && argumentType !== 'string' && argumentType !== 'boolean' && argumentType !== 'object') {
          throw new Error('function ' + name + ' has arguments with type ' + argumentType + ', but only number, string, boolean and object types are supported')
        }
      }
      if (returnType !== 'number' && returnType !== 'string' && returnType !== 'boolean' && returnType !== 'object') {
        throw new Error('return type of function ' + name + ' is ' + returnType + ', but only number, string, boolean and object return types are supported')
      }
      if (currentArguments > maxArguments) {
        throw new Error('function ' + name + ' has ' + currentArguments + ' arguments, but only a maximum of ' + maxArguments + ' is supported')
      }
    })
  })
}

module.exports = validateData
