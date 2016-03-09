'use strict';

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


module.exports = {
    check: checkOptions,
    get: getOptions,
    AJV: AJV_OPTIONS
};


function checkOptions(argv, requiredParams, allowedParams) {
    var ok = true;
    requiredParams = requiredParams.concat(requiredParams.map(toCamelCase));
    requiredParams.forEach(function (param) {
        if (!argv[param]) {
            console.error('error:  -' + param + ' parameter required');
            ok = false;
        }
    });

    allowedParams = allowedParams
                    .concat(allowedParams.map(toCamelCase))
                    .concat(requiredParams);
    for (var param in argv) {
        if (param != '_' && allowedParams.indexOf(param) == -1) {
            console.error('error: ' + param + ' parameter unknown');
            ok = false;
        }
    }

    return ok;
}


var NUMBER = /^[0-9]+$/;
function getOptions(argv) {
    var options = {};
    AJV_OPTIONS.forEach(function (opt) {
        var optCC = toCamelCase(opt);
        var value = argv[opt] || argv[optCC];
        if (value) {
            value = value === 'true' ? true : value === 'false' ? false
                    : NUMBER.test(value) ? +value : value;
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
