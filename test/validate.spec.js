'use strict';

var exec = require('child_process').exec;
var assert = require('assert');


describe('single file validation', function() {
  it('should validate valid data', function (done) {
    exec('node ../index -s schema -d valid_data', { cwd: __dirname },
      function (error, stdout, stderr) {
        assert.strictEqual(error, null);
        assertValid(stdout, 1);
        assert.equal(stderr, '');
        done();
      }
    );
  });

  it('should validate invalid data', function (done) {
    exec('node ../index -s schema.json -d invalid_data.json --errors=line', { cwd: __dirname },
      function (error, stdout, stderr) {
        assert(error instanceof Error);
        assert.equal(stdout, '');
        assertError(stderr);
        done();
      }
    );
  });
});


describe('multiple file validation', function() {
  it('should exit without error if all files are valid', function (done) {
    exec('node ../index -s schema -d "valid*.json" --errors=line', { cwd: __dirname },
      function (error, stdout, stderr) {
        assert.strictEqual(error, null);
        assertValid(stdout, 2);
        assert.equal(stderr, '');
        done();
      }
    );
  });

  it('should exit with error if all files are valid', function (done) {
    exec('node ../index -s schema -d "*data*.json" --errors=line', { cwd: __dirname },
      function (error, stdout, stderr) {
        assert(error instanceof Error);
        assertValid(stdout, 2);
        assertError(stderr);
        done();
      }
    );
  });
});


function assertValid(stdout, count) {
  var lines = stdout.split('\n');
  assert.equal(lines.length, count + 1);
  for (var i=0; i<count; i++)
    assert(/\svalid/.test(lines[i]));
}


function assertError(stderr) {
  var lines = stderr.split('\n');
  assert.equal(lines.length, 3);
  assert(/\sinvalid/.test(lines[0]));
  var errors = JSON.parse(lines[1]);
  assert.equal(errors.length, 1);
  var err = errors[0]
  assert.equal(err.keyword, 'required');
  assert.equal(err.dataPath, '[1].dimensions');
  assert.equal(err.schemaPath, '#/items/properties/dimensions/required');
  assert.deepEqual(err.params, { missingProperty: 'height' });
}
