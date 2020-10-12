var vm = require('vm')

function runOpalScript (timeout, opalScript) {
  var context = {
    Buffer: Buffer
  }
  try {
    vm.runInNewContext(opalScript, context, {
      timeout: timeout,
      displayErrors: false
    })
  } catch (err) {
    var timeoutMessages = [
      'Script execution timed out.',
      'Script execution timed out after ' + timeout + 'ms'
    ]
    if (timeoutMessages.includes(err.message)) {
      throw new Error('template evaluation timed out after ' + timeout + 'ms')
    } else {
      throw new Error(err.message)
    }
  }
  return context.output
}

module.exports = runOpalScript
