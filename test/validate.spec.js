'use strict';

var cli = require('./cli');
var assert = require('assert');


describe('validate', function() {
  this.timeout(5000);

  describe('single file validation', function() {
    it('should validate valid data', function (done) {
      cli('-s test/schema -d test/valid_data', function (error, stdout, stderr) {
        assert.strictEqual(error, null);
        assertValid(stdout, 1);
        assert.equal(stderr, '');
        done();
      });
    });

    it('should validate invalid data', function (done) {
      cli('-s test/schema.json -d test/invalid_data.json --errors=line', function (error, stdout, stderr) {
        assert(error instanceof Error);
        assert.equal(stdout, '');
        assertError(stderr);
        done();
      });
    });

    it('should print usage if syntax is invalid', function (done) {
      cli('-d test/valid_data', function (error, stdout, stderr) {
        assert(error instanceof Error);
        assert.equal(stdout, '');
        assert(/usage/.test(stderr));
        assert(/parameter\srequired/.test(stderr));
        done();
      });
    });
  });


  describe('multiple file validation', function() {
    describe('with glob', function() {
      it('should exit without error if all files are valid', function (done) {
        cli('-s test/schema -d "test/valid*.json"', function (error, stdout, stderr) {
          assert.strictEqual(error, null);
          assertValid(stdout, 2);
          assert.equal(stderr, '');
          done();
        });
      });

      it('should exit with error if some files are invalid', function (done) {
        cli('-s test/schema -d "test/*data*.json" --errors=line', function (error, stdout, stderr) {
          assert(error instanceof Error);
          assertValid(stdout, 2);
          assertError(stderr);
          done();
        });
      });
    });

    describe('with multiple files or patterns', function() {
      it('should exit without error if all files are valid', function (done) {
        cli('-s test/schema -d test/valid_data.json -d test/valid_data2.json', function (error, stdout, stderr) {
          assert.strictEqual(error, null);
          assertValid(stdout, 2);
          assert.equal(stderr, '');
          done();
        });
      });

      it('should exit with error if some files are invalid', function (done) {
        cli('-s test/schema -d test/valid_data.json -d test/valid_data2.json -d test/invalid_data.json --errors=line', function (error, stdout, stderr) {
          assert(error instanceof Error);
          assertValid(stdout, 2);
          assertError(stderr);
          done();
        });
      });

      it('should exit with error if some files are invalid (multiple patterns)', function (done) {
        cli('-s test/schema -d "test/valid*.json" -d "test/invalid*.json" --errors=line', function (error, stdout, stderr) {
          assert(error instanceof Error);
          assertValid(stdout, 2);
          assertError(stderr);
          done();
        });
      });
    });
  });


  describe('validate schema with $ref', function() {
    it('should resolve reference and validate', function (done) {
      cli('-s test/schema_with_ref -r test/schema -d test/valid_data', function (error, stdout, stderr) {
        assert.strictEqual(error, null);
        assertValid(stdout, 1);
        assert.equal(stderr, '');
        done();
      });
    });

    it('should resolve reference and validate invalide data', function (done) {
      cli('-s test/schema_with_ref -r test/schema -d test/invalid_data --errors=line', function (error, stdout, stderr) {
        assert(error instanceof Error);
        assert.equal(stdout, '');
        assertError(stderr, 'schema.json');
        done();
      });
    });
  });
});


function assertValid(stdout, count) {
  var lines = stdout.split('\n');
  assert.equal(lines.length, count + 1);
  for (var i=0; i<count; i++)
    assert(/\svalid/.test(lines[i]));
}


function assertError(stderr, schemaRef) {
  var lines = stderr.split('\n');
  schemaRef = schemaRef || '#';
  assert.equal(lines.length, 3);
  assert(/\sinvalid/.test(lines[0]));
  var errors = JSON.parse(lines[1]);
  assert.equal(errors.length, 1);
  var err = errors[0]
  assert.equal(err.keyword, 'required');
  assert.equal(err.dataPath, '[0].dimensions');
  assert.equal(err.schemaPath, schemaRef + '/items/properties/dimensions/required');
  assert.deepEqual(err.params, { missingProperty: 'height' });
}
