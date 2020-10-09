/* eslint-disable */

__OPAL__

eval(globalThis.Opal.Opal.ERB.$compile(Buffer.from('__TEMPLATE__', 'base64').toString('utf8'), 'mytemplate'));

var ctx = globalThis.Opal.get('Object').$new();
var json = Buffer.from('__FIELDS__', 'base64').toString('utf8');
var jsFields = JSON.parse(json);
var rubyFields = globalThis.Opal.get('JSON').$parse(json);
Object.keys(jsFields).forEach(function (field) {
  ctx.$instance_variable_set("@" + field, rubyFields['$[]'](field));
});

output = globalThis.Opal.Template['$[]']('mytemplate').$render(ctx);
/* eslint-enable */
