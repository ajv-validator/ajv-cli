'use strict';

var glob = require('glob');
var path = require('path');


module.exports = {
    getFiles: getFiles,
    openFile: openFile,
    logJSON: logJSON,
    compile: compile,
    checkSchema: checkSchema
};


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


function logJSON(mode, data, ajv) {
    switch (mode) {
        case 'json': data = JSON.stringify(data, null, '  '); break;
        case 'line': data = JSON.stringify(data); break;
        case 'no':   data = ''; break;
        case 'text': if (ajv) data = ajv.errorsText(data);
    }
    return data;
}


function compile(ajv, schemaFile) {
    var schema = openFile(schemaFile, 'schema');
    try { return ajv.compile(schema); }
    catch (err) {
        console.error('schema', schemaFile, 'is invalid');
        console.error('error:', err.message);
        process.exit(1);
    }
}


function checkSchema(argv) {
    if (!Array.isArray(argv.s) && !glob.hasMagic(argv.s)) return true;
    console.error('only one schema should be passed in -s parameter');
}
