'use strict';

var options = require('./options');
var util = require('./util');
var glob = require('glob');
var getAjv = require('./ajv');


module.exports = {
    check: check,
    execute: execute
};


function check(argv) {
    var REQUIRED_PARAMS = ['s', 'd'];
    var ALLOWED_PARAMS = ['r', 'm', 'errors', 'valid', 'invalid'].concat(options.AJV);

    return argv._.length <= 1
            && options.check(argv, REQUIRED_PARAMS, ALLOWED_PARAMS)
            && (argv.valid ? !argv.invalid : argv.invalid)
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
    var shouldBeValid = !!argv.valid && argv.valid != 'false';
    var allPassed = true;

    var dataFiles = util.getFiles(argv.d);
    dataFiles.forEach(testDataFile);

    return allPassed;


    function testDataFile(file) {
        var data = util.openFile(file, 'data file ' + file);
        var validData = validate(data);
        var errors;
        if (!validData) errors = util.logJSON(argv.errors, validate.errors, ajv);

        if (validData === shouldBeValid) {
            console.log(file, 'passed test');
            if (errors) console.log(errors);
        } else {
            allPassed = false;
            console.error(file, 'failed test');
            if (errors) console.error(errors);
        }
    }
}
