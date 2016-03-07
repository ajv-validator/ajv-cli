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

var AJV_OPTIONS = [    // default,    values ...
    'v5',              // false,      true
    'all-errors',      // false,      true
    'verbose',         // false,      true
    'json-pointers',   // false,      true
    'unique-items',    // true,       false
    'unicode',         // true,       false
    'format',          // 'fast',     'full'
    'missing-refs',    // true,       'ignore', 'fail'
    'multiple-of-precision',// false, integer number
    'error-data-path', // 'object',   'property'
    'messages'         // true,       false
];

REQUIRED_PARAMS.forEach(function (param) {
    if (!argv[param]) {
        console.error('error:  -' + param + ' parameter required');
        errors++;
    }
});

if (errors > 0){
    console.error('usage:  ajv-cli -s schema[.json] -d data[.json] -r referenced_schema[.json]');
    process.exit(2);
}

if (Array.isArray(argv.s) || glob.hasMagic(argv.s)) {
    console.error('only one schema should be passed in -s parameter');
    process.exit(2);
}

var schemaFile = openFile(argv.s, 'schema');

var ajv = Ajv(getOptions());

if (argv.r) {
    var refFiles = getFiles(argv.r);
    var refSchemas = refFiles.map(function(file) {
        return openFile(file, 'schema');
    });
    ajv.addSchema(refSchemas);
}

var validate = ajv.compile(schemaFile);

var allValid = true;

var dataFiles = getFiles(argv.d);
dataFiles.forEach(validateDataFile);

if (!allValid) process.exit(1);


function validateDataFile(file) {
    var data = openFile(file, 'data file ' + file);
    var validData = validate(data);
    allValid = allValid && validData;

    if (validData) {
        console.log(file, 'valid');
    } else {
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


function getFiles(args) {
    var files = [];
    if (Array.isArray(args)) args.forEach(_getFiles);
    else _getFiles(args);
    return files;

    function _getFiles(fileOrPattern) {
        if (glob.hasMagic(fileOrPattern)) {
            var dataFiles = glob.sync(fileOrPattern, { cwd: process.cwd() });
            files = files.concat(dataFiles);
        } else {
            files.push(fileOrPattern);
        }
    }
}


function openFile(filename, suffix){
    var json = null;
    try {
        json = require(path.resolve(process.cwd(), filename));
    } catch(err) {
        console.error('error:  ' + err.message.replace(' module', ' ' + suffix));
        process.exit(2);
    }
    return json;
}


function getOptions() {
    var options = {};
    AJV_OPTIONS.forEach(function(opt) {
        var camelCased = opt.replace(/-([a-z])/g, function (s) { return s[1].toUpperCase(); })
        var value = argv[opt] || argv[camelCased];
        if (value) {
            value = value === 'true' ? true : value === 'false' ? false
                    : /^[0-9]+$/.test(value) ? +value : value;
            options[camelCased] = value;
        }
    });
    return options;
}
