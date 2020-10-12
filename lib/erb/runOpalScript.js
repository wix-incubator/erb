var vm = require('vm')

function createGlobalScope () {
  return {
    Buffer: Buffer,
    console: {
      log: function () {
      }
    },
    global: {
    }
  }
}

function runOpalScript (timeout, opalScript) {
  var context = createGlobalScope()
  try {
    vm.runInNewContext(opalScript, context, {
      timeout: timeout,
      displayErrors: false
    })
  } catch (err) {
    if (err.message === 'Script execution timed out after ' + timeout + 'ms') {
      throw new Error('template evaluation timed out after ' + timeout + 'ms')
    } else {
      throw new Error(err.message)
    }
  }
  return context.output
}

module.exports = runOpalScript
