var express = require('express');
var app     = express();
var port    = 3000;

app.get('/', function(req, res){
  res.render(__dirname + '/views/index');
})

app.listen(port, function(err){
  console.log('Running fine on port ' + port);
})
