# erb

# Example

If in `example.js` you have:

```javascript
var erb = require('erb');

var data = {
  "values": {
    "additions": "with pattie, breaded and fried"
  },
  "functions": {
    "title": [
      [
        1,
        "One Chicken Fried Steak"
      ],
      [
        2,
        3,
        "Two or Three Chicken Fried Steaks"
      ]
    ]
  }
}

erb('template.erb', data).then(console.log, console.error);
```

And in `template.erb` you have:

```
Morty had <%= title(1) %> <%= additions %>.
Rick had <%= title(2, 3) %> <%= additions %>.
```

And you do `node example.js`, then you get:

```
Morty had One Chicken Fried Steak with pattie, breaded and fried.
Rick had Two or Three Chicken Fried Steaks with pattie, breaded and fried.
```