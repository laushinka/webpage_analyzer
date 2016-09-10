var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var request     = require('request');
var cheerio     = require('cheerio');
var _           = require('lodash');
var port        = 2016;

var data = {
  error_message: 'Please enter correct URL',
  status_code: 200,
  doctype: '',
  title: '',
  h1: 0,
  h2: 0,
  h3: 0,
  h4: 0,
  h5: 0,
  h6: 0,
  links_count: 0,
  internal_links: 0,
  external_links: null,
  login_form: ''
}

// Express requires a view engine
app.set('view engine', 'ejs');

// Parse all incoming requests before executing the other HTTP requests below
app.use(bodyParser.urlencoded(
  {extended: false}
));
app.use(bodyParser.json());

app.get('/', function(req, res){
  res.render(__dirname + '/views/index', { data: {} });
})

// All user input is stored in the body property of the request object
app.post('/', function(req, res){
  request(req.body.url, function(error, response, body){
    if (error) {
      data.status_code = response.statusCode;
      res.render(__dirname + '/views/index', {data: data});
    } else {

      // HTML version
      var html = body.toLowerCase();
      var doctypes = html.match(/<!doctype html(.*?)>/);
      // console.log(doctypes);
      if (doctypes && doctypes[0] == '<!doctype html>') {
        data.doctype = 'HTML 5.0';
      } else if (doctypes[0].search('html 4.01')) {
        data.doctype = 'HTML 4.01';
      } else if (doctypes[0].search('xhtml 1.1')) {
        data.doctype = 'XHTML 1.1';
      } else if (doctypes[0].search('xhtml 1.0')) {
        data.doctype = 'XHTML 1.0';
      } else {
        data.doctype = 'No HTML version found';
      }

      var $ = cheerio.load(html);

      // Title
      data.title = _.upperFirst($('title').text());

      // Page headings
      data.h1 = $('h1').length;
      data.h2 = $('h2').length;
      data.h3 = $('h3').length;
      data.h4 = $('h4').length;
      data.h5 = $('h5').length;
      data.h6 = $('h6').length;

      // Number of links
      data.links_count = $('a').length;

      // Number of internal links
      // var internalLinks = _.filter($('a'), function(link){
      //   // console.log(link.attribs.href);
      //   var isInternal = link.attribs.href.indexOf('http') > 0 || link.attribs.href.indexOf('http') < 0 ? true : false;
      //   console.log(link.attribs.href);
      //   return isInternal;
      // });
      // data.internal_links = internalLinks.length;

      // Number of external links

      // Is there a login/signup form
      if ($('form')) {
        data.login = "Yes";
      }
    }
    res.render(__dirname + '/views/index', { data: data });
  })
})

app.listen(port, function(err){
  console.log('Running fine on port ' + port);
})
