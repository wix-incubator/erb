'use strict';

const help = `
Meet octopus - an opinionated tool for building and managing git-based multi-module npm projects.

     ,'""\`.
    / _  _ \\
    |(@)(@)|
    )  __  (
   /,'))((\`.\\
  (( ((  )) ))
   \`\\ \`)(' /'       
`;

const examples = `
  Examples:
    'octo run --build clean install test' - run npm scripts for changed packages and mark modules as built;
    'octo deps sync --save' - sync dependency versions of all modules with ones defined in octopus.json;
`;

module.exports = txt => help + txt + examples;

