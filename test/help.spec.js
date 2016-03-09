'use strict';

var cli = require('./cli');
var assert = require('assert');


describe('help', function() {
  this.timeout(5000);

  it('should print help', function (done) {
    cli('help', function (error, stdout, stderr) {
      assert.strictEqual(error, null);
      assert(/usage/.test(stdout));
      assert(/options/.test(stdout));
      assert.equal(stderr, '');
      done();
    });
  });

  it('should print usage if syntax is invalid', function (done) {
    cli('help -s test/schema.json', function (error, stdout, stderr) {
      assert(error instanceof Error);
      assert.equal(stdout, '');
      assert(/usage/.test(stderr));
      assert(/parameter\sunknown/.test(stderr));
      done();
    });
  });
});
