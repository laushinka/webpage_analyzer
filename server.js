var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var request     = require('request');
var cheerio     = require('cheerio');
var _           = require('lodash');
const url       = require('url');
var port        = 2016;

// Data to be rendered in index.ejs


function renderPageStats(stats) {
  return 'thrgshfgshfsghf'
}

function checkHtml(html) {
  let result = {};
  let doctypes = html.toLowerCase().match(/<!doctype html(.*?)>/);
  if (doctypes) {
    let doctype = doctypes[0];
    if (doctype == '<!doctype html>') {
      result.version = 'HTML 5.0';
    } else if (doctype.search('html 4.01') >= 0) {
      result.version = 'HTML 4.01';
    } else {
      result.version = 'HTML version unrecognized';
    }
  } else {
    result.version = 'No doctype found';
  }
  return result
}

app.set('view engine', 'ejs');

// Parse all incoming requests before executing the other HTTP requests below
app.use(bodyParser.urlencoded(
  {extended: true}
));

app.get('/', function(req, res){
  res.render(__dirname + '/views/index', { stats: null });
})

// All user input is stored in the body property of the request object
app.post('/', function(req, res){
  res.render(__dirname + '/views/index', { stats: {url: req.body.url}, error: false });
})

function parseHostname(href){
  if (href !== null) {
    href = href.split('.');
    var href_length = href.length
    if (href_length > 2) {
      href = href[href_length-2] + '.' + href[href_length-1]
    } else {
      href = href.join('.');
    }
  }
  return href;
}

// Determine whether an inner link is external or internal
function isExternal(url_input, original_url){
  if(!url_input.attribs.href) {
    return
  };
  // Get/set hostname of inner link
  var href_hostname = url.parse(url_input.attribs.href).hostname;
  console.log(href_hostname, 'Inner link hostname')
  href_hostname = parseHostname(href_hostname);

  // Get/set hostname of original url
  var user_hostname = url.parse(original_url).hostname;
  console.log(user_hostname, 'Original url hostname')
  user_hostname = parseHostname(user_hostname);

  return href_hostname !== null && href_hostname !== user_hostname;
}

app.listen(port, function(err){
  console.log('Running fine on port ' + port);
})

module.exports = {checkHtml: checkHtml, renderPageStats: renderPageStats};
