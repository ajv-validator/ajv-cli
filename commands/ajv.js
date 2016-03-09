'use strict';

var Ajv = require('ajv');
var options = require('./options');
var util = require('./util');


module.exports = function (argv) {
    var ajv = Ajv(options.get(argv));

    if (argv.r) {
        var refFiles = util.getFiles(argv.r);
        var refSchemas = refFiles.map(function(file) {
            return util.openFile(file, 'schema');
        });
        ajv.addSchema(refSchemas);
    }

    return ajv;
};
