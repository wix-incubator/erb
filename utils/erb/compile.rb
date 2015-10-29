require 'erb'
require 'json'

data = (ARGV[0] == '-') ? STDIN : File.open(ARGV[0], 'rb')
template = File.open(ARGV[1], 'rb')

data = JSON.parse(data.read, symbolize_names: true)

data[:values].each_pair do |name, value|
  define_method name do
    value
  end
end

data[:functions].each_pair do |name, values|
  define_method name, ->(*args) do
    values.each do |value|
      input = value.slice(0, value.length - 1)
      output = value[value.length - 1]
      if input == args
        return output
      end
    end
    raise name.to_s + ' function value is undefined for arguments ' + JSON.generate(args)
  end
end

puts ERB.new(template.read).result