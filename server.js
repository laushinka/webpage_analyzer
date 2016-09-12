var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var request     = require('request');
var cheerio     = require('cheerio');
var _           = require('lodash');
const url       = require('url');
var port        = 2016;

// Data to be rendered in index.ejs
var data = {
  error_message: '',
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
  broken_links: 0,
  login_form: 'None'
}

app.set('view engine', 'ejs');

// Parse all incoming requests before executing the other HTTP requests below
app.use(bodyParser.urlencoded(
  {extended: true}
));

app.get('/', function(req, res){
  res.render(__dirname + '/views/index', { data: {}, error: false });
})

// All user input is stored in the body property of the request object
app.post('/', function(req, res){
  request(req.body.url, function(error, response, body){
    console.log(req.body.url);
    if (error) {
      res.render(__dirname + '/views/index', {error: true, error_message: error});
      return;
    }
    if (response.statusCode !== 200) {
      res.render(__dirname + '/views/index', {error: true,error_message: 'Status code is ' + response.statusCode});
      return;
    }

    // HTML version
    var html = body.toLowerCase();
    var doctypes = html.match(/<!doctype html(.*?)>/);
    // console.log(doctypes);
    if (doctypes) {
      if (doctypes[0] == '<!doctype html>') {
        data.doctype = 'HTML 5.0';
      } else if (doctypes[0].search('html 4.01')) {
        data.doctype = 'HTML 4.01';
      } else if (doctypes[0].search('xhtml 1.1')) {
        data.doctype = 'XHTML 1.1';
      } else if (doctypes[0].search('xhtml 1.0')) {
        data.doctype = 'XHTML 1.0';
      }
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
    var links = $('a');
    data.links_count = links.length;
    var outstanding_requests = links.length;

    // Determine whether an inner link is external or internal
    function isExternal(url_input){
      if(!url_input.attribs.href) {
        return
      };
      // Get hostname of inner link
      var href_hostname = url.parse(url_input.attribs.href).hostname;
      console.log(href_hostname, 'Inner link hostname')
      if (href_hostname !== null) {
        href_hostname = href_hostname.split('.');
        var href_length = href_hostname.length
        if (href_length > 2) {
          href_hostname = href_hostname[href_length-2] + '.' +href_hostname[href_length-1]
        } else {
          href_hostname = href_hostname.join('.');
        }
      }
      // Get hostname of original url
      var user_hostname = url.parse(req.body.url).hostname;
      console.log(user_hostname, 'Original hostname')
      if (user_hostname !== null) {
        user_hostname = user_hostname.split('.');
        var user_length = user_hostname.length
        if (user_length > 2) {
            user_hostname = user_hostname[user_length-2] + '.' +user_hostname[user_length-1]
        } else {
          user_hostname = user_hostname.join('.')
        }
      }
      return href_hostname !== null && href_hostname !== user_hostname;
    }

    // Number of external links
    data.external_links = _.filter($('a'), function(link) {
      if (link) {
        return isExternal(link)
      } else {
        console.log(error, 'Error');
      }
    }).length

    // Number of internal links
    data.internal_links = _.filter($('a'), function(link) {
      if (link) {
        return !isExternal(link)
      } else {
        console.log(error, 'Error');
      }
    }).length

    // Number of broken links
    _.each(links, function(link){
      if(!link.attribs.href) {
        outstanding_requests--;
        return;
      };
      var url_link = link.attribs.href;
      // Concat protocol and hostname if url is incomplete
      if(url_link.indexOf('http') === -1){
          url_link = url.parse(req.body.url).protocol + '//' + url.parse(req.body.url).hostname + url_link;
      }
      // Make get requests to each link
      request(url_link, function(error, response, body){
        if(error){
          console.log(error, 'Error');
        }else{
          if(response.statusCode !== 200){
            data.broken_links++;
          }
        }
        // Render only after outstanding_requests is 0 - to address the asynchrony
        outstanding_requests--;
        if (outstanding_requests === 0) {
          res.render(__dirname + '/views/index', { error: false, data: data });
        }
        console.log(data.broken_links);
      })
    })

    // Is there a login/signup form
    if ($('input[type="password"]').length > 0) {
      data.login_form = "Available";
    }
  });
})

app.listen(port, function(err){
  console.log('Running fine on port ' + port);
})
