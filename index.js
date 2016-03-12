#! /usr/bin/env node
'use strict';

var argv = require('minimist')(process.argv.slice(2));
var commands = require('./commands');

var command = argv._[0] || 'validate';
var cmd = commands[command];

if (cmd) {
    if (cmd.check(argv)) {
        var ok = cmd.execute(argv);
        process.exit(ok ? 0 : 1);
    } else {
        commands.help.usage();
        process.exit(2);
    }
} else {
    console.error('Unknown command', command);
    commands.help.usage();
    process.exit(2);
}
