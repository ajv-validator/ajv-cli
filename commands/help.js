'use strict';

var options = require('./options');

module.exports = {
    check: check,
    execute: execute,
    usage: usage
};


var commands = {
    validate: helpValidate,
    compile: helpCompile
};


function check(argv) {
    return argv._.length <= 2 && options.check(argv, [], []);
}


function execute(argv) {
    var command = argv._[1];
    if (!command || command == 'help') {
        mainHelp();
        return true;
    }

    var cmdHelp = commands[command];

    if (cmdHelp) {
        cmdHelp();
        return true;
    }

    console.error('Unknown command', command);
    usage();
}


function usage() {
    console.error('\
usage:\n\
    validate:  ajv [validate] -s schema[.json] -d data[.json]\n\
    compile:   ajv compile -s schema[.json]\n\
\n\
    help:      ajv help\n\
               ajv help <command>');
}


function mainHelp() {
    _helpValidate();
    _helpCompile();
    console.log('\
More information:\n\
        ajv help validate\n\
        ajv help compile');
}


function helpValidate() {
    _helpValidate();
    console.log('\
parameters\n\
    -s JSON schema to validate against (required, only one schema allowed)\n\
    -d data file(s) to be validated (required)\n\
    -r referenced schema(s)\n\
    -m meta schema(s)\n\
\n\
    -d, -r, -m can be globs and can be used multiple times\n\
    glob should be enclosed in double quotes\n\
    .json extension can be omitted (but should be used in globs)\n\
\n\
options:\n\
    --errors=          error reporting\n\
             js        JavaScript object (default)\n\
             json      JSON format\n\
             line      JSON single line\n\
             text      text message\n');
    helpAjvOptions();
}


function _helpValidate() {
    console.log('\
Validate data file(s) against schema\n\
    ajv [validate] -s schema[.json] -d data[.json]\n\
    ajv [validate] -s schema[.json] -d "data*.json"\n');
}


function helpCompile() {
    _helpCompile();
    console.log('\
parameters\n\
    -s JSON schema to validate against (required)\n\
    -r referenced schema(s)\n\
    -m meta schema(s)\n\
\n\
    -s, -r, -m can be globs and can be used multiple times\n\
    glob should be enclosed in double quotes\n\
    .json extension can be omitted (but should be used in globs)\n');
    helpAjvOptions();
}


function _helpCompile() {
    console.log('\
Compile schema(s)\n\
    ajv compile -s schema[.json]\n\
    ajv compile -s "schema*.json"\n');
}


function helpAjvOptions() {
    console.log('\
Ajv options (see https://github.com/epoberezkin/ajv#options):\n\
    --v5               support validation keywords from v5 proposals\n\
\n\
    --all-errors       collect all errors\n\
\n\
    --json-pointers    report data paths as JSON pointers\n\
\n\
    --unique-items=false  do not validate uniqueItems keyword\n\
\n\
    --unicode=false    count unicode pairs as 2 characters\n\
\n\
    --format=          format validation mode\n\
             fast      using regex (default)\n\
             full      using functions\n\
\n\
    --missing-refs=    handling missing referenced schemas\n\
             true      fail schema compilation (default)\n\
             ignore    log error and pass validation\n\
             fail      log error and fail validation if ref is used\n\
\n\
    --remove-additional=  remove additional properties\n\
             all       remove all additional properties\n\
             true      remove if additionalProperties is false\n\
             failing   also remove if fails validation of schema in additionalProperties\n\
\n\
    --use-defaults     replace missing properties/items with the values from default keyword\n\
\n\
    --coerce-types     change type of data to match type keyword\n\
\n\
    --multiple-of-precision=N  pass integer number\n\
\n\
    --error-data-path= data path in errors of required, additionalProperties and dependencies\n\
             object    point to object (default)\n\
             property  point to property\n\
\n\
    --messages=false   do not include text messages in errors');
}
