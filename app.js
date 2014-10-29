var express = require('express');
require("long-stack-traces");
var bodyParser = require('body-parser');
var swig = require('swig');
var app = express();
var utils = require('./utils.js');
var ym = require('yandex-money-sdk');
var constants = require("./constants");


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

swig.setDefaults({ loader: swig.loaders.fs(__dirname + '/views' )});

// parse application/json
//app.use(bodyParser.json());

app.get('/', function(req, res){
  var result = utils.render('index.html');
  res.send(result);
});

app.post('/obtain-token/', function(req, res) {
  var scope = req.body.scope;
  var url = ym.Wallet.buildObtainTokenUrl(
    constants.CLIENT_ID,
    constants.REDIRECT_URI,
    scope.split(' ')
  );
  res.redirect(url);
});

require('./controllers/wallet')('', app); 

app.listen(3000, function () {
  console.log("Server is started at 3000 port");
});
