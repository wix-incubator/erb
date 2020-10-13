/* global Opal */

// eslint-disable-next-line
__OPAL__

// eslint-disable-next-line
eval(global.Opal.Opal.ERB.$compile(new Buffer('__TEMPLATE__', 'base64').toString('utf8'), 'mytemplate'));

// eslint-disable-next-line
var ctx = global.Opal.get('Object').$new();
// eslint-disable-next-line
var json = new Buffer('__FIELDS__', 'base64').toString('utf8');
// eslint-disable-next-line
var jsFields = JSON.parse(json);
// eslint-disable-next-line
var rubyFields = global.Opal.get('JSON').$parse(json);
Object.keys(jsFields).forEach(function (field) {
  ctx.$instance_variable_set('@' + field, rubyFields['$[]'](field))
})

// eslint-disable-next-line no-undef
output = Opal.Template['$[]']('mytemplate').$render(ctx)
