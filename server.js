var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var request     = require('request');
var port        = 2016;

// Express requires a view engine
app.set('view engine', 'ejs');

// Parse all incoming requests before executing the other HTTP requests below
app.use(bodyParser.urlencoded(
  {extended: false}
));
app.use(bodyParser.json());

app.get('/', function(req, res){
  // console.log(__dirname);
  res.render(__dirname + '/views/index');
})

// All user input is stored in the body property of the request object
app.post('/', function(req, res){
  request(req.body.url, function(error, response, body){
    if (error) {
      res.send('Please enter correct URL');
    } else {
      var html = body.toLowerCase();
      // console.log(html);
      var doctypes = html.match(/<!doctype html(.*?)>/);
    }
  //   // res.render(__dirname + '/views/index')
  })
})

app.listen(port, function(err){
  console.log('Running fine on port ' + port);
})
