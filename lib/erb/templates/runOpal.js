/* global Opal */

// eslint-disable-next-line
__OPAL__

var script = global.Opal.Opal.ERB.$compile(Buffer.from('__TEMPLATE__', 'base64').toString('utf8'), 'mytemplate')
// eslint-disable-next-line
eval(script)

var ctx = global.Opal.get('Object').$new()
var json = Buffer.from('__FIELDS__', 'base64').toString('utf8')
var jsFields = JSON.parse(json)
var rubyFields = global.Opal.get('JSON').$parse(json)
Object.keys(jsFields).forEach(function (field) {
  ctx.$instance_variable_set('@' + field, rubyFields['$[]'](field))
})

// eslint-disable-next-line no-undef
output = Opal.Template['$[]']('mytemplate').$render(ctx)
