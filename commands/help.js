'use strict';

var options = require('./options');

module.exports = {
    check: check,
    execute: execute
};


function check(argv) {
    return argv._.length == 1 && options.check(argv, [], []);
}


function execute() {
    console.log('\
usage:\n\
    ajv -s schema[.json] -d data[.json]\n\
    ajv -s schema[.json] -d data[.json] -r referenced_schemas[.json]\n\
\n\
    -d, -r can be globs and can be used multiple times\n\
\n\
options:\n\
    --errors=          error reporting\n\
             js        JavaScript object (default)\n\
             json      JSON format\n\
             line      JSON single line\n\
             text      text message\n\
\n\
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
    return true;
}
