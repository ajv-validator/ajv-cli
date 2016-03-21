'use strict';

var util = require('./util');
var getAjv = require('./ajv');

module.exports = {
    execute: execute,
    schema: {
        type: 'object',
        required: ['s'],
        properties: {
            s: { $ref: '#/definitions/stringOrArray' },
            r: { $ref: '#/definitions/stringOrArray' },
            m: { $ref: '#/definitions/stringOrArray' }
        }
    }
};


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
