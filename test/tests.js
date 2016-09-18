var server = require('../server.js');
var assert = require('assert');

describe('checkHtml', function() {
  it('Extracts HTML version 5', function() {
    let html = '<!DOCTYPE html>';
    let result = server.checkHtml(html);
    assert.equal(result.version, 'HTML 5.0');
  });
  it('Extracts HTML version 4', function() {
    let html = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">';
    let result = server.checkHtml(html);
    assert.equal(result.version, 'HTML 4.01');
  });
  it('Informs missing doctype');
});
