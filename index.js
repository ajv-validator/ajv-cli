#! /usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var commands = require('./commands');

var command = argv._[0] || 'validate';
var cmd = commands[command];

if (cmd) {
    if (cmd.check(argv)) {
        var ok = cmd.execute(argv);
        process.exit(ok ? 0 : 1);
    } else {
        usage();
        process.exit(2);
    }
} else {
    console.error('Unknown command', command);
    usage();
    process.exit(2);
}


function usage() {
    console.error('\
usage:\n\
    validate:  ajv -s schema[.json] -d data[.json]\n\
               ajv -s schema[.json] -d data[.json] -r referenced_schemas[.json]\n\
               -d, -r can be globs and can be used multiple times\n\
\n\
    help:      ajv help');
}
