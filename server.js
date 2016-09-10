var express = require('express');
var app     = express();
var port    = 3000;

// Express requires a view engine
app.set('view engine', 'ejs');

app.get('/', function(req, res){
  console.log(__dirname);
  res.render(__dirname + '/views/index');
})

app.listen(port, function(err){
  console.log('Running fine on port ' + port);
})
