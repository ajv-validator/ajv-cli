#! /usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var help = require('./lib/help');


if (argv._[0] == 'help') {
    help.main();
    process.exit(0);
}


var path = require('path');
var glob = require('glob');
var Ajv = require('ajv');

var REQUIRED_PARAMS = ['s', 'd'];
var errors = 0;

var AJV_OPTIONS = [
    'v5',
    'all-errors',
    'verbose',
    'json-pointers',
    'unique-items',
    'unicode',
    'format',
    'missing-refs',
    'multiple-of-precision',
    'error-data-path',
    'messages',
    // modifying options
    'remove-additional',
    'use-defaults',
    'coerce-types'
];

REQUIRED_PARAMS.forEach(function (param) {
    if (!argv[param]) {
        console.error('error:  -' + param + ' parameter required');
        errors++;
    }
});

var ALLOWED_PARAMS = ['r', 'errors']
                        .concat(REQUIRED_PARAMS)
                        .concat(AJV_OPTIONS)
                        .concat(AJV_OPTIONS.map(toCamelCase));

for (var param in argv) {
    if (param != '_' && ALLOWED_PARAMS.indexOf(param) == -1) {
        console.error('error: ' + param + ' parameter unknown');
        errors++;
    }
}

if (errors > 0){
    help.usage();
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
    AJV_OPTIONS.forEach(function (opt) {
        var optCC = toCamelCase(opt);
        var value = argv[opt] || argv[optCC];
        if (value) {
            value = value === 'true' ? true : value === 'false' ? false
                    : /^[0-9]+$/.test(value) ? +value : value;
            options[optCC] = value;
        }
    });
    return options;
}


function toCamelCase(str) {
    return str.replace(/-[a-z]/g, function (s) {
        return s[1].toUpperCase();
    });
}
