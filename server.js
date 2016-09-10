var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var request     = require('request');
var port        = 2016;

var data = {
  doctype: ''
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
      res.send('Please enter correct URL');
    } else {
      var html = body.toLowerCase();
      var doctypes = html.match(/<!doctype html(.*?)>/);
      console.log(doctypes);
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
    }
    res.render(__dirname + '/views/index', { data: data });
  })
})

app.listen(port, function(err){
  console.log('Running fine on port ' + port);
})
