#! /usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));

//TODO: check length, provide help documentation

var path = require('path');
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
    console.log('usage:  ajv-cli -s schema[.json] -d data[.json]');
    process.exit(2);
}

function openFile(filename, suffix){
    var result = null;;
    try {
        result = require(path.resolve(process.cwd(), filename));
    } catch(err) {
        console.log('error:  ' + err.message.replace(' module', ' ' + suffix));
    }
}

var schemaFile = openFile(argv.s, 'schema');
var data = openFile(argv.d, 'datafile');

if (!schemaFile || !data) {
    process.exit(2);
}

// var schemaFile = require(path.resolve(process.cwd(), argv.s));
// var data = require(path.resolve(process.cwd(), argv.d));

var ajv = Ajv();
var validate = ajv.compile(schemaFile);
var validData = validate(data);

if (!validData) {
	console.log(validate.errors);
	process.exit(1);
} else {
	console.log('Data is valid!');
}
