// It is a placeholder that will be replaced at runtime with Opal runtime code
// eslint-disable-next-line
__OPAL__

Opal.loaded(['erb', 'json', 'base64'])

// We are evaluating compiled Ruby to JavaScript code so the template appears in Opal runtime
// eslint-disable-next-line no-eval
eval(Opal.Opal.ERB.$compile(Buffer.from('__TEMPLATE__', 'base64').toString('utf8'), 'my-template'))

const ctx = Opal.Object.$new()
const json = Buffer.from('__FIELDS__', 'base64').toString('utf8')
const jsFields = JSON.parse(json)
const rubyFields = Opal.JSON.$parse(json)
Object.keys(jsFields).forEach(function (field) {
  ctx.$instance_variable_set('@' + field, rubyFields['$[]'](field))
})

// output here will be used as context.output in the callee to retrieve the result
// eslint-disable-next-line
output = Opal.Template['$[]']('my-template').$render(ctx)
