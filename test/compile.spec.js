'use strict';

var cli = require('./cli');
var assert = require('assert');


describe('compile', function() {
  this.timeout(5000);

  describe('compile single schema', function() {
    it('should compile valid schema', function (done) {
      cli('compile -s test/schema', function (error, stdout, stderr) {
        assert.strictEqual(error, null);
        assertValid(stdout, 1);
        assert.equal(stderr, '');
        done();
      });
    });

    it('should compile valid v5 schema', function (done) {
      cli('compile -s test/v5/schema --v5', function (error, stdout, stderr) {
        assert.strictEqual(error, null);
        assertValid(stdout, 1);
        assert.equal(stderr, '');
        done();
      });
    });

    it('should compile valid schema with a custom meta-schema', function (done) {
      cli('compile -s test/meta/schema -m test/meta/meta_schema', function (error, stdout, stderr) {
        assert.strictEqual(error, null);
        assertValid(stdout, 1);
        assert.equal(stderr, '');
        done();
      });
    });

    it('should fail to compile invalid schema with a custom meta-schema', function (done) {
      cli('compile -s test/meta/invalid_schema -m test/meta/meta_schema', function (error, stdout, stderr) {
        assert(error instanceof Error);
        assert.equal(stdout, '');
        var lines = assertError(stderr);
        assert(/my_keyword\sshould\sbe\sboolean/.test(lines[1]));
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


function assertError(stderr) {
  var lines = stderr.split('\n');
  assert.equal(lines.length, 3);
  assert(/schema/.test(lines[0]));
  assert(/\sinvalid/.test(lines[0]));
  assert(/error/.test(lines[1]));
  return lines;
}
