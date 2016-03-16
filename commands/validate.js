'use strict';

var options = require('./options');
var util = require('./util');
var glob = require('glob');
var getAjv = require('./ajv');
var jsonPatch = require('fast-json-patch');


module.exports = {
    check: check,
    execute: execute
};


function check(argv) {
    var REQUIRED_PARAMS = ['s', 'd'];
    var ALLOWED_PARAMS = ['r', 'm', 'errors', 'changes'].concat(options.AJV);

    return argv._.length <= 1
            && options.check(argv, REQUIRED_PARAMS, ALLOWED_PARAMS)
            && checkSchema();

    function checkSchema() {
        if (!Array.isArray(argv.s) && !glob.hasMagic(argv.s)) return true;
        console.error('only one schema should be passed in -s parameter');
    }
}


function execute(argv) {
    var schemaFile = util.openFile(argv.s, 'schema');

    var ajv = getAjv(argv);
    var validate;
    try { validate = ajv.compile(schemaFile); }
    catch (err) {
        console.error('schema', argv.s, 'is invalid');
        console.error('error:', err.message);
        process.exit(1);
    }
    var allValid = true;

    var dataFiles = util.getFiles(argv.d);
    dataFiles.forEach(validateDataFile);

    return allValid;


    function validateDataFile(file) {
        var data = util.openFile(file, 'data file ' + file);
        var original;
        if (argv.changes) original = JSON.parse(JSON.stringify(data));
        var validData = validate(data);

        if (validData) {
            console.log(file, 'valid');
            if (argv.changes) {
                var patch = jsonPatch.compare(original, data);
                if (patch.length == 0) {
                    console.log('no changes');
                } else {
                    switch (argv.changes) {
                        case 'json': patch = JSON.stringify(patch, null, '  '); break;
                        case 'line': patch = JSON.stringify(patch); break;
                    }
                    console.log('changes:');
                    console.log(patch);
                }
            }
        } else {
            allValid = false;
            console.error(file, 'invalid');
            var errors;
            switch (argv.errors) {
                case 'json': errors = JSON.stringify(validate.errors, null, '  '); break;
                case 'line': errors = JSON.stringify(validate.errors); break;
                case 'text': errors = ajv.errorsText(validate.errors); break;
                case 'js':
                default:
                    errors = validate.errors; break;
            }
            console.error(errors);
        }
    }
}
