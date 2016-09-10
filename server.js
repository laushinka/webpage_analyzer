var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var request     = require('request');
var cheerio     = require('cheerio');
var _           = require('lodash');
const url       = require('url');
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
  external_links: 0,
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
    console.log(req.body.url);
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

      // External links
      function isExternal(url_input){
        // console.log(url_input.attribs.href, url.parse(url_input.attribs.href).hostname, 'Debugger \n');

        var href_hostname = url.parse(url_input.attribs.href).hostname;
        console.log(href_hostname, 'Original hostname')
        if (href_hostname !== null) {
          href_hostname = href_hostname.split('.');
          var href_length = href_hostname.length
          if (href_length > 2) {
            // 012345
            href_hostname = href_hostname[href_length-2] + '.' +href_hostname[href_length-1]
          } else {
            href_hostname = href_hostname.join('.');
          }
        }
        var user_hostname = url.parse(req.body.url).hostname;
        if (user_hostname !== null) {
          user_hostname = user_hostname.split('.');
          var user_length = user_hostname.length
          if (user_length > 2) {
              user_hostname = user_hostname[user_length-2] + '.' +user_hostname[user_length-1]
          } else {
            user_hostname = user_hostname.join('.')
          }
        }

        console.log(href_hostname)
        console.log(user_hostname)
        console.log(url_input.attribs.href)
        console.log(req.body.url)
        console.log(href_hostname != null )
        console.log(href_hostname !== user_hostname )

        return href_hostname !== null && href_hostname !== user_hostname;
      }

      // Number of internal and external links
      var externalLinks = _.filter($('a'), function(link){
        if (isExternal(link)) {
          console.log('External link: ' + link);
          data.external_links++;
        } else {
          console.log('Internal link: ' + link);
          data.internal_links++;
        }
      })

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
