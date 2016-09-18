var server = require('../server.js');
var assert = require('assert');

describe('checkHtml', function() {
  it('Extracts the HTML version', function() {
    let html = '<!DOCTYPE html>';
    let result = server.checkHtml(html);
    assert.equal(result.version, 'HTML 5.0');
  });
  it('Informs missing doctype');
});
