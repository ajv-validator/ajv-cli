#! /usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));

//TODO: check length, provide help documentation

var path = require('path');
var glob = require('glob');
var Ajv = require('ajv');

//TODO: allow parsing of ajv options via a third parameter
//https://github.com/epoberezkin/ajv#options

var REQUIRED_PARAMS = ['s', 'd'];
var errors = 0;

REQUIRED_PARAMS.forEach(function (param) {
    if (!argv[param]) {
        console.error('error:  -' + param + ' parameter required');
        errors++;
    }
});

if (errors > 0){
    console.error('usage:  ajv-cli -s schema[.json] -d data[.json]');
    process.exit(2);
}

function openFile(filename, suffix){
    var json = null;
    try {
        json = require(path.resolve(process.cwd(), filename));
    } catch(err) {
        console.error('error:  ' + err.message.replace(' module', ' ' + suffix));
    }
    return json;
}

var schemaFile = openFile(argv.s, 'schema');

if (!schemaFile) {
    console.error('Schema file not found.');
    process.exit(2);
}

// var schemaFile = require(path.resolve(process.cwd(), argv.s));
// var data = require(path.resolve(process.cwd(), argv.d));

var ajv = Ajv();
var validate = ajv.compile(schemaFile);

var allValid = true;
if (glob.hasMagic(argv.d)) {
    var dataFiles = glob.sync(argv.d, { cwd: process.cwd() });
    dataFiles.forEach(validateDataFile);
} else {
    validateDataFile(argv.d);
}

if (!allValid) process.exit(1);

function validateDataFile(file) {
    var data = openFile(file, 'datafile ' + file);
    var validData = validate(data);
    allValid = allValid && validData;

    if (validData) {
        console.log(file, 'valid');
    } else {
        console.error(file, 'invalid');
        var errors;
        switch (argv.errors) {
            case 'json': errors = JSON.stringify(validate.errors, null, '  ');
            case 'line': errors = JSON.stringify(validate.errors); break;
            case 'text': errors = ajv.errorsText(validate.errors); break;
            case 'js':
            default:
                errors = validate.errors; break;
        }
        console.error(errors);
    }
}
