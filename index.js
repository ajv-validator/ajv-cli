#! /usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));

//TODO: check length, provide help documentation

var path = require('path');
var Ajv = require('ajv');

//TODO: allow parsing of ajv options via a third parameter
//https://github.com/epoberezkin/ajv#options

if (!argv.s) {
	throw new Error('-s prameter required');
}

var schemaFile = require(path.resolve(process.cwd(), argv.s));

if (!argv.d) {
	 throw new Error('-d parameter is required');
}

var data = require(path.resolve(process.cwd(), argv.d));

var ajv = Ajv();
var validate = ajv.addSchema(schemaFile);

var validData = validate(data);

if (!validData) {
	console.log(validate.errors);
	process.exit(1);
} else {
	console.log('Schema is valid!');
}