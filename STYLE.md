# style guide

We take https://github.com/airbnb/javascript as a base style guide with some exceptions:
 - it targets ES6, wherea we target subset of ES6 that comes out of the box with node 4.2;
 - having multiple variable declarations under single `const`, `var`, `let` is preferred;


# module structure

Sample structure for module named `wix-module`:

`
├── README.md
├── index.js
├── .jshintrc
├── lib
│   ├── rules.js
│   └── wix-module.js
├── package.json
└── test
    ├── .jshintrc
    ├── matchers.js
    ├── wix-module.it.js
    └── wix-module.spec.js
`

 - `index.js` - file with nothing but exports to `./lib/wix-module.js`. Why? So we can have stable jshint expression in `package.json` set to `jslint lib/ test/` and have proper coverage. Now if we want to include entry point and it's not named `index.js`, then we have to add it to expression explicitly, upon renaming it's easy to forget both entry point and jshint expression;
 - `./lib/wix-module.js` - actual code where core of module resides;
 - `./test/wix-module.it.js` - if you have tests split between unit/integration then it's helpful to have distinction, otherwise if you have only one set of tests you can name them `wix-module.spec.js`;
 - `./test/wix-module.spec.js` - module tests.
 - `.jshintrc` - linting rules;
 - `./test/.jshintrc` - chai enforces us to use somewhat weakened linting rules, so `./test/.jshintrc` let's us have that without weakening rules for main code.  

Basic libraries/franeworks used:
 - mocha;
 - chai;
 - jshint;