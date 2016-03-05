'use strict';

var exec = require('child_process').exec;
var assert = require('assert');


describe('single file validation', function() {
  it('should validate valid data', function (done) {
    exec('node ../index -s schema -d valid_data', { cwd: __dirname }, function (error, stdout, stderr) {
      assert.strictEqual(error, null);
      assert(/\svalid/.test(stdout));
      assert.equal(stderr, '');
      done();
    });
  });

  it('should validate invalid data', function (done) {
    exec('node ../index -s schema -d invalid_data', { cwd: __dirname }, function (error, stdout, stderr) {
      assert(error instanceof Error);
      assert.equal(stdout, '');
      var errors = JSON.parse(stderr);
      assert.equal(errors.length, 1);
      var err = errors[0]
      assert.equal(err.keyword, 'required');
      assert.equal(err.dataPath, '[1].dimensions');
      assert.equal(err.schemaPath, '#/items/properties/dimensions/required');
      assert.deepEqual(err.params, { missingProperty: 'height' });
      done();
    });
  });
});
