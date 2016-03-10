'use strict';

var options = require('./options');
var util = require('./util');
var getAjv = require('./ajv');

module.exports = {
    check: check,
    execute: execute
};


function check(argv) {
    var REQUIRED_PARAMS = ['s'];
    var ALLOWED_PARAMS = ['r', 'm'].concat(options.AJV);

    return argv._.length <= 1
            && options.check(argv, REQUIRED_PARAMS, ALLOWED_PARAMS);
}


function execute(argv) {
    var ajv = getAjv(argv);
    var allValid = true;

    var schemaFiles = util.getFiles(argv.s);
    schemaFiles.forEach(compileSchema);

    return allValid;


    function compileSchema(file) {
        var schema = util.openFile(file, 'schema ' + file);
        var validate;
        try {
            validate = ajv.compile(schema);
            /* istanbul ignore else */
            if (typeof validate == 'function') {
                console.log('schema', file, 'is valid');
            } else {
                allValid = false;
                console.error('schema', file, 'failed to compile to a function');
                console.error(validate);
            }
        } catch (err) {
            allValid = false;
            console.error('schema', file, 'is invalid');
            console.error('error:', err.message);
        }
    }
}
