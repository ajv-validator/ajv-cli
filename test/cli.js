'use strict';

var exec = require('child_process').exec;
var path = require('path');

var RUN_CLI = process.env.CLI_TEST_COVERAGE == 'true'
              ? 'istanbul cover --report none --print none --include-pid index.js -- '
              : 'node index ';
var CWD = path.join(__dirname, '..');


module.exports = function cli(params, callback) {
  exec(RUN_CLI + params, { cwd: CWD }, callback);
};
