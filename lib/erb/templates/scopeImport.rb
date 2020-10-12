require 'json'
require 'base64'

def method_missing(method_name, *args, &block)
  data = JSON.parse(Base64.decode64('__DATA__'))
  data[:values].each_pair do |name, value|
    if method_name == name
      return value
    end
  end

  data[:functions].each_pair do |name, values|
    if method_name == name
      values.each do |value|
        input = value.slice(0, value.length - 1)
        output = value[value.length - 1]
        if input == args
          return output
        end
      end
    end
  end

  raise method_name.to_s + ' function or value is undefined for arguments ' + JSON.generate(args)
end