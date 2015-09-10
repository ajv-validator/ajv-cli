#! /usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));

//TODO: check length, provide help documentation

var path = require('path');
var Ajv = require('ajv');

//TODO: allow parsing of ajv options via a third parameter
//https://github.com/epoberezkin/ajv#options

var REQUIRED_PARAMS = ['s', 'd'];

REQUIRED_PARAMS.forEach(function (param) {
    if (!argv[param]) throw new Error('-' + param + ' parameter required');
});

var schemaFile = require(path.resolve(process.cwd(), argv.s));
var data = require(path.resolve(process.cwd(), argv.d));

var ajv = Ajv();
var validate = ajv.compile(schemaFile);
var validData = validate(data);

if (!validData) {
	console.log(validate.errors);
	process.exit(1);
} else {
	console.log('Data is valid!');
}
