var express = require('express');
var app     = express();
var port    = 3000;

app.get('/', function(req, res){
  res.render(__dirname + '/views/index');
})

// Express requires a view engine
app.set('view engine', 'ejs');

app.listen(port, function(err){
  console.log('Running fine on port ' + port);
})
