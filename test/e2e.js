var Promise = require('bluebird')
var _ = require('lodash')

describe('erb', function () {
  var erb, expectedGlobals
  var zero = _.range(0)
  var one = _.range(1)
  var many = _.range(5)
  var maxArguments = 39017
  var lots = _.range(maxArguments)
  var oops = _.range(39018)

  function getGlobalVariables () {
    var variables = []
    for (var variable in global) {
      variables.push(variable)
    }
    return variables
  }

  function expectError (actualErrorPromise, expectedErrorMessage) {
    return actualErrorPromise.then(function () {
      throw new Error('expected error')
    }, function (actualError) {
      expect(actualError instanceof Error).to.equal(true)
      expect(actualError.message).to.equal(expectedErrorMessage)
    })
  }

  function itx (realit, name, parameters) {
    realit(name, function () {
      var data = {
        values: {
          value1: 'admiring',
          value2: 'adoring'
        },
        functions: {
          function1: [
            [
              'agitated'
            ]
          ],
          function2: [
            [
              1,
              'compassionate'
            ],
            [
              2,
              'condescending'
            ]
          ]
        }
      }
      if ('function0' in parameters) {
        data.functions.function0 = parameters.function0
      }
      if ('value0' in parameters) {
        data.values.value0 = parameters.value0
      }
      var call = Promise.resolve(erb({
        template: parameters.template,
        data: data,
        timeout: parameters.timeout
      }))
      if (parameters.expectedError) {
        return expectError(call, parameters.expectedError)
      }
      return call.then(function (actualOutput) {
        expect(actualOutput).to.eql(parameters.expectedOutput)
      })
    })
  }

  function it (name, parameters) {
    itx(global.it, name, parameters)
  }

  it.only = function (name, parameters) {
    itx(global.it.only.bind(global.it), name, parameters)
  }

  beforeEach(function () {
    expectedGlobals = getGlobalVariables()
    erb = require('..')
  })

  afterEach(function () {
    var actualGlobals = getGlobalVariables()

    expect(actualGlobals).to.eql(expectedGlobals)
  })

  describe('template evaluation time out', function () {
    it('is by default 5000ms', {
      template: '<% while true do end %>',
      expectedError: 'template evaluation timed out after 5000ms'
    })

    it('cannot be disabled', {
      template: '<% while true do end %>',
      timeout: undefined,
      expectedError: 'template evaluation timed out after 5000ms'
    })

    it('can be changed', {
      template: '<% while true do end %>',
      timeout: 500,
      expectedError: 'template evaluation timed out after 500ms'
    })
  })

  global.it('does not modify options', function () {
    var options = {
      template: '<%= TRUE %>'
    }
    var expectedOptions = JSON.parse(JSON.stringify(options))
    return Promise
      .resolve(erb(options))
      .then(function () {
        var actualOptions = JSON.parse(JSON.stringify(options))

        expect(actualOptions).to.eql(expectedOptions)
      })
  })

  global.it('does not substitute if template is not a string', function () {
    return expectError(erb({
    }), 'template must be a string')
  })

  global.it('substitutes if data is undefined', function () {
    return expect(erb({
      template: '<%= TRUE %>'
    })).to.eventually.equal('true')
  })

  global.it('supports toJSON in data', function () {
    var data = function () {
    }
    var values = function () {
    }
    var value0 = function () {
    }

    value0.toJSON = function () {
      return 'distracted'
    }
    values.toJSON = function () {
      return {
        value0: value0
      }
    }
    data.toJSON = function () {
      return {
        values: values
      }
    }
    return expect(erb({
      template: '<%= value0 %>',
      data: data
    })).to.eventually.equal('distracted')
  })

  global.it('substitutes if data.values is undefined', function () {
    return expect(erb({
      template: '<%= TRUE %>',
      data: {
        functions: {
        }
      }
    })).to.eventually.equal('true')
  })

  global.it('does not substitute if data.values is not an object', function () {
    return expectError(erb({
      template: '',
      data: {
        values: '',
        functions: {
        }
      }
    }), 'data.values must be an object')
  })

  global.it('does not substitute if data.values is null', function () {
    return expectError(erb({
      template: '',
      data: {
        values: null,
        functions: {
        }
      }
    }), 'data.values must not be null')
  })

  it('substitutes TRUE value', {
    template: '<%= TRUE %>',
    expectedOutput: 'true'
  })

  global.it('ignores a try to override TRUE value', function () {
    var expectedOutput = 'true'
    var actualOutputPromise = erb({
      template: '<%= TRUE %>',
      data: {
        values: {
          TRUE: false
        },
        functions: {
        }
      }
    })
    return expect(actualOutputPromise).to.eventually.equal(expectedOutput)
  })

  it('substitutes values by name', {
    template: '<%= value1 %> and <%= value2 %>',
    expectedOutput: 'admiring and adoring'
  })

  it('substitutes numeric values', {
    template: '<%= value0 %>',
    value0: 1,
    expectedOutput: '1'
  })

  it('substitutes string values', {
    template: '<%= value0 %>',
    value0: '1',
    expectedOutput: '1'
  })

  it('substitutes boolean values', {
    template: '<%= value0 %>',
    value0: true,
    expectedOutput: 'true'
  })

  it('substitutes object values', {
    template: '<%= value0[:property0] %>',
    value0: {
      property0: 'cranky'
    },
    expectedOutput: 'cranky'
  })

  it('does not substitute undefined values', {
    template: '<%= value0 %>',
    value0: undefined,
    expectedError: 'value0 function or value is undefined for arguments []'
  })

  it('does not substitute function values', {
    template: '<%= value0 %>',
    value0: function () {
    },
    expectedError: 'value0 function or value is undefined for arguments []'
  })

  global.it('substitutes if data.functions is undefined', function () {
    return expect(erb({
      template: '<%= TRUE %>',
      data: {
        values: {
        }
      }
    })).to.eventually.equal('true')
  })

  global.it('does not substitute if data.functions is not an object', function () {
    return expectError(erb({
      template: '',
      data: {
        values: {},
        functions: ''
      }
    }), 'data.functions must be an object')
  })

  global.it('does not substitute if data.functions is null', function () {
    return expectError(erb({
      template: '',
      data: {
        values: {},
        functions: null
      }
    }), 'data.functions must not be null')
  })

  it('does not substitute when function definition is not an array', {
    template: '<%= function1() %>',
    function0: '',
    expectedError: 'function function0 definition must be an array'
  })

  it('ignores print call', {
    template: '<% print("call1") %>',
    expectedOutput: ''
  })

  global.it('ignores a try to override print function', function () {
    var expectedOutput = ''
    var actualOutputPromise = erb({
      template: '<%= print() %>',
      data: {
        values: {},
        functions: {
          print: [[1]]
        }
      }
    })
    return expect(actualOutputPromise).to.eventually.equal(expectedOutput)
  })

  it('substitutes functions by name', {
    template: '<%= function0() %> and <%= function1() %>',
    function0: [zero.concat('amazing')],
    expectedOutput: 'amazing and agitated'
  })

  it('substitutes functions by skipping non-matching arguments', {
    template: '<%= function2(2) %>',
    expectedOutput: 'condescending'
  })

  it('substitutes functions with ' + zero.length + ' arguments', {
    template: '<%= function0(' + zero.join(', ') + ') %>',
    function0: [zero.concat('angry')],
    expectedOutput: 'angry'
  })

  it('substitutes functions with ' + one.length + ' argument', {
    template: '<%= function0(' + one.join(', ') + ') %>',
    function0: [one.concat('awesome')],
    expectedOutput: 'awesome'
  })

  it('substitutes functions with ' + many.length + ' arguments', {
    template: '<%= function0(' + many.join(', ') + ') %>',
    function0: [many.concat('backstabbing')],
    expectedOutput: 'backstabbing'
  })

  it('substitutes functions with ' + lots.length + ' arguments', {
    template: '<%= function0(' + lots.join(', ') + ') %>',
    function0: [lots.concat('berserk')],
    timeout: 120000,
    expectedOutput: 'berserk'
  })

  it('does not substitute functions with ' + oops.length + ' arguments', {
    template: '<%= function0(' + oops.join(', ') + ') %>',
    function0: [oops.concat('big')],
    expectedError: 'function function0 has ' + oops.length + ' arguments, but only a maximum of ' + maxArguments + ' is supported'
  })

  it('substitutes functions with numeric arguments', {
    template: '<%= function0(1) %>',
    function0: [[1, 'boring']],
    expectedOutput: 'boring'
  })

  it('substitutes functions with string arguments', {
    template: '<%= function0("1") %>',
    function0: [['1', 'clever']],
    expectedOutput: 'clever'
  })

  it('substitutes functions with boolean arguments', {
    template: '<%= function0(true) %>',
    function0: [[true, 'cocky']],
    expectedOutput: 'cocky'
  })

  it('substitutes functions with undefined arguments by taking undefined as null', {
    template: '<%= function0(nil) %>',
    function0: [[undefined, 'dreamy']],
    expectedOutput: 'dreamy'
  })

  it('substitutes functions with null arguments', {
    template: '<%= function0(nil) %>',
    function0: [[null, 'drunk']],
    expectedOutput: 'drunk'
  })

  it('substitutes functions with function arguments by taking functions as null', {
    template: '<%= function0(nil) %>',
    function0: [[_.noop, 'ecstatic']],
    expectedOutput: 'ecstatic'
  })

  it('substitutes functions with object arguments', {
    template: '<%= function0({a: 1}) %>',
    function0: [[{a: 1}, 'workable']],
    expectedOutput: 'workable'
  })

  it('substitutes functions with numeric return values', {
    template: '<%= function0() %>',
    function0: [[1]],
    expectedOutput: '1'
  })

  it('substitutes functions with string return values', {
    template: '<%= function0() %>',
    function0: [['1']],
    expectedOutput: '1'
  })

  it('substitutes functions with boolean return values', {
    template: '<%= function0() %>',
    function0: [[true]],
    expectedOutput: 'true'
  })

  it('substitutes functions with object return values', {
    template: '<%= function0()[:property0] %>',
    function0: [[{
      property0: 'desperate'
    }]],
    expectedOutput: 'desperate'
  })

  it('substitutes functions with undefined return values by taking undefined as null', {
    template: '<%= function0(function0()) %>',
    function0: [[undefined], [null, 'elated']],
    expectedOutput: 'elated'
  })

  it('substitutes functions with function return values by taking functions as null', {
    template: '<%= function0(function0()) %>',
    function0: [[_.noop], [null, 'elegant']],
    expectedOutput: 'elegant'
  })
})
