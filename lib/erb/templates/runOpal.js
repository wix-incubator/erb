/* eslint-disable */

__OPAL__

Opal.loaded(["erb", "json", "base64"])
eval(global.Opal.Opal.ERB.$compile(new Buffer('__TEMPLATE__', 'base64').toString('utf8'), 'mytemplate'));

var ctx = global.Opal.Object.$new();
var json = new Buffer('__FIELDS__', 'base64').toString('utf8');
var jsFields = JSON.parse(json);
var rubyFields = global.Opal.JSON.$parse(json);
Object.keys(jsFields).forEach(function (field) {
  ctx.$instance_variable_set("@" + field, rubyFields['$[]'](field));
});

output = global.Opal.Template['$[]']('mytemplate').$render(ctx);
/* eslint-enable */