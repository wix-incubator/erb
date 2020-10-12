// This is the placeholder used to indicate the place where Opal runtime code will be pasted
// eslint-disable-next-line
__OPAL__

Opal.loaded(['erb', 'json', 'base64'])

// We need to evaluate Ruby -> JavaScript code here so the template can be accessible later from Opal runtime
// eslint-disable-next-line no-eval
eval(Opal.Opal.ERB.$compile(Buffer.from('__TEMPLATE__', 'base64').toString('utf8'), 'my-template'))

const ctx = Opal.Object.$new()
const json = Buffer.from('__FIELDS__', 'base64').toString('utf8')
const jsFields = JSON.parse(json)
const rubyFields = Opal.JSON.$parse(json)
Object.keys(jsFields).forEach(function (field) {
  ctx.$instance_variable_set('@' + field, rubyFields['$[]'](field))
})

// It is a variable used for retrieving rendering results in a callee
// eslint-disable-next-line no-undef
output = Opal.Template['$[]']('my-template').$render(ctx)
