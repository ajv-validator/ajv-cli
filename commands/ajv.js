'use strict';

var Ajv = require('ajv');
var options = require('./options');
var util = require('./util');


module.exports = function (argv) {
    var opts = options.get(argv);
    var ajv = Ajv(opts);
    addSchemas(argv.m, ajv.addMetaSchema, 'meta-schema');
    addSchemas(argv.r, ajv.addSchema, 'schema');
    return ajv;

    function addSchemas(args, method, fileType) {
        if (!args) return;
        var files = util.getFiles(args);
        files.forEach(function (file) {
            var schema = util.openFile(file, fileType);
            method(schema);
        });
    }
};
